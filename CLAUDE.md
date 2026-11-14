# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DoggyFrictions is a full-stack expense/debt management system built with ASP.NET Core 10.0, MongoDB, and a Vue 3 + TypeScript frontend (Vite, Bootstrap 5).

## Commands

### Build

```bash
# Restore and build
dotnet restore
dotnet build -c Release

# Frontend build (run inside src/DoggyFrictions.ExternalApi/), output in wwwroot/dist
npm ci && npm run build    # Type check (vue-tsc) + Vite build
npm run watch              # Rebuild on change
npm test                   # Frontend unit tests (Vitest)
```

### Run Locally

```bash
# Start MongoDB + API (port 5190)
docker compose up
```

### Tests

```bash
# Run tests via Docker (matches CI)
docker compose -f docker-compose.tests.yml up --abort-on-container-exit --build

# Run tests directly
dotnet test --nologo --blame-hang --blame-hang-timeout 60s --logger:"console;verbosity=detailed"

# End-to-end tests (Playwright) against a running app (docker compose up -d --build)
cd tests/e2e && npm ci && npx playwright test

# End-to-end tests fully in Docker (matches CI)
docker compose -f docker-compose.ui-tests.yml up --build --abort-on-container-exit --exit-code-from ui-tests
```

### Versioning

```bash
nbgv get-version   # Inspect current semantic version
```

## Architecture

**Pattern:** Controller → Service → Repository

```
src/DoggyFrictions.ExternalApi/
├── ClientApp/          Vue 3 front end: pages/, components/, models/ (form logic), styles/site.less
├── Controllers/        REST API + MVC controllers (Actions, Debts, Sessions, Home)
├── Domain/             Core domain entities (DebtAction, Good, Participation, SessionActionsProvider)
├── Models/             DTOs and view models (Session, Debt, Consumer, etc.)
├── Localization/       Interface texts per language (ru/en/dog JSON) and ITexts
├── Services/
│   ├── DebtService.cs          Debt calculation logic
│   ├── MoneyMoverService.cs    Money transfer processing
│   └── Repository/             MongoDB data access layer
├── Views/              Razor MVC views
├── Program.cs          App startup, DI registration, MongoDB connection
└── vite.config.ts      Frontend build (ClientApp/main.ts → wwwroot/dist/app.js, app.css)

tests/DoggyFrictions.ExternalApi.Tests/
└── Services/           NUnit unit tests with AutoFixture

tests/e2e/              Playwright regression tests (sessions, actions, debts, HTTP API, phone viewport)
```

**Key dependencies:** MongoDB.Driver, NUnit + AutoFixture (tests), Vue 3 + vue-router, Vite, Vitest (frontend), Nerdbank.GitVersioning (versioning).

## Branching & Versioning

- Version is managed by Nerdbank.GitVersioning (`version.json`, currently `1.2-alpha`)
- Release branches follow `release/v{version}` naming
- Public releases are cut from `master` or `release/v*` branches
- CI publishes Docker images to `ghcr.io` on push to master/release branches
