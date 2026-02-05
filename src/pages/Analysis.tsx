import { useEffect, useMemo, useState } from "react"
import { useLocation } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import PositionFields from "@/features/analysis/PositionFields"
import BoardView from "@/features/board/BoardView"
import { PositionV1 } from "@/lib/schema/position"
import { createPosition } from "@/lib/position"
import { getPosition, savePosition } from "@/lib/storage/positions"
import { suggestBestMove } from "@/lib/engine/gnubgClient"
import { useToast } from "@/hooks/use-toast"

export default function AnalysisPage() {
  const location = useLocation()
  const positionId = (location.state as { positionId?: string } | null)?.positionId
  const [position, setPosition] = useState<PositionV1 | null>(null)
  const [result, setResult] = useState<{ bestMove: string; moves: Array<{ from: number; to: number }> } | null>(null)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [controller, setController] = useState<AbortController | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    let active = true
    async function load() {
      if (positionId) {
        const stored = await getPosition(positionId)
        if (stored && active) {
          setPosition(stored)
          return
        }
      }
      if (active) setPosition(createPosition({ source: "manual" }))
    }
    load()
    return () => {
      active = false
    }
  }, [positionId])

  const displayPosition = position ?? createPosition({ source: "manual" })
  const currentMoves = useMemo(() => result?.moves ?? [], [result])

  async function runAnalysis() {
    if (!position) return
    setBusy(true)
    setProgress(10)
    setResult(null)
    const aborter = new AbortController()
    setController(aborter)

    try {
      const interval = window.setInterval(() => {
        setProgress((prev) => Math.min(prev + 15, 90))
      }, 1000)
      const analysis = await suggestBestMove(position, 10000, aborter.signal)
      window.clearInterval(interval)
      setResult(analysis)
      setProgress(100)
      await savePosition(position)
    } catch (error) {
      toast({ title: "Analysis failed", description: (error as Error).message })
      setProgress(0)
    } finally {
      setBusy(false)
      setController(null)
    }
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Board Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <BoardView board={displayPosition.board} highlightMoves={currentMoves} />
        </CardContent>
      </Card>

      <PositionFields position={displayPosition} onChange={(next) => setPosition(next)} />

      <Card>
        <CardHeader>
          <CardTitle>Best Move</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="text-lg font-semibold">
            {result?.bestMove || "Run analysis to get a move."}
          </div>
          {busy && (
            <div className="grid gap-2">
              <Progress value={progress} />
              <Button variant="outline" onClick={() => controller?.abort()}>
                Cancel analysis
              </Button>
            </div>
          )}
          <Button onClick={runAnalysis} disabled={busy}>
            Suggest best move
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
