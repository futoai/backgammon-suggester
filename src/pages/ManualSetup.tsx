import { useState } from "react"
import ManualEditor from "@/features/board/ManualEditor"
import PositionFields from "@/features/analysis/PositionFields"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createPosition } from "@/lib/position"
import { savePosition } from "@/lib/storage/positions"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"

export default function ManualSetupPage() {
  const [position, setPosition] = useState(() => createPosition({ source: "manual" }))
  const { toast } = useToast()
  const navigate = useNavigate()

  return (
    <div className="grid gap-4">
      <ManualEditor
        board={position.board}
        onChange={(board) => setPosition((prev) => ({ ...prev, board }))}
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
              toast({ title: "Position saved" })
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
