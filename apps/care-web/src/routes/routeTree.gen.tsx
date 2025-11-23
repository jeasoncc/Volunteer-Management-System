// This file is auto-generated, but we're creating a simple manual version for now

import { createRootRoute, createRoute } from '@tanstack/react-router'
import { lazy } from 'react'

// Lazy load all pages
const IndexComponent = lazy(() => import('../pages/HomePage').then(module => ({ default: module.default || module })))
const AboutComponent = lazy(() => import('../pages/AboutPage').then(module => ({ default: module.AboutPage || module })))
const ServicesComponent = lazy(() => import('../pages/ServicesPage').then(module => ({ default: module.ServicesPage || module })))
const StoriesComponent = lazy(() => import('../pages/StoriesPage').then(module => ({ default: module.StoriesPage || module })))
const NewsComponent = lazy(() => import('../pages/NewsPage').then(module => ({ default: module.NewsPage || module })))
const JoinComponent = lazy(() => import('../pages/JoinPage').then(module => ({ default: module.JoinPage || module })))
const DonateComponent = lazy(() => import('../pages/DonatePage').then(module => ({ default: module.DonatePage || module })))
const ContactComponent = lazy(() => import('../pages/ContactPage').then(module => ({ default: module.ContactPage || module })))
const FaqComponent = lazy(() => import('../pages/FaqPage').then(module => ({ default: module.FaqPage || module })))
const TestComponent = lazy(() => import('../pages/TestPage').then(module => ({ default: module.TestPage || module })))

// Create routes
const rootRoute = createRootRoute()

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexComponent,
})

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: AboutComponent,
})

const servicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/services',
  component: ServicesComponent,
})

const storiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/stories',
  component: StoriesComponent,
})

const newsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/news',
  component: NewsComponent,
})

const joinRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/join',
  component: JoinComponent,
})

const donateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/donate',
  component: DonateComponent,
})

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contact',
  component: ContactComponent,
})

const faqRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/faq',
  component: FaqComponent,
})

const testRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/test',
  component: TestComponent,
})

// Create route tree
export const routeTree = rootRoute.addChildren([
  indexRoute,
  aboutRoute,
  servicesRoute,
  storiesRoute,
  newsRoute,
  joinRoute,
  donateRoute,
  contactRoute,
  faqRoute,
  testRoute,
])