export type FilterType = 
  | 'none' 
  | 'sacred-wolf' 
  | 'holy-light' 
  | 'anime-local' 
  | '3d-avatar-local' 
  | 'cinematic-local' 
  | 'vibrant' 
  | 'cinematic-black' 
  | 'gold-glow' 
  | 'sharp-detail' 
  | 'soft-blur'
  | 'wolf-forest'
  | 'gold-palace';

export const applyFilters = (ctx: CanvasRenderingContext2D, width: number, height: number, filter: FilterType) => {
  if (filter === 'none') return;

  // Use CSS filters for some types if possible (faster)
  if (filter === 'soft-blur') {
    ctx.filter = 'blur(8px)';
    return;
  }
  if (filter === 'sharp-detail') {
    ctx.filter = 'contrast(1.5) brightness(1.1) saturate(1.2)';
    return;
  }

  try {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      if (filter === 'sacred-wolf') {
        // Dark Cinematic: High contrast, deep shadows, blue-cyan highlights
        r = Math.max(0, Math.min(255, (r - 128) * 1.4 + 128 - 45));
        g = Math.max(0, Math.min(255, (g - 128) * 1.4 + 128 - 45));
        b = Math.max(0, Math.min(255, (b - 128) * 1.4 + 128 - 15));
        
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = r * 0.5 + gray * 0.5;
        g = g * 0.5 + gray * 0.5;
        b = b * 0.7 + gray * 0.3; 
      } else if (filter === 'holy-light' || filter === 'gold-glow') {
        // Golden Divine: Warm, bright, golden tint
        r = Math.min(255, r * 1.2 + 30);
        g = Math.min(255, g * 1.1 + 15);
        b = Math.max(0, b * 0.85);
        
        // Soft glow effect
        r = Math.min(255, r + 15);
        g = Math.min(255, g + 10);
      } else if (filter === 'vibrant') {
        // Vibrant: High saturation and contrast
        r = Math.max(0, Math.min(255, (r - 128) * 1.2 + 128));
        g = Math.max(0, Math.min(255, (g - 128) * 1.2 + 128));
        b = Math.max(0, Math.min(255, (b - 128) * 1.2 + 128));
        
        // Saturation boost
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = Math.min(255, r * 1.3 - gray * 0.3);
        g = Math.min(255, g * 1.3 - gray * 0.3);
        b = Math.min(255, b * 1.3 - gray * 0.3);
      } else if (filter === 'cinematic-black') {
        // Cinematic Black: High contrast, desaturated, deep blacks
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = g = b = Math.max(0, Math.min(255, (gray - 128) * 1.6 + 128 - 20));
      } else if (filter === 'anime-local') {
        // Local Anime: High saturation, flattened colors, bright highlights
        // Quantize colors (Flattening)
        r = Math.floor(r / 32) * 32 + 16;
        g = Math.floor(g / 32) * 32 + 16;
        b = Math.floor(b / 32) * 32 + 16;
        
        // Boost saturation
        r = Math.min(255, r * 1.1 + 10);
        g = Math.min(255, g * 1.1 + 10);
        b = Math.min(255, b * 1.2 + 20);
      } else if (filter === '3d-avatar-local') {
        // Local 3D Avatar: Smooth skin, high vibrance, plastic-like texture
        r = Math.min(255, r * 1.3 + 20);
        g = Math.min(255, g * 1.2 + 10);
        b = Math.min(255, b * 1.2 + 10);
        
        // Soften shadows
        if (r < 50) r += 30;
        if (g < 50) g += 30;
        if (b < 50) b += 30;
      } else if (filter === 'cinematic-local') {
        // Local Cinematic: Teal & Orange grade, high contrast
        r = Math.max(0, Math.min(255, (r - 128) * 1.2 + 128 + 10)); // Orange push
        g = Math.max(0, Math.min(255, (g - 128) * 1.1 + 128));
        b = Math.max(0, Math.min(255, (b - 128) * 1.3 + 128 + 20)); // Teal push
      } else if (filter === 'wolf-forest') {
        // Wolf Forest: Deep greens, high contrast, misty blue highlights
        r = Math.max(0, Math.min(255, (r - 128) * 1.3 + 128 - 30));
        g = Math.max(0, Math.min(255, (g - 128) * 1.5 + 128 + 10));
        b = Math.max(0, Math.min(255, (b - 128) * 1.2 + 128 - 20));
        
        // Desaturate reds
        r = r * 0.7 + (0.299 * r + 0.587 * g + 0.114 * b) * 0.3;
      } else if (filter === 'gold-palace') {
        // Gold Palace: Luxurious warm tones, high brightness, golden highlights
        r = Math.min(255, r * 1.4 + 40);
        g = Math.min(255, g * 1.2 + 20);
        b = Math.max(0, b * 0.8);
        
        // High contrast
        r = Math.max(0, Math.min(255, (r - 128) * 1.2 + 128));
        g = Math.max(0, Math.min(255, (g - 128) * 1.2 + 128));
      }

      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }

    ctx.putImageData(imageData, 0, 0);
  } catch (e) {
    console.warn("Could not apply pixel-level filters due to tainted canvas (CORS). Applying overlays only.", e);
  }

  // Apply Overlays
  if (filter === 'sacred-wolf' || filter === 'cinematic-local' || filter === 'cinematic-black') {
    // Cinematic Vignette
    const gradient = ctx.createRadialGradient(width / 2, height / 2, width / 4, width / 2, height / 2, width / 1.1);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 5, 0.7)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
  
  if (filter === 'anime-local') {
    // Anime Sky Glow (Top)
    const skyGlow = ctx.createLinearGradient(0, 0, 0, height * 0.4);
    skyGlow.addColorStop(0, 'rgba(100, 200, 255, 0.2)');
    skyGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = skyGlow;
    ctx.globalCompositeOperation = 'screen';
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'source-over';
  }

  if (filter === 'gold-glow') {
    const goldGlow = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width);
    goldGlow.addColorStop(0, 'rgba(255, 215, 0, 0.15)');
    goldGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = goldGlow;
    ctx.globalCompositeOperation = 'screen';
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'source-over';
  }

  if (filter === 'wolf-forest') {
    // Forest Mist
    const mist = ctx.createLinearGradient(0, height, 0, height * 0.6);
    mist.addColorStop(0, 'rgba(150, 200, 180, 0.4)');
    mist.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = mist;
    ctx.globalCompositeOperation = 'screen';
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'source-over';
    
    // Vignette
    const vignette = ctx.createRadialGradient(width / 2, height / 2, width / 3, width / 2, height / 2, width);
    vignette.addColorStop(0, 'rgba(0, 20, 10, 0)');
    vignette.addColorStop(1, 'rgba(0, 30, 15, 0.8)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
  }

  if (filter === 'gold-palace') {
    // Royal Glow
    const royalGlow = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width * 1.2);
    royalGlow.addColorStop(0, 'rgba(255, 215, 0, 0.2)');
    royalGlow.addColorStop(0.5, 'rgba(255, 180, 0, 0.1)');
    royalGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = royalGlow;
    ctx.globalCompositeOperation = 'screen';
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'source-over';
    
    // Warm Vignette
    const vignette = ctx.createRadialGradient(width / 2, height / 2, width / 4, width / 2, height / 2, width);
    vignette.addColorStop(0, 'rgba(40, 20, 0, 0)');
    vignette.addColorStop(1, 'rgba(60, 30, 0, 0.6)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
  }
};
