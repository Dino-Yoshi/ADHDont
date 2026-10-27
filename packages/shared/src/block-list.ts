import { z } from "zod";

export const DEFAULT_BLOCK_LIST: readonly string[] = [
  "youtube.com",
  "reddit.com",
  "x.com",
  "twitter.com",
  "instagram.com",
  "facebook.com",
  "tiktok.com",
  "twitch.tv",
  "netflix.com",
];

export const rejectReasonSchema = z.enum(["invalid", "own-domain"]);
export type RejectReason = z.infer<typeof rejectReasonSchema>;

export const rejectedEntrySchema = z.object({
  entry: z.string(),
  reason: rejectReasonSchema,
});
export type RejectedEntry = z.infer<typeof rejectedEntrySchema>;

export function normaliseDomain(
  raw: string,
): { ok: true; domain: string } | { ok: false; reason: "invalid" } {
  const trimmed = raw.trim();
  if (trimmed === "" || /\s/.test(trimmed)) {
    return { ok: false, reason: "invalid" };
  }
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;
  let hostname: string;
  try {
    hostname = new URL(withScheme).hostname.toLowerCase();
  } catch {
    return { ok: false, reason: "invalid" };
  }
  const domain = hostname.startsWith("www.") ? hostname.slice(4) : hostname;
  if (!domain.includes(".")) {
    return { ok: false, reason: "invalid" };
  }
  return { ok: true, domain };
}

export function isOwnDomain(domain: string, portalDomain: string): boolean {
  const portal = normaliseDomain(portalDomain);
  if (!portal.ok) {
    return false;
  }
  return domain === portal.domain || domain.endsWith(`.${portal.domain}`);
}

export function buildBlockList(
  entries: string[],
  portalDomain: string,
): { domains: string[]; rejected: RejectedEntry[] } {
  const domains = new Set<string>();
  const rejected: RejectedEntry[] = [];
  for (const entry of entries) {
    const result = normaliseDomain(entry);
    if (!result.ok) {
      rejected.push({ entry, reason: "invalid" });
    } else if (isOwnDomain(result.domain, portalDomain)) {
      rejected.push({ entry, reason: "own-domain" });
    } else {
      domains.add(result.domain);
    }
  }
  return { domains: [...domains].sort(), rejected };
}
