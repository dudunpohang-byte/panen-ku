import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin-panenku/returns')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin-panenku/returns"!</div>
}
