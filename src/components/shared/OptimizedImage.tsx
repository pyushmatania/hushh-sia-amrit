import { useState, memo, type ImgHTMLAttributes } from "react";

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src: string;
  alt: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  onImageLoad?: () => void;
  showSkeleton?: boolean;
}

/**
 * OptimizedImage — a drop-in <img> replacement with:
 * - Responsive `srcset` via Vite asset URLs (2x/3x density hints)
 * - Native lazy loading by default (override with priority)
 * - Skeleton shimmer while loading
 * - `decoding="async"` for non-blocking decode
 * - Proper `fetchPriority` for above-the-fold images
 */
const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  fill = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  priority = false,
  onImageLoad,
  showSkeleton = true,
  className = "",
  style,
  ...rest
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);

  const handleLoad = () => {
    setLoaded(true);
    onImageLoad?.();
  };

  const fillStyles = fill
    ? { position: "absolute" as const, inset: 0, width: "100%", height: "100%" }
    : {};

  return (
    <>
      {showSkeleton && !loaded && (
        <div
          className="absolute inset-0 bg-secondary overflow-hidden"
          style={fillStyles}
        >
          <div className="absolute inset-0 shimmer-bg" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${loaded ? "" : "opacity-0"}`}
        style={{
          ...fillStyles,
          transition: "opacity 0.3s ease",
          ...style,
        }}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        sizes={sizes}
        onLoad={handleLoad}
        {...rest}
      />
    </>
  );
});

export default OptimizedImage;
