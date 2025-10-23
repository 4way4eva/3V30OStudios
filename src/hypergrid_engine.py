"""Hypergrid economic engine for the BLEUCHAIN Evolverse.

This module implements deterministic, auditable functions for the
5-Layer Guarantee cycle that powers each sector in the Hypergrid ledger.
The functions are intentionally lightweight so they can execute inside
metaverse runtimes, CLI simulations, or serverless jobs.
"""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Tuple

import json

DEFAULT_LEDGER_PATH = Path("data/HYPERGRID_LEDGER.json")


@dataclass(frozen=True)
class YieldBreakdown:
    """Represents a single transaction cycle in the Hypergrid."""

    sector: str
    gross_amount: float
    residual_capture: float
    scholarship_reserve: float
    reinvestment_pool: float
    profit_surplus: float

    def as_dict(self) -> Dict[str, float | str]:
        return {
            "sector": self.sector,
            "gross_amount": self.gross_amount,
            "residual_capture": self.residual_capture,
            "scholarship_reserve": self.scholarship_reserve,
            "reinvestment_pool": self.reinvestment_pool,
            "profit_surplus": self.profit_surplus,
        }


def load_ledger(path: Path = DEFAULT_LEDGER_PATH) -> Dict:
    """Load the Hypergrid ledger JSON file."""

    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def _clamp(value: float, lower: float, upper: float) -> float:
    return max(lower, min(upper, value))


def compute_yield(
    sector_name: str,
    amount: float,
    residual_pct: float,
    scholarship_pct: float,
    profit_pct: float,
) -> YieldBreakdown:
    """Compute the deterministic breakdown for a sector cycle."""

    residual_capture = amount * residual_pct
    scholarship_reserve = amount * scholarship_pct
    profit_surplus = amount * profit_pct
    reinvestment_pool = amount - (residual_capture + scholarship_reserve + profit_surplus)

    return YieldBreakdown(
        sector=sector_name,
        gross_amount=amount,
        residual_capture=residual_capture,
        scholarship_reserve=scholarship_reserve,
        reinvestment_pool=reinvestment_pool,
        profit_surplus=profit_surplus,
    )


def sector_defaults(ledger: Dict, sector_name: str) -> Tuple[float, float, float]:
    """Fetch the recommended percentage configuration for a sector."""

    for record in ledger["sectors"]:
        if record["sector"] == sector_name:
            residual = float(record.get("residual_capture_pct", 0.15))
            scholarship = float(record.get("scholarship_pct", 0.15))
            profit_range = record.get("profit_surplus_pct", [0.3, 0.5])
            profit = sum(profit_range) / len(profit_range)
            return residual, scholarship, profit

    raise KeyError(f"Sector '{sector_name}' not defined in ledger")


def reciprocal_route(amount: float, targets: Iterable[str]) -> Dict[str, float]:
    """Split an amount equally across reciprocal routing targets."""

    targets = list(targets)
    if not targets:
        return {}

    share = amount / len(targets)
    return {target: share for target in targets}


def audit_ledger(ledger: Dict) -> List[str]:
    """Run structural validations over the ledger data."""

    issues: List[str] = []
    seen = set()
    for record in ledger.get("sectors", []):
        identifier = record.get("uuid")
        if identifier in seen:
            issues.append(f"Duplicate UUID detected: {identifier}")
        seen.add(identifier)

        bills = record.get("bills", [])
        coins = record.get("coins", [])
        vaults = record.get("vaults", [])
        if not (bills and coins and vaults):
            issues.append(f"Sector {record.get('sector')} is missing ledger chains")

        residual = record.get("residual_capture_pct", 0)
        scholarship = record.get("scholarship_pct", 0)
        profit_range = record.get("profit_surplus_pct", [0, 0])
        if residual <= 0 or scholarship <= 0:
            issues.append(f"Sector {record.get('sector')} requires positive percentages")
        if profit_range[0] <= 0:
            issues.append(f"Sector {record.get('sector')} requires profit surplus minimum")

    return issues


def transactional_cycle(
    amount: float,
    sector_name: str,
    ledger_path: Path = DEFAULT_LEDGER_PATH,
) -> Dict[str, Dict[str, float]]:
    """Execute a single 5-Layer Guarantee cycle and return results."""

    ledger = load_ledger(ledger_path)
    residual, scholarship, profit = sector_defaults(ledger, sector_name)

    constants = ledger.get("constants", {})
    min_residual, max_residual = constants.get("residual_capture_range", [0.1, 0.2])
    min_scholarship, max_scholarship = constants.get("scholarship_reserve_range", [0.1, 0.2])
    min_profit, max_profit = constants.get("profit_surplus_range", [0.3, 0.5])

    residual = _clamp(residual, min_residual, max_residual)
    scholarship = _clamp(scholarship, min_scholarship, max_scholarship)
    profit = _clamp(profit, min_profit, max_profit)

    breakdown = compute_yield(sector_name, amount, residual, scholarship, profit)
    targets = next(
        (
            record.get("reciprocal_routes", [])
            for record in ledger["sectors"]
            if record["sector"] == sector_name
        ),
        [],
    )

    routes = reciprocal_route(breakdown.reinvestment_pool, targets)

    return {
        "breakdown": breakdown.as_dict(),
        "reciprocal_routes": routes,
    }


__all__ = [
    "YieldBreakdown",
    "load_ledger",
    "sector_defaults",
    "compute_yield",
    "reciprocal_route",
    "audit_ledger",
    "transactional_cycle",
]
