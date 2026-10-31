import { getMe } from "@/src/api-client";
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

function showError(message: string): void {
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
}

function clearError(): void {
  errorMessage.textContent = "";
  errorMessage.classList.add("hidden");
}

function showSignedIn(username: string): void {
  loadingEl.classList.add("hidden");
  signedOutView.classList.add("hidden");
  usernameDisplay.textContent = username;
  signedInView.classList.remove("hidden");
  clearError();
}

function showSignedOut(): void {
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
      showSignedIn(me.username);
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
    showSignedIn(me.username);
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
