export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const SESSION_COOKIE = "werefa_session";
export const PROVIDER_ID_COOKIE = "werefa_provider_id";
export const SERVICE_ID_COOKIE = "werefa_service_id";
export const APP_ROLE_COOKIE = "werefa_app_role";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 8;
