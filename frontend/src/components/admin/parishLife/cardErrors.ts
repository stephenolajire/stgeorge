import { isAxiosError } from 'axios'

/** Turns DRF field errors ({field: ["msg"]}) into {formField: "msg"} using the given name map. */
export function fieldErrorsFrom<T extends string>(error: unknown, map: Record<string, T>): Partial<Record<T, string>> {
  const data = isAxiosError(error) ? error.response?.data : null
  const errors: Partial<Record<T, string>> = {}
  if (data && typeof data === 'object') {
    for (const [field, messages] of Object.entries(data)) {
      const key = map[field]
      if (key) errors[key] = Array.isArray(messages) ? String(messages[0]) : String(messages)
    }
  }
  return errors
}
