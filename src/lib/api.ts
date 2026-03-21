// In production, calls go to the deployed Next.js backend.
// In dev, Vite proxy handles routing to localhost:3000.
const API_BASE = import.meta.env.VITE_API_URL || "";

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}
