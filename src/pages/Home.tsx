import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Backgammon Move Suggester</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Button asChild size="lg">
            <Link to="/manual">Set up manually</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link to="/scan">Scan from photo</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/history">History</Link>
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Quick Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Use manual setup for speed. Scan is best with clear, overhead photos.
        </CardContent>
      </Card>
    </div>
  )
}
