/// <reference types="google.maps" />
let pending: Promise<typeof google.maps> | undefined;
declare global { interface Window { foodhubMapsReady?: () => void; } }
export function loadGoogleMap() {
  if (pending) return pending;
  pending = new Promise((resolve, reject) => {
    const key = import.meta.env['VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY'];
    if (!key) { reject(new Error("إعداد الخرائط غير مكتمل")); return; }
    window.foodhubMapsReady = () => resolve(google.maps);
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&callback=foodhubMapsReady&channel=${import.meta.env['VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID'] ?? ''}&language=ar`;
    script.onerror = () => reject(new Error("تعذر تحميل الخريطة"));
    document.head.append(script);
  });
  return pending;
}