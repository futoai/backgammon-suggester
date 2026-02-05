export interface Env {
  OPENROUTER_API_KEY: string
}

const maxImageBytes = 3_000_000
const rateLimitWindowMs = 60_000
const rateLimitMax = 10

const rateMap = new Map<string, { count: number; resetAt: number }>()
let modelCache: { fetchedAt: number; models: Array<{ id: string; name: string }> } | null = null

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json", ...corsHeaders },
    ...init,
  })
}

async function fetchModels(apiKey: string) {
  const now = Date.now()
  if (modelCache && now - modelCache.fetchedAt < 5 * 60 * 1000) {
    return modelCache.models
  }

  const response = await fetch("https://openrouter.ai/api/v1/models", {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  })
  if (!response.ok) {
    throw new Error("Failed to fetch models")
  }
  const data = (await response.json()) as {
    data: Array<{
      id: string
      name: string
      pricing?: { prompt?: string; completion?: string }
      input_modalities?: string[]
      output_modalities?: string[]
      supported_response_formats?: string[]
    }>
  }

  const models = data.data
    .filter((model) => {
      const free = model.pricing?.prompt === "0" && model.pricing?.completion === "0"
      const hasImage = model.input_modalities?.includes("image")
      const supportsSchema = model.supported_response_formats?.includes("json_schema")
      return free && hasImage && supportsSchema
    })
    .map((model) => ({ id: model.id, name: model.name }))

  modelCache = { fetchedAt: now, models }
  return models
}

function getClientIp(request: Request) {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for") ||
    "unknown"
  )
}

function checkRateLimit(ip: string) {
  const now = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || entry.resetAt < now) {
    rateMap.set(ip, { count: 1, resetAt: now + rateLimitWindowMs })
    return true
  }
  if (entry.count >= rateLimitMax) return false
  entry.count += 1
  return true
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const ip = getClientIp(request)

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders })
    }

    if (url.pathname === "/api/models") {
      try {
        const models = await fetchModels(env.OPENROUTER_API_KEY)
        return jsonResponse({ models })
      } catch (error) {
        return jsonResponse({ error: (error as Error).message }, { status: 500 })
      }
    }

    if (url.pathname === "/api/vision" && request.method === "POST") {
      if (!checkRateLimit(ip)) {
        return jsonResponse({ error: "Rate limit exceeded" }, { status: 429 })
      }

      const body = (await request.json()) as {
        model: string
        image: string
        prompt: string
        response_format: Record<string, unknown>
      }

      if (!body.image || !body.prompt) {
        return jsonResponse({ error: "Missing image or prompt" }, { status: 400 })
      }

      const imageBytes = Math.floor((body.image.length * 3) / 4)
      if (imageBytes > maxImageBytes) {
        return jsonResponse({ error: "Image too large" }, { status: 413 })
      }

      const models = await fetchModels(env.OPENROUTER_API_KEY)
      const modelId =
        body.model === "auto" ? models[0]?.id : models.find((model) => model.id === body.model)?.id
      if (!modelId) {
        return jsonResponse({ error: "No valid model available" }, { status: 400 })
      }

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelId,
          response_format: body.response_format,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: body.prompt },
                { type: "image_url", image_url: { url: body.image } },
              ],
            },
          ],
        }),
      })

      if (!response.ok) {
        const text = await response.text()
        return jsonResponse({ error: text }, { status: 500 })
      }

      const data = (await response.json()) as {
        choices: Array<{ message: { content: string } }>
      }

      const content = data.choices?.[0]?.message?.content
      if (!content) {
        return jsonResponse({ error: "No content returned" }, { status: 500 })
      }

      let parsed: unknown
      try {
        parsed = JSON.parse(content)
      } catch {
        return jsonResponse({ error: "Invalid JSON returned" }, { status: 500 })
      }

      return jsonResponse({ result: parsed })
    }

    return new Response("Not found", { status: 404 })
  },
}
