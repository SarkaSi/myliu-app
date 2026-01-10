// NSFW Detection and Censorship Module
// Detects nudity in images and automatically censors with blue heart emoji

/**
 * Detect sensitive regions in an image using heuristical color analysis
 * Returns array of regions to censor: {x, y, width, height, type: 'breast'|'genital'}
 */
export async function detectNSFWRegions(imageElement) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = imageElement.width;
  canvas.height = imageElement.height;
  
  ctx.drawImage(imageElement, 0, 0);
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  const regions = [];
  
  // Define regions of interest (top 2/3 of image for chest area, bottom 1/3 for genital area)
  const chestRegionTop = 0;
  const chestRegionBottom = Math.floor(canvas.height * 0.65);
  const genitalRegionTop = Math.floor(canvas.height * 0.65);
  const genitalRegionBottom = canvas.height;
  
  // Analyze skin tone regions
  // Skin tones typically have: R > G > B (for lighter skin) or R ≈ G ≈ B (for darker skin)
  // And have certain hue/saturation values
  
  // Check chest region (upper 2/3)
  const chestRegions = analyzeRegionForNudity(data, canvas.width, canvas.height, chestRegionTop, chestRegionBottom, 0.2, 0.8, 'breast');
  regions.push(...chestRegions);
  
  // Check genital region (lower 1/3, center 40% width)
  const genitalRegions = analyzeRegionForNudity(data, canvas.width, canvas.height, genitalRegionTop, genitalRegionBottom, 0.3, 0.7, 'genital');
  regions.push(...genitalRegions);
  
  return regions;
}

/**
 * Analyze a region for potential nudity based on skin color detection
 */
function analyzeRegionForNudity(data, width, height, regionTop, regionBottom, widthStart, widthEnd, type) {
  const regions = [];
  const regionWidth = Math.floor(width * (widthEnd - widthStart));
  const regionLeft = Math.floor(width * widthStart);
  const regionHeight = regionBottom - regionTop;
  
  // Sample grid points to detect skin-colored pixels
  const gridSize = 20; // Sample every 20 pixels
  const skinPixels = [];
  
  for (let y = regionTop; y < regionBottom; y += gridSize) {
    for (let x = regionLeft; x < regionLeft + regionWidth; x += gridSize) {
      if (x >= width || y >= height) continue;
      
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const a = data[index + 3];
      
      // Skip transparent pixels
      if (a < 128) continue;
      
      // Check if pixel color matches skin tone
      if (isSkinTone(r, g, b)) {
        skinPixels.push({ x, y });
      }
    }
  }
  
  // If significant number of skin pixels found, mark region for censorship
  const skinPixelRatio = skinPixels.length / ((regionWidth / gridSize) * (regionHeight / gridSize));
  
  if (skinPixelRatio > 0.3) { // 30% skin pixels threshold
    // Calculate bounding box
    if (skinPixels.length > 0) {
      const xs = skinPixels.map(p => p.x);
      const ys = skinPixels.map(p => p.y);
      const minX = Math.max(0, Math.min(...xs) - gridSize);
      const maxX = Math.min(width, Math.max(...xs) + gridSize);
      const minY = Math.max(0, Math.min(...ys) - gridSize);
      const maxY = Math.min(height, Math.max(...ys) + gridSize);
      
      regions.push({
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
        type: type
      });
    }
  }
  
  return regions;
}

/**
 * Check if RGB color matches common skin tones
 */
function isSkinTone(r, g, b) {
  // Normalize to 0-1 range
  const normR = r / 255;
  const normG = g / 255;
  const normB = b / 255;
  
  // Convert to HSV for better skin detection
  const { h, s, v } = rgbToHsv(normR, normG, normB);
  
  // Skin tones typically have:
  // - Hue: 0-50 (red-yellow range) or 340-360 (red range)
  // - Saturation: 0.2-0.7
  // - Value (brightness): 0.3-0.95
  
  const hue = h * 360;
  const isSkinHue = (hue >= 0 && hue <= 50) || (hue >= 340 && hue <= 360);
  const isSkinSaturation = s >= 0.2 && s <= 0.7;
  const isSkinValue = v >= 0.3 && v <= 0.95;
  
  // Additional RGB-based check for common skin colors
  const isLightSkin = r > 95 && g > 40 && b > 20 && r > g && g > b && (r - b) > 15 && (r - g) > 15;
  const isDarkSkin = r > 50 && g > 35 && b > 20 && r > b && g > b && (r - b) < 30;
  
  return (isSkinHue && isSkinSaturation && isSkinValue) || isLightSkin || isDarkSkin;
}

