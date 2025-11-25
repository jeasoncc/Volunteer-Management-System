import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { NotificationProvider } from '../components/NotificationManager'

export const Route = createRootRoute({
  component: () => (
    <NotificationProvider>
      <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/30">
        <Header />
        <main>
          <Outlet />
        </main>
        <Footer />
        <TanStackRouterDevtools />
      </div>
    </NotificationProvider>
  ),
})
