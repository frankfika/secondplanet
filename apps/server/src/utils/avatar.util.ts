/**
 * Generate a gradient avatar SVG based on a seed string
 * Creates a consistent gradient avatar for each user
 */
export function generateGradientAvatar(seed: string): string {
  // Generate consistent colors based on seed
  const hash = seed.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  // Generate two colors for gradient
  const hue1 = Math.abs(hash) % 360;
  const hue2 = (hue1 + 60) % 360; // Complementary color
  
  // Use vibrant but not too bright colors
  const saturation = 70 + (Math.abs(hash) % 20); // 70-90%
  const lightness1 = 50 + (Math.abs(hash >> 8) % 15); // 50-65%
  const lightness2 = 55 + (Math.abs(hash >> 16) % 15); // 55-70%

  const color1 = `hsl(${hue1}, ${saturation}%, ${lightness1}%)`;
  const color2 = `hsl(${hue2}, ${saturation}%, ${lightness2}%)`;

  // Generate direction for gradient
  const angle = Math.abs(hash >> 24) % 360;

  // Create SVG with gradient
  const svg = `
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad-${Math.abs(hash)}" x1="0%" y1="0%" x2="100%" y2="100%" gradientTransform="rotate(${angle})">
      <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="20" fill="url(#grad-${Math.abs(hash)})"/>
</svg>`.trim();

  // Convert to data URL
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

