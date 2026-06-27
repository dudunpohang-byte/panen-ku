import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin-panenku/security')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin-panenku/security"!</div>
}
