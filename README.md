# RAVENTA

RAVENTA is a full-stack HMS and Security control platform.

## Current architecture

- React + Vite frontend
- ASP.NET Core / .NET 8 API
- SQLite persistence
- Domain project for shared core models
- GitHub repository with generated build output excluded

## Control Center

The current frontend provides:

- HMS / Security filtering
- control registration
- severity
- lifecycle status
- KPI summary
- API-backed persistence
- responsive presentation

Lifecycle:

`Registrering → risiko → tiltak → verifisering → lukking`

## Local development

### Backend

```powershell
dotnet build backend/src/Raventa.Api/Raventa.Api.csproj
dotnet run --project backend/src/Raventa.Api/Raventa.Api.csproj
```

The API listens on `http://localhost:5000`.

### Frontend

```powershell
cd frontend
npm install
npm run build
npm run dev
```

The frontend uses `VITE_API_URL` when supplied and otherwise uses the local API.

## Repository hygiene

Generated files are excluded through `.gitignore`:

- `bin/`
- `obj/`
- `dist/`
- `node_modules/`
- local environment files
- logs


## Collaboration

RAVENTA is open to constructive collaboration around software engineering, health technology, HMS/security workflows and practical implementation.

- Report bugs through GitHub Issues.
- Propose features and improvements through Issues.
- Submit focused Pull Requests.
- Contribute tests, documentation, accessibility and security improvements.
- Review architecture and usability.

See [COLLABORATION.md](COLLABORATION.md), [CONTRIBUTING.md](CONTRIBUTING.md), [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) and [SECURITY.md](SECURITY.md).

## Roadmap

See [ROADMAP.md](ROADMAP.md) for the distinction between the current foundation and remaining production-readiness work.

## Continuous integration

GitHub Actions now validates the backend build, frontend build and any .NET test projects that actually exist. No test suite is represented as passing unless it exists and runs successfully.

## Production status

The repository is structurally working, but production readiness still requires the remaining application modules, authentication/authorization, durable production database configuration, observability, security hardening, deployment configuration and end-to-end verification to be completed and verified.

This README deliberately distinguishes implemented functionality from remaining production work.
