export const LOCATION_INTERVAL_MS = 5000;
export const LOCATION_STALE_MS = 60000;
export const validCoordinates = (lat: number, lng: number) => Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
export const locationFresh = (updatedAt: string, now: number) => now - Date.parse(updatedAt) <= LOCATION_STALE_MS;