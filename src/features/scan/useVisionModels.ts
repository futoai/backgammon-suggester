import { useEffect, useState } from "react"
import { getVisionModels, VisionModel } from "./models"

export function useVisionModels() {
  const [models, setModels] = useState<VisionModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const list = await getVisionModels()
        if (active) setModels(list)
      } catch (err) {
        if (active) setError((err as Error).message)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  return { models, loading, error }
}
