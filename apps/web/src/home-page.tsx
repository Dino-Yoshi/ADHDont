import type { RejectedEntry } from "@adhdont/shared";
import type { FormEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { getBlockList, getMe, resetBlockList, updateBlockList } from "./api-client";
import { LockdownPanel } from "./lockdown-panel";
import { supabase } from "./supabase";

function rejectionMessage(reason: "invalid" | "own-domain", entry: string) {
  if (reason === "invalid") return `“${entry}” isn't a website address.`;
  return "You can't block ADHDont itself.";
}

export function HomePage() {
  const [username, setUsername] = useState<string | null>(null);
  const [coins, setCoins] = useState<number | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [domains, setDomains] = useState<string[]>([]);
  const [entry, setEntry] = useState("");
  const [isBlockListLoaded, setIsBlockListLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [blockListError, setBlockListError] = useState<string | null>(null);
  const [rejections, setRejections] = useState<RejectedEntry[]>([]);

  const refreshAccount = useCallback(async () => {
    try {
      const me = await getMe();
      setUsername(me.username);
      setCoins(me.coins);
      setAccountError(null);
    } catch {
      setAccountError("Could not load your account. Try again.");
    }
  }, []);

  useEffect(() => {
    void refreshAccount();
    void getBlockList().then(
      (blockList) => {
        setDomains(blockList.domains);
        setIsBlockListLoaded(true);
      },
      () => setBlockListError("Could not load your block list. Reload the page to try again."),
    );
  }, [refreshAccount]);

  async function saveBlockList(entries: string[]) {
    setIsSaving(true);
    setBlockListError(null);
    try {
      const result = await updateBlockList(entries);
      setDomains(result.domains);
      setRejections(result.rejected);
      setEntry("");
    } catch {
      setBlockListError("Could not update your block list. Try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await saveBlockList([...domains, entry]);
  }

  async function handleReset() {
    if (!window.confirm("Reset your block list to the defaults?")) return;
    setIsSaving(true);
    setBlockListError(null);
    try {
      const result = await resetBlockList();
      setDomains(result.domains);
      setRejections([]);
      setEntry("");
    } catch {
      setBlockListError("Could not reset your block list. Try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main>
      <h1>{username ? `Hi, ${username}` : "ADHDont"}</h1>
      {accountError && <p role="alert">{accountError}</p>}
      {coins !== null && <p className="coin-total">{coins} coins</p>}
      <LockdownPanel onLockdownEnded={refreshAccount} />
      <section aria-labelledby="block-list-heading">
        <h2 id="block-list-heading">Blocked websites</h2>
        <ul className="block-list">
          {domains.map((domain) => (
            <li key={domain}>
              <span>{domain}</span>
              <button
                type="button"
                disabled={!isBlockListLoaded || isSaving}
                onClick={() =>
                  void saveBlockList(domains.filter((listedDomain) => listedDomain !== domain))
                }
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <form onSubmit={handleAdd}>
          <label className="visually-hidden" htmlFor="block-list-entry">
            Website to block
          </label>
          <input
            id="block-list-entry"
            placeholder="Add a website, e.g. youtube.com"
            value={entry}
            onChange={(event) => setEntry(event.target.value)}
            disabled={!isBlockListLoaded || isSaving}
          />
          <button type="submit" disabled={!isBlockListLoaded || isSaving}>
            Add
          </button>
        </form>
        {rejections.length > 0 && (
          <p className="block-list-rejection" role="alert">
            {rejections
              .map((rejection) => rejectionMessage(rejection.reason, rejection.entry))
              .join(" ")}
          </p>
        )}
        {blockListError && <p role="alert">{blockListError}</p>}
        <button
          type="button"
          disabled={!isBlockListLoaded || isSaving}
          onClick={() => void handleReset()}
        >
          Reset to defaults
        </button>
      </section>
      <button type="button" onClick={() => supabase.auth.signOut()}>
        Log out
      </button>
    </main>
  );
}
