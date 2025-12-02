#!/usr/bin/env node

/**
 * BLEU Backbone Report Utilities
 * 
 * Utility script for working with the BLEU Backbone Full Report data.
 * Provides functions for querying, analyzing, and exporting report data.
 */

const fs = require('fs');
const path = require('path');

// Load the BLEU Backbone report data
const reportPath = path.join(__dirname, '../data/bleu_backbone_full_report.json');
const reportData = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

class BleuBackboneAnalyzer {
  constructor(data) {
    this.report = data.bleu_backbone_full_report;
  }

  /**
   * Get all products sorted by ROI
   */
  getProductsByROI(descending = true) {
    const products = [];
    this.report.sectors_registry.forEach(sector => {
      sector.products.forEach(product => {
        products.push({
          ...product,
          sector_name: sector.sector_name,
          sector_icon: sector.sector_icon
        });
      });
    });
    
    products.sort((a, b) => descending ? b.roi_percent - a.roi_percent : a.roi_percent - b.roi_percent);
    return products;
  }

  /**
   * Get all products sorted by overscale value
   */
  getProductsByOverscale(descending = true) {
    const products = [];
    this.report.sectors_registry.forEach(sector => {
      sector.products.forEach(product => {
        products.push({
          ...product,
          sector_name: sector.sector_name,
          sector_icon: sector.sector_icon
        });
      });
    });
    
    products.sort((a, b) => descending ? b.overscale_billions - a.overscale_billions : a.overscale_billions - b.overscale_billions);
    return products;
  }

  /**
   * Get products by sector
   */
  getProductsBySector(sectorId) {
    const sector = this.report.sectors_registry.find(s => s.sector_id === sectorId);
    return sector ? sector.products : [];
  }

  /**
   * Get products by domain (CIVILIAN, MILITARY, COSMIC)
   */
  getProductsByDomain(domain) {
    const products = [];
    this.report.sectors_registry
      .filter(sector => sector.domain === domain)
      .forEach(sector => {
        sector.products.forEach(product => {
          products.push({
            ...product,
            sector_name: sector.sector_name,
            sector_icon: sector.sector_icon
          });
        });
      });
    return products;
  }

  /**
   * Get sector summary statistics
   */
  getSectorSummary() {
    return this.report.sectors_registry.map(sector => ({
      sector_id: sector.sector_id,
      sector_name: sector.sector_name,
      sector_icon: sector.sector_icon,
      domain: sector.domain,
      total_products: sector.total_products,
      total_overscale_billions: sector.total_overscale_billions,
      avg_roi: sector.products.reduce((sum, p) => sum + p.roi_percent, 0) / sector.products.length
    }));
  }

  /**
   * Search products by name or use case
   */
  searchProducts(query) {
    const products = [];
    const lowerQuery = query.toLowerCase();
    
    this.report.sectors_registry.forEach(sector => {
      sector.products.forEach(product => {
        if (
          product.name.toLowerCase().includes(lowerQuery) ||
          product.use_case.toLowerCase().includes(lowerQuery) ||
          product.signal.toLowerCase().includes(lowerQuery)
        ) {
          products.push({
            ...product,
            sector_name: sector.sector_name,
            sector_icon: sector.sector_icon
          });
        }
      });
    });
    
    return products;
  }

  /**
   * Get products within ROI range
   */
  getProductsByROIRange(minROI, maxROI) {
    const products = [];
    this.report.sectors_registry.forEach(sector => {
      sector.products.forEach(product => {
        if (product.roi_percent >= minROI && product.roi_percent <= maxROI) {
          products.push({
            ...product,
            sector_name: sector.sector_name,
            sector_icon: sector.sector_icon
          });
        }
      });
    });
    return products;
  }

  /**
   * Generate markdown report
   */
  generateMarkdownReport() {
    let md = `# BLEU Backbone Full Report\n\n`;
    md += `**Version**: ${this.report.version}\n`;
    md += `**Report Date**: ${this.report.report_date}\n\n`;
    md += `## Summary\n\n`;
    md += `- **Total Products**: ${this.report.total_products}\n`;
    md += `- **Total Sectors**: ${this.report.sectors}\n`;
    md += `- **Total Overscale**: $${this.report.total_overscale_billions}B\n`;
    md += `- **Average ROI**: ${this.report.economic_summary.total_roi_weighted_average}%\n\n`;
    
    this.report.sectors_registry.forEach(sector => {
      md += `## ${sector.sector_icon} ${sector.sector_name}\n\n`;
      md += `**Domain**: ${sector.domain} | **Total Overscale**: $${sector.total_overscale_billions}B\n\n`;
      md += `| Product | ROI | Overscale |\n`;
      md += `|---------|-----|------------|\n`;
      sector.products.forEach(product => {
        md += `| ${product.name} | ${product.roi_percent}% | $${product.overscale_billions}B |\n`;
      });
      md += `\n`;
    });
    
    return md;
  }

  /**
   * Export to CSV
   */
  exportToCSV() {
    let csv = 'Sector,Product ID,Product Name,Signal,Use Case,ROI %,Overscale $B,Yield $/sec,Domain,Element\n';
    
    this.report.sectors_registry.forEach(sector => {
      sector.products.forEach(product => {
        csv += `"${sector.sector_name}","${product.product_id}","${product.name}","${product.signal}","${product.use_case}",${product.roi_percent},${product.overscale_billions},${product.yield_usd_per_second},"${sector.domain}","${product.ceremonial_attributes.element}"\n`;
      });
    });
    
    return csv;
  }

