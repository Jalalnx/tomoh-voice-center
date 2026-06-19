// Runtime URLs come from Vite env vars. Set in .env.local for dev; CI sets them at build time.
// In dev: VITE_API_URL=/api/v1  (Vite proxy → localhost:8000)
// In prod: VITE_API_URL=https://app.tomoh.io/api/v1

export const API_URL =
  import.meta.env.VITE_API_URL || '/api/v1';

// Platform login page — redirect anonymous users who want their info pre-filled.
// Login is optional for voice center forms.
export const PLATFORM_URL =
  import.meta.env.VITE_PLATFORM_URL || 'https://tomoh.io';

export const LOGIN_URL = `${PLATFORM_URL}/account/login`;
