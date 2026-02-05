import { Navigate, Route, Routes } from "react-router-dom"
import HomePage from "@/pages/Home"
import ManualSetupPage from "@/pages/ManualSetup"
import ScanPage from "@/pages/Scan"
import ReviewPage from "@/pages/Review"
import AnalysisPage from "@/pages/Analysis"
import HistoryPage from "@/pages/History"
import SettingsPage from "@/pages/Settings"
import AppShell from "@/components/layout/AppShell"

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/manual" element={<ManualSetupPage />} />
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}
