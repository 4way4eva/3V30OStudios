"""Core Ω48/reciprocal math primitives for algorithmic deployment.

This module converts the specification math into deterministic functions that can be
used by runtime systems (dashboards, simulations, game loops, and treasury checks).
"""
from __future__ import annotations

from dataclasses import dataclass
import math
from typing import Iterable, List, Sequence

OMEGA_TICKS = 48
MINUTES_PER_CYCLE = 60
QUARTER_TICKS = (12, 24, 36, 0)


@dataclass(frozen=True)
class CycleProjection:
    """Projection of a minute offset into Ω48 tick + angle space."""

    minutes: float
    tick: int
    angle_radians: float


@dataclass(frozen=True)
class ReciprocalState:
    """Reciprocal analysis state for a scalar x."""

    x: float
    reciprocal: float
    reciprocal_sum: float
    snapped_tick: int


@dataclass(frozen=True)
class SyncEvent:
    """Describes quarter and reciprocal sync conditions for an event tick."""

    tick: int
    reciprocal_tick: int
    quarter_hit: bool
    reciprocal_sync: bool


def snap_tick(minutes: float, cycle_minutes: int = MINUTES_PER_CYCLE, omega_ticks: int = OMEGA_TICKS) -> int:
    """Map a minute offset to an Ω48 tick using nearest-integer projection."""

    projected = round(omega_ticks * minutes / cycle_minutes)
    return projected % omega_ticks


def tick_angle(tick: int, omega_ticks: int = OMEGA_TICKS) -> float:
    """Convert tick index to angular position on the unit circle."""

    return (2 * math.pi * (tick % omega_ticks)) / omega_ticks


def project_cycle(minutes: float) -> CycleProjection:
    """Project minute offset into (tick, angle) representation."""

    tick = snap_tick(minutes)
    return CycleProjection(minutes=minutes, tick=tick, angle_radians=tick_angle(tick))


def reciprocal_sum(x: float) -> float:
    """Compute R(x) = x + 1/x."""

    if x == 0:
        raise ValueError("x must be non-zero for reciprocal computation")
    return x + (1 / x)


def frac(value: float) -> float:
    """Return fractional component in [0,1)."""

    return value - math.floor(value)


def reciprocal_tick(x: float, omega_ticks: int = OMEGA_TICKS) -> int:
    """Compute lattice-snapped reciprocal tick using R48-style projection."""

    if x == 0:
        raise ValueError("x must be non-zero for reciprocal tick")

    k_a = round(omega_ticks * frac(x))
    k_b = round(omega_ticks * frac(1 / x))
    return (k_a + k_b) % omega_ticks


def reciprocal_state(x: float) -> ReciprocalState:
    """Build reciprocal state payload for runtime consumption."""

    return ReciprocalState(
        x=x,
        reciprocal=1 / x,
        reciprocal_sum=reciprocal_sum(x),
        snapped_tick=reciprocal_tick(x),
    )


def spiral_radius(x: float, median_r: float, alpha: float) -> float:
    """Compute reciprocal-powered spiral radius ρ = 1 + α*(R(x) - median(R))."""

    return 1 + alpha * (reciprocal_sum(x) - median_r)


def is_quarter_tick(tick: int) -> bool:
    """Check whether a tick is one of the quarter anchors."""

    return (tick % OMEGA_TICKS) in QUARTER_TICKS


def reciprocal_sync(tick: int, reciprocal_k: int, tolerance: int = 1) -> bool:
    """Check if tick and reciprocal tick are synchronized within tolerance."""

    a = tick % OMEGA_TICKS
    b = reciprocal_k % OMEGA_TICKS
    delta = abs(a - b)
    wrapped_delta = min(delta, OMEGA_TICKS - delta)
    return wrapped_delta <= tolerance


def evaluate_event(tick: int, x: float, tolerance: int = 1) -> SyncEvent:
    """Evaluate quarter hit + reciprocal sync for a single event."""

    rk = reciprocal_tick(x)
    return SyncEvent(
        tick=tick % OMEGA_TICKS,
        reciprocal_tick=rk,
        quarter_hit=is_quarter_tick(tick),
        reciprocal_sync=reciprocal_sync(tick, rk, tolerance=tolerance),
    )


def chain333(quarter_ticks: Sequence[int], tolerance: int = 1) -> bool:
    """Return True when 3 consecutive hits land on/near quarter ticks."""

    if len(quarter_ticks) < 3:
        return False

    for tick in quarter_ticks[-3:]:
        if not any(reciprocal_sync(tick, qt, tolerance=tolerance) for qt in QUARTER_TICKS):
            return False
    return True


__all__ = [
    "OMEGA_TICKS",
    "MINUTES_PER_CYCLE",
    "QUARTER_TICKS",
    "CycleProjection",
    "ReciprocalState",
    "SyncEvent",
    "snap_tick",
    "tick_angle",
    "project_cycle",
    "reciprocal_sum",
    "reciprocal_tick",
    "reciprocal_state",
    "spiral_radius",
    "is_quarter_tick",
    "reciprocal_sync",
    "evaluate_event",
    "chain333",
]
