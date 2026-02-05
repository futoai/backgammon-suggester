import { BoardState } from "@/features/board/types"
import { PositionV1 } from "@/lib/schema/position"

const base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"

function bytesToBase64(bytes: Uint8Array) {
  let result = ""
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i]
    const b = bytes[i + 1] ?? 0
    const c = bytes[i + 2] ?? 0
    const triple = (a << 16) | (b << 8) | c
    result += base64Chars[(triple >> 18) & 63]
    result += base64Chars[(triple >> 12) & 63]
    result += i + 1 < bytes.length ? base64Chars[(triple >> 6) & 63] : "="
    result += i + 2 < bytes.length ? base64Chars[triple & 63] : "="
  }
  return result.replace(/=+$/, "")
}

function getOrder(color: "white" | "black") {
  if (color === "white") {
    return Array.from({ length: 24 }, (_, i) => i)
  }
  return Array.from({ length: 24 }, (_, i) => 23 - i)
}

function appendBits(bits: number[], count: number) {
  for (let i = 0; i < count; i++) bits.push(1)
  bits.push(0)
}

export function positionIdFromBoard(board: BoardState, turn: PositionV1["turn"]) {
  const player = turn ?? "white"
  const opponent = player === "white" ? "black" : "white"

  const bits: number[] = []

  const playerOrder = getOrder(player)
  playerOrder.forEach((idx) => appendBits(bits, board.points[idx][player]))
  appendBits(bits, board.bar[player])

  const opponentOrder = getOrder(opponent)
  opponentOrder.forEach((idx) => appendBits(bits, board.points[idx][opponent]))
  appendBits(bits, board.bar[opponent])

  while (bits.length < 80) bits.push(0)
  if (bits.length > 80) throw new Error("Invalid board for position ID")

  const bytes = new Uint8Array(10)
  bits.forEach((bit, idx) => {
    if (bit) {
      const byteIndex = Math.floor(idx / 8)
      const bitIndex = idx % 8
      bytes[byteIndex] |= 1 << bitIndex
    }
  })

  return bytesToBase64(bytes)
}
