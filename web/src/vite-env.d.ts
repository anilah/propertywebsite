/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_SITE_ENABLED?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_ADMIN_TEST_MOBILE?: string;
  readonly VITE_ADMIN_TEST_OTP?: string;
  readonly VITE_GA_MEASUREMENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
