# Overscale Starter Pack v1

This starter pack captures the Phase 36 operational kit for the accepted OverScale scroll. It provides canonical IDs, spiral placement coordinates, guard policies, vault mappings, and overscale-adjusted flows so teams can activate the PPPI network without re-designing schemas.

## Contents

- `nodes.json` – Golden-angle placement metadata for 12 seed nodes across governance, treasury, health, education, energy, transport, defense, commerce, culture, civic, data, and labor sectors.
- `guards.json` – Authoritative guard definitions with scopes, rules, expirations, and proof anchors.
- `coins.json` / `vaults.json` – Fungible coin catalog and default vault policies, including overscale residual bands.
- `flows.json` – Initial residual and scholarship flows scaled by the overscale coefficient (γ = 175/150).
- `compare_contrast.csv` – Matrix contrasting EV0L operational practices with conventional sector approaches.
- `overscale_snapshot.yaml` – Minimal audit snapshot aligned to Phase 36 cadence.

## Usage

1. Load `nodes.json` into the spiral mapper to replicate the golden-angle placement and loop assignments.
2. Register the guards before enabling residual flows to ensure scholarship and service access remain policy compliant.
3. Push the vault policies into the treasury router, then replay `flows.json` to seed overscale-adjusted reserves.
4. Track implementation deltas inside the compare–contrast matrix and extend the audit snapshot once the first hash root is minted.

All files adhere to the canonical ID formats and policy ratios described in the Phase 36 kit so downstream contracts and tokens can bind deterministically once minting is authorized.
