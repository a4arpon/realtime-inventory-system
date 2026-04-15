import { useEffect, useState } from "react"

import { Badge } from "#app/components/ui/badge"
import { Button } from "#app/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "#app/components/ui/card"
import { Separator } from "#app/components/ui/separator"
import { Skeleton } from "#app/components/ui/skeleton"
import { cn } from "#app/lib/tw"
import type { DropT } from "#app/types/api-res"

interface DropCardProps {
  drop: DropT
  onReserve: (dropId: string) => void
  isReserving?: boolean
}

// Hardcoded placeholder – replace with dynamic image later
const THUMBNAIL_URL =
  "https://i.pinimg.com/1200x/d2/45/99/d24599c6c775e9607cd5009f30907990.jpg"

export function DropCard({
  drop,
  onReserve,
  isReserving = false
}: DropCardProps) {
  const isOutOfStock = drop.availableStock === 0
  const [stockChanged, setStockChanged] = useState(false)

  // Animate when stock changes (real‑time update)
  useEffect(() => {
    setStockChanged(true)
    const timer = setTimeout(() => setStockChanged(false), 500)
    return () => clearTimeout(timer)
  }, [drop.availableStock])

  // Stock color based on availability
  const stockColor = isOutOfStock
    ? "text-red-600"
    : drop.availableStock <= 5
      ? "text-yellow-600"
      : "text-green-600"

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg">
      {/* Image with overlay */}
      <div className="relative">
        <div className="bg-muted aspect-[4/3] w-full overflow-hidden">
          <img
            src={THUMBNAIL_URL}
            alt={drop.name}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
        {/* Overlay badge (no countdown) */}
        <Badge className="absolute top-2 right-2 bg-black/70 text-white hover:bg-black/70">
          Limited
        </Badge>
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-1 text-xl font-bold tracking-tight">
            {drop.name}
          </CardTitle>
          <Badge
            variant={isOutOfStock ? "destructive" : "secondary"}
            className="shrink-0"
          >
            {isOutOfStock ? "Out of Stock" : `${drop.availableStock} left`}
          </Badge>
        </div>
        <p className="text-primary text-2xl font-bold">
          ${(drop.price / 100).toFixed(2)}
        </p>
      </CardHeader>

      <CardContent className="space-y-3 pb-2">
        {/* Recent buyers */}
        <div>
          <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            Recent Purchasers
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {drop.purchases.slice(0, 3).map((purchase, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {purchase.user.username}
              </Badge>
            ))}
            {drop.purchases.length === 0 && (
              <span className="text-muted-foreground text-xs">
                No purchases yet
              </span>
            )}
          </div>
        </div>

        <Separator />

        {/* Live stock info with animation */}
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-medium">Live Stock</span>
          <div className="text-right">
            <span
              className={cn(
                "text-2xl font-bold transition-all duration-300",
                stockColor,
                stockChanged && "scale-110 text-primary"
              )}
            >
              {drop.availableStock}
            </span>
            <span className="text-muted-foreground ml-1 text-sm">units</span>
            {!isOutOfStock && (
              <div className="mt-1 animate-pulse text-xs text-green-600">
                ● Live
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          onClick={() => onReserve(drop.id)}
          disabled={isOutOfStock || isReserving}
        >
          {isReserving ? (
            <span className="flex items-center gap-2">
              <span className="border-background h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
              Reserving...
            </span>
          ) : isOutOfStock ? (
            "Out of Stock"
          ) : (
            "Reserve Now"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

export function DropCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-[4/3] w-full" />
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-8 w-1/3" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-2/3" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  )
}
