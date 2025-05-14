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