/** Media kinds that are campaign/marketing video, not photo gallery items. */
const VIDEO_KINDS = new Set(['VIDEO', 'REEL']);

export function isVideoUrl(url: string): boolean {
  const path = url.split('?')[0].toLowerCase();
  return /\.(mp4|webm|mov|m4v|avi|mkv)$/.test(path);
}

export function isVideoMediaKind(kind?: string | null): boolean {
  return VIDEO_KINDS.has(String(kind || '').toUpperCase());
}

/** First usable photo URL for listing cards (skips reels/videos). */
export function listingCoverImage(listing: {
  images?: string[];
  media?: { url: string; kind?: string }[];
}): string | undefined {
  if (listing.media && listing.media.length > 0) {
    const photo = listing.media.find(
      (m) => !isVideoMediaKind(m.kind) && m.url && !isVideoUrl(m.url)
    );
    if (photo?.url) return photo.url;
  }
  if (Array.isArray(listing.images)) {
    return listing.images.find((u) => typeof u === 'string' && u && !isVideoUrl(u));
  }
  return undefined;
}

/** Photo-only list for galleries / carousels (skips reels/videos). */
export function listingPhotoUrls(listing: {
  images?: string[];
  media?: { url: string; kind?: string }[];
}): string[] {
  if (listing.media && listing.media.length > 0) {
    return listing.media
      .filter((m) => !isVideoMediaKind(m.kind) && m.url && !isVideoUrl(m.url))
      .map((m) => m.url);
  }
  if (!Array.isArray(listing.images)) return [];
  return listing.images.filter((u) => typeof u === 'string' && u && !isVideoUrl(u));
}
