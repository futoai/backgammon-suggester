import { BoardState, CheckerColor } from "./types"

export function createEmptyBoard(orientation: BoardState["orientation"] = "whiteBottom"): BoardState {
  return {
    points: Array.from({ length: 24 }, () => ({ white: 0, black: 0 })),
    bar: { white: 0, black: 0 },
    borneOff: { white: 0, black: 0 },
    orientation,
  }
}

export function countCheckers(board: BoardState) {
  const totals = { white: 0, black: 0 }
  board.points.forEach((p) => {
    totals.white += p.white
    totals.black += p.black
  })
  totals.white += board.bar.white + board.borneOff.white
  totals.black += board.bar.black + board.borneOff.black
  return totals
}

export function clampChecker(value: number) {
  return Math.max(0, Math.min(15, value))
}

export function adjustPoint(
  board: BoardState,
  index: number,
  color: CheckerColor,
  delta: number
) {
  const next = structuredClone(board)
  next.points[index][color] = clampChecker(next.points[index][color] + delta)
  return next
}

export function setPointClear(board: BoardState, index: number) {
  const next = structuredClone(board)
  next.points[index] = { white: 0, black: 0 }
  return next
}

export function adjustZone(
  board: BoardState,
  zone: "bar" | "borneOff",
  color: CheckerColor,
  delta: number
) {
  const next = structuredClone(board)
  next[zone][color] = clampChecker(next[zone][color] + delta)
  return next
}

export function setZoneClear(board: BoardState, zone: "bar" | "borneOff") {
  const next = structuredClone(board)
  next[zone] = { white: 0, black: 0 }
  return next
}

export function toggleOrientation(board: BoardState): BoardState {
  return {
    ...board,
    orientation: board.orientation === "whiteBottom" ? "blackBottom" as const : "whiteBottom" as const,
  }
}

export function displayOrder(board: BoardState, row: "top" | "bottom") {
  const indices = row === "bottom" ? Array.from({ length: 12 }, (_, i) => i) : Array.from({ length: 12 }, (_, i) => i + 12)
  if (board.orientation === "whiteBottom") {
    return indices
  }
  return indices.slice().reverse()
}
