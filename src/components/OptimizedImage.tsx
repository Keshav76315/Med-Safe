import { ImgHTMLAttributes, useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export const OptimizedImage = ({ 
  src, 
  alt, 
  className, 
  priority = false,
  ...props 
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Convert to WebP if browser supports it (for future enhancement)
  const getOptimizedSrc = (originalSrc: string) => {
    // For now, return original src
    // In production, you'd convert images to WebP format
    return originalSrc;
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {!isLoaded && !hasError && (
        <div 
          className={cn(
            "absolute inset-0 bg-muted animate-pulse",
            className
          )}
          aria-hidden="true"
        />
      )}
      <img
        src={getOptimizedSrc(src)}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={cn(
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          hasError && "hidden",
          className
        )}
        {...props}
      />
      {hasError && (
        <div 
          className={cn(
            "absolute inset-0 bg-muted flex items-center justify-center text-muted-foreground text-sm",
            className
          )}
        >
          Failed to load image
        </div>
      )}
    </div>
  );
};
