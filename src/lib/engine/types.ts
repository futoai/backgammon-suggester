import { PositionV1 } from "@/lib/schema/position"

export type EngineRequest = {
  id: string
  position: PositionV1
  positionId: string
}

export type EngineResponse = {
  id: string
  bestMove: string
  moves: Array<{ from: number; to: number }>
}
