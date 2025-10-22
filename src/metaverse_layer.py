"""Metaverse mirror bindings for BLEUCHAIN vault activity."""
from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List

import json

from .hypergrid_engine import transactional_cycle


@dataclass
class MetaVault:
    """Represents a real-world vault mirrored in the metaverse."""

    name: str
    real_vault: str
    routes: List[str] = field(default_factory=list)

    def mirror(self, transaction: Dict[str, Dict[str, float]]) -> Dict[str, Dict[str, float]]:
        """Return a payload that can be used by a metaverse client."""

        payload = {
            "metavault": self.name,
            "real_vault": self.real_vault,
            "transaction": transaction["breakdown"],
            "routes": transaction["reciprocal_routes"],
        }
        return payload


@dataclass
class MetaGalaxy:
    """A procedural constellation mapping sectors to metaverse nodes."""

    manifest_path: Path

    def load(self) -> Dict:
        with self.manifest_path.open("r", encoding="utf-8") as handle:
            return json.load(handle)


def sync_sector(
    sector_name: str,
    amount: float,
    ledger_path: Path,
    manifest_path: Path,
) -> Dict[str, Dict[str, float]]:
    """Execute a transactional cycle and prepare the metaverse mirror payload."""

    cycle = transactional_cycle(amount, sector_name, ledger_path)
    galaxy = MetaGalaxy(manifest_path).load()

    vault_name = next(
        (
            node["meta_vault"]
            for node in galaxy.get("nodes", [])
            if node.get("sector") == sector_name
        ),
        f"MetaVault::{sector_name}",
    )

    metavault = MetaVault(name=vault_name, real_vault=cycle["breakdown"]["sector"], routes=list(cycle["reciprocal_routes"].keys()))
    return metavault.mirror(cycle)


__all__ = ["MetaVault", "MetaGalaxy", "sync_sector"]
