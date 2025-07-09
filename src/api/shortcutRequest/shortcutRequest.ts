import { adminGenericProxyFetch, IDeskproClient, proxyFetch } from "@deskpro/app-sdk";

interface ShortcutRequestParams {
  endpoint: string,
  method?: "GET" | "POST" | "PUT",
  data?: unknown
  apiToken?: string
}

/**
 * Wrapper fetch function for requests to the Shortcut API.
 *
 * @template T - The type of the response data.
 * 
 * @throws {ShortcutError} If the HTTP status code indicates a failed request (not 2xx or 3xx).
 */
export default async function shortcutRequest<T>(client: IDeskproClient, params: ShortcutRequestParams): Promise<T> {
  const { endpoint, method, data, apiToken } = params

  const isAdminDrawer = Boolean(apiToken)

  const baseURL = `https://api.app.shortcut.com/api/v3`
  const requestURL = `${baseURL}/${endpoint}`

  const dpFetch = await (isAdminDrawer ? adminGenericProxyFetch : proxyFetch)(client)

  const options: RequestInit = {
    method,
    headers: {
      "Shortcut-Token": `${isAdminDrawer ? apiToken : "__api_key__"}`,
      "Content-Type": "application/json",
    },
  }

  if (data) {
    options.body = JSON.stringify(data)
  }

  const response = await dpFetch(requestURL, options)

  if (isResponseError(response)) {
    let errorData: unknown
    const rawText = await response.text()

    try {
      errorData = JSON.parse(rawText)
    } catch {
      errorData = { message: "Unexpected response from Shortcut. The error format was not recognised.", raw: rawText }
    }

    throw new ShortcutError("Shortcut API Request Failed", { statusCode: response.status, data: errorData })

  }

  return await response.json() as T
}

interface ShortcutErrorPayload {
  statusCode: number
  data?: unknown
}

export class ShortcutError extends Error {
  data: ShortcutErrorPayload["data"]
  statusCode: ShortcutErrorPayload["statusCode"]

  constructor(message: string, payload: ShortcutErrorPayload) {
    super(message)
    this.name = "ShortcutError"
    this.data = payload.data
    this.statusCode = payload.statusCode
  }
}

interface ShortcutTroubleshootError {
    message: string
    errors?: Record<string, string>
}
export function isShortcutErrorWithMessage(data: unknown): data is ShortcutTroubleshootError {
    if (data && typeof data === "object" && "message" in data && typeof data.message === "string") {
        return true
    }
    return false
}

function isResponseError(response: Response): boolean {
  return response.status < 200 || response.status >= 400
}

