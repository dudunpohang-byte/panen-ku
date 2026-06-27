import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/admin-panenku/")({
  component: () => <Navigate to="/admin-panenku/verifikasi" />,
});
