import { BoardState, CheckerColor } from "./types"
import { displayOrder } from "./helpers"
import { cn } from "@/lib/utils"

export type PointClick = {
  type: "point" | "bar" | "borneOff"
  index?: number
}

function CheckerStack({ count, color }: { count: number; color: CheckerColor }) {
  if (count === 0) return null
  return (
    <div className="flex flex-col items-center gap-1">
      {Array.from({ length: Math.min(5, count) }).map((_, idx) => (
        <div
          key={idx}
          className={cn(
            "h-5 w-5 rounded-full border",
            color === "white" ? "bg-white border-slate-300" : "bg-slate-900 border-slate-700"
          )}
        />
      ))}
      {count > 5 && (
        <div className="text-[10px] font-semibold text-muted-foreground">+{count - 5}</div>
      )}
    </div>
  )
}

function PointColumn({
  label,
  white,
  black,
  onClick,
  highlighted,
}: {
  label: string
  white: number
  black: number
  onClick: () => void
  highlighted?: boolean
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-full w-full flex-col items-center justify-between rounded-lg border bg-card px-1 py-2 text-xs",
        highlighted && "border-primary ring-2 ring-primary/30"
      )}
      onClick={onClick}
    >
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="flex flex-col gap-2">
        <CheckerStack count={white} color="white" />
        <CheckerStack count={black} color="black" />
      </div>
    </button>
  )
}

export default function BoardView({
  board,
  onPointClick,
  highlightMoves = [],
}: {
  board: BoardState
  onPointClick?: (payload: PointClick) => void
  highlightMoves?: Array<{ from: number; to: number }>
}) {
  const top = displayOrder(board, "top")
  const bottom = displayOrder(board, "bottom")
  const highlightSet = new Set(highlightMoves.flatMap((move) => [move.from, move.to]))

  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-[1fr_auto_1fr] gap-3">
        <div className="grid grid-cols-6 gap-2">
          {top.slice(0, 6).map((idx) => (
            <PointColumn
              key={idx}
              label={`${idx + 1}`}
              white={board.points[idx].white}
              black={board.points[idx].black}
              onClick={() => onPointClick?.({ type: "point", index: idx })}
              highlighted={highlightSet.has(idx + 1)}
            />
          ))}
        </div>
        <div className="grid gap-2">
          <PointColumn
            label="Bar"
            white={board.bar.white}
            black={board.bar.black}
            onClick={() => onPointClick?.({ type: "bar" })}
          />
          <PointColumn
            label="Off"
            white={board.borneOff.white}
            black={board.borneOff.black}
            onClick={() => onPointClick?.({ type: "borneOff" })}
          />
        </div>
        <div className="grid grid-cols-6 gap-2">
          {top.slice(6).map((idx) => (
            <PointColumn
              key={idx}
              label={`${idx + 1}`}
              white={board.points[idx].white}
              black={board.points[idx].black}
              onClick={() => onPointClick?.({ type: "point", index: idx })}
              highlighted={highlightSet.has(idx + 1)}
            />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] gap-3">
        <div className="grid grid-cols-6 gap-2">
          {bottom.slice(0, 6).map((idx) => (
            <PointColumn
              key={idx}
              label={`${idx + 1}`}
              white={board.points[idx].white}
              black={board.points[idx].black}
              onClick={() => onPointClick?.({ type: "point", index: idx })}
              highlighted={highlightSet.has(idx + 1)}
            />
          ))}
        </div>
        <div className="grid gap-2">
          <div className="flex h-full items-center justify-center rounded-lg border bg-muted text-xs text-muted-foreground">
            Board
          </div>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {bottom.slice(6).map((idx) => (
            <PointColumn
              key={idx}
              label={`${idx + 1}`}
              white={board.points[idx].white}
              black={board.points[idx].black}
              onClick={() => onPointClick?.({ type: "point", index: idx })}
              highlighted={highlightSet.has(idx + 1)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
