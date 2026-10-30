import { API_URL } from './api'

/**
 * Websocket address for live updates. Set VITE_WS_URL to override; otherwise it is
 * worked out from the API address: http://host/api → ws://host/ws/updates/.
 */
export function liveUpdatesUrl(): string {
  if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL
  const url = new URL(API_URL, window.location.origin)
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  url.pathname = '/ws/updates/'
  url.search = ''
  return url.toString()
}

/** Message the server sends when content changes. */
export interface ContentChangedMessage {
  type: 'content.changed'
  /** Which area changed: about, clergy, parish-life, parish-groups, … */
  topic: string
}
