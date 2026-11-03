import { formatCountdown } from "@/src/enforcement";
import { getStoredLockdown } from "@/src/storage";

const countdownEl = document.getElementById("countdown") as HTMLElement;
const statusMessageEl = document.getElementById("status-message") as HTMLElement;

const headingEl = document.getElementById("heading") as HTMLElement;
const subtitleEl = document.getElementById("subtitle") as HTMLElement;
const countdownSectionEl = document.getElementById("countdown-section") as HTMLElement;

// Any website can link to this page, so only a plain http(s) URL counts as the original URL.
function readOriginalUrl(): string | null {
  try {
    const url = new URL(location.hash.slice(1));
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

const originalUrl = readOriginalUrl();

function showEnded(): void {
  headingEl.textContent = "Lockdown complete";
  subtitleEl.textContent = originalUrl
    ? "You can now refresh this page."
    : "You can close this tab.";
  countdownSectionEl.hidden = true;
  statusMessageEl.hidden = true;
}

// No stored lockdown means the rule is already removed. A stored lockdown past its end still
// has its rule, so redirecting then would loop back here.
async function updateCountdown(isFirstLoad = false): Promise<void> {
  const stored = await getStoredLockdown();
  if (!stored) {
    if (isFirstLoad && originalUrl) {
      location.replace(originalUrl);
      return;
    }
    showEnded();
    return;
  }

  const remainingMs = new Date(stored.endsAt).getTime() - Date.now();
  countdownEl.textContent = formatCountdown(Math.max(0, remainingMs));
}

await updateCountdown(true);
window.setInterval(updateCountdown, 1000);
