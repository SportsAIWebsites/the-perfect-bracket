import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/draft': 'Draft Players',
  '/my-team': 'My Team',
  '/leaderboard': 'Global Leaderboard',
  '/bracket': 'Bracket',
  '/players': 'All Players',
}

export function AppShell() {
  const { pathname } = useLocation()
  const title = pageTitles[pathname] ?? 'March Madness Fantasy'

  return (
    <div className="min-h-screen bg-[#0C0C0C]">
      <Sidebar />
      <div className="ml-56">
        <TopBar title={title} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
