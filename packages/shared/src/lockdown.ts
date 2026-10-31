import { z } from "zod";

export const MIN_LOCKDOWN_MINUTES = 5;
export const MAX_LOCKDOWN_MINUTES = 720;

const MS_PER_MINUTE = 60_000;

export const lockdownSchema = z.object({
  id: z.string().uuid(),
  domains: z.array(z.string()),
  startedAt: z.string().datetime(),
  endsAt: z.string().datetime(),
});
export type Lockdown = z.infer<typeof lockdownSchema>;

export const activeLockdownResponseSchema = lockdownSchema.nullable();
export type ActiveLockdownResponse = z.infer<typeof activeLockdownResponseSchema>;

export const startLockdownBodySchema = z.object({ minutes: z.number() });
export type StartLockdownBody = z.infer<typeof startLockdownBodySchema>;

export type LockdownTimes = { startedAt: Date; endsAt: Date; stoppedAt: Date | null };
export type LockdownStatus = "active" | "completed" | "stopped";

export function isValidLockdownLength(minutes: number): boolean {
  return (
    Number.isInteger(minutes) && minutes >= MIN_LOCKDOWN_MINUTES && minutes <= MAX_LOCKDOWN_MINUTES
  );
}

export function lockdownEndTime(startedAt: Date, minutes: number): Date {
  return new Date(startedAt.getTime() + minutes * MS_PER_MINUTE);
}

export function lockdownStatus(lockdown: LockdownTimes, now: Date): LockdownStatus {
  if (lockdown.stoppedAt !== null) {
    return "stopped";
  }
  return now.getTime() < lockdown.endsAt.getTime() ? "active" : "completed";
}

export function coinsFor(lockdown: LockdownTimes, now: Date): number {
  if (lockdownStatus(lockdown, now) !== "completed") {
    return 0;
  }
  return Math.floor((lockdown.endsAt.getTime() - lockdown.startedAt.getTime()) / MS_PER_MINUTE);
}

export function coinBalance(lockdowns: LockdownTimes[], now: Date): number {
  return lockdowns.reduce((total, lockdown) => total + coinsFor(lockdown, now), 0);
}
