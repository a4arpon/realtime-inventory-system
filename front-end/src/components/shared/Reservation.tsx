import { ShoppingCart } from "lucide-react"
import { useState } from "react"
import { useEffect } from "react"

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

// Helper to format remaining seconds to mm:ss
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
  onPurchase: (reservationId: string) => void
  isPurchasing: boolean
}) {
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const expires = new Date(reservation.expiresAt).getTime()
    const now = Date.now()
    return Math.max(0, Math.floor((expires - now) / 1000))
  })

  useEffect(() => {
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
  }, [timeLeft])

  const isExpired = timeLeft === 0

  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div>
        <p className="font-medium">{reservation.drop.name}</p>
        <p className="text-muted-foreground text-sm">
          ${(reservation.drop.price / 100).toFixed(2)}
        </p>
        {!isExpired ? (
          <p className="text-xs text-yellow-600">
            ⏱️ {formatTime(timeLeft)} left
          </p>
        ) : (
          <p className="text-xs text-red-500">
            Expired{" "}
            {new Date(reservation?.expiresAt)?.toLocaleString("en-US", {
              hour12: true
            })}
          </p>
        )}
      </div>
      <Button
        size="sm"
        onClick={() => onPurchase(reservation.id)}
        disabled={isExpired || isPurchasing}
      >
        {isPurchasing ? "Purchasing..." : "Purchase"}
      </Button>
    </div>
  )
}

export function ReservationBadge() {
  const [open, setOpen] = useState(false)
  const { data: reservations, isLoading, refetch } = useMyReservations()
  const { mutate: purchase, isPending: isPurchasing } = usePurchaseMutation()

  const activeCount =
    reservations?.filter(
      (r) => r.status === "active" && new Date(r.expiresAt) > new Date()
    ).length ?? 0

  const handlePurchase = (reservationId: string) => {
    purchase(reservationId, {
      onSuccess: () => {
        // Close dialog after purchase if no active reservations left
        refetch().then(({ data }) => {
          if (
            !data?.some(
              (r) => r.status === "active" && new Date(r.expiresAt) > new Date()
            )
          ) {
            setOpen(false)
          }
        })
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
      ></DialogTrigger>
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
                  isPurchasing={isPurchasing}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
