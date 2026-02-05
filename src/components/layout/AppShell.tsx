import { ReactNode } from "react"
import { Link, useLocation } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useOnlineStatus } from "@/lib/useOnlineStatus"

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/manual", label: "Manual" },
  { to: "/scan", label: "Scan" },
  { to: "/analysis", label: "Analysis" },
  { to: "/history", label: "History" },
  { to: "/settings", label: "Settings" },
]

export default function AppShell({ children }: { children: ReactNode }) {
  const online = useOnlineStatus()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="rounded-lg bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
              BG
            </span>
            <div className="text-sm font-semibold">Move Suggester</div>
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant={online ? "secondary" : "destructive"}>
              {online ? "Online" : "Offline"}
            </Badge>
            <Button asChild size="sm" variant="ghost">
              <Link to="/settings">Settings</Link>
            </Button>
          </div>
        </div>
        <nav className="mx-auto w-full max-w-5xl px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {navLinks.map((link) => (
              <Button
                key={link.to}
                asChild
                size="sm"
                variant={location.pathname === link.to ? "default" : "outline"}
              >
                <Link to={link.to}>{link.label}</Link>
              </Button>
            ))}
          </div>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-4">{children}</main>
    </div>
  )
}
