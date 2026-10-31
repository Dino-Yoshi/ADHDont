import { getMe } from "@/src/api-client";
import { cancelLockdown, formatCountdown, syncLockdown } from "@/src/enforcement";
import { supabase } from "@/src/supabase";

const loadingEl = document.getElementById("loading") as HTMLDivElement;
const signedInView = document.getElementById("signed-in-view") as HTMLDivElement;
const signedOutView = document.getElementById("signed-out-view") as HTMLDivElement;
const usernameDisplay = document.getElementById("username-display") as HTMLElement;
const signOutButton = document.getElementById("sign-out-button") as HTMLButtonElement;
const signInForm = document.getElementById("sign-in-form") as HTMLFormElement;
const emailInput = document.getElementById("email-input") as HTMLInputElement;
const passwordInput = document.getElementById("password-input") as HTMLInputElement;
const signInButton = document.getElementById("sign-in-button") as HTMLButtonElement;
const errorMessage = document.getElementById("error-message") as HTMLParagraphElement;
const lockdownSection = document.getElementById("lockdown-section") as HTMLDivElement;
const lockdownTime = document.getElementById("lockdown-time") as HTMLSpanElement;

let countdownInterval: number | null = null;

function showError(message: string): void {
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
}

function clearError(): void {
  errorMessage.textContent = "";
  errorMessage.classList.add("hidden");
}

function stopCountdown(): void {
  if (countdownInterval !== null) {
    window.clearInterval(countdownInterval);
    countdownInterval = null;
  }
  lockdownSection.classList.add("hidden");
}

function startCountdown(endsAt: string): void {
  stopCountdown();
  const endsAtMs = new Date(endsAt).getTime();

  function tick(): void {
    const remainingMs = endsAtMs - Date.now();
    if (remainingMs <= 0) {
      stopCountdown();
      return;
    }
    lockdownTime.textContent = formatCountdown(remainingMs);
  }

  tick();
  lockdownSection.classList.remove("hidden");
  countdownInterval = window.setInterval(tick, 1000);
}

async function updateLockdownStatus(): Promise<void> {
  const active = await syncLockdown();
  if (active) {
    startCountdown(active.endsAt);
  } else {
    stopCountdown();
  }
}

async function showSignedIn(username: string): Promise<void> {
  loadingEl.classList.add("hidden");
  signedOutView.classList.add("hidden");
  usernameDisplay.textContent = username;
  signedInView.classList.remove("hidden");
  clearError();
  await updateLockdownStatus();
}

function showSignedOut(): void {
  stopCountdown();
  loadingEl.classList.add("hidden");
  signedInView.classList.add("hidden");
  signedOutView.classList.remove("hidden");
  passwordInput.value = "";
}

async function checkSession(): Promise<void> {
  try {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      showSignedOut();
      return;
    }

    try {
      const me = await getMe();
      await showSignedIn(me.username);
    } catch {
      await supabase.auth.signOut();
      showSignedOut();
    }
  } catch {
    showSignedOut();
  }
}

signInForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearError();

  const email = emailInput.value.trim();
  const password = passwordInput.value;
  if (!email || !password) {
    return;
  }

  signInButton.disabled = true;
  signInButton.textContent = "Signing in...";

  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const isCredentialError =
        error.message.toLowerCase().includes("invalid login credentials") ||
        error.message.toLowerCase().includes("invalid grant");
      showError(isCredentialError ? "Invalid email or password." : error.message);
      return;
    }

    const me = await getMe();
    await showSignedIn(me.username);
  } catch (err) {
    showError(err instanceof Error ? err.message : "Failed to sign in.");
  } finally {
    signInButton.disabled = false;
    signInButton.textContent = "Sign in";
  }
});

signOutButton.addEventListener("click", async () => {
  signOutButton.disabled = true;
  try {
    await cancelLockdown();
    await supabase.auth.signOut();
  } finally {
    signOutButton.disabled = false;
    showSignedOut();
  }
});

supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === "SIGNED_OUT" || !session) {
    showSignedOut();
  }
});

await checkSession();
