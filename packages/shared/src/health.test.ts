import { expect, test } from "vitest";
import { healthSchema } from "./health";

test("healthSchema accepts ok: true", () => {
  expect(healthSchema.parse({ ok: true })).toEqual({ ok: true });
});
