// Utility functions for globe interaction and calculations

/**
 * Converts degrees to radians
 */
export const degreesToRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Converts radians to degrees
 */
export const radiansToDegrees = (radians: number): number => {
  return radians * (180 / Math.PI);
};

/**
 * Calculates the distance between two points on Earth (in kilometers)
 * Using the Haversine formula
 */
export const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance;
};

/**
 * Formats coordinates for display
 */
export const formatCoordinates = (latitude: number, longitude: number): string => {
  const latDirection = latitude >= 0 ? 'N' : 'S';
  const lonDirection = longitude >= 0 ? 'E' : 'W';
  
  const formattedLat = `${Math.abs(latitude).toFixed(4)}° ${latDirection}`;
  const formattedLon = `${Math.abs(longitude).toFixed(4)}° ${lonDirection}`;
  
  return `${formattedLat}, ${formattedLon}`;
};

/**
 * Gets a friendly location name from coordinates (placeholder)
 * In a real app, you'd use reverse geocoding here
 */
export const getFriendlyLocationName = (latitude: number, longitude: number): string => {
  // This would typically use a geocoding API
  // For now, we'll return a placeholder
  return `Location at ${formatCoordinates(latitude, longitude)}`;
};

/**
 * OpenGlobus-specific utilities
 */

/**
 * Creates a pulse animation effect for a marker
 * @param ctx Canvas context to draw on
 * @param x X coordinate of the center
 * @param y Y coordinate of the center
 * @param radius Maximum radius of the pulse
 * @param color Color of the pulse
 * @param duration Duration of one pulse cycle in milliseconds
 */
export const createPulseAnimation = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  duration: number = 2000
): void => {
  let startTime = Date.now();
  
  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = (elapsed % duration) / duration;
    
    // Clear the canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Draw the pulse
    const currentRadius = radius * progress;
    const alpha = 1 - progress;
    
    ctx.beginPath();
    ctx.arc(x, y, currentRadius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${hexToRgb(color)}, ${alpha})`;
    ctx.fill();
    
    requestAnimationFrame(animate);
  };
  
  animate();
};

/**
 * Convert hex color to RGB for use in rgba()
 */
export const hexToRgb = (hex: string): string => {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Convert 3-digit hex to 6-digit
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `${r}, ${g}, ${b}`;
};

/**
 * Creates animated flight path between two locations
 */
export const createFlightPath = (
  startLon: number, 
  startLat: number, 
  endLon: number, 
  endLat: number,
  numPoints: number = 100
): { lon: number; lat: number; height?: number }[] => {
  // Convert to radians
  const startLatRad = degreesToRadians(startLat);
  const startLonRad = degreesToRadians(startLon);
  const endLatRad = degreesToRadians(endLat);
  const endLonRad = degreesToRadians(endLon);
  
  // Create path with arc between points
  const path: { lon: number; lat: number }[] = [];
  
  for (let i = 0; i <= numPoints; i++) {
    const fraction = i / numPoints;
    
    // Calculate the great circle path
    const A = Math.sin((1 - fraction) * Math.PI) / Math.sin(Math.PI);
    const B = Math.sin(fraction * Math.PI) / Math.sin(Math.PI);
    
    const x = A * Math.cos(startLatRad) * Math.cos(startLonRad) + B * Math.cos(endLatRad) * Math.cos(endLonRad);
    const y = A * Math.cos(startLatRad) * Math.sin(startLonRad) + B * Math.cos(endLatRad) * Math.sin(endLonRad);
    const z = A * Math.sin(startLatRad) + B * Math.sin(endLatRad);
    
    const latRad = Math.atan2(z, Math.sqrt(x * x + y * y));
    const lonRad = Math.atan2(y, x);
    
    // Add arc height to create a curved path
    const height = (fraction > 0 && fraction < 1) 
      ? Math.sin(fraction * Math.PI) * (calculateDistance(startLat, startLon, endLat, endLon) / 10) 
      : 0;
    
    path.push({
      lon: radiansToDegrees(lonRad),
      lat: radiansToDegrees(latRad),
      height // Include height for 3D path rendering
    });
  }
  
  return path;
};

/**
 * Creates a customized OpenGlobus marker image
 */
export const createCustomMarker = (
  text: string,
  primaryColor: string = '#0ea5e9',
  secondaryColor: string = '#0284c7',
  size: number = 64
): string => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';
  
  const center = size / 2;
  const radius = size * 0.375; // 3/8 of the size
  
  // Draw outer circle
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.fillStyle = primaryColor;
  ctx.fill();
  
  // Add glow effect
  ctx.shadowColor = primaryColor;
  ctx.shadowBlur = size * 0.15;
  ctx.beginPath();
  ctx.arc(center, center, radius * 0.8, 0, Math.PI * 2);
  ctx.fillStyle = secondaryColor;
  ctx.fill();
  
  // Reset shadow for text
  ctx.shadowBlur = 0;
  
  // Draw text
  ctx.font = `bold ${size * 0.4}px Arial, sans-serif`;
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, center, center);
  
  return canvas.toDataURL();
};