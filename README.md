# DoggyFrictions
Accounting system for dogs

# Building

Execute the following inside `DoggyFrictions.ExternalApi` directory: `npm install && gulp`.

# What it does

DoggyFrictions splits shared expenses within a group and tells who owes whom.

- **Тёрка (session)** – a group of participants ("собаки") sharing expenses: a trip, a party, a flat.
- **Постанова (action)** – one expense: its items (price, quantity, who consumed each) and who paid.
  An item is split equally between the ticked participants; paid and spent totals must match.
- **Долги (debts)** – per-session balances and the list of who owes whom. "Погасить" settles a debt
  by recording a money transfer as a new action.

# Running

`docker compose up -d --build` starts MongoDB and the app on http://localhost:5190.

# Tests

Unit tests: `dotnet test`.

End-to-end regression tests (Playwright) run against the app started above:

```bash
cd tests/e2e
npm ci
npx playwright install chromium   # first time only
npx playwright test               # all scenarios, desktop + mobile
npx playwright show-report        # open the HTML report with screenshots
npm run test:headed               # watch it in a real browser (SLOWMO=300 slows it down)
```

Set `E2E_BASE_URL` to test an app running elsewhere.

`npm run test:compose` (or `docker compose -f docker-compose.ui-tests.yml up --build --abort-on-container-exit --exit-code-from ui-tests`
from the repository root) builds the app and runs the whole suite inside Docker; this is what the `E2E` CI workflow does.

Tests locate elements by `data-testid` attributes in the Razor templates.

The pages are responsive: one template per page, and below 768px every row of a `table-cards` table is
laid out as a card with its cells labelled by `data-label` (see the media query in `Styles/site.less`).

# Installable app (PWA)

The site can be installed to a phone's home screen or as a desktop app: it has a web app manifest
(`wwwroot/manifest.webmanifest`), icons and a service worker (`wwwroot/sw.js`).

- The service worker caches only the application shell (page, scripts, styles, templates, CDN libraries),
  so the installed app starts without a connection. Data is never cached: offline, the app says the
  server is unreachable instead of showing stale debts.
- Browsers offer installation and run service workers only over **HTTPS** (or on `localhost`).
- After changing what the shell caches, bump `CACHE` in `sw.js` so old caches are dropped.

# Languages

The interface comes in three wordings, picked in the **Settings** menu of the header: plain Russian,
plain English, and "Собачий" — the original playful one ("тёрки", "постановы", "собаки").

- Texts live in `Localization/<code>.json` (`ru`, `en`, `dog`), one flat `key: text` file per language.
  Razor templates use `@T["key"]`, scripts `T('key')`, server-side validation `ITexts`.
- The choice is stored in the `lang` cookie. Without one the app follows the browser's `Accept-Language`
  (Russian or English, English otherwise); the playful wording is only ever chosen explicitly.
- To add a text, add its key to all three files. Unit tests fail if the files disagree on keys or
  placeholders, if a key used in the sources is missing, or if a text is no longer used.