/**
 * Convert RGB to HSV
 */
function rgbToHsv(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  
  let h = 0;
  if (diff !== 0) {
    if (max === r) {
      h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
    } else if (max === g) {
      h = ((b - r) / diff + 2) / 6;
    } else {
      h = ((r - g) / diff + 4) / 6;
    }
  }
  
  const s = max === 0 ? 0 : diff / max;
  const v = max;
  
  return { h, s, v };
}

/**
 * Draw a heart shape on canvas
 */
function drawHeart(ctx, x, y, size) {
  ctx.save();
  
  // Draw blue heart using emoji
  ctx.font = `${size * 0.8}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#1E88E5';
  ctx.lineWidth = 2;
  
  const heartEmoji = '💙'; // Blue heart emoji (if supported, otherwise use ❤️)
  
  // Try to draw emoji
  try {
    ctx.strokeText(heartEmoji, x, y);
    ctx.fillText(heartEmoji, x, y);
  } catch (e) {
    // Fallback: Draw heart shape using path
    ctx.beginPath();
    const topOffset = size * 0.15;
    const radius = size * 0.25;
    
    // Left circle
    ctx.arc(x - radius * 0.8, y - topOffset, radius, 0, Math.PI * 2);
    // Right circle
    ctx.arc(x + radius * 0.8, y - topOffset, radius, 0, Math.PI * 2);
    
    // Bottom triangle
    ctx.moveTo(x - radius * 1.6, y - topOffset);
    ctx.lineTo(x + radius * 1.6, y - topOffset);
    ctx.lineTo(x, y + radius * 1.5);
    ctx.closePath();
    
    ctx.fill();
    ctx.stroke();
  }
  
  ctx.restore();
}

/**
 * Censor detected regions with blue heart emoji
 */
export function censorRegions(canvas, ctx, regions) {
  if (regions.length === 0) return;
  
  regions.forEach(region => {
    // Draw blue overlay background
    ctx.fillStyle = 'rgba(30, 136, 229, 0.95)'; // Semi-transparent blue background
    ctx.fillRect(region.x, region.y, region.width, region.height);
    
    // Draw blue heart in center
    const heartSize = Math.min(region.width, region.height) * 0.6;
    const heartX = region.x + region.width / 2;
    const heartY = region.y + region.height / 2;
    
    drawHeart(ctx, heartX, heartY, heartSize);
  });
}

/**
 * Main function: Detect and censor NSFW content in an image
 * Returns censored image as base64 string
 */
export async function detectAndCensorImage(imageSrc, forProfile = true) {
  // Skip censorship for chat messages (not profile photos)
  if (!forProfile) {
    return imageSrc;
  }
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = async () => {
      try {
        // Detect NSFW regions
        const regions = await detectNSFWRegions(img);
        
        if (regions.length === 0) {
          // No nudity detected, return original
          resolve(imageSrc);
          return;
        }
        
        // Create canvas with censored regions
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw original image
        ctx.drawImage(img, 0, 0);
        
        // Censor detected regions
        censorRegions(canvas, ctx, regions);
        
        // Convert to base64
        const censoredBase64 = canvas.toDataURL('image/jpeg', 0.85);
        resolve(censoredBase64);
      } catch (error) {
        console.error('Error detecting/censoring image:', error);
        // On error, return original image
        resolve(imageSrc);
      }
    };
    
    img.onerror = (error) => {
      console.error('Error loading image for detection:', error);
      // On error loading image, return original image
      resolve(imageSrc);
    };
    img.src = imageSrc;
  });
}
