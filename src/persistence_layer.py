"""Persistence helpers for BLEUCHAIN Hypergrid snapshots."""
from __future__ import annotations

from datetime import datetime
from hashlib import sha256
from pathlib import Path
from typing import Dict

import json

SNAPSHOT_DIR = Path("data/snapshots")
SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)


def _timestamp() -> str:
    return datetime.utcnow().replace(microsecond=0).isoformat() + "Z"


def save_snapshot(state: Dict, *, directory: Path = SNAPSHOT_DIR) -> Path:
    """Persist a JSON snapshot and return the saved path."""

    timestamp = _timestamp()
    filename = f"snapshot_{timestamp}.json"
    path = directory / filename

    with path.open("w", encoding="utf-8") as handle:
        json.dump(state, handle, indent=2, ensure_ascii=False)

    return path


def hash_snapshot(path: Path) -> str:
    """Return the SHA-256 hash of a stored snapshot."""

    digest = sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(4096), b""):
            digest.update(chunk)
    return digest.hexdigest()


def save_and_hash(state: Dict, *, directory: Path = SNAPSHOT_DIR) -> Dict[str, str]:
    """Convenience helper that saves a snapshot and returns its hash."""

    path = save_snapshot(state, directory=directory)
    return {
        "path": str(path),
        "sha256": hash_snapshot(path),
        "timestamp": _timestamp(),
    }


__all__ = ["save_snapshot", "hash_snapshot", "save_and_hash", "SNAPSHOT_DIR"]
