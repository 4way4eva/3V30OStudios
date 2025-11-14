#!/usr/bin/env node

/**
 * BLEU Backbone Flashcard Generator
 * 
 * Generate interactive flashcards for studying the BLEU Backbone products.
 * Supports multiple modes: products, sectors, ROI quiz, elements, protocols
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Load the BLEU Backbone report data
const reportPath = path.join(__dirname, '../data/bleu_backbone_full_report.json');
const reportData = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const report = reportData.bleu_backbone_full_report;

class FlashcardGenerator {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * Generate product flashcards
   */
  generateProductFlashcards() {
    const cards = [];
    report.sectors_registry.forEach(sector => {
      sector.products.forEach(product => {
        cards.push({
          front: `${sector.sector_icon} ${product.name}`,
          back: `Signal: "${product.signal}"\nUse Case: ${product.use_case}\nROI: ${product.roi_percent}%\nOverscale: $${product.overscale_billions}B\nSector: ${sector.sector_name}`,
          category: 'products'
        });
      });
    });
    return cards;
  }

  /**
   * Generate signal flashcards
   */
  generateSignalFlashcards() {
    const cards = [];
    report.sectors_registry.forEach(sector => {
      sector.products.forEach(product => {
        cards.push({
          front: `"${product.signal}"`,
          back: `Product: ${product.name}\nSector: ${sector.sector_name}\nUse Case: ${product.use_case}`,
          category: 'signals'
        });
      });
    });
    return cards;
  }

  /**
   * Generate ROI flashcards
   */
  generateROIFlashcards() {
    const cards = [];
    report.sectors_registry.forEach(sector => {
      sector.products.forEach(product => {
        cards.push({
          front: `What is the ROI for ${product.name}?`,
          back: `${product.roi_percent}%\nOverscale: $${product.overscale_billions}B\nSector: ${sector.sector_name}`,
          category: 'roi'
        });
      });
    });
    return cards;
  }

  /**
   * Generate ceremonial element flashcards
   */
  generateElementFlashcards() {
    const cards = [];
    report.sectors_registry.forEach(sector => {
      sector.products.forEach(product => {
        cards.push({
          front: `What is the ceremonial element for ${product.name}?`,
          back: `Element: ${product.ceremonial_attributes.element}\nActivation: ${product.ceremonial_attributes.activation}\nGovernance: ${product.ceremonial_attributes.governance_tier}`,
          category: 'elements'
        });
      });
    });
    return cards;
  }

  /**
   * Generate sector summary flashcards
   */
  generateSectorFlashcards() {
    const cards = [];
    report.sectors_registry.forEach(sector => {
      cards.push({
        front: `${sector.sector_icon} ${sector.sector_name}`,
        back: `Domain: ${sector.domain}\nFocus: ${sector.focus}\nProducts: ${sector.total_products}\nTotal Overscale: $${sector.total_overscale_billions}B\nAvg ROI: ${(sector.products.reduce((sum, p) => sum + p.roi_percent, 0) / sector.products.length).toFixed(1)}%`,
        category: 'sectors'
      });
    });
    return cards;
  }

  /**
   * Shuffle array
   */
  shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Run interactive flashcard session
   */
  async runFlashcardSession(cards, mode) {
    const shuffled = this.shuffle(cards);
    let correct = 0;
    let total = 0;
    let remaining = shuffled.length;

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎴 BLEU BACKBONE FLASHCARD SESSION - ${mode.toUpperCase()}`);
    console.log(`${'='.repeat(60)}\n`);
    console.log(`Total cards: ${shuffled.length}`);
    console.log(`Press ENTER to reveal answer, then type 'y' for correct or 'n' for incorrect\n`);

    for (let i = 0; i < shuffled.length; i++) {
      const card = shuffled[i];
      console.log(`\n${'-'.repeat(60)}`);
      console.log(`Card ${i + 1} of ${shuffled.length} | Remaining: ${remaining}`);
      console.log(`${'-'.repeat(60)}\n`);
      console.log(`FRONT:\n${card.front}\n`);
      
      await this.waitForEnter('Press ENTER to reveal answer...');
      
      console.log(`\nBACK:\n${card.back}\n`);
      
      const response = await this.askQuestion('Did you get it right? (y/n/skip): ');
      
      if (response.toLowerCase() === 'y') {
        correct++;
        total++;
        remaining--;
        console.log('✓ Correct!');
      } else if (response.toLowerCase() === 'n') {
        total++;
        remaining--;
        console.log('✗ Incorrect - Review this one');
      } else if (response.toLowerCase() === 'skip' || response.toLowerCase() === 's') {
        console.log('⊘ Skipped');
      } else if (response.toLowerCase() === 'quit' || response.toLowerCase() === 'q') {
        break;
      }
    }

    if (total > 0) {
      const percentage = ((correct / total) * 100).toFixed(1);
      console.log(`\n${'='.repeat(60)}`);
      console.log(`SESSION COMPLETE`);
      console.log(`${'='.repeat(60)}`);
      console.log(`Score: ${correct}/${total} (${percentage}%)`);
      console.log(`${'='.repeat(60)}\n`);
    }

    this.rl.close();
  }

  /**
   * Export flashcards to Anki format (CSV)
   */
  exportToAnki(cards, filename) {
    let csv = 'Front,Back,Tags\n';
    cards.forEach(card => {
      const front = card.front.replace(/"/g, '""');
      const back = card.back.replace(/"/g, '""').replace(/\n/g, '<br>');
      csv += `"${front}","${back}","bleu-backbone,${card.category}"\n`;
    });
    
    const filepath = path.join(__dirname, `../data/${filename}`);
    fs.writeFileSync(filepath, csv);
    console.log(`\n✓ Exported ${cards.length} flashcards to ${filepath}`);
    console.log(`Import this file into Anki to study on the go!\n`);
  }

  /**
   * Export flashcards to JSON format
   */
  exportToJSON(cards, filename) {
    const filepath = path.join(__dirname, `../data/${filename}`);
    fs.writeFileSync(filepath, JSON.stringify({ flashcards: cards }, null, 2));
    console.log(`\n✓ Exported ${cards.length} flashcards to ${filepath}\n`);
  }

  /**
   * Wait for Enter key
   */
  waitForEnter(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, () => {
        resolve();
      });
    });
  }

  /**
   * Ask a question
   */
  askQuestion(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, (answer) => {
        resolve(answer);
      });
    });
  }

  /**
   * Display menu
   */
  displayMenu() {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║         🎴 BLEU BACKBONE FLASHCARD GENERATOR 🎴           ║
╚════════════════════════════════════════════════════════════╝

Choose a flashcard mode:

  1. Products - All 28 products with details
  2. Signals - Match signals to products
  3. ROI - Test your knowledge of ROI percentages
  4. Elements - Ceremonial elements and activations
  5. Sectors - Sector summaries and statistics
  
Export options:
  
  6. Export All to Anki (CSV)
  7. Export All to JSON
  8. Generate Custom Set

Enter your choice (1-8): `);
  }
}

