import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { listPositions, exportPositions, importPositions, restoreBackupSnapshot } from "@/lib/storage/positions"
import { PositionV1 } from "@/lib/schema/position"
import { useToast } from "@/hooks/use-toast"

export default function HistoryPage() {
  const [positions, setPositions] = useState<PositionV1[]>([])
  const [importText, setImportText] = useState("")
  const { toast } = useToast()
  const navigate = useNavigate()

  async function refresh() {
    const items = await listPositions()
    setPositions(items)
  }

  useEffect(() => {
    refresh()
  }, [])

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Saved Positions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {positions.length === 0 && <div className="text-sm text-muted-foreground">No saved positions yet.</div>}
          {positions.map((pos) => (
            <div key={pos.id} className="rounded-lg border p-3 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{pos.label || "Untitled"}</div>
                  <div className="text-muted-foreground">{new Date(pos.createdAt).toLocaleString()}</div>
                </div>
                <Button size="sm" onClick={() => navigate("/analysis", { state: { positionId: pos.id } })}>
                  Analyze
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export / Import</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Button
            variant="outline"
            onClick={async () => {
              const json = await exportPositions()
              await navigator.clipboard.writeText(json)
              toast({ title: "Export copied to clipboard" })
            }}
          >
            Copy export JSON
          </Button>
          <Textarea
            placeholder="Paste export JSON"
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
          />
          <Button
            onClick={async () => {
              try {
                await importPositions(importText)
                toast({ title: "Import complete" })
                setImportText("")
                refresh()
              } catch (error) {
                toast({ title: "Import failed", description: (error as Error).message })
              }
            }}
          >
            Import JSON
          </Button>
          <Button
            variant="secondary"
            onClick={async () => {
              const count = await restoreBackupSnapshot()
              toast({ title: `Restored ${count} positions from backup` })
              refresh()
            }}
          >
            Restore local backup
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
