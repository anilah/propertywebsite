import { useState } from 'react';

interface CampaignMediaThumbProps {
  url?: string | null;
  assetType?: string | null;
  format?: string | null;
  thumbnailUrl?: string | null;
  className?: string;
  fallback?: React.ReactNode;
}

function isVideoAsset(assetType?: string | null, format?: string | null, url?: string | null): boolean {
  const type = (assetType || '').toUpperCase();
  const fmt = (format || '').toUpperCase();
  if (type === 'VIDEO' || fmt === 'VIDEO' || fmt === 'REEL') return true;
  if (url && /\.(mp4|mov|webm|m4v)(\?|$)/i.test(url)) return true;
  return false;
}

/**
 * Campaign list/detail thumbnail — images use <img>, videos use <video> poster/frame
 * (never put a video URL in <img>, which shows a broken-image icon).
 */
export function CampaignMediaThumb({
  url,
  assetType,
  format,
  thumbnailUrl,
  className = 'w-16 h-16 rounded-lg object-cover border border-gray-100',
  fallback,
}: CampaignMediaThumbProps) {
  const [failed, setFailed] = useState(false);
  const video = isVideoAsset(assetType, format, url);
  const imageSrc = thumbnailUrl || (!video ? url : null);

  if (!url && !thumbnailUrl) {
    return <>{fallback}</>;
  }

  if (failed) {
    return (
      <div className={`${className} flex items-center justify-center bg-slate-900 text-white`}>
        <span className="text-[10px] font-bold uppercase tracking-wide">
          {video ? (format?.toUpperCase() === 'REEL' ? 'Reel' : 'Video') : 'Media'}
        </span>
      </div>
    );
  }

  if (imageSrc) {
    return (
      <img
        src={imageSrc}
        alt=""
        className={className}
        onError={() => setFailed(true)}
      />
    );
  }

  // Video without a separate thumbnail — show first frame via <video>
  return (
    <div className={`relative overflow-hidden bg-slate-900 ${className}`}>
      <video
        src={url!}
        muted
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover"
        onError={() => setFailed(true)}
      />
      <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
        {format?.toUpperCase() === 'REEL' ? 'Reel' : 'Video'}
      </span>
    </div>
  );
}
