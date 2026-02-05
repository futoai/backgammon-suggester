import { BackgammonScanResultV1, BackgammonScanResultV1Schema, BackgammonScanResultV1JsonSchema } from "@/lib/schema/position"
import { z } from "zod"
import { getSelectedModel } from "./settings"
import { scanPrompt } from "./scanPrompt"

const ResponseSchema = z.object({ result: BackgammonScanResultV1Schema })

export async function scanFromImage(dataUrl: string): Promise<BackgammonScanResultV1> {
  const model = getSelectedModel()

  const response = await fetch("/api/vision", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      image: dataUrl,
      prompt: scanPrompt,
      response_format: {
        type: "json_schema",
        json_schema: BackgammonScanResultV1JsonSchema,
      },
    }),
  })

  if (!response.ok) {
    throw new Error("Vision scan failed")
  }

  const data = (await response.json()) as { result: BackgammonScanResultV1 }
  const parsed = ResponseSchema.parse(data)
  return parsed.result
}
