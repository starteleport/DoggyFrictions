# DoggyFrictions
Accounting system for dogs

# Building

The front end is a Vue 3 app in TypeScript (`src/DoggyFrictions.ExternalApi/ClientApp`), built by Vite into
`wwwroot/dist`, which the Razor layout includes. Bootstrap, the icons and the Roboto font are bundled with it.
Inside `src/DoggyFrictions.ExternalApi`:

```bash
npm ci
npm run build     # type check (vue-tsc) and build once
npm run watch     # rebuild on every change while the app runs (dotnet run)
npm test          # unit tests of the front end (Vitest)
```

The Docker image does all of this itself.

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

Unit tests: `dotnet test` for the server, `npm test` in `src/DoggyFrictions.ExternalApi` for the front end.

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

Tests locate elements by `data-testid` attributes in the Vue components.

The pages are responsive: one component per page, and below 768px every row of a `table-cards` table is
laid out as a card with its cells labelled by `data-label` (see the media query in `ClientApp/styles/site.less`).

# Installable app (PWA)

The site can be installed to a phone's home screen or as a desktop app: it has a web app manifest
(`wwwroot/manifest.webmanifest`), icons and a service worker (`wwwroot/sw.js`).

- The service worker caches only the application shell (the page and the bundle in `/dist/`),
  so the installed app starts without a connection. Data is never cached: offline, the app says the
  server is unreachable instead of showing stale debts.
- Browsers offer installation and run service workers only over **HTTPS** (or on `localhost`).
- After changing what the shell caches, bump `CACHE` in `sw.js` so old caches are dropped.

# Languages

The interface comes in three wordings, picked in the **Settings** menu of the header: plain Russian,
plain English, and "Собачий" — the original playful one ("тёрки", "постановы", "собаки").

- Texts live in `Localization/<code>.json` (`ru`, `en`, `dog`), one flat `key: text` file per language.
  The page embeds the texts of the chosen language; Vue components use `t('key')`, Razor views `@T["key"]`,
  server-side validation `ITexts`.
- The choice is stored in the `lang` cookie. Without one the app follows the browser's `Accept-Language`
  (Russian or English, English otherwise); the playful wording is only ever chosen explicitly.
- To add a text, add its key to all three files. Unit tests fail if the files disagree on keys or
  placeholders, if a key used in the sources is missing, or if a text is no longer used.

