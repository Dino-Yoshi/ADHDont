import { formatCountdown } from "@/src/enforcement";
import { getStoredLockdown } from "@/src/storage";

const countdownEl = document.getElementById("countdown") as HTMLElement;
const statusMessageEl = document.getElementById("status-message") as HTMLElement;

async function updateCountdown(): Promise<void> {
  const stored = await getStoredLockdown();
  if (!stored) {
    countdownEl.textContent = "0:00:00";
    statusMessageEl.textContent = "Lockdown complete — you can now refresh this page.";
    return;
  }

  const endsAtMs = new Date(stored.endsAt).getTime();
  const remainingMs = endsAtMs - Date.now();

  if (remainingMs <= 0) {
    countdownEl.textContent = "0:00:00";
    statusMessageEl.textContent = "Lockdown complete — you can now refresh this page.";
    return;
  }

  countdownEl.textContent = formatCountdown(remainingMs);
}

await updateCountdown();
window.setInterval(updateCountdown, 1000);
