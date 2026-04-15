import { fetchClient, setSessionId } from "#app/lib/api"
import type { UserT } from "#app/types/api-res"

export async function initSession(): Promise<UserT> {
  let sessionId = localStorage.getItem("sessionId")

  if (!sessionId) {
    const { data: user } = await fetchClient<UserT>(
      "/public-users/create-user",
      {
        method: "POST",
        useAuth: false
      }
    )

    setSessionId(user?.sessionId)
    localStorage.setItem("username", user?.username)

    return {
      sessionId: user?.sessionId,
      username: user?.username
    }
  }

  return {
    username: localStorage.getItem("username") || "User",
    sessionId: sessionId
  }
}
