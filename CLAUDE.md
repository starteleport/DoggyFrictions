# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DoggyFrictions is a full-stack expense/debt management system built with ASP.NET Core 6.0, MongoDB, and a jQuery/Bootstrap frontend.

## Commands

### Build

```bash
# Restore and build
dotnet restore
dotnet build -c Release

# Frontend build (run inside src/DoggyFrictions.ExternalApi/)
npm install && gulp        # Development build
npm install && gulp prod   # Production build (minification)
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
```

### Versioning

```bash
nbgv get-version   # Inspect current semantic version
```

## Architecture

**Pattern:** Controller → Service → Repository + Cache

```
src/DoggyFrictions.ExternalApi/
├── Controllers/        REST API + MVC controllers (Actions, Debts, Sessions, Templates, Home)
├── Domain/             Core domain entities (DebtAction, Good, Participation, SessionActionsProvider)
├── Models/             DTOs and view models (Session, Debt, Consumer, etc.)
├── Services/
│   ├── DebtService.cs          Debt calculation logic
│   ├── MoneyMoverService.cs    Money transfer processing
│   ├── Repository/             MongoDB data access layer
│   └── Cache/                  In-memory caching (CacheBase, ActionsCache, SessionsCache)
├── Views/              Razor MVC views
├── Styles/             LESS stylesheets compiled via Gulp
├── Program.cs          App startup, DI registration, MongoDB connection
└── gulpfile.js         Frontend asset pipeline (LESS → CSS, vendor copying, minification)

tests/DoggyFrictions.ExternalApi.Tests/
└── Services/           NUnit unit tests with AutoFixture
```

**Key dependencies:** MongoDB.Driver, NUnit + AutoFixture (tests), Gulp 4 (frontend), Nerdbank.GitVersioning (versioning).

## Branching & Versioning

- Version is managed by Nerdbank.GitVersioning (`version.json`, currently `1.2-alpha`)
- Release branches follow `release/v{version}` naming
- Public releases are cut from `master` or `release/v*` branches
- CI publishes Docker images to `ghcr.io` on push to master/release branches
