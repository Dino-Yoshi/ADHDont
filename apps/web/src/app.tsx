import { useEffect, useState } from "react";
import { getHealth } from "./api-client";

export function App() {
  const [isApiUp, setIsApiUp] = useState<boolean | null>(null);

  useEffect(() => {
    getHealth().then(
      () => setIsApiUp(true),
      () => setIsApiUp(false),
    );
  }, []);

  return (
    <main>
      <h1>ADHDont</h1>
      <p>{isApiUp === null ? "Checking API…" : isApiUp ? "API is up" : "API is down"}</p>
    </main>
  );
}
