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

## Production status

The repository is structurally working, but production readiness still requires the remaining application modules, automated CI, deployment configuration, authentication/authorization, durable production database configuration, observability and security hardening to be completed and verified.

This README deliberately distinguishes implemented functionality from planned production work.
