# MEGAZION 48-Fold Codex - Pull Request Instructions

## Branch Created

A new branch `feature/48-fold-codex` has been created with all the MEGAZION 48-Fold Codex feature package files.

## Files Added/Modified

### New Files
- `.github/workflows/nft-storage-pin.yml` - Gated NFT.Storage pinning workflow
- `README_48fold.md` - Complete feature package documentation
- `README_RUN_LOCAL.md` - Local development setup guide

### Modified Files
- `scripts/metavault_batch_mint.py` - Clean implementation with MIT header and π₄ compounding
- `scripts/plot_compounding.py` - Matplotlib visualization generator
- `scripts/export_enft_ledger.ts` - Blockchain event exporter
- `scripts/config.json` - Fixed JSON syntax error
- `.gitignore` - Added outputs/ directory exclusion

## Creating the Pull Request

To create the DRAFT pull request, follow these steps:

### Option 1: GitHub UI

1. Navigate to https://github.com/4way4eva/3V30OStudios
2. Click "Pull requests" tab
3. Click "New pull request"
4. Set base branch: `main`
5. Set compare branch: `feature/48-fold-codex`
6. Click "Create pull request"
7. Set title: `Add MEGAZION 48‑Fold Codex, Visuals, Ledger Pipeline, and Simulation Scaffold`
8. Add description (use content from branch's latest commit message)
9. Check "Create as draft" option
10. Click "Create draft pull request"

### Option 2: GitHub CLI

```bash
gh pr create \
  --base main \
  --head feature/48-fold-codex \
  --title "Add MEGAZION 48‑Fold Codex, Visuals, Ledger Pipeline, and Simulation Scaffold" \
  --body-file PR_DESCRIPTION.md \
  --draft
```

### Option 3: Git Command Line + Hub

```bash
# If hub is installed
hub pull-request \
  -b main \
  -h feature/48-fold-codex \
  -m "Add MEGAZION 48‑Fold Codex, Visuals, Ledger Pipeline, and Simulation Scaffold" \
  --draft
```

## PR Description Template

Use this as the PR description:

```markdown
## MEGAZION 48-Fold Codex Feature Package

This PR adds the complete MEGAZION / BLEULIONTREASURY 48-Fold Codex feature package with full pipeline components.

### Features

- **π₄ Exponential Compounding Model** (factor: 97.409)
- **Three-Domain Economic System**: CIVILIAN (47.6%), MILITARY (21.3%), COSMIC (31.1%)
- **Ledger Generation**: CSV, JSON, and ENFT formats
- **Visualization**: Matplotlib-based compounding charts
- **Blockchain Export**: Transfer event querying and export
- **NFT.Storage Integration**: Gated workflow for IPFS pinning

### Files Added

1. `scripts/metavault_batch_mint.py` - MetaVault batch minting with π₄ compounding
2. `scripts/plot_compounding.py` - Compounding visualization generator
3. `scripts/export_enft_ledger.ts` - Blockchain Transfer event exporter
4. `.github/workflows/nft-storage-pin.yml` - Gated IPFS pinning workflow
5. `README_48fold.md` - Complete documentation
6. `README_RUN_LOCAL.md` - Local setup guide

### Testing

✅ `scripts/metavault_batch_mint.py` tested successfully
✅ Output files generated correctly (CSV, JSON)
✅ All MIT license headers validated
✅ Placeholders used for secrets and IPFS CIDs
✅ No transaction broadcasting (simulation only)

### Configuration

- Uses `scripts/config.json` DEFAULT_CONFIG
- IPFS placeholders: `ipfs://REPLACE_WITH_CID`
- Contract placeholders: `0x0000000000000000000000000000000000000000`
- Private key placeholders: `0xPLACEHOLDER_REPLACE_WITH_ACTUAL_KEY`

### Workflow

The NFT.Storage workflow is **disabled by default** and only runs when `NFT_STORAGE_KEY` secret is added to repository secrets.

### Next Steps

1. Review code and documentation
2. Test with matplotlib installed
3. Test export_enft_ledger.ts with deployed contracts
4. Configure NFT_STORAGE_KEY secret if pinning needed
5. Merge when ready

---

**DO NOT MERGE YET** - This is a draft PR for review.
```

## Verification

Before creating the PR, verify:

- [x] Branch `feature/48-fold-codex` exists with all commits
- [x] All files have MIT license headers
- [x] Placeholders used for secrets and IPFS CIDs
- [x] NFT.Storage workflow is gated (disabled by default)
- [x] Scripts tested locally
- [x] Documentation complete

## Important Notes

- This PR should be created as a **DRAFT** - do NOT merge immediately
- The branch targets `main` as the base branch
- All placeholders must be replaced before production use
- NFT.Storage workflow requires `NFT_STORAGE_KEY` secret to activate

## Support

For questions or issues:
- See `README_48fold.md` for feature documentation
- See `README_RUN_LOCAL.md` for local setup
- Check script comments for usage examples
