export type CheckerColor = "white" | "black"

export type CheckerCounts = {
  white: number
  black: number
}

export type BoardPoint = CheckerCounts

export type BoardState = {
  points: BoardPoint[]
  bar: CheckerCounts
  borneOff: CheckerCounts
  orientation: "whiteBottom" | "blackBottom"
}
