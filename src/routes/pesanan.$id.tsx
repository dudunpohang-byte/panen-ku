import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/pesanan/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/pesanan/$id"!</div>
}
