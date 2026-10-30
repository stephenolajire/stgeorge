/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the Django API, e.g. http://localhost:8000/api */
  readonly VITE_API_URL?: string
  /** Websocket for live updates, e.g. ws://localhost:8000/ws/updates/ (optional; derived from VITE_API_URL) */
  readonly VITE_WS_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
