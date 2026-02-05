import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import ManualEditor from "@/features/board/ManualEditor"
import PositionFields from "@/features/analysis/PositionFields"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getPosition, savePosition } from "@/lib/storage/positions"
import { PositionV1, BackgammonScanResultV1 } from "@/lib/schema/position"
import { useToast } from "@/hooks/use-toast"

export default function ReviewPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { toast } = useToast()
  const state = location.state as { positionId?: string; scan?: BackgammonScanResultV1 } | null
  const [position, setPosition] = useState<PositionV1 | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      if (state?.positionId) {
        const stored = await getPosition(state.positionId)
        if (stored && active) setPosition(stored)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [state?.positionId])

  if (!position) {
    return <div className="text-sm text-muted-foreground">Loading…</div>
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>AI Review</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Confirm every field. Unknown items should stay unknown until you are sure.
        </CardContent>
      </Card>

      {state?.scan?.unknowns?.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Unknowns</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            {state.scan.unknowns.map((item, index) => (
              <div key={index} className="rounded-lg border p-2">
                <div className="font-medium">{item.field}</div>
                <div className="text-muted-foreground">{item.reason}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <ManualEditor
        board={position.board}
        onChange={(board) => setPosition((prev) => (prev ? { ...prev, board } : prev))}
      />
      <PositionFields position={position} onChange={setPosition} allowNotes />

      <Card>
        <CardHeader>
          <CardTitle>Next</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button
            onClick={async () => {
              await savePosition(position)
              toast({ title: "Position updated" })
              navigate("/analysis", { state: { positionId: position.id } })
            }}
          >
            Save & Analyze
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
