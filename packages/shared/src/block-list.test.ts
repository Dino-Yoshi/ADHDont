import { describe, expect, test } from "vitest";
import { buildBlockList, DEFAULT_BLOCK_LIST, isOwnDomain, normaliseDomain } from "./block-list";

const PORTAL = "adhdont.com";

describe("normaliseDomain", () => {
  test("strips the scheme, www, path and query and lowercases a full URL", () => {
    expect(normaliseDomain("https://www.YouTube.com/watch?v=1")).toEqual({
      ok: true,
      domain: "youtube.com",
    });
  });

  test("accepts a bare domain with no scheme", () => {
    expect(normaliseDomain("reddit.com")).toEqual({ ok: true, domain: "reddit.com" });
  });

  test("strips a leading www.", () => {
    expect(normaliseDomain("www.reddit.com")).toEqual({ ok: true, domain: "reddit.com" });
  });

  test("lowercases uppercase input", () => {
    expect(normaliseDomain("REDDIT.COM")).toEqual({ ok: true, domain: "reddit.com" });
  });

  test("strips a port", () => {
    expect(normaliseDomain("http://example.com:8080/x")).toEqual({
      ok: true,
      domain: "example.com",
    });
    expect(normaliseDomain("example.com:8080")).toEqual({ ok: true, domain: "example.com" });
  });

  test("strips a path, query string and fragment on a bare domain", () => {
    expect(normaliseDomain("example.com/a/b?c=d#e")).toEqual({ ok: true, domain: "example.com" });
  });

  test("trims surrounding whitespace", () => {
    expect(normaliseDomain("  twitch.tv \n")).toEqual({ ok: true, domain: "twitch.tv" });
  });

  test("keeps subdomains other than www", () => {
    expect(normaliseDomain("https://old.reddit.com")).toEqual({
      ok: true,
      domain: "old.reddit.com",
    });
  });

  test("strips only one leading www.", () => {
    expect(normaliseDomain("www.www.example.com")).toEqual({
      ok: true,
      domain: "www.example.com",
    });
  });

  test("rejects blank input", () => {
    expect(normaliseDomain("")).toEqual({ ok: false, reason: "invalid" });
    expect(normaliseDomain("   ")).toEqual({ ok: false, reason: "invalid" });
  });

  test("rejects input with no dot", () => {
    expect(normaliseDomain("localhost")).toEqual({ ok: false, reason: "invalid" });
    expect(normaliseDomain("http://localhost:3000")).toEqual({ ok: false, reason: "invalid" });
  });

  test("rejects input containing a space", () => {
    expect(normaliseDomain("you tube.com")).toEqual({ ok: false, reason: "invalid" });
    expect(normaliseDomain("https://example.com/a b")).toEqual({ ok: false, reason: "invalid" });
  });

  test("rejects input that cannot be parsed", () => {
    expect(normaliseDomain("http://")).toEqual({ ok: false, reason: "invalid" });
    expect(normaliseDomain("https://exa<mple.com")).toEqual({ ok: false, reason: "invalid" });
  });
});

describe("isOwnDomain", () => {
  test("is true for the portal's exact domain", () => {
    expect(isOwnDomain("adhdont.com", PORTAL)).toBe(true);
  });

  test("is true for a subdomain of the portal", () => {
    expect(isOwnDomain("app.adhdont.com", PORTAL)).toBe(true);
  });

  test("is false for a lookalike that is not a subdomain", () => {
    expect(isOwnDomain("notadhdont.com", PORTAL)).toBe(false);
  });

  test("is false for an unrelated domain", () => {
    expect(isOwnDomain("youtube.com", PORTAL)).toBe(false);
  });

  test("normalises the portal domain before comparing", () => {
    expect(isOwnDomain("adhdont.com", "https://www.ADHDont.com/")).toBe(true);
  });
});

describe("DEFAULT_BLOCK_LIST", () => {
  test("holds the nine default domains in order", () => {
    expect(DEFAULT_BLOCK_LIST).toEqual([
      "youtube.com",
      "reddit.com",
      "x.com",
      "twitter.com",
      "instagram.com",
      "facebook.com",
      "tiktok.com",
      "twitch.tv",
      "netflix.com",
    ]);
  });
});

describe("buildBlockList", () => {
  test("returns nothing for no entries", () => {
    expect(buildBlockList([], PORTAL)).toEqual({ domains: [], rejected: [] });
  });

  test("cleans, de-duplicates and sorts valid entries A-Z", () => {
    const result = buildBlockList(
      ["https://www.YouTube.com/watch", "reddit.com", "youtube.com", "WWW.reddit.com", "a.org"],
      PORTAL,
    );
    expect(result).toEqual({ domains: ["a.org", "reddit.com", "youtube.com"], rejected: [] });
  });

  test("reports invalid and own-domain entries with the original text and a reason", () => {
    const result = buildBlockList(
      ["reddit.com", "nodots", "https://app.adhdont.com/home", "bad domain.com", "adhdont.com"],
      PORTAL,
    );
    expect(result.domains).toEqual(["reddit.com"]);
    expect(result.rejected).toEqual([
      { entry: "nodots", reason: "invalid" },
      { entry: "https://app.adhdont.com/home", reason: "own-domain" },
      { entry: "bad domain.com", reason: "invalid" },
      { entry: "adhdont.com", reason: "own-domain" },
    ]);
  });

  test("accepts a lookalike of the portal domain", () => {
    expect(buildBlockList(["notadhdont.com"], PORTAL).domains).toEqual(["notadhdont.com"]);
  });
});
