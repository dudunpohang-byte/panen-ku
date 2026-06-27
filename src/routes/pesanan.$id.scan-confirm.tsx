import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/pesanan/$id/scan-confirm')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/pesanan/$id/scan-confirm"!</div>
}
