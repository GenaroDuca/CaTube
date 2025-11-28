import { VITE_API_URL } from '../../config';

export function resolveUrl(path) {
  if (!path) return '';
  const trimmed = path.trim();
  // If it's an absolute URL, return as-is
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  // If it starts with '/', prefix with VITE_API_URL
  if (trimmed.startsWith('/')) return `${VITE_API_URL}${trimmed}`;
  // Otherwise assume it's a path relative to API and prefix with slash
  return `${VITE_API_URL}/${trimmed}`;
}

export default resolveUrl;
