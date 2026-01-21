function renderSVG(stars, width, height, metadata) {
    const cosmicBlue = '#050B14';
    const starColor = '#FFD700';

    let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Noise filter for grainy background -->
    <filter id="noiseFilter">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.12 0"/>
    </filter>

    <!-- Glow filter for stars -->
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    
    <!-- Larger glow for bright stars -->
    <filter id="brightGlow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Deep space background -->
  <rect width="100%" height="100%" fill="${cosmicBlue}"/>
  
  <!-- Grainy texture overlay -->
  <rect width="100%" height="100%" filter="url(#noiseFilter)" opacity="1"/>
  
  <!-- Stars -->
  <g id="stars">`;

    stars.forEach(star => {
        const glowFilter = star.brightness > 0.7 ? 'brightGlow' : 'glow';
        const cx = star.x;
        const cy = star.y;
        const r = star.size * 0.6; // Slightly smaller than the full spike radius

        svg += `
    <circle 
      cx="${cx}" 
      cy="${cy}" 
      r="${r.toFixed(2)}" 
      fill="${starColor}" 
      opacity="${star.brightness.toFixed(2)}" 
      filter="url(#${glowFilter})"
    />`;
    });

    svg += `
  </g>
</svg>`;

    return svg;
}

module.exports = { renderSVG };