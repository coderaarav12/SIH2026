export function apiUrl(path: string): string {
  const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  return baseUrl + cleanPath;
}
