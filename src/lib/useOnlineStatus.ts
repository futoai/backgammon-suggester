import { useEffect, useState } from "react"

export function useOnlineStatus() {
  const [online, setOnline] = useState(() => navigator.onLine)

  useEffect(() => {
    const onChange = () => setOnline(navigator.onLine)
    window.addEventListener("online", onChange)
    window.addEventListener("offline", onChange)
    return () => {
      window.removeEventListener("online", onChange)
      window.removeEventListener("offline", onChange)
    }
  }, [])

  return online
}
