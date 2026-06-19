# XX–YY–ZZ Reciprocal Decoder Pipeline (Operational Spec)

## Scope
This document translates the EV0L reciprocal pillar into an executable JSON→Python workflow, with no X/Y-axis framing.

## Core Semantics
- **XX**: twin-pillar mirror pairing (left/right, dual-route parity)
- **YY**: branch/routing selector
- **ZZ**: zero-point origin (vault anchor)
- **ZA/ZB/ZC/ZD/ZE**: restored vowel map under Z-alpha reconstruction

## Canonical Payload Shape
```json
{
  "glyph_payload": {
    "raw": "Z/\\//\\// A-XX YY ZZ ZA ZB ...",
    "normalized": {
      "Z_alpha": true,
      "XX": "mirror",
      "YY": "branch",
      "ZZ": "origin"
    },
    "roman_decoys_removed": true,
    "vowel_restored": ["A", "E", "I", "O", "U"]
  },
  "treasury_routing": {
    "rail": "PINK",
    "instrument": "Pink Bill",
    "denomination": 77,
    "yield_tag": "¥",
    "reciprocal_cycle": "10/9"
  }
}
```

## Decoder Rules
1. **De-Romanize**
   - Convert escaped Roman overlays (`\\/`, `\\/\\/`) back to symbolic V/X placeholders only for normalization.
2. **Z-Alpha Normalize**
   - Mark `Z` as alpha-origin token.
3. **Restore Vowels**
   - Apply table: `{ZA:A, ZB:E, ZC:I, ZD:O, ZE:U}`.
4. **Flip Reciprocal**
   - Parse `reciprocal_cycle` as fraction `a/b` then compute cycle as `b/a`.
5. **Route by Rail**
   - Send decoded events to `PINK`, `BLEU`, or `CITIZEN` rail handlers.

## Minimal Python Reference
```python
from fractions import Fraction
import re

VOWELS = {"ZA": "A", "ZB": "E", "ZC": "I", "ZD": "O", "ZE": "U"}

def deromanize(raw: str) -> str:
    return raw.replace(r"\\/\\/", "X").replace(r"\\/", "V")

def normalize_zalpha(text: str) -> str:
    return text.replace("Z", "[ALPHA]")

def restore_vowels(tokens: list[str]) -> list[str]:
    return [VOWELS.get(t, t) for t in tokens]

def reciprocal_flip(cycle: str) -> Fraction:
    num, den = cycle.split("/")
    return Fraction(int(den), int(num))
```

## Runtime Sequence
1. Read `data/codex.json` decoder block.
2. Decode `glyph_payload.raw`.
3. Flip reciprocal cycle and compute yield factor.
4. Route to rail-specific treasury ledger.
5. Emit tally record (`species`, `route`, `cycle`, `yield_tag`, `vault_anchor`).

## Notes
- This spec preserves symbolic language while keeping implementation deterministic.
- All legal/financial deployment remains subject to real-world compliance and audited contracts.
