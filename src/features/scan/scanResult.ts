import { BackgammonScanResultV1 } from "@/lib/schema/position"
import { PositionV1 } from "@/lib/schema/position"
import { createPosition } from "@/lib/position"

export function scanResultToPosition(scan: BackgammonScanResultV1): PositionV1 {
  return createPosition({
    source: "photo",
    board: scan.board,
    turn: scan.turn,
    dice: scan.dice,
    cube: scan.cube,
    mode: scan.mode,
    match: scan.match,
  })
}
