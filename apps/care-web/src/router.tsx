import { createRouter, createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './routes/__root'

import HomePage from './pages/HomePage'
import { AboutPage } from './pages/AboutPage'
import { ServicesPage } from './pages/ServicesPage'
import { StatsPage } from './pages/StatsPage'
import { StoriesPage } from './pages/StoriesPage'
import { NewsPage } from './pages/NewsPage'
import { JoinPage } from './pages/JoinPage'
import { DonatePage } from './pages/DonatePage'
import { ContactPage } from './pages/ContactPage'
import { FaqPage } from './pages/FaqPage'
import { TestPage } from './pages/TestPage'

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'about',
  component: AboutPage,
})

const servicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'services',
  component: ServicesPage,
})

const statsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'stats',
  component: StatsPage,
})

const storiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'stories',
  component: StoriesPage,
})

const newsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'news',
  component: NewsPage,
})

const joinRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'join',
  component: JoinPage,
})

const donateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'donate',
  component: DonatePage,
})

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'contact',
  component: ContactPage,
})

const faqRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'faq',
  component: FaqPage,
})

const testRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'test',
  component: TestPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  aboutRoute,
  servicesRoute,
  statsRoute,
  storiesRoute,
  newsRoute,
  joinRoute,
  donateRoute,
  contactRoute,
  faqRoute,
  testRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
