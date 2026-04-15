import { useQuery, useQueryClient } from "@tanstack/react-query"

import { initSession } from "#app/services/user-profile"
import type { UserT } from "#app/types/api-res"

export function useSession() {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: ["session", "user"],
    queryFn: async () => {
      const cached = queryClient.getQueryData<UserT>(["session", "user"])
      if (cached) return cached
      const user = await initSession()
      return user
    },
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  })
}
