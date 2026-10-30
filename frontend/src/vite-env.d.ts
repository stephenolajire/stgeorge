/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the Django API, e.g. http://localhost:8000/api */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
