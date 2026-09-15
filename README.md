# LEGACY — RAVENTA

RAVENTA is a historical full-stack HMS/security control prototype. Its control-record workflow has been consolidated into the canonical HealthTech portfolio repository.

## Canonical destination

→ **[abla86/healthtech-dashboard](https://github.com/abla86/healthtech-dashboard)**

The consolidated implementation lives under:

- `backend/raventa_control.py` — FastAPI control-record API
- `backend/main.py` — registers the control API alongside the device API
- `backend/test_raventa_control.py` — API lifecycle and validation coverage
- `tools/raventa-control-center/` — historical UI-derived module material

The canonical API exposes synthetic control records through `/controls`, including domain/status filtering and create/patch lifecycle operations.

## Consolidation boundary

RAVENTA is no longer a separate portfolio flagship. Do not build duplicate functionality here. Future HMS/security-control work belongs in `healthtech-dashboard`.

This repository remains as historical source material until repository-level archival/deletion is handled separately.
