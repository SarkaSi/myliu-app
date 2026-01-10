import React, { useState, useEffect, useRef } from 'react';
import { detectAndCensorImage } from './nsfwDetection';

/**
 * CensoredImage Component
 * Automatically detects and censors NSFW content in profile photos
 * Only applies censorship to profile photos, not chat messages
 */
const CensoredImage = ({ src, alt, className, style, forProfile = true, ...props }) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [isProcessing, setIsProcessing] = useState(false);
  const imgRef = useRef(null);
  
  useEffect(() => {
    // Only process if it's a profile photo
    if (forProfile && src && (src.startsWith('/') || src.startsWith('data:image'))) {
      // Process local images (from public folder or base64)
      setIsProcessing(true);
      
      detectAndCensorImage(src, true)
        .then(censoredSrc => {
          setImageSrc(censoredSrc);
          setIsProcessing(false);
        })
        .catch(error => {
          console.error('Error censoring image:', error);
          // On error, show original image
          setImageSrc(src);
          setIsProcessing(false);
        });
    } else {
      // For non-profile images or external URLs, use original
      setImageSrc(src);
    }
  }, [src, forProfile]);
  
  // Reset image src when src prop changes
  useEffect(() => {
    setImageSrc(src);
  }, [src]);
  
  return (
    <img
      ref={imgRef}
      src={imageSrc || src}
      alt={alt}
      className={className}
      style={style}
      {...props}
      onLoad={() => {
        if (props.onLoad) props.onLoad();
      }}
      onError={() => {
        // If censored image fails to load, try original
        if (imageSrc !== src) {
          setImageSrc(src);
        }
        if (props.onError) props.onError();
      }}
    />
  );
};

export default CensoredImage;
