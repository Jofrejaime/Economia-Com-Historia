export const APP_CONFIG = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000/api",
  requestTimeoutMs: 10000,
  // Reverb (tempo real). Devem coincidir com REVERB_* do backend.
  reverb: {
    key: process.env.EXPO_PUBLIC_REVERB_KEY ?? "ech-local-key",
    host: process.env.EXPO_PUBLIC_REVERB_HOST ?? "127.0.0.1",
    port: Number(process.env.EXPO_PUBLIC_REVERB_PORT ?? 8080),
    scheme: (process.env.EXPO_PUBLIC_REVERB_SCHEME ?? "http") as "http" | "https",
  },
};
