import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function DiceStepper({
  label,
  value,
  onChange,
}: {
  label: string
  value: number | null
  onChange: (value: number | null) => void
}) {
  const display = value ?? 0

  function inc() {
    const next = display >= 6 ? 0 : display + 1
    onChange(next === 0 ? null : next)
  }

  function dec() {
    const next = display <= 0 ? 6 : display - 1
    onChange(next === 0 ? null : next)
  }

  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border bg-card px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <Button size="icon" variant="ghost" onClick={inc}>
        <ChevronUp className="h-4 w-4" />
      </Button>
      <div
        className={cn(
          "text-xl font-semibold",
          value === null && "text-muted-foreground"
        )}
      >
        {value ?? "?"}
      </div>
      <Button size="icon" variant="ghost" onClick={dec}>
        <ChevronDown className="h-4 w-4" />
      </Button>
    </div>
  )
}
