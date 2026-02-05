import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useVisionModels } from "@/features/scan/useVisionModels"
import { useState } from "react"
import { getSelectedModel, setSelectedModel } from "@/features/scan/settings"

export default function SettingsPage() {
  const { models, loading, error } = useVisionModels()
  const [selected, setSelected] = useState(() => getSelectedModel())

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Vision Model</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          <Select
            value={selected}
            onValueChange={(value) => {
              setSelected(value)
              setSelectedModel(value)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto (best free)</SelectItem>
              {models.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {loading && <div className="text-sm text-muted-foreground">Loading models…</div>}
          {error && <div className="text-sm text-destructive">{error}</div>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Privacy</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Photos are processed only when you explicitly scan. The app works offline for everything else.
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Licenses</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          GNU Backgammon engine binaries are provided under the GPL. See README for full attribution.
        </CardContent>
      </Card>
    </div>
  )
}
