/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string;
  readonly VITE_ADMIN_REPORTS_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
