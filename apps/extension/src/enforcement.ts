import { isOwnDomain, type Lockdown } from "@adhdont/shared";
import { browser } from "wxt/browser";
import { getActiveLockdown } from "./api-client";
import { config } from "./config";
import { getStoredLockdown, removeStoredLockdown, setStoredLockdown } from "./storage";

export const BLOCK_RULE_ID = 1;

export const ALARM_NAMES = {
  POLL_LOCKDOWN: "poll-lockdown",
  LOCKDOWN_END: "lockdown-end",
} as const;

export const NOTIFICATION_ID = "lockdown-complete";
export const NOTIFICATION_MESSAGE = "Lockdown complete — your sites are unblocked.";

export function isSafeToBlock(domain: string): boolean {
  if (isOwnDomain(domain, config.WXT_PORTAL_DOMAIN)) {
    return false;
  }

  let apiHostname: string;
  try {
    apiHostname = new URL(config.WXT_API_URL).hostname;
  } catch {
    apiHostname = "";
  }

  if (apiHostname) {
    if (domain === apiHostname || domain.endsWith(`.${apiHostname}`)) {
      return false;
    }
    if (isOwnDomain(domain, apiHostname)) {
      return false;
    }
  }

  return true;
}

export async function removeBlockRules(): Promise<void> {
  await browser.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [BLOCK_RULE_ID],
  });
}

export async function applyBlockRules(domains: string[]): Promise<void> {
  const safeDomains = domains.filter(isSafeToBlock);
  if (safeDomains.length === 0) {
    await removeBlockRules();
    return;
  }

  await browser.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [BLOCK_RULE_ID],
    addRules: [
      {
        id: BLOCK_RULE_ID,
        priority: 1,
        action: {
          type: "redirect",
          redirect: {
            extensionPath: "/blocked.html",
          },
        },
        condition: {
          requestDomains: safeDomains,
          resourceTypes: ["main_frame"],
        },
      },
    ],
  });
}

export async function finishLockdown(): Promise<void> {
  await removeBlockRules();
  await removeStoredLockdown();
  await browser.alarms.clear(ALARM_NAMES.LOCKDOWN_END);

  try {
    await browser.notifications.create(NOTIFICATION_ID, {
      type: "basic",
      iconUrl: browser.runtime.getURL("/icon.png"),
      title: "ADHDont",
      message: NOTIFICATION_MESSAGE,
    });
  } catch {
    // Notification creation might fail if permissions or system notifications are disabled.
  }
}

export async function cancelLockdown(): Promise<void> {
  await removeBlockRules();
  await removeStoredLockdown();
  await browser.alarms.clear(ALARM_NAMES.LOCKDOWN_END);
}

export async function syncLockdown(): Promise<Lockdown | null> {
  try {
    const active = await getActiveLockdown();
    if (!active) {
      await cancelLockdown();
      return null;
    }

    const now = Date.now();
    const endsAtMs = new Date(active.endsAt).getTime();
    if (endsAtMs <= now) {
      await finishLockdown();
      return null;
    }

    await setStoredLockdown(active);
    await applyBlockRules(active.domains);
    browser.alarms.create(ALARM_NAMES.LOCKDOWN_END, { when: endsAtMs });
    return active;
  } catch {
    const stored = await getStoredLockdown();
    if (!stored) {
      return null;
    }

    const now = Date.now();
    const endsAtMs = new Date(stored.endsAt).getTime();
    if (endsAtMs <= now) {
      await finishLockdown();
      return null;
    }

    await applyBlockRules(stored.domains);
    browser.alarms.create(ALARM_NAMES.LOCKDOWN_END, { when: endsAtMs });
    return stored;
  }
}

export function formatCountdown(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}
