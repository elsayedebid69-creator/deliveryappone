import { useEffect, useRef, useState } from "react";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import { Button } from "@/components/ui/button";
import { LocateFixed, RotateCw } from "lucide-react";
import { ORDER_MAP_STYLE, type OrderMapPoint } from "@/lib/order-map-points";

export function OrderMapCanvas({ points }: { points: OrderMapPoint[] }) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap | null>(null);
  const markers = useRef(new Map<string, Marker>());
  const latestPoints = useRef(points);
  latestPoints.current = points;
  const fittedEndpoints = useRef<string | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const fitPoints = () => {
    const current = latestPoints.current;
    if (!map.current || !current.length) return;
    const lngs = current.map(p => p.coordinates[0]);
    const lats = current.map(p => p.coordinates[1]);
    map.current.fitBounds([[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]], {
      padding: { top: 55, bottom: 45, left: 65, right: 65 }, maxZoom: 16, duration: 0,
    });
  };

  useEffect(() => {
    let disposed = false;
    let resize: ResizeObserver | undefined;
    setError(false);
    setReady(false);
    fittedEndpoints.current = null;
    void Promise.all([import("maplibre-gl"), import("maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url")]).then(([api, worker]) => {
      if (disposed || !container.current) return;
      api.setWorkerUrl(worker.default);
      const instance = new api.Map({ container: container.current, style: ORDER_MAP_STYLE,
        center: latestPoints.current[0]?.coordinates ?? [0, 0], zoom: 15, attributionControl: { compact: true } });
      map.current = instance;
      instance.addControl(new api.NavigationControl({ showCompass: false }), "top-left");
      instance.on("load", () => { if (!disposed) { setReady(true); setError(false); } });
      instance.on("error", () => { if (!disposed) setError(true); });
      resize = new ResizeObserver(() => instance.resize());
      resize.observe(container.current);
    }).catch(() => { if (!disposed) setError(true); });
    return () => {
      disposed = true;
      resize?.disconnect();
      markers.current.forEach(marker => marker.remove());
      markers.current.clear();
      map.current?.remove();
      map.current = null;
    };
  }, [attempt]);

  useEffect(() => {
    if (!ready || !map.current) return;
    let disposed = false;
    void import("maplibre-gl").then(api => {
      if (disposed || !map.current) return;
      markers.current.forEach((marker, id) => {
        if (!points.some(point => point.id === id)) { marker.remove(); markers.current.delete(id); }
      });
      for (const point of points) {
        let marker = markers.current.get(point.id);
        if (!marker) {
          const element = document.createElement("div");
          element.className = `order-map-marker order-map-marker--${point.id}`;
          element.textContent = point.label;
          element.setAttribute("aria-label", point.label);
          marker = new api.Marker({ element, anchor: "bottom" }).setLngLat(point.coordinates).addTo(map.current);
          markers.current.set(point.id, marker);
        } else marker.setLngLat(point.coordinates);
      }
      const endpoints = JSON.stringify(points.filter(p => p.id !== "courier"));
      if (fittedEndpoints.current !== endpoints) { fitPoints(); fittedEndpoints.current = endpoints; }
    });
    return () => { disposed = true; };
  }, [ready, points]);

  return <div className="relative">
    <div ref={container} dir="ltr" role="region" aria-label="خريطة تتبع الطلب والاستلام والتسليم" className="order-map-canvas h-72 w-full overflow-hidden rounded-lg border bg-muted" />
    {!ready && !error && <p role="status" className="absolute inset-x-12 top-3 rounded bg-background p-2 text-center text-sm text-foreground">جارِ تحميل الخريطة…</p>}
    {ready && <Button variant="outline" size="icon" aria-label="إظهار جميع المواقع" title="إظهار جميع المواقع" className="absolute right-2 top-2 bg-background" onClick={fitPoints}><LocateFixed className="size-4" /></Button>}
    {error && <div role="alert" className="mt-2 flex items-center justify-between gap-2 text-sm text-destructive"><span>تعذر تحميل بعض بيانات الخريطة؛ تحقق من الاتصال.</span><Button variant="outline" size="icon" aria-label="إعادة تحميل الخريطة" onClick={() => setAttempt(n => n + 1)}><RotateCw className="size-4" /></Button></div>}
  </div>;
}