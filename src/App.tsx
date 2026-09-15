import { QueryProvider } from "@/providers/query-provider";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "@/router";

export function App() {
  return (
    <QueryProvider>
      <RouterProvider router={router} />
    </QueryProvider>
  );
}
