import { useMemo, useState } from "react"
import BoardView, { PointClick } from "./BoardView"
import { BoardState, CheckerColor } from "./types"
import {
  adjustPoint,
  adjustZone,
  countCheckers,
  createEmptyBoard,
  setPointClear,
  setZoneClear,
  toggleOrientation,
} from "./helpers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"

export default function ManualEditor({
  board,
  onChange,
}: {
  board?: BoardState
  onChange?: (next: BoardState) => void
}) {
  const [internal, setInternal] = useState<BoardState>(board ?? createEmptyBoard())
  const [selectedColor, setSelectedColor] = useState<CheckerColor>("white")
  const [selection, setSelection] = useState<PointClick | null>(null)

  const current = board ?? internal
  const totals = useMemo(() => countCheckers(current), [current])
  const warning = totals.white > 15 || totals.black > 15

  function update(next: BoardState) {
    if (board) {
      onChange?.(next)
    } else {
      setInternal(next)
      onChange?.(next)
    }
  }

  function applyDelta(delta: number) {
    if (!selection) return
    if (selection.type === "point" && selection.index !== undefined) {
      update(adjustPoint(current, selection.index, selectedColor, delta))
    } else if (selection.type === "bar") {
      update(adjustZone(current, "bar", selectedColor, delta))
    } else if (selection.type === "borneOff") {
      update(adjustZone(current, "borneOff", selectedColor, delta))
    }
  }

  function clearSelection() {
    if (!selection) return
    if (selection.type === "point" && selection.index !== undefined) {
      update(setPointClear(current, selection.index))
    } else if (selection.type === "bar") {
      update(setZoneClear(current, "bar"))
    } else if (selection.type === "borneOff") {
      update(setZoneClear(current, "borneOff"))
    }
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Board Setup</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={selectedColor === "white" ? "default" : "secondary"}>
              {selectedColor === "white" ? "White" : "Black"}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedColor(selectedColor === "white" ? "black" : "white")}
            >
              Switch color
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span>White: {totals.white}</span>
              <span>Black: {totals.black}</span>
              {warning && <span className="text-destructive">Max 15 checkers</span>}
            </div>
            <Button size="sm" variant="outline" onClick={() => update(toggleOrientation(current))}>
              Flip board
            </Button>
          </div>
          <BoardView board={current} onPointClick={setSelection} />
        </CardContent>
      </Card>

      <Sheet open={!!selection} onOpenChange={(open) => !open && setSelection(null)}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Adjust {selection?.type}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Button onClick={() => applyDelta(1)}>+1</Button>
            <Button onClick={() => applyDelta(-1)} variant="secondary">
              -1
            </Button>
            <Button onClick={() => applyDelta(5)} variant="outline">
              +5
            </Button>
            <Button onClick={clearSelection} variant="destructive">
              Clear
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
