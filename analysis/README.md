# BLEU Codex Complexity Analysis Tools

This directory contains analytical tools for measuring and validating the ceremonial complexity of the BLEU Codex and ARIEL Fortress systems.

## Overview

The complexity analysis framework provides quantitative metrics that benchmark the BLEU Codex against legendary historical codices such as:

- **Leonardo da Vinci's Codices** (Codex Leicester, Codex Atlanticus)
- **Sun Tzu's Art of War**
- **Maya Codices** (Dresden, Madrid, Paris)
- **Vauban's Fortification Treatises**

## Metrics Measured

### 1. Cyclomatic Complexity
Measures multi-path logic and strategic branching through ceremonial scrolls.

- **Interpretation**: Number of independent decision pathways
- **Benchmark**: Sun Tzu (15-25), Maya Codices (20-40)
- **Target**: Extensive strategic branches indicating deep adaptability

### 2. Halstead Volume
Quantifies vocabulary richness and symbolic diversity.

- **Interpretation**: Total vocabulary usage × log₂(unique vocabulary)
- **Benchmark**: Da Vinci (exceptional cross-domain vocabulary)
- **Target**: Extensive symbolic system reflecting multidisciplinary synthesis

### 3. Maintainability Index
Assesses modular structure and ease of extension.

- **Interpretation**: 0-100 scale, higher is more maintainable
- **Benchmark**: Vauban (high modular design)
- **Target**: Score ≥ 65 for sustainable long-term evolution

### 4. Cognitive Complexity
Evaluates nested logic depth and abstraction levels.

- **Interpretation**: Mental effort required to comprehend the system
- **Benchmark**: Mesoamerican codices (multi-layered symbolic logic)
- **Target**: High complexity reflecting ceremonial abstraction

## Usage

### Run Complexity Analysis

```bash
# Using npm script
npm run analyze:complexity

# Direct Python execution
python3 analysis/codex_complexity_analyzer.py
```

### Output Files

- **codex_complexity_report.json**: Detailed JSON report with all metrics
- **Console Output**: Summary statistics and interpretations

### Sample Output

```
================================================================================
BLEU CODEX & ARIEL FORTRESS - COMPLEXITY ANALYSIS
================================================================================

Cyclomatic Complexity:
  Total: 9347
  Average per scroll: 112.61
  Assessment: Very high complexity, extensive strategic branches

Halstead Metrics:
  Volume: 16221495.62
  Vocabulary Size: 11675
  Assessment: Exceptional symbolic diversity

Maintainability Index:
  Score: 0/100
  Assessment: Challenging to maintain, consider restructuring

Cognitive Complexity:
  Score: 116.21
  Max Nesting Depth: 1
  Assessment: Very high cognitive demand, multi-level abstraction

Ceremonial Metrics:
  Total Scrolls Analyzed: 83
  Strategic Branches: 1153
  Symbolic Vocabulary: 16
  Total Content Length: 1,200,602 chars
```

## Files

### codex_complexity_analyzer.py

Main analysis tool that:
- Scans all ceremonial scrolls (.md, .json, .txt files)
- Extracts decision points, vocabulary, symbols, and structure
- Calculates complexity metrics
- Generates comparative analysis against historical benchmarks

**Features**:
- Automated scroll structure analysis
- Symbolic vocabulary cataloging
- Nesting depth calculation
- Strategic branch counting
- Historical benchmark comparison

## Interpretation Guidelines

### Cyclomatic Complexity

| Score Range | Interpretation                                  |
|-------------|-------------------------------------------------|
| < 10        | Simple, linear structure                        |
| 10-20       | Moderate complexity, some branching            |
| 20-50       | High complexity, multi-path logic              |
| > 50        | Very high complexity, extensive strategic branches |

### Halstead Volume

| Score Range    | Interpretation                    |
|----------------|-----------------------------------|
| < 1,000        | Limited vocabulary and symbolism  |
| 1,000-10,000   | Moderate symbolic richness        |
| 10,000-100,000 | Extensive vocabulary and symbolism|
| > 100,000      | Exceptional symbolic diversity    |

### Maintainability Index

| Score Range | Interpretation                                  |
|-------------|-------------------------------------------------|
| ≥ 80        | Highly maintainable, excellent modularity      |
| 65-79       | Good maintainability, clear structure          |
| 50-64       | Moderate maintainability                       |
| < 50        | Challenging to maintain, consider restructuring |

### Cognitive Complexity

| Score Range | Interpretation                            |
|-------------|-------------------------------------------|
| < 10        | Low cognitive load, straightforward       |
| 10-25       | Moderate cognitive demand                 |
| 25-50       | High cognitive complexity, nested logic   |
| > 50        | Very high cognitive demand, multi-level abstraction |

## Theoretical Foundation

See [Ceremonial Complexity Framework](../docs/CEREMONIAL_COMPLEXITY_FRAMEWORK.md) for detailed theoretical background on:

- Adaptation of software metrics to ceremonial infrastructure
- Historical codex complexity benchmarks
- Multidisciplinary innovation indicators
- Continuous improvement framework

## Comparative Benchmarks

The analyzer includes built-in historical benchmarks:

```json
{
  "comparative_benchmarks": {
    "Sun Tzu (Art of War)": {
      "cyclomatic_estimate": "15-25 (strategic branches)",
      "cognitive": "High (multi-level tactical logic)"
    },
    "Da Vinci Codices": {
      "halstead_volume_estimate": "Very High (extensive vocabulary)",
      "cognitive": "Very High (cross-domain integration)"
    },
    "Maya Codices": {
      "cyclomatic_estimate": "20-40 (ritual pathways)",
      "symbolic_richness": "Exceptional (glyphs, calendrics)"
    },
    "Vauban Treatises": {
      "maintainability": "High (modular fortress designs)",
      "cyclomatic": "Moderate (geometric principles)"
    }
  }
}
```

## Integration with Development Workflow

### Periodic Analysis

Run complexity analysis after significant codex updates:

```bash
# After adding new scrolls
git add .
npm run analyze:complexity
git add codex_complexity_report.json
git commit -m "Update complexity metrics after new scroll deployment"
```

### Quality Monitoring

Track complexity trends over time to ensure:
- Cyclomatic complexity remains manageable
- Maintainability index stays above 65
- Symbolic richness continues to grow
- Cognitive complexity reflects ceremonial depth without becoming incomprehensible

## Future Enhancements

Potential additions to the analysis framework:

1. **Trend Analysis**: Track complexity evolution over git history
2. **Scroll-Specific Reports**: Detailed per-scroll complexity profiles
3. **Visualization**: Generate charts and graphs of metrics
4. **Automated Alerts**: Warn when complexity thresholds are exceeded
5. **Comparative Analysis**: Direct comparison with specific historical codices
6. **Domain-Specific Metrics**: Specialized measures for military, agricultural, educational scrolls

## Contributing

When adding new ceremonial scrolls:

1. Ensure proper use of decision markers (if, when, choose, etc.)
2. Maintain consistent symbolic vocabulary
3. Document strategic branches with clear headers (#, ##, ###)
4. Run complexity analysis to verify impact on overall metrics
5. Update documentation if introducing new ceremonial patterns

## References

- [README.md](../README.md) - Main project documentation with comparative analysis table
- [Ceremonial Complexity Framework](../docs/CEREMONIAL_COMPLEXITY_FRAMEWORK.md) - Theoretical foundation
- [BLEU Codex NFT Commandments](../EV0L_CODEX_NFT_COMMANDMENTS.md) - Core ceremonial principles

---

*For questions or suggestions regarding complexity analysis, please open an issue or submit a pull request.*
