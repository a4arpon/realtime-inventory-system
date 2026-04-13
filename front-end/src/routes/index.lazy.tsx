import { createLazyFileRoute } from "@tanstack/react-router"

import { Button } from "#app/components/ui/button"

export const Route = createLazyFileRoute("/")({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <div>
      Hello "/"!
      <Button> World</Button>
    </div>
  )
}
