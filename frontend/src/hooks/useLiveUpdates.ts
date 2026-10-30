import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { liveUpdatesUrl, type ContentChangedMessage } from '../api/liveUpdates'

const FIRST_RETRY_MS = 1_000
const MAX_RETRY_MS = 30_000
// Several changes in a row (e.g. saving a page with images) cause a single reload.
const BATCH_MS = 300

/**
 * Keeps the open page in step with the server: when the admin changes content, the server says
 * so over a websocket and every page reloads its data in the background (no full page refresh).
 *
 * Only the cached data is reloaded. Forms keep what you are typing, because they hold their own copy.
 */
export function useLiveUpdates() {
  const queryClient = useQueryClient()

  useEffect(() => {
    let socket: WebSocket | null = null
    let retryMs = FIRST_RETRY_MS
    let retryTimer: ReturnType<typeof setTimeout> | undefined
    let batchTimer: ReturnType<typeof setTimeout> | undefined
    let hadConnection = false
    let stopped = false

    // Topics that only change admin data (e.g. a new contact message); public visitors need not reload.
    const ADMIN_ONLY_TOPICS = new Set(['contact-messages', 'subscribers'])
    let adminOnly = true

    // Reload site content; the signed-in user ("auth") is not content.
    const reloadContent = () => {
      const onlyAdmin = adminOnly
      adminOnly = true
      queryClient.invalidateQueries({
        predicate: (q) => q.queryKey[0] !== 'auth' && (!onlyAdmin || q.queryKey[0] === 'admin'),
      })
    }

    const scheduleReload = (topic?: string) => {
      if (!topic || !ADMIN_ONLY_TOPICS.has(topic)) adminOnly = false
      clearTimeout(batchTimer)
      batchTimer = setTimeout(reloadContent, BATCH_MS)
    }

    const connect = () => {
      socket = new WebSocket(liveUpdatesUrl())

      socket.onopen = () => {
        retryMs = FIRST_RETRY_MS
        // After a dropped connection we may have missed changes: catch up.
        if (hadConnection) scheduleReload()
        hadConnection = true
      }

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as ContentChangedMessage
          if (message.type === 'content.changed') scheduleReload(message.topic)
        } catch {
          // Ignore anything that is not one of our messages.
        }
      }

      socket.onclose = () => {
        if (stopped) return
        // Try again, waiting a little longer each time (1s, 2s, 4s … up to 30s).
        retryTimer = setTimeout(connect, retryMs)
        retryMs = Math.min(retryMs * 2, MAX_RETRY_MS)
      }
    }

    connect()

    return () => {
      stopped = true
      clearTimeout(retryTimer)
      clearTimeout(batchTimer)
      socket?.close()
    }
  }, [queryClient])
}
