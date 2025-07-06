export function buildUrl(path: string, params: Record<string, any> = {}): string {
  const url = new URL(path, window.location.origin);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  return url.toString().replace(window.location.origin, ""); // keeps it relative
}