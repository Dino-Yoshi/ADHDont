import type { Lockdown } from "@adhdont/shared";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { ApiError, getLockdown, startLockdown, stopLockdown } from "./api-client";
import { LockdownCountdown } from "./lockdown-countdown";

function errorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}

export function LockdownPanel({ onLockdownEnded }: { onLockdownEnded: () => void }) {
  const [lockdown, setLockdown] = useState<Lockdown | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lengthHours, setLengthHours] = useState("0");
  const [lengthMinutes, setLengthMinutes] = useState("25");
  const [lockdownError, setLockdownError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLockdown() {
      try {
        setLockdown(await getLockdown());
        setIsLoaded(true);
      } catch {
        setLockdownError("Could not load your lockdown. Reload the page to try again.");
      }
    }
    void loadLockdown();
  }, []);

  async function handleStart(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setLockdownError(null);
    try {
      setLockdown(await startLockdown(Number(lengthHours) * 60 + Number(lengthMinutes)));
    } catch (error) {
      setLockdownError(errorMessage(error, "Could not start your lockdown. Try again."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleStop() {
    if (!window.confirm("Stop now? You won't earn coins for this lockdown.")) return;
    setIsSaving(true);
    setLockdownError(null);
    try {
      await stopLockdown();
      setLockdown(null);
    } catch (error) {
      setLockdownError(errorMessage(error, "Could not stop your lockdown. Try again."));
    } finally {
      setIsSaving(false);
    }
  }

  // Only the server decides a lockdown has ended, so a fast local clock keeps asking until it agrees.
  async function handleCountdownElapsed() {
    try {
      const current = await getLockdown();
      setLockdown(current);
      if (!current) onLockdownEnded();
    } catch {
      // The countdown asks again on its next tick.
    }
  }

  return (
    <section aria-labelledby="lockdown-heading">
      <h2 id="lockdown-heading">Lockdown</h2>
      {lockdown ? (
        <>
          <LockdownCountdown
            endsAt={lockdown.endsAt}
            onElapsed={() => void handleCountdownElapsed()}
          />
          <ul className="block-list">
            {lockdown.domains.map((domain) => (
              <li key={domain}>{domain}</li>
            ))}
          </ul>
          <button type="button" disabled={isSaving} onClick={() => void handleStop()}>
            Stop early
          </button>
        </>
      ) : (
        <form onSubmit={handleStart}>
          <div className="lockdown-length">
            <label>
              Hours
              <input
                type="number"
                min="0"
                max="12"
                value={lengthHours}
                onChange={(event) => setLengthHours(event.target.value)}
                disabled={!isLoaded || isSaving}
              />
            </label>
            <label>
              Minutes
              <input
                type="number"
                min="0"
                max="59"
                value={lengthMinutes}
                onChange={(event) => setLengthMinutes(event.target.value)}
                disabled={!isLoaded || isSaving}
              />
            </label>
          </div>
          <button type="submit" disabled={!isLoaded || isSaving}>
            Start lockdown
          </button>
        </form>
      )}
      {lockdownError && (
        <p className="lockdown-error" role="alert">
          {lockdownError}
        </p>
      )}
    </section>
  );
}
