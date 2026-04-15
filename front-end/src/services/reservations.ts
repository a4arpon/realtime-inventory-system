import { fetchClient } from "#app/lib/api"
import type { PurchaseResponseT, ReservationT } from "#app/types/api-res"

export async function reserveDrop(dropId: string): Promise<ReservationT> {
  const { data: reservation } = await fetchClient<ReservationT>(
    "/public-reservations/reserve-drop",
    {
      method: "POST",
      body: JSON.stringify({ dropId }),
      useAuth: true
    }
  )

  return reservation
}

export async function getMyReservations(): Promise<ReservationT[]> {
  const { data: reservations } = await fetchClient<ReservationT[]>(
    "/public-reservations/my-reservations",

    {
      useAuth: true
    }
  )

  return reservations
}

export async function purchaseReservedDrop(
  reserveId: string
): Promise<PurchaseResponseT> {
  const { data: purchase } = await fetchClient<PurchaseResponseT>(
    "/public-reservations/purchase-reserved-drop",
    {
      method: "POST",
      body: JSON.stringify({ reserveId }),
      useAuth: true
    }
  )

  return purchase
}
