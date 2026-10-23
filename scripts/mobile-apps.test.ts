import { describe, expect, test } from "bun:test";
import { getMobileApp } from "./mobile-apps";

describe("separate mobile identities", () => {
  for (const role of ["customer", "captain", "kitchen", "admin"] as const) {
    test(`${role} opens its own app`, () => {
      expect(getMobileApp(role).id).toBe(`delivery.foodhub.${role}`);
      expect(new URL(getMobileApp(role).url).searchParams.get("app")).toBe(role);
    });
  }
  test("invalid roles fail before packaging", () => {
    expect(() => getMobileApp("superuser")).toThrow("Unknown mobile app");
  });
});