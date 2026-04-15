import { toast } from "sonner"

export const API_BASE = import.meta.env.VITE_API_URL

function getSessionId(): string | null {
  return localStorage.getItem("sessionId")
}

export function setSessionId(sessionId: string) {
  localStorage.setItem("sessionId", sessionId)
}

interface FetchOptions extends RequestInit {
  method?: "GET" | "POST" | "PUT" | "DELETE"
  useAuth?: boolean
}

type ResponseT<T> = {
  success: boolean
  message: string
  data: T
  extra: null
}

export async function fetchClient<T>(
  endpoint: string,
  options: FetchOptions = {
    method: "GET",
    useAuth: false
  }
): Promise<ResponseT<T>> {
  const { useAuth, ...fetchOptions } = options

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...((fetchOptions.headers as Record<string, string>) ?? {})
  }

  if (useAuth) {
    const sessionId = getSessionId()
    if (!sessionId) {
      throw new Error("No session ID found. Please re-authenticate.")
    }
    headers["Authorization"] = `Bearer ${sessionId}`
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers
  })

  const json = await response.json()

  if (!response.ok) {
    const errorMessage = json?.message || json.error || "Request failed"

    toast.error(errorMessage)
    throw new Error(errorMessage)
  }

  return json
}
