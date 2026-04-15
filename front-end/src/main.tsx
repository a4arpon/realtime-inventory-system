import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import { StrictMode } from "react"

import "#app/assets/app.css"
import { createRoot } from "react-dom/client"

import { Toaster } from "./components/ui/sonner"
import { initSocket } from "./lib/socket"
import { routeTree } from "./routeTree.gen"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 120, // 2 minutes
      refetchOnWindowFocus: false
    }
  }
})

initSocket(queryClient)

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  scrollRestoration: true
})

// Register module for typesafety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster position="top-center" />
    </QueryClientProvider>
  </StrictMode>
)
