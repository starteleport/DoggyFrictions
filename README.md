# DoggyFrictions
Accounting system for dogs

# Building

Preferred root-level commands:

- Install frontend dependencies: `npm run web:deps`
- Build frontend assets: `npm run web:build`
- Build production frontend assets: `npm run web:build:prod`

UI end-to-end tests:

- Install E2E dependencies: `npm run ui:deps`
- Run E2E against an already-running app: `npm run ui:test`
- Run E2E in headed mode (local debugging): `npm run ui:test:headed`
- Run E2E via Docker Compose (starts app + mongo + tests): `npm run ui:test:compose`
- Tear down E2E Compose stack manually: `npm run ui:test:compose:down`

CI uses raw Docker Compose (`docker-compose.ui-tests.yml`) for PR UI checks.
