import { ShoppingCart } from "lucide-react"
import { useState, useEffect } from "react"

import { Badge } from "#app/components/ui/badge"
import { Button } from "#app/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "#app/components/ui/dialog"
import { useMyReservations } from "#app/hooks/useReservations"
import { usePurchaseMutation } from "#app/hooks/useReservations"
import type { ReservationT } from "#app/types/api-res"

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

function ReservationItem({
  reservation,
  onPurchase,
  isPurchasing
}: {
  reservation: ReservationT
  onPurchase: (id: string) => void
  isPurchasing: boolean
}) {
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const expires = new Date(reservation.expiresAt).getTime()
    const now = Date.now()
    return Math.max(0, Math.floor((expires - now) / 1000))
  })

  const [isPurchaseLocalState, setIsPurchaseLocalState] = useState(false)

  useEffect(() => {
    if (reservation.status !== "active") return
    if (timeLeft <= 0) return
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [timeLeft, reservation.status])

  const isActive = reservation.status === "active"
  const isExpired = reservation.status === "expired"
  const isCompleted = reservation.status === "completed"
  const expiredTimer = isActive && timeLeft === 0

  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div>
        <p className="font-medium">{reservation.drop.name}</p>
        <p className="text-muted-foreground text-sm">
          ${(reservation.drop.price / 100).toFixed(2)}
        </p>
        {isActive && !expiredTimer && (
          <p className="text-xs text-yellow-600">
            ⏱️ {formatTime(timeLeft)} left
          </p>
        )}
        {isActive && expiredTimer && (
          <p className="text-xs text-red-500">Expired (refresh to update)</p>
        )}
        {isExpired && (
          <p className="text-xs text-red-500">
            Expired on {new Date(reservation.expiresAt).toLocaleString()}
          </p>
        )}
        {isCompleted && <p className="text-xs text-green-600">Purchased ✓</p>}
      </div>
      {isActive && !expiredTimer && (
        <Button
          onClick={() => {
            onPurchase(reservation.id)
            setIsPurchaseLocalState(true)
          }}
          disabled={isPurchaseLocalState}
        >
          {isPurchasing ? "Purchasing..." : "Purchase"}
        </Button>
      )}
      {(isExpired || isCompleted || expiredTimer) && (
        <Badge variant="outline" className="text-xs">
          {isExpired ? "Expired" : isCompleted ? "Completed" : "Expired"}
        </Badge>
      )}
    </div>
  )
}

export function ReservationBadge() {
  const [open, setOpen] = useState(false)
  const { data: reservations, isLoading, refetch } = useMyReservations()
  const { mutate: purchase } = usePurchaseMutation()
  const [purchasingId, setPurchasingId] = useState<string | null>(null)

  const activeCount =
    reservations?.filter(
      (r) => r.status === "active" && new Date(r.expiresAt) > new Date()
    ).length ?? 0

  const handlePurchase = (reservationId: string) => {
    setPurchasingId(reservationId)
    purchase(reservationId, {
      onSettled: () => setPurchasingId(null),
      onSuccess: () => {
        refetch()
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            size="lg"
            className="fixed right-4 bottom-4 z-50 h-14 text-lg shadow-lg"
          >
            <ShoppingCart /> Reservations
            {activeCount > 0 && (
              <Badge variant="destructive" className="ml-1">
                {activeCount}
              </Badge>
            )}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle>My Reservations</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto pr-4">
          {isLoading ? (
            <div className="text-muted-foreground py-4 text-center">
              Loading...
            </div>
          ) : !reservations?.length ? (
            <div className="text-muted-foreground py-4 text-center">
              No reservations yet.
            </div>
          ) : (
            <div className="space-y-3">
              {reservations.map((res) => (
                <ReservationItem
                  key={res.id}
                  reservation={res}
                  onPurchase={handlePurchase}
                  isPurchasing={purchasingId === res.id}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
