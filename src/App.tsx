import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { DashboardPage } from './pages/DashboardPage'
import { DraftPage } from './pages/DraftPage'
import { DraftRoomPage } from './pages/DraftRoomPage'
import { MyTeamPage } from './pages/MyTeamPage'
import { LeaderboardPage } from './pages/LeaderboardPage'
import { BracketPage } from './pages/BracketPage'
import { PlayerSearchPage } from './pages/PlayerSearchPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="draft" element={<DraftPage />} />
          <Route path="draft/room" element={<DraftRoomPage />} />
          <Route path="my-team" element={<MyTeamPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="bracket" element={<BracketPage />} />
          <Route path="players" element={<PlayerSearchPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
