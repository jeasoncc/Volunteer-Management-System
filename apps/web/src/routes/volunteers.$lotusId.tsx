import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/volunteers/$lotusId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/volunteers/$lotusId"!</div>
}
