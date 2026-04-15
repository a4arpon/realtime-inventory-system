import { useQuery } from "@tanstack/react-query"

import { getDrops } from "#app/services/drops"

export function useDrops() {
  return useQuery({
    queryKey: ["drops", "all"],
    queryFn: getDrops
  })
}
