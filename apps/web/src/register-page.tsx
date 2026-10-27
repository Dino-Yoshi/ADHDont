import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "./supabase";

// A taken username makes the database trigger fail. Newer Supabase versions pass the unique-key
// error through; older ones replace it with a generic message.
const USERNAME_TAKEN_MESSAGES = ["profiles_username_key", "Database error saving new user"];

export function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: username.trim() } },
    });
    if (error) {
      setMessage(
        USERNAME_TAKEN_MESSAGES.some((text) => error.message.includes(text))
          ? "That username is taken."
          : error.message,
      );
      return;
    }
    navigate("/");
  }

  return (
    <main>
      <h1>Create an account</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Username
          <input value={username} onChange={(e) => setUsername(e.target.value)} required />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </label>
        <button type="submit">Register</button>
      </form>
      {message && <p role="alert">{message}</p>}
      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </main>
  );
}
