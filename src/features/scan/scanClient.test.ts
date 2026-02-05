import { describe, expect, it, vi } from "vitest"
import { scanFromImage } from "./scanClient"

const mockResult = {
  version: "1",
  source: "photo",
  board: {
    points: Array.from({ length: 24 }, () => ({ white: 0, black: 0 })),
    bar: { white: 0, black: 0 },
    borneOff: { white: 0, black: 0 },
    orientation: "whiteBottom",
  },
  turn: null,
  dice: { d1: null, d2: null },
  cube: { value: null, owner: null },
  mode: "match",
  match: { length: 7, scoreWhite: 0, scoreBlack: 0 },
  confidence: { overall: 0.5, board: 0.5, dice: 0.5, cube: 0.5, match: 0.5, turn: 0.5 },
  unknowns: [],
}

describe("scanFromImage", () => {
  it("parses structured result", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({ result: mockResult }),
    })) as unknown as typeof fetch)

    const result = await scanFromImage("data:image/jpeg;base64,abc")
    expect(result.version).toBe("1")
  })
})
