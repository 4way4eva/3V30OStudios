"""Continuous runtime loop for BLEUCHAIN Hypergrid."""
from __future__ import annotations

import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.append(str(ROOT))

from src.hypergrid_engine import audit_ledger, load_ledger, transactional_cycle
from src.metaverse_layer import sync_sector
from src.persistence_layer import save_and_hash

LEDGER_PATH = ROOT / "data/HYPERGRID_LEDGER.json"
MANIFEST_PATH = ROOT / "data/GALAXY_MANIFEST.json"
SECTORS = [
    "Agriculture & Ecology",
    "Military & Defense",
    "Industry & Infrastructure",
    "Consumer & Commerce",
    "Health, Insurance & Life",
    "Education & Culture",
    "Cosmic & Spiritual",
    "Mega-Tech & Future Systems",
]


def main_loop(cycles: int = 1, amount: float = 1_000_000_000.0, delay: float = 0.0) -> None:
    ledger = load_ledger(LEDGER_PATH)
    issues = audit_ledger(ledger)
    if issues:
        raise ValueError(f"Ledger validation failed: {issues}")

    for _ in range(cycles):
        for sector in SECTORS:
            cycle = transactional_cycle(amount, sector, LEDGER_PATH)
            mirror_payload = sync_sector(sector, amount, LEDGER_PATH, MANIFEST_PATH)
            save_and_hash({
                "sector": sector,
                "breakdown": cycle["breakdown"],
                "routes": cycle["reciprocal_routes"],
                "metaverse": mirror_payload,
            })
            if delay:
                time.sleep(delay)


if __name__ == "__main__":
    main_loop(cycles=1, amount=1_000_000.0, delay=0.0)
