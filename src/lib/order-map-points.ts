import { validCoordinates } from "./tracking-rules";

export const ORDER_MAP_STYLE = "https://tiles.openfreemap.org/styles/positron";
export type OrderMapPoint = { id: "pickup" | "delivery" | "courier"; label: string; coordinates: [number, number] };
type Coordinates = { latitude: number | null; longitude: number | null };
export function orderMapPoints(order: {
  pickup_latitude: number | null; pickup_longitude: number | null;
  delivery_latitude: number | null; delivery_longitude: number | null;
} | null | undefined, courier: Coordinates | null | undefined): OrderMapPoint[] {
  const points: OrderMapPoint[] = [];
  const add = (id: OrderMapPoint["id"], label: string, lat: number | null | undefined, lng: number | null | undefined) => {
    if (typeof lat === "number" && typeof lng === "number" && validCoordinates(lat, lng)) {
      points.push({ id, label, coordinates: [lng, lat] });
    }
  };
  add("pickup", "الاستلام", order?.pickup_latitude, order?.pickup_longitude);
  add("delivery", "التسليم", order?.delivery_latitude, order?.delivery_longitude);
  add("courier", "المندوب", courier?.latitude, courier?.longitude);
  return points;
}