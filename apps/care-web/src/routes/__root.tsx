import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { NotificationProvider } from '../components/NotificationManager'
import { ScrollProgress } from '../components/ui/ScrollProgress'
import { BackToTop } from '../components/BackToTop'
import { ToastProvider } from '../components/ui/Toast'

export const Route = createRootRoute({
  component: () => (
    <NotificationProvider>
      <ToastProvider>
        <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/30">
          <ScrollProgress />
          <Header />
          <main id="main-content" tabIndex={-1}>
            <Outlet />
          </main>
          <Footer />
          <BackToTop />
          <TanStackRouterDevtools />
        </div>
      </ToastProvider>
    </NotificationProvider>
  ),
})