// CLI interface
if (require.main === module) {
  const generator = new FlashcardGenerator();
  const mode = process.argv[2];

  if (!mode) {
    generator.displayMenu();
    generator.rl.question('', async (choice) => {
      let cards;
      switch (choice) {
        case '1':
          cards = generator.generateProductFlashcards();
          await generator.runFlashcardSession(cards, 'products');
          break;
        case '2':
          cards = generator.generateSignalFlashcards();
          await generator.runFlashcardSession(cards, 'signals');
          break;
        case '3':
          cards = generator.generateROIFlashcards();
          await generator.runFlashcardSession(cards, 'roi');
          break;
        case '4':
          cards = generator.generateElementFlashcards();
          await generator.runFlashcardSession(cards, 'elements');
          break;
        case '5':
          cards = generator.generateSectorFlashcards();
          await generator.runFlashcardSession(cards, 'sectors');
          break;
        case '6':
          const allCards = [
            ...generator.generateProductFlashcards(),
            ...generator.generateSignalFlashcards(),
            ...generator.generateROIFlashcards(),
            ...generator.generateElementFlashcards(),
            ...generator.generateSectorFlashcards()
          ];
          generator.exportToAnki(allCards, 'bleu_backbone_flashcards.csv');
          generator.rl.close();
          break;
        case '7':
          const allCardsJSON = [
            ...generator.generateProductFlashcards(),
            ...generator.generateSignalFlashcards(),
            ...generator.generateROIFlashcards(),
            ...generator.generateElementFlashcards(),
            ...generator.generateSectorFlashcards()
          ];
          generator.exportToJSON(allCardsJSON, 'bleu_backbone_flashcards.json');
          generator.rl.close();
          break;
        default:
          console.log('Invalid choice');
          generator.rl.close();
      }
    });
  } else {
    // Direct mode from command line
    let cards;
    switch (mode) {
      case 'products':
        cards = generator.generateProductFlashcards();
        generator.runFlashcardSession(cards, 'products');
        break;
      case 'signals':
        cards = generator.generateSignalFlashcards();
        generator.runFlashcardSession(cards, 'signals');
        break;
      case 'roi':
        cards = generator.generateROIFlashcards();
        generator.runFlashcardSession(cards, 'roi');
        break;
      case 'elements':
        cards = generator.generateElementFlashcards();
        generator.runFlashcardSession(cards, 'elements');
        break;
      case 'sectors':
        cards = generator.generateSectorFlashcards();
        generator.runFlashcardSession(cards, 'sectors');
        break;
      case 'export-anki':
        const allCards = [
          ...generator.generateProductFlashcards(),
          ...generator.generateSignalFlashcards(),
          ...generator.generateROIFlashcards(),
          ...generator.generateElementFlashcards(),
          ...generator.generateSectorFlashcards()
        ];
        generator.exportToAnki(allCards, 'bleu_backbone_flashcards.csv');
        generator.rl.close();
        break;
      case 'export-json':
        const allCardsJSON = [
          ...generator.generateProductFlashcards(),
          ...generator.generateSignalFlashcards(),
          ...generator.generateROIFlashcards(),
          ...generator.generateElementFlashcards(),
          ...generator.generateSectorFlashcards()
        ];
        generator.exportToJSON(allCardsJSON, 'bleu_backbone_flashcards.json');
        generator.rl.close();
        break;
      default:
        console.log('Usage: node bleu_backbone_flashcards.js [mode]');
        console.log('Modes: products, signals, roi, elements, sectors, export-anki, export-json');
        generator.rl.close();
    }
  }
}

module.exports = FlashcardGenerator;
