import { describe, expect, it, vi } from "vitest"
import { suggestBestMove } from "./gnubgClient"
import { createPosition } from "@/lib/position"

class FakeWorker {
  listeners: Array<(event: MessageEvent) => void> = []
  postMessage(message: { id: string }) {
    const response = {
      id: message.id,
      bestMove: "24/18 13/9",
      moves: [
        { from: 24, to: 18 },
        { from: 13, to: 9 },
      ],
    }
    setTimeout(() => {
      this.listeners.forEach((handler) => handler({ data: response } as MessageEvent))
    }, 10)
  }
  addEventListener(_type: string, handler: (event: MessageEvent) => void) {
    this.listeners.push(handler)
  }
  removeEventListener(_type: string, handler: (event: MessageEvent) => void) {
    this.listeners = this.listeners.filter((item) => item !== handler)
  }
  terminate() {}
}

describe("suggestBestMove", () => {
  it("returns best move", async () => {
    vi.stubGlobal("Worker", FakeWorker as unknown as typeof Worker)
    const result = await suggestBestMove(createPosition(), 1000)
    expect(result.bestMove).toBe("24/18 13/9")
  })
})