  /**
   * Get top N products by combined score (ROI * Overscale)
   */
  getTopProductsByCombinedScore(n = 10) {
    const products = [];
    this.report.sectors_registry.forEach(sector => {
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
    return products.slice(0, n);
  }
}

// CLI interface
if (require.main === module) {
  const analyzer = new BleuBackboneAnalyzer(reportData);
  const command = process.argv[2];
  
  switch (command) {
    case 'top-roi':
      const topN = parseInt(process.argv[3]) || 10;
      console.log(`\n🏆 Top ${topN} Products by ROI:\n`);
      analyzer.getProductsByROI().slice(0, topN).forEach((p, i) => {
        console.log(`${i + 1}. ${p.name} - ${p.roi_percent}% (${p.sector_name})`);
      });
      break;
      
    case 'top-overscale':
      const topM = parseInt(process.argv[3]) || 10;
      console.log(`\n💰 Top ${topM} Products by Overscale:\n`);
      analyzer.getProductsByOverscale().slice(0, topM).forEach((p, i) => {
        console.log(`${i + 1}. ${p.name} - $${p.overscale_billions}B (${p.sector_name})`);
      });
      break;
      
    case 'sector':
      const sectorId = process.argv[3];
      if (!sectorId) {
        console.log('Please provide a sector ID (e.g., HLNG-MED-BIO)');
        break;
      }
      const products = analyzer.getProductsBySector(sectorId);
      console.log(`\n📊 Products in Sector ${sectorId}:\n`);
      products.forEach(p => {
        console.log(`- ${p.name}: ${p.roi_percent}% ROI, $${p.overscale_billions}B`);
      });
      break;
      
    case 'domain':
      const domain = process.argv[3];
      if (!domain) {
        console.log('Please provide a domain (CIVILIAN, MILITARY, or COSMIC)');
        break;
      }
      const domainProducts = analyzer.getProductsByDomain(domain);
      console.log(`\n🌍 ${domain} Domain Products:\n`);
      domainProducts.forEach(p => {
        console.log(`- ${p.name} (${p.sector_name}): ${p.roi_percent}% ROI`);
      });
      break;
      
    case 'search':
      const query = process.argv[3];
      if (!query) {
        console.log('Please provide a search query');
        break;
      }
      const results = analyzer.searchProducts(query);
      console.log(`\n🔍 Search results for "${query}":\n`);
      results.forEach(p => {
        console.log(`- ${p.name} (${p.sector_name}): ${p.signal}`);
      });
      break;
      
    case 'summary':
      const summary = analyzer.getSectorSummary();
      console.log('\n📈 Sector Summary:\n');
      summary.forEach(s => {
        console.log(`${s.sector_icon} ${s.sector_name}`);
        console.log(`  Domain: ${s.domain}`);
        console.log(`  Products: ${s.total_products}`);
        console.log(`  Total Overscale: $${s.total_overscale_billions}B`);
        console.log(`  Avg ROI: ${s.avg_roi.toFixed(1)}%\n`);
      });
      break;
      
    case 'export-csv':
      const csv = analyzer.exportToCSV();
      const csvPath = path.join(__dirname, '../data/bleu_backbone_export.csv');
      fs.writeFileSync(csvPath, csv);
      console.log(`\n✓ Exported to ${csvPath}`);
      break;
      
    case 'export-md':
      const md = analyzer.generateMarkdownReport();
      const mdPath = path.join(__dirname, '../data/bleu_backbone_export.md');
      fs.writeFileSync(mdPath, md);
      console.log(`\n✓ Exported to ${mdPath}`);
      break;
      
    case 'top-combined':
      const topK = parseInt(process.argv[3]) || 10;
      console.log(`\n🌟 Top ${topK} Products by Combined Score (ROI × Overscale):\n`);
      analyzer.getTopProductsByCombinedScore(topK).forEach((p, i) => {
        console.log(`${i + 1}. ${p.name} - Score: ${(p.combined_score / 1000).toFixed(0)}K (${p.roi_percent}% × $${p.overscale_billions}B)`);
      });
      break;
      
    default:
      console.log(`
BLEU Backbone Report Utilities
==============================

Usage: node bleu_backbone_utils.js <command> [options]

Commands:
  top-roi [n]           Show top N products by ROI (default: 10)
  top-overscale [n]     Show top N products by overscale (default: 10)
  top-combined [n]      Show top N products by combined score (default: 10)
  sector <sector_id>    Show all products in a sector
  domain <domain>       Show all products in a domain (CIVILIAN/MILITARY/COSMIC)
  search <query>        Search products by name, use case, or signal
  summary               Show sector summary statistics
  export-csv            Export all data to CSV
  export-md             Export report to Markdown

Examples:
  node scripts/bleu_backbone_utils.js top-roi 5
  node scripts/bleu_backbone_utils.js sector HLNG-MED-BIO
  node scripts/bleu_backbone_utils.js domain CIVILIAN
  node scripts/bleu_backbone_utils.js search energy
  node scripts/bleu_backbone_utils.js summary
`);
  }
}

module.exports = BleuBackboneAnalyzer;
