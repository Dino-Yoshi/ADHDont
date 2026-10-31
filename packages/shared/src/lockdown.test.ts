import { describe, expect, test } from "vitest";
import {
  coinBalance,
  coinsFor,
  isValidLockdownLength,
  type LockdownTimes,
  lockdownEndTime,
  lockdownStatus,
  MAX_LOCKDOWN_MINUTES,
  MIN_LOCKDOWN_MINUTES,
} from "./lockdown";

const startedAt = new Date("2026-11-01T14:00:00.000Z");
const endsAt = new Date("2026-11-01T14:30:00.000Z");
const running: LockdownTimes = { startedAt, endsAt, stoppedAt: null };
const stopped: LockdownTimes = {
  startedAt,
  endsAt,
  stoppedAt: new Date("2026-11-01T14:10:00.000Z"),
};
const after = new Date("2026-11-01T15:00:00.000Z");

describe("isValidLockdownLength", () => {
  test("exposes the 5 and 720 minute limits", () => {
    expect(MIN_LOCKDOWN_MINUTES).toBe(5);
    expect(MAX_LOCKDOWN_MINUTES).toBe(720);
  });

  test("rejects 4 minutes", () => {
    expect(isValidLockdownLength(4)).toBe(false);
  });

  test("accepts 5 minutes", () => {
    expect(isValidLockdownLength(5)).toBe(true);
  });

  test("accepts 720 minutes", () => {
    expect(isValidLockdownLength(720)).toBe(true);
  });

  test("rejects 721 minutes", () => {
    expect(isValidLockdownLength(721)).toBe(false);
  });

  test("rejects non-whole numbers", () => {
    expect(isValidLockdownLength(5.5)).toBe(false);
    expect(isValidLockdownLength(Number.NaN)).toBe(false);
    expect(isValidLockdownLength(Number.POSITIVE_INFINITY)).toBe(false);
  });
});

describe("lockdownEndTime", () => {
  test("is the chosen number of minutes after the start", () => {
    expect(lockdownEndTime(startedAt, 30)).toEqual(endsAt);
  });
});

describe("lockdownStatus", () => {
  test("is active just before endsAt", () => {
    expect(lockdownStatus(running, new Date(endsAt.getTime() - 1))).toBe("active");
  });

  test("is completed exactly at endsAt", () => {
    expect(lockdownStatus(running, endsAt)).toBe("completed");
  });

  test("is completed just after endsAt", () => {
    expect(lockdownStatus(running, new Date(endsAt.getTime() + 1))).toBe("completed");
  });

  test("is stopped once stoppedAt is set, before endsAt", () => {
    expect(lockdownStatus(stopped, new Date("2026-11-01T14:20:00.000Z"))).toBe("stopped");
  });

  test("stays stopped after endsAt has passed", () => {
    expect(lockdownStatus(stopped, after)).toBe("stopped");
  });
});

describe("coinsFor", () => {
  test("a completed lockdown earns its length in minutes", () => {
    expect(coinsFor(running, after)).toBe(30);
  });

  test("a lockdown that is still active earns no coins", () => {
    expect(coinsFor(running, new Date("2026-11-01T14:15:00.000Z"))).toBe(0);
  });

  test("a lockdown stopped early earns no coins", () => {
    expect(coinsFor(stopped, after)).toBe(0);
  });
});

describe("coinBalance", () => {
  test("is 0 with no lockdowns", () => {
    expect(coinBalance([], after)).toBe(0);
  });

  test("sums only the completed lockdowns", () => {
    const longer: LockdownTimes = {
      startedAt: new Date("2026-11-01T10:00:00.000Z"),
      endsAt: new Date("2026-11-01T11:00:00.000Z"),
      stoppedAt: null,
    };
    const future: LockdownTimes = {
      startedAt: new Date("2026-11-01T14:50:00.000Z"),
      endsAt: new Date("2026-11-01T16:00:00.000Z"),
      stoppedAt: null,
    };
    expect(coinBalance([running, stopped, longer, future], after)).toBe(90);
  });
});
