import { createRootRoute, Outlet } from "@tanstack/react-router"

import { ReservationBadge } from "#app/components/shared/Reservation"

export const Route = createRootRoute({
  component: RootComponent
})

function RootComponent() {
  return (
    <>
      <Outlet />
      <ReservationBadge />
    </>
  )
}
