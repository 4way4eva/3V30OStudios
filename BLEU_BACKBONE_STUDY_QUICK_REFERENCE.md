# BLEU Backbone Study System - Quick Reference

## 🎴 Flashcard Commands

| Command | Description | Cards |
|---------|-------------|-------|
| `npm run study:flashcards` | Interactive menu | - |
| `npm run study:flashcards:products` | All products with details | 28 |
| `npm run study:flashcards:signals` | Match signals to products | 28 |
| `npm run study:flashcards:roi` | ROI percentages | 28 |
| `npm run study:flashcards:elements` | Ceremonial elements | 28 |
| `npm run study:flashcards:sectors` | Sector summaries | 8 |
| `npm run study:flashcards:export-anki` | Export to Anki CSV | 120 |
| `npm run study:flashcards:export-json` | Export to JSON | 120 |

## 📝 Quiz Commands

| Command | Description | Questions |
|---------|-------------|-----------|
| `npm run study:quiz` | Interactive menu | - |
| `npm run study:quiz:multiple-choice` | Multiple choice questions | 15 |
| `npm run study:quiz:true-false` | True/False questions | 6 |
| `npm run study:quiz:fill-blank` | Fill in the blank | 4 |
| `npm run study:quiz:comprehensive` | All question types | 25 |
| `npm run study:quiz:quick` | Random quick quiz | 10 |

## 🗺️ Visual Map Commands

| Command | Description | Output |
|---------|-------------|--------|
| `npm run study:visual:tree` | ASCII hierarchy tree | Console |
| `npm run study:visual:mermaid` | Mermaid flowchart | Markdown |
| `npm run study:visual:investment` | Investment priority matrix | Console |
| `npm run study:visual:heatmap` | ROI heat map with bars | Console |
| `npm run study:visual:distribution` | Domain pie charts | Console |
| `npm run study:visual:comparison` | Sector comparison table | Console |
| `npm run study:visual:export` | Export all visualizations | 6 files |

## 📊 Analysis Commands

| Command | Description |
|---------|-------------|
| `npm run bleu:backbone:summary` | Sector summaries with stats |
| `npm run bleu:backbone:top-roi [n]` | Top N products by ROI |
| `npm run bleu:backbone:top-overscale [n]` | Top N products by overscale |
| `npm run bleu:backbone:export-csv` | Export to CSV spreadsheet |
| `npm run bleu:backbone:export-md` | Export to Markdown |

## 📁 Generated Files

All files saved to `data/` directory:

### Flashcards
- `bleu_backbone_flashcards.csv` - Anki-compatible (20KB)
- `bleu_backbone_flashcards.json` - JSON format (25KB)

### Visualizations
- `bleu_backbone_tree.txt` - ASCII tree structure (6.4KB)
- `bleu_backbone_flowchart.md` - Mermaid diagram (2.5KB)
- `bleu_backbone_investment_matrix.txt` - Priority ranking (3.6KB)
- `bleu_backbone_roi_heatmap.txt` - Heat map with bars (8KB)
- `bleu_backbone_domain_distribution.txt` - Pie charts (2.2KB)
- `bleu_backbone_sector_comparison.txt` - Comparison table (2.6KB)

### Exports
- `bleu_backbone_export.csv` - Full data export
- `bleu_backbone_export.md` - Markdown report

## 🎯 Quick Start Examples

### Study Session
```bash
# Start with flashcards
npm run study:flashcards:sectors

# Test yourself
npm run study:quiz:quick

# Review performance
npm run study:visual:heatmap
```

### Export for Mobile
```bash
# Export flashcards to Anki
npm run study:flashcards:export-anki

# Import data/bleu_backbone_flashcards.csv into Anki app
```

### Generate All Visuals
```bash
# Export everything
npm run study:visual:export

# View files in data/ directory
ls -lh data/bleu_backbone_*.txt data/bleu_backbone_*.md
```

### Analysis Session
```bash
# Top performers
npm run bleu:backbone:top-roi 10
npm run bleu:backbone:top-overscale 10

# Sector breakdown
npm run bleu:backbone:summary

# Export for spreadsheet
npm run bleu:backbone:export-csv
```

## 📚 Learning Paths

### Beginner (Week 1)
1. Read `BLEU_BACKBONE_STUDY_GUIDE.md`
2. `npm run study:visual:tree`
3. `npm run study:flashcards:sectors`
4. `npm run study:quiz:quick`

### Intermediate (Week 2)
1. `npm run study:flashcards:products`
2. `npm run study:flashcards:signals`
3. `npm run study:quiz:multiple-choice`
4. `npm run study:visual:heatmap`

### Advanced (Week 3)
1. `npm run study:flashcards:roi`
2. `npm run study:flashcards:elements`
3. `npm run study:quiz:comprehensive`
4. `npm run study:visual:investment`

### Mastery (Week 4)
1. `npm run study:flashcards:export-anki`
2. `npm run study:visual:export`
3. Perfect score on `study:quiz:comprehensive`
4. Teach someone else using your notes

## 💡 Pro Tips

### Spaced Repetition
- Use Anki export for daily 15-min sessions
- Review weekly with `study:quiz:quick`
- Track progress with visual maps

### Active Learning
- Try to answer before revealing flashcard backs
- Explain concepts out loud
- Draw sector diagrams from memory

### Pattern Recognition
- Compare similar products across sectors
- Notice ROI trends by domain
- Connect ceremonial elements to use cases

## 🔗 Key Resources

- **Study Guide**: `BLEU_BACKBONE_STUDY_GUIDE.md` (324 lines)
- **Study System**: `BLEU_BACKBONE_STUDY_SYSTEM.md` (10KB)
- **Data Source**: `data/bleu_backbone_full_report.json` (45KB)
- **Scripts**: `scripts/bleu_backbone_*.js` (3 files)

## 📈 Key Statistics to Memorize

- **Total Products**: 28
- **Total Sectors**: 8
- **Total Overscale**: $19.07 trillion
- **Average ROI**: 197.5%
- **Highest ROI**: BLEU SportsVerse Arenas (248%)
- **Largest Overscale**: Ziphonate Cores ($1.2T)
- **Domain Split**: 50% CIVILIAN, 39% COSMIC, 13% MILITARY

---

**Version**: 1.0.0  
**Last Updated**: November 14, 2025  
**Ceremonial Seal**: BLEU_BACKBONE_GENESIS
