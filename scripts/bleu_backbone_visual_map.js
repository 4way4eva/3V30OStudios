#!/usr/bin/env node

/**
 * BLEU Backbone Visual Map Generator
 * 
 * Generate visual representations of BLEU Backbone structure:
 * - ASCII tree diagrams
 * - Mermaid flowcharts
 * - Domain/sector relationships
 * - Investment priority maps
 */

const fs = require('fs');
const path = require('path');

// Load the BLEU Backbone report data
const reportPath = path.join(__dirname, '../data/bleu_backbone_full_report.json');
const reportData = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const report = reportData.bleu_backbone_full_report;

class VisualMapGenerator {
  /**
   * Generate ASCII tree structure
   */
  generateASCIITree() {
    let tree = '\n';
    tree += '╔═══════════════════════════════════════════════════════════════════════════╗\n';
    tree += '║                    BLEU BACKBONE STRUCTURE MAP                            ║\n';
    tree += '╚═══════════════════════════════════════════════════════════════════════════╝\n\n';
    tree += '                           BLEU BACKBONE v1.0.0\n';
    tree += '                    ($19.07T Total | 197.5% Avg ROI)\n';
    tree += '                                   |\n';
    tree += '           ┌───────────────────────┼───────────────────────┐\n';
    tree += '           |                       |                       |\n';
    tree += '       CIVILIAN                MILITARY                COSMIC\n';
    tree += '    (17 products)             (3 products)           (9 products)\n';
    tree += '      $9.62T                    $2.52T                 $7.35T\n';
    tree += '           |\n';

    // Organize by domain
    const domains = {
      CIVILIAN: [],
      MILITARY: [],
      COSMIC: []
    };

    report.sectors_registry.forEach(sector => {
      domains[sector.domain].push(sector);
    });

    Object.entries(domains).forEach(([domain, sectors]) => {
      tree += `\n${domain} DOMAIN:\n`;
      tree += '═'.repeat(80) + '\n\n';
      
      sectors.forEach((sector, idx) => {
        const isLast = idx === sectors.length - 1;
        const prefix = isLast ? '└──' : '├──';
        
        tree += `${prefix} ${sector.sector_icon} ${sector.sector_name}\n`;
        tree += `${isLast ? '   ' : '│  '} ├─ Products: ${sector.total_products}\n`;
        tree += `${isLast ? '   ' : '│  '} ├─ Overscale: $${sector.total_overscale_billions}B\n`;
        tree += `${isLast ? '   ' : '│  '} └─ Avg ROI: ${(sector.products.reduce((sum, p) => sum + p.roi_percent, 0) / sector.products.length).toFixed(1)}%\n`;
        
        sector.products.forEach((product, pidx) => {
          const isLastProduct = pidx === sector.products.length - 1;
          const productPrefix = isLastProduct ? '└──' : '├──';
          tree += `${isLast ? '   ' : '│  '}    ${productPrefix} ${product.name}\n`;
          tree += `${isLast ? '   ' : '│  '}    ${isLastProduct ? '   ' : '│  '} • ${product.signal}\n`;
          tree += `${isLast ? '   ' : '│  '}    ${isLastProduct ? '   ' : '│  '} • ROI: ${product.roi_percent}% | Overscale: $${product.overscale_billions}B\n`;
        });
        tree += '\n';
      });
    });

    return tree;
  }

  /**
   * Generate Mermaid flowchart
   */
  generateMermaidFlowchart() {
    let mermaid = '```mermaid\ngraph TD\n';
    mermaid += '    A[BLEU BACKBONE v1.0.0] --> B[CIVILIAN Domain]\n';
    mermaid += '    A --> C[MILITARY Domain]\n';
    mermaid += '    A --> D[COSMIC Domain]\n\n';

    report.sectors_registry.forEach((sector, idx) => {
      const sectorId = `S${idx + 1}`;
      const domainId = sector.domain === 'CIVILIAN' ? 'B' : sector.domain === 'MILITARY' ? 'C' : 'D';
      
      mermaid += `    ${domainId} --> ${sectorId}["${sector.sector_icon} ${sector.sector_name}<br/>$${sector.total_overscale_billions}B"]\n`;
      
      sector.products.forEach((product, pidx) => {
        const productId = `P${idx + 1}_${pidx + 1}`;
        mermaid += `    ${sectorId} --> ${productId}["${product.name}<br/>ROI: ${product.roi_percent}%<br/>$${product.overscale_billions}B"]\n`;
      });
      mermaid += '\n';
    });

    mermaid += '    style A fill:#ff6b6b\n';
    mermaid += '    style B fill:#4ecdc4\n';
    mermaid += '    style C fill:#ffe66d\n';
    mermaid += '    style D fill:#a8e6cf\n';
    mermaid += '```\n';

    return mermaid;
  }

