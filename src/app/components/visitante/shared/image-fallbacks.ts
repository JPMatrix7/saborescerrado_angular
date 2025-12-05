export const VISITANTE_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1481391032119-d89fee407e44?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1441988778268-5876e0bf7c3d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80'
];

export function fallbackImage(index = 0): string {
  return VISITANTE_FALLBACK_IMAGES[index % VISITANTE_FALLBACK_IMAGES.length];
}
