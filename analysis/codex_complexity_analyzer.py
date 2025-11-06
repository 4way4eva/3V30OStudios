#!/usr/bin/env python3
"""
BLEU Codex Complexity Analyzer
Measures ceremonial complexity metrics for the BLEU Codex and ARIEL Fortress systems.

This analyzer provides quantitative metrics analogous to software complexity measures:
- Cyclomatic Complexity: Multi-path logic through ceremonial scrolls
- Halstead Volume: Vocabulary and symbolic richness
- Maintainability Index: Modular structure assessment  
- Cognitive Complexity: Nested ceremonial logic depth
"""

import json
import os
from pathlib import Path
from typing import Dict, List, Tuple
import re


class CodexComplexityAnalyzer:
    """Analyzes the complexity and structure of codex systems."""
    
    def __init__(self, codex_root: str = "."):
        self.codex_root = Path(codex_root)
        self.metrics = {
            "cyclomatic_complexity": 0,
            "halstead_volume": 0,
            "maintainability_index": 0,
            "cognitive_complexity": 0,
            "scroll_count": 0,
            "ceremonial_layers": 0,
            "symbolic_vocabulary": set(),
            "strategic_branches": 0
        }
        
    def analyze_scroll_structure(self, filepath: Path) -> Dict:
        """Analyze the structural complexity of a ceremonial scroll."""
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Cyclomatic complexity: count decision points and branches
        decision_markers = [
            'if', 'when', 'unless', 'choose', 'select',
            'either', 'or', 'alternative', 'pathway', 'branch'
        ]
        cyclomatic = sum(content.lower().count(marker) for marker in decision_markers)
        
        # Halstead volume: unique vocabulary (operators and operands)
        words = re.findall(r'\b[A-Za-z]{3,}\b', content)
        unique_words = set(w.lower() for w in words)
        
        # Ceremonial symbols and special markers
        symbols = re.findall(r'[🌀🔷💎🧬⚡🛡️👁️🌊⛽🏛️🎓💰🗝️📜✨🔮]', content)
        unique_symbols = set(symbols)
        
        # Nested structure depth (headers, lists, blockquotes)
        max_depth = self._calculate_nesting_depth(content)
        
        # Strategic branches (sections, chapters, modules)
        strategic_branches = len(re.findall(r'^#{1,6}\s', content, re.MULTILINE))
        
        return {
            "cyclomatic": cyclomatic,
            "unique_words": unique_words,
            "vocabulary_size": len(unique_words),
            "symbol_count": len(unique_symbols),
            "nesting_depth": max_depth,
            "strategic_branches": strategic_branches,
            "content_length": len(content),
            "symbols": unique_symbols,
            "file": str(filepath)
        }
    
    def _calculate_nesting_depth(self, content: str) -> int:
        """Calculate maximum nesting depth of ceremonial structures."""
        max_depth = 0
        current_depth = 0
        
        for line in content.split('\n'):
            # Check for nested lists
            if line.strip().startswith(('-', '*', '+')):
                leading_spaces = len(line) - len(line.lstrip())
                depth = leading_spaces // 2
                max_depth = max(max_depth, depth)
            
            # Check for blockquotes
            if line.strip().startswith('>'):
                depth = len(re.match(r'^>+', line.strip()).group())
                max_depth = max(max_depth, depth)
        
        return max_depth
    
    def calculate_halstead_metrics(self, vocab_size: int, total_length: int) -> Tuple[float, float]:
        """
        Calculate Halstead volume and difficulty.
        Volume = total_length * log2(vocab_size)
        """
        import math
        if vocab_size == 0:
            return 0, 0
        
        volume = total_length * math.log2(vocab_size)
        # Simplified difficulty measure
        difficulty = vocab_size / 2
        return volume, difficulty
    
    def calculate_maintainability_index(self, halstead_volume: float, 
                                       cyclomatic: int, lines: int) -> float:
        """
        Calculate maintainability index (0-100 scale).
        Higher scores indicate better maintainability.
        """
        import math
        if lines == 0 or halstead_volume == 0:
            return 100
        
        # Simplified MI calculation
        mi = max(0, (171 - 5.2 * math.log(halstead_volume) - 
                     0.23 * cyclomatic - 16.2 * math.log(lines)) * 100 / 171)
        return mi
    
    def analyze_codex(self, file_patterns: List[str] = None) -> Dict:
        """Perform comprehensive analysis of the entire codex."""
        if file_patterns is None:
            file_patterns = ['*.md', '*.json', '*.txt']
        
        total_cyclomatic = 0
        total_vocab = set()
        total_symbols = set()
        total_length = 0
        total_branches = 0
        scroll_analyses = []
        
        for pattern in file_patterns:
            for filepath in self.codex_root.rglob(pattern):
                # Skip hidden files and certain directories
                if any(part.startswith('.') for part in filepath.parts):
                    continue
                if 'node_modules' in filepath.parts or 'dist' in filepath.parts:
                    continue
                
                try:
                    analysis = self.analyze_scroll_structure(filepath)
                    scroll_analyses.append(analysis)
                    
                    total_cyclomatic += analysis['cyclomatic']
                    # Accumulate unique words from all scrolls
                    total_vocab.update(analysis.get('unique_words', set()))
                    total_symbols.update(analysis['symbols'])
                    total_length += analysis['content_length']
                    total_branches += analysis['strategic_branches']
                except Exception as e:
                    print(f"Warning: Could not analyze {filepath}: {e}")
        
        # Calculate aggregate metrics
        avg_cyclomatic = total_cyclomatic / max(len(scroll_analyses), 1)
        halstead_volume, halstead_difficulty = self.calculate_halstead_metrics(
            len(total_vocab), total_length
        )
        
        # Estimate lines (assuming avg 80 chars per line)
        estimated_lines = total_length / 80
        maintainability = self.calculate_maintainability_index(
            halstead_volume, total_cyclomatic, estimated_lines
        )
        
        # Cognitive complexity: combination of nesting and branching
        max_nesting = max((a.get('nesting_depth', 0) for a in scroll_analyses), default=0)
        cognitive_complexity = (avg_cyclomatic + max_nesting * 2 + 
                               len(total_symbols) / 10)
        
        return {
            "cyclomatic_complexity": {
                "total": total_cyclomatic,
                "average_per_scroll": round(avg_cyclomatic, 2),
                "interpretation": self._interpret_cyclomatic(avg_cyclomatic)
            },
            "halstead_metrics": {
                "volume": round(halstead_volume, 2),
                "difficulty": round(halstead_difficulty, 2),
                "vocabulary_size": len(total_vocab),
                "interpretation": self._interpret_halstead(halstead_volume)
            },
            "maintainability_index": {
                "score": round(maintainability, 2),
                "interpretation": self._interpret_maintainability(maintainability)
            },
            "cognitive_complexity": {
                "score": round(cognitive_complexity, 2),
                "max_nesting_depth": max_nesting,
                "interpretation": self._interpret_cognitive(cognitive_complexity)
            },
            "ceremonial_metrics": {
                "total_scrolls": len(scroll_analyses),
                "strategic_branches": total_branches,
                "symbolic_vocabulary": len(total_symbols),
                "total_content_length": total_length
            },
            "scroll_details": scroll_analyses[:10]  # Sample of detailed analyses
        }
    
    def _interpret_cyclomatic(self, value: float) -> str:
        """Interpret cyclomatic complexity score."""
        if value < 10:
            return "Simple, linear structure"
        elif value < 20:
            return "Moderate complexity, some branching"
        elif value < 50:
            return "High complexity, multi-path logic"
        else:
            return "Very high complexity, extensive strategic branches"
    
    def _interpret_halstead(self, volume: float) -> str:
        """Interpret Halstead volume."""
        if volume < 1000:
            return "Limited vocabulary and symbolism"
        elif volume < 10000:
            return "Moderate symbolic richness"
        elif volume < 100000:
            return "Extensive vocabulary and symbolism"
        else:
            return "Exceptional symbolic diversity"
    
    def _interpret_maintainability(self, mi: float) -> str:
        """Interpret maintainability index."""
        if mi >= 80:
            return "Highly maintainable, excellent modularity"
        elif mi >= 65:
            return "Good maintainability, clear structure"
        elif mi >= 50:
            return "Moderate maintainability"
        else:
            return "Challenging to maintain, consider restructuring"
    
    def _interpret_cognitive(self, value: float) -> str:
        """Interpret cognitive complexity."""
        if value < 10:
            return "Low cognitive load, straightforward"
        elif value < 25:
            return "Moderate cognitive demand"
        elif value < 50:
            return "High cognitive complexity, nested logic"
        else:
            return "Very high cognitive demand, multi-level abstraction"
    
    def generate_report(self, output_path: str = "codex_complexity_report.json"):
        """Generate a comprehensive complexity report."""
        results = self.analyze_codex()
        
        # Add comparative benchmarks
        results["comparative_benchmarks"] = {
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
        
        # Convert sets to lists for JSON serialization
        def convert_sets(obj):
            if isinstance(obj, set):
                return list(obj)
            elif isinstance(obj, dict):
                return {k: convert_sets(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [convert_sets(item) for item in obj]
            return obj
        
        results = convert_sets(results)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        print(f"Complexity analysis report generated: {output_path}")
        return results


def main():
    """Main entry point for codex complexity analysis."""
    analyzer = CodexComplexityAnalyzer()
    results = analyzer.generate_report()
    
    print("\n" + "="*80)
    print("BLEU CODEX & ARIEL FORTRESS - COMPLEXITY ANALYSIS")
    print("="*80 + "\n")
    
    print("Cyclomatic Complexity:")
    cc = results['cyclomatic_complexity']
    print(f"  Total: {cc['total']}")
    print(f"  Average per scroll: {cc['average_per_scroll']}")
    print(f"  Assessment: {cc['interpretation']}\n")
    
    print("Halstead Metrics:")
    hm = results['halstead_metrics']
    print(f"  Volume: {hm['volume']}")
    print(f"  Vocabulary Size: {hm['vocabulary_size']}")
    print(f"  Assessment: {hm['interpretation']}\n")
    
    print("Maintainability Index:")
    mi = results['maintainability_index']
    print(f"  Score: {mi['score']}/100")
    print(f"  Assessment: {mi['interpretation']}\n")
    
    print("Cognitive Complexity:")
    cog = results['cognitive_complexity']
    print(f"  Score: {cog['score']}")
    print(f"  Max Nesting Depth: {cog['max_nesting_depth']}")
    print(f"  Assessment: {cog['interpretation']}\n")
    
    print("Ceremonial Metrics:")
    cm = results['ceremonial_metrics']
    print(f"  Total Scrolls Analyzed: {cm['total_scrolls']}")
    print(f"  Strategic Branches: {cm['strategic_branches']}")
    print(f"  Symbolic Vocabulary: {cm['symbolic_vocabulary']}")
    print(f"  Total Content Length: {cm['total_content_length']:,} chars\n")
    
    print("="*80)
    print("Analysis complete. See codex_complexity_report.json for full details.")
    print("="*80)


if __name__ == "__main__":
    main()
