import { fetchClient } from "#app/lib/api"
import type { DropT } from "#app/types/api-res"

export async function getDrops(): Promise<DropT[]> {
  const { data: drops } = await fetchClient<DropT[]>("/public-drops/get-drops")

  return drops
}
