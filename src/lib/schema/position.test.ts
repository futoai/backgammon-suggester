import { describe, expect, it } from "vitest"
import { BackgammonScanResultV1Schema } from "./position"

const baseScan = {
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

describe("BackgammonScanResultV1Schema", () => {
  it("accepts a valid scan", () => {
    const result = BackgammonScanResultV1Schema.parse(baseScan)
    expect(result.version).toBe("1")
  })

  it("rejects invalid checker counts", () => {
    expect(() =>
      BackgammonScanResultV1Schema.parse({
        ...baseScan,
        board: { ...baseScan.board, bar: { white: 20, black: 0 } },
      })
    ).toThrow()
  })
})
