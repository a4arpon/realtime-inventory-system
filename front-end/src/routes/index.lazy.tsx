import { createLazyFileRoute } from "@tanstack/react-router"

import { DropCard, DropCardSkeleton } from "#app/components/shared/DropCard"
import { useDrops } from "#app/hooks/useDrops"
import { useReserveMutation } from "#app/hooks/useReservations"
import { useSession } from "#app/hooks/useSessionts"

export const Route = createLazyFileRoute("/")({
  component: RouteComponent
})

function RouteComponent() {
  const { data: user, isLoading: sessionLoading } = useSession()
  const { data: drops, isLoading: dropsLoading, error } = useDrops()
  const { mutate: reserve, isPending: isReserving } = useReserveMutation()

  if (sessionLoading || dropsLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <DropCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">Failed to load drops</div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6 space-y-4">
        <h1 className="text-3xl font-bold">Sneaker Drop</h1>
        <p className="text-muted-foreground text-4xl">
          Welcome back,{" "}
          <span className="text-primary font-bold">{user?.username}</span>!
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {drops?.map((drop) => (
          <DropCard
            key={drop.id}
            drop={drop}
            onReserve={() => reserve(drop.id)}
            isReserving={isReserving}
          />
        ))}
      </div>
    </div>
  )
}
