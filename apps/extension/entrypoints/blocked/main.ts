import { formatCountdown } from "@/src/enforcement";
import { getStoredLockdown } from "@/src/storage";

const countdownEl = document.getElementById("countdown") as HTMLElement;
const statusMessageEl = document.getElementById("status-message") as HTMLElement;

const headingEl = document.getElementById("heading") as HTMLElement;
const subtitleEl = document.getElementById("subtitle") as HTMLElement;
const countdownSectionEl = document.getElementById("countdown-section") as HTMLElement;

function showEnded(): void {
  headingEl.textContent = "Lockdown complete";
  subtitleEl.textContent = "You can now refresh this page.";
  countdownSectionEl.hidden = true;
  statusMessageEl.hidden = true;
}

async function updateCountdown(): Promise<void> {
  const stored = await getStoredLockdown();
  const remainingMs = stored ? new Date(stored.endsAt).getTime() - Date.now() : 0;

  if (remainingMs <= 0) {
    showEnded();
    return;
  }

  countdownEl.textContent = formatCountdown(remainingMs);
}

await updateCountdown();
window.setInterval(updateCountdown, 1000);
