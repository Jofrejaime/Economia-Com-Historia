export const environment = {
  production: true,
  apiBaseUrl: 'http://127.0.0.1:8000',
  // Reverb (tempo real). Devem coincidir com REVERB_* do backend.
  reverb: {
    key: 'ech-local-key',
    host: '127.0.0.1',
    port: 8080,
    scheme: 'http' as 'http' | 'https',
  },
};
