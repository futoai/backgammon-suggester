import localforage from "localforage"

export type VisionModel = {
  id: string
  name: string
}

const modelStore = localforage.createInstance({
  name: "backgammon-suggester",
  storeName: "vision-models",
})

const cacheKey = "models"
const cacheDays = 7

export async function getCachedModels(): Promise<VisionModel[] | null> {
  const entry = await modelStore.getItem<{ fetchedAt: string; models: VisionModel[] }>(cacheKey)
  if (!entry) return null
  const ageMs = Date.now() - new Date(entry.fetchedAt).getTime()
  if (ageMs > cacheDays * 24 * 60 * 60 * 1000) return null
  return entry.models
}

export async function fetchModels(): Promise<VisionModel[]> {
  const response = await fetch("/api/models")
  if (!response.ok) {
    throw new Error("Failed to fetch models")
  }
  const data = (await response.json()) as { models: VisionModel[] }
  await modelStore.setItem(cacheKey, { fetchedAt: new Date().toISOString(), models: data.models })
  return data.models
}

export async function getVisionModels() {
  const cached = await getCachedModels()
  if (cached) return cached
  return fetchModels()
}
