# Manual checklist

Run this on Chrome, Edge, Opera and Firefox. Use a throwaway account, and pick a short lockdown for the finish step. A local run uses `pnpm dev` with `.output/chrome-mv3` / `.output/firefox-mv3`, while the recorded release results must come from the live portal and API with the production build (`.output/chrome-mv3-prod` / `.output/firefox-mv3-prod`, see `docs/deployment.md`).

## How to record

Replace `not executed` in the results table with `pass`, `fail` (add a note below the table) or `n/a` with the reason. Add the browser version and date under the table. Do not paste secrets or real email addresses.

## Setup

1. Load the production extension in the browser (Chromium: Load unpacked from `.output/chrome-mv3-prod`; Firefox: temporary add-on from `.output/firefox-mv3-prod`).
2. Open the portal at its live URL.

## Steps

| # | Step | How to run it |
|---|---|---|
| 1 | Register | Create an account on `/register`. You land in the portal. |
| 2 | Log in and log out | Log out, log in again. Refresh `/login` and `/register`: both load. |
| 3 | Edit the block list | Add a domain, remove one, reload: the block list persists. |
| 4 | Own domain is refused | Add the portal's domain, then its parent domain and the API's domain: each is rejected with a message. |
| 5 | Sign in to the extension | Open the extension popup and sign in. It shows "Signed in as" and your username, and no lockdown. |
| 6 | Blocked page | Start a lockdown that includes `reddit.com`. Open the popup (blocks immediately), then visit `https://reddit.com`: the blocked page shows the time left. |
| 7 | Subdomain is blocked | Visit `https://old.reddit.com`: the blocked page shows. Also try `http://reddit.com`. |
| 8 | Portal and API stay reachable | During the lockdown the portal still loads and works, and `https://<api-domain>/health` still responds. |
| 9 | Portal closed | Close the portal tab. `reddit.com` is still blocked. |
| 10 | Browser restart | Quit and reopen the browser. `reddit.com` is still blocked. |
| 11 | Start delay | Start a lockdown from the portal while the popup is closed. A listed domain is blocked within about a minute. |
| 12 | Stop early | Stop the lockdown in the portal. The domains unblock within about a minute, no notification appears and no coins are added. |
| 13 | Finish | Start a 5 minute lockdown and let it end. The domains unblock, the notification "Lockdown complete" appears and the coins increase. |
| 14 | Dark and light mode | Switch the system theme. The portal follows it in both modes. |

### Firefox: restart step (step 10)

Firefox removes temporary add-ons when it restarts. To test step 10, use Firefox Developer Edition, set `xpinstall.signatures.required` to `false` in `about:config`, build the zip with `pnpm zip:extension:firefox:prod` and install it from `about:addons` (Install Add-on From File). If you cannot, record `n/a - temporary add-on`.

## Results

| # | Step | Chrome | Edge | Opera | Firefox |
|---|---|---|---|---|---|
| 1 | Register | not executed | not executed | not executed | not executed |
| 2 | Log in and log out | not executed | not executed | not executed | not executed |
| 3 | Edit the block list | not executed | not executed | not executed | not executed |
| 4 | Own domain is refused | not executed | not executed | not executed | not executed |
| 5 | Sign in to the extension | not executed | not executed | not executed | not executed |
| 6 | Blocked page | not executed | not executed | not executed | not executed |
| 7 | Subdomain is blocked | not executed | not executed | not executed | not executed |
| 8 | Portal and API stay reachable | not executed | not executed | not executed | not executed |
| 9 | Portal closed | not executed | not executed | not executed | not executed |
| 10 | Browser restart | not executed | not executed | not executed | not executed |
| 11 | Start delay | not executed | not executed | not executed | not executed |
| 12 | Stop early | not executed | not executed | not executed | not executed |
| 13 | Finish | not executed | not executed | not executed | not executed |
| 14 | Dark and light mode | not executed | not executed | not executed | not executed |

Browser versions and date:
