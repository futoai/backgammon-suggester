import DiceStepper from "@/components/DiceStepper"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { PositionV1 } from "@/lib/schema/position"

export default function PositionFields({
  position,
  onChange,
  allowNotes,
}: {
  position: PositionV1
  onChange: (next: PositionV1) => void
  allowNotes?: boolean
}) {
  function update(partial: Partial<PositionV1>) {
    onChange({ ...position, ...partial })
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Turn & Dice</CardTitle>
          <Select
            value={position.turn ?? "unknown"}
            onValueChange={(value) => update({ turn: value === "unknown" ? null : (value as PositionV1["turn"]) })}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Turn" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unknown">Unknown</SelectItem>
              <SelectItem value="white">White to move</SelectItem>
              <SelectItem value="black">Black to move</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <DiceStepper
            label="Die 1"
            value={position.dice.d1}
            onChange={(value) => update({ dice: { ...position.dice, d1: value } })}
          />
          <DiceStepper
            label="Die 2"
            value={position.dice.d2}
            onChange={(value) => update({ dice: { ...position.dice, d2: value } })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Cube & Mode</CardTitle>
          <div className="flex items-center gap-2 text-sm">
            <span>Match</span>
            <Switch
              checked={position.mode === "money"}
              onCheckedChange={(checked) => update({ mode: checked ? "money" : "match" })}
            />
            <span>Money</span>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              min={1}
              max={64}
              placeholder="Cube value"
              value={position.cube.value ?? ""}
              onChange={(event) =>
                update({ cube: { ...position.cube, value: event.target.value ? Number(event.target.value) : null } })
              }
            />
            <Select
              value={position.cube.owner ?? "unknown"}
              onValueChange={(value) =>
                update({ cube: { ...position.cube, owner: value === "unknown" ? null : (value as PositionV1["cube"]["owner"]) } })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Cube owner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unknown">Unknown</SelectItem>
                <SelectItem value="center">Centered</SelectItem>
                <SelectItem value="white">White owns</SelectItem>
                <SelectItem value="black">Black owns</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {position.mode === "match" && (
            <div className="grid gap-2">
              <div className="text-sm font-medium">Match score</div>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  type="number"
                  min={1}
                  max={25}
                  placeholder="Length"
                  value={position.match.length ?? ""}
                  onChange={(event) =>
                    update({ match: { ...position.match, length: event.target.value ? Number(event.target.value) : null } })
                  }
                />
                <Input
                  type="number"
                  min={0}
                  max={24}
                  placeholder="White"
                  value={position.match.scoreWhite ?? ""}
                  onChange={(event) =>
                    update({
                      match: {
                        ...position.match,
                        scoreWhite: event.target.value ? Number(event.target.value) : null,
                      },
                    })
                  }
                />
                <Input
                  type="number"
                  min={0}
                  max={24}
                  placeholder="Black"
                  value={position.match.scoreBlack ?? ""}
                  onChange={(event) =>
                    update({
                      match: {
                        ...position.match,
                        scoreBlack: event.target.value ? Number(event.target.value) : null,
                      },
                    })
                  }
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {allowNotes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Input
              placeholder="Label"
              value={position.label ?? ""}
              onChange={(event) => update({ label: event.target.value })}
            />
            <Input
              placeholder="Notes"
              value={position.notes ?? ""}
              onChange={(event) => update({ notes: event.target.value })}
            />
            <Button variant="outline" onClick={() => update({ label: "", notes: "" })}>
              Clear notes
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
