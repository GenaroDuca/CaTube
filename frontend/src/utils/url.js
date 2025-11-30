import { VITE_API_URL } from '../../config';

export function resolveUrl(path) {
  if (!path) return '';
  const trimmed = path.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (trimmed.startsWith('/')) return `${VITE_API_URL}${trimmed}`;
  return `${VITE_API_URL}/${trimmed}`;
}

export default resolveUrl;