  /**
   * Generate investment priority matrix
   */
  generateInvestmentMatrix() {
    let matrix = '\n';
    matrix += '╔═══════════════════════════════════════════════════════════════════════════╗\n';
    matrix += '║                    INVESTMENT PRIORITY MATRIX                             ║\n';
    matrix += '╚═══════════════════════════════════════════════════════════════════════════╝\n\n';

    // Calculate combined scores
    const products = [];
    report.sectors_registry.forEach(sector => {
      sector.products.forEach(product => {
        products.push({
          ...product,
          sector_name: sector.sector_name,
          sector_icon: sector.sector_icon,
          combined_score: product.roi_percent * product.overscale_billions
        });
      });
    });

    products.sort((a, b) => b.combined_score - a.combined_score);

    matrix += 'TIER 1: HIGHEST PRIORITY (Top Combined Score)\n';
    matrix += '─'.repeat(80) + '\n';
    products.slice(0, 7).forEach((p, i) => {
      matrix += `${i + 1}. ${p.name}\n`;
      matrix += `   ${p.sector_icon} ${p.sector_name}\n`;
      matrix += `   ROI: ${p.roi_percent}% | Overscale: $${p.overscale_billions}B | Score: ${(p.combined_score / 1000).toFixed(0)}K\n`;
      matrix += `   "${p.signal}"\n\n`;
    });

    matrix += '\nTIER 2: HIGH VALUE (Balanced Growth)\n';
    matrix += '─'.repeat(80) + '\n';
    products.slice(7, 14).forEach((p, i) => {
      matrix += `${i + 8}. ${p.name} - ${p.sector_icon} ${p.sector_name}\n`;
      matrix += `   ROI: ${p.roi_percent}% | Overscale: $${p.overscale_billions}B\n\n`;
    });

    matrix += '\nTIER 3: SPECIALIZED IMPACT\n';
    matrix += '─'.repeat(80) + '\n';
    products.slice(14, 21).forEach((p, i) => {
      matrix += `${i + 15}. ${p.name} - ${p.sector_icon} ${p.sector_name}\n`;
      matrix += `   ROI: ${p.roi_percent}% | Overscale: $${p.overscale_billions}B\n\n`;
    });

    return matrix;
  }

  /**
   * Generate ROI heat map (ASCII)
   */
  generateROIHeatMap() {
    let heatmap = '\n';
    heatmap += '╔═══════════════════════════════════════════════════════════════════════════╗\n';
    heatmap += '║                         ROI HEAT MAP                                      ║\n';
    heatmap += '╚═══════════════════════════════════════════════════════════════════════════╝\n\n';

    report.sectors_registry.forEach(sector => {
      const avgROI = sector.products.reduce((sum, p) => sum + p.roi_percent, 0) / sector.products.length;
      
      heatmap += `${sector.sector_icon} ${sector.sector_name}\n`;
      heatmap += `Avg ROI: ${avgROI.toFixed(1)}% `;
      
      // Visual bar
      const barLength = Math.floor(avgROI / 5);
      heatmap += '[' + '█'.repeat(barLength) + '░'.repeat(50 - barLength) + ']\n';
      
      // Individual products
      sector.products.forEach(product => {
        const productBarLength = Math.floor(product.roi_percent / 5);
        heatmap += `  ${product.name.padEnd(30)} ${product.roi_percent}% `;
        heatmap += '[' + '█'.repeat(productBarLength) + '░'.repeat(50 - productBarLength) + ']\n';
      });
      
      heatmap += '\n';
    });

    heatmap += '\nLEGEND:\n';
    heatmap += '250% [██████████████████████████████████████████████████]\n';
    heatmap += '200% [████████████████████████████████████████░░░░░░░░░░]\n';
    heatmap += '150% [██████████████████████████████░░░░░░░░░░░░░░░░░░░░]\n';
    heatmap += '100% [████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]\n';

    return heatmap;
  }

  /**
   * Generate domain distribution pie chart (ASCII)
   */
  generateDomainDistribution() {
    let chart = '\n';
    chart += '╔═══════════════════════════════════════════════════════════════════════════╗\n';
    chart += '║                    DOMAIN DISTRIBUTION                                    ║\n';
    chart += '╚═══════════════════════════════════════════════════════════════════════════╝\n\n';

    const domains = {
      CIVILIAN: { overscale: 0, products: 0 },
      MILITARY: { overscale: 0, products: 0 },
      COSMIC: { overscale: 0, products: 0 }
    };

    report.sectors_registry.forEach(sector => {
      domains[sector.domain].overscale += sector.total_overscale_billions;
      domains[sector.domain].products += sector.total_products;
    });

    chart += 'BY OVERSCALE VALUE:\n';
    chart += '─'.repeat(80) + '\n';
    Object.entries(domains).forEach(([domain, data]) => {
      const percentage = (data.overscale / report.total_overscale_billions * 100).toFixed(1);
      const barLength = Math.floor(percentage / 2);
      chart += `${domain.padEnd(12)} $${data.overscale}B (${percentage}%) `;
      chart += '[' + '█'.repeat(barLength) + '░'.repeat(50 - barLength) + ']\n';
    });

    chart += '\nBY PRODUCT COUNT:\n';
    chart += '─'.repeat(80) + '\n';
    Object.entries(domains).forEach(([domain, data]) => {
      const percentage = (data.products / report.total_products * 100).toFixed(1);
      const barLength = Math.floor(percentage / 2);
      chart += `${domain.padEnd(12)} ${data.products} products (${percentage}%) `;
      chart += '[' + '█'.repeat(barLength) + '░'.repeat(50 - barLength) + ']\n';
    });

    return chart;
  }

