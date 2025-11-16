/**
 * 布局组件
 */

import { Link, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../hooks/useAuth'
import { Button } from './ui/button'

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate({ to: '/login' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="text-xl font-bold text-gray-900">
                莲花斋义工管理系统
              </Link>
              
              {isAuthenticated && (
                <nav className="flex gap-4">
                  <Link
                    to="/volunteers"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    activeProps={{ className: 'bg-gray-100 text-gray-900' }}
                  >
                    义工管理
                  </Link>
                  <Link
                    to="/checkin"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    activeProps={{ className: 'bg-gray-100 text-gray-900' }}
                  >
                    考勤管理
                  </Link>
                </nav>
              )}
            </div>

            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-gray-700">
                    {user?.name || user?.account}
                  </span>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    退出登录
                  </Button>
                </>
              ) : (
                <Link to="/login">
                  <Button size="sm">登录</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
