import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  getMyReservations,
  purchaseReservedDrop,
  reserveDrop
} from "#app/services/reservations"

export function useMyReservations() {
  return useQuery({
    queryKey: ["reservations", "my"],
    queryFn: getMyReservations
  })
}

export function useReserveMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dropId: string) => reserveDrop(dropId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drops", "all"] })
      queryClient.invalidateQueries({ queryKey: ["reservations", "my"] })

      toast.success("Reserved! You have 60 seconds to purchase.")
    }
  })
}

export function usePurchaseMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (reserveId: string) => purchaseReservedDrop(reserveId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drops", "all"] })
      queryClient.invalidateQueries({ queryKey: ["reservations", "my"] })
      queryClient.invalidateQueries({ queryKey: ["reservations", "my"] })
      toast.success("Purchase completed!")
    }
  })
}
