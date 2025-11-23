import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Suspense } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';
import { BackToTop } from '../components/BackToTop';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { NotificationProvider } from '../components/NotificationManager';

export const Route = createRootRoute({
  component: () => (
    <NotificationProvider>
      <div className="min-h-screen flex flex-col bg-[#f9f4e8]">
        <SEO />
        <Header />
        <main className="flex-1">
          <Suspense fallback={<LoadingSpinner size="lg" className="h-64" />}>
            <Outlet />
          </Suspense>
        </main>
        <Footer />
        <BackToTop />
      </div>
    </NotificationProvider>
  ),
});