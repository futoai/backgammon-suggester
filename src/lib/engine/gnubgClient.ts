import { EngineResponse } from "./types"
import { PositionV1 } from "@/lib/schema/position"
import { positionIdFromBoard } from "@/lib/engine/positionId"

let worker: Worker | null = null

function getWorker() {
  if (!worker) {
    worker = new Worker(new URL("./gnubg.worker.ts", import.meta.url), { type: "classic" })
  }
  return worker
}

export function suggestBestMove(position: PositionV1, timeoutMs = 10000, signal?: AbortSignal) {
  const requestId = crypto.randomUUID()

  return new Promise<EngineResponse>((resolve, reject) => {
    const activeWorker = getWorker()
    const timeoutId = window.setTimeout(() => {
      cleanup()
      reject(new Error("Analysis timed out"))
    }, timeoutMs)

    function cleanup() {
      window.clearTimeout(timeoutId)
      activeWorker.removeEventListener("message", onMessage)
      signal?.removeEventListener("abort", onAbort)
    }

    function onMessage(event: MessageEvent<EngineResponse & { error?: string }>) {
      if (event.data.id !== requestId) return
      cleanup()
      if (event.data.error) {
        reject(new Error(event.data.error))
      } else {
        resolve(event.data)
      }
    }

    function onAbort() {
      cleanup()
      reject(new DOMException("Analysis cancelled", "AbortError"))
    }

    activeWorker.addEventListener("message", onMessage)
    signal?.addEventListener("abort", onAbort)

    const positionId = positionIdFromBoard(position.board, position.turn)
    activeWorker.postMessage({ id: requestId, position, positionId })
  })
}