  /**
   * Generate sector comparison table
   */
  generateSectorComparison() {
    let table = '\n';
    table += '╔═══════════════════════════════════════════════════════════════════════════════════════════════════╗\n';
    table += '║                                    SECTOR COMPARISON TABLE                                        ║\n';
    table += '╚═══════════════════════════════════════════════════════════════════════════════════════════════════╝\n\n';

    table += '┌────┬───────────────────────────────────────┬──────────┬──────────┬──────────────┬──────────────┐\n';
    table += '│ #  │ Sector Name                           │ Domain   │ Products │ Overscale    │ Avg ROI      │\n';
    table += '├────┼───────────────────────────────────────┼──────────┼──────────┼──────────────┼──────────────┤\n';

    report.sectors_registry
      .sort((a, b) => b.total_overscale_billions - a.total_overscale_billions)
      .forEach((sector, idx) => {
        const avgROI = (sector.products.reduce((sum, p) => sum + p.roi_percent, 0) / sector.products.length).toFixed(1);
        table += `│ ${(idx + 1).toString().padStart(2)} │ ${(sector.sector_icon + ' ' + sector.sector_name).padEnd(37)} │ ${sector.domain.padEnd(8)} │ ${sector.total_products.toString().padStart(8)} │ $${sector.total_overscale_billions.toString().padStart(10)}B │ ${avgROI.padStart(10)}%  │\n`;
      });

    table += '└────┴───────────────────────────────────────┴──────────┴──────────┴──────────────┴──────────────┘\n';

    return table;
  }

  /**
   * Export all visualizations
   */
  exportAll() {
    const outputDir = path.join(__dirname, '../data');
    
    // ASCII Tree
    const tree = this.generateASCIITree();
    fs.writeFileSync(path.join(outputDir, 'bleu_backbone_tree.txt'), tree);
    console.log('✓ Exported ASCII tree to bleu_backbone_tree.txt');

    // Mermaid Flowchart
    const mermaid = this.generateMermaidFlowchart();
    fs.writeFileSync(path.join(outputDir, 'bleu_backbone_flowchart.md'), mermaid);
    console.log('✓ Exported Mermaid flowchart to bleu_backbone_flowchart.md');

    // Investment Matrix
    const matrix = this.generateInvestmentMatrix();
    fs.writeFileSync(path.join(outputDir, 'bleu_backbone_investment_matrix.txt'), matrix);
    console.log('✓ Exported investment matrix to bleu_backbone_investment_matrix.txt');

    // ROI Heat Map
    const heatmap = this.generateROIHeatMap();
    fs.writeFileSync(path.join(outputDir, 'bleu_backbone_roi_heatmap.txt'), heatmap);
    console.log('✓ Exported ROI heat map to bleu_backbone_roi_heatmap.txt');

    // Domain Distribution
    const distribution = this.generateDomainDistribution();
    fs.writeFileSync(path.join(outputDir, 'bleu_backbone_domain_distribution.txt'), distribution);
    console.log('✓ Exported domain distribution to bleu_backbone_domain_distribution.txt');

    // Sector Comparison
    const comparison = this.generateSectorComparison();
    fs.writeFileSync(path.join(outputDir, 'bleu_backbone_sector_comparison.txt'), comparison);
    console.log('✓ Exported sector comparison to bleu_backbone_sector_comparison.txt');

    console.log('\n✓ All visualizations exported to /data directory\n');
  }
}

// CLI interface
if (require.main === module) {
  const generator = new VisualMapGenerator();
  const command = process.argv[2];

  switch (command) {
    case 'tree':
      console.log(generator.generateASCIITree());
      break;
    case 'mermaid':
      console.log(generator.generateMermaidFlowchart());
      break;
    case 'investment':
      console.log(generator.generateInvestmentMatrix());
      break;
    case 'heatmap':
      console.log(generator.generateROIHeatMap());
      break;
    case 'distribution':
      console.log(generator.generateDomainDistribution());
      break;
    case 'comparison':
      console.log(generator.generateSectorComparison());
      break;
    case 'export':
      generator.exportAll();
      break;
    default:
      console.log(`
BLEU Backbone Visual Map Generator
==================================

Usage: node bleu_backbone_visual_map.js <command>

Commands:
  tree           Generate ASCII tree structure
  mermaid        Generate Mermaid flowchart
  investment     Generate investment priority matrix
  heatmap        Generate ROI heat map
  distribution   Generate domain distribution chart
  comparison     Generate sector comparison table
  export         Export all visualizations to files

Examples:
  node scripts/bleu_backbone_visual_map.js tree
  node scripts/bleu_backbone_visual_map.js mermaid
  node scripts/bleu_backbone_visual_map.js export
`);
  }
}

module.exports = VisualMapGenerator;
