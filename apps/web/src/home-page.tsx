import { useEffect, useState } from "react";
import { getMe } from "./api-client";
import { supabase } from "./supabase";

export function HomePage() {
  const [username, setUsername] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    getMe().then(
      (me) => setUsername(me.username),
      () => setMessage("Could not load your account. Try again."),
    );
  }, []);

  return (
    <main>
      <h1>{username ? `Hi, ${username}` : "ADHDont"}</h1>
      {message && <p role="alert">{message}</p>}
      <button type="button" onClick={() => supabase.auth.signOut()}>
        Log out
      </button>
    </main>
  );
}
