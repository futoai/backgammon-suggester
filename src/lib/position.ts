import { BoardState } from "@/features/board/types"
import { PositionV1 } from "@/lib/schema/position"

export function createPosition(overrides?: Partial<PositionV1>): PositionV1 {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    source: "manual",
    board: overrides?.board ?? {
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
    ...overrides,
  }
}

export function boardFromState(board: BoardState) {
  return board
}

export function updatePosition(position: PositionV1, updates: Partial<PositionV1>) {
  return {
    ...position,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
}
