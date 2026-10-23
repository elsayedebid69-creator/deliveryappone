import { test,expect } from "bun:test";
import { validCoordinates,locationFresh,LOCATION_INTERVAL_MS } from "../src/lib/tracking-rules";
test("tracking only accepts real geographic coordinate ranges",()=>{
  expect(validCoordinates(24.7136,46.6753)).toBe(true);
  expect(validCoordinates(91,46)).toBe(false);
  expect(validCoordinates(24,181)).toBe(false);
  expect(validCoordinates(NaN,46)).toBe(false);
});
test("location becomes stale rather than inventing movement",()=>{
  expect(locationFresh("2026-10-23T20:00:00Z",Date.parse("2026-10-23T20:00:59Z"))).toBe(true);
  expect(locationFresh("2026-10-23T20:00:00Z",Date.parse("2026-10-23T20:01:01Z"))).toBe(false);
  expect(LOCATION_INTERVAL_MS).toBe(5000);
});