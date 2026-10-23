export const mobileApps = {
  customer: { id: "delivery.foodhub.customer", name: "FoodHub Customer" },
  captain: { id: "delivery.foodhub.captain", name: "FoodHub Captain" },
  kitchen: { id: "delivery.foodhub.kitchen", name: "FoodHub Kitchen" },
} as const;

export function getMobileApp(role = "customer") {
  if (role !== "customer" && role !== "captain" && role !== "kitchen") {
    throw new Error(`Unknown mobile app: ${role}`);
  }
  return { ...mobileApps[role], role, url: `https://foodhub.delivery/?app=${role}` };
}