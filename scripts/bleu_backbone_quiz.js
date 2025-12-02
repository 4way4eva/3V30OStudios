#!/usr/bin/env node

/**
 * BLEU Backbone Quiz Generator
 * 
 * Interactive quiz for testing knowledge of BLEU Backbone products and sectors.
 * Multiple choice, true/false, and fill-in-the-blank questions.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Load the BLEU Backbone report data
const reportPath = path.join(__dirname, '../data/bleu_backbone_full_report.json');
const reportData = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const report = reportData.bleu_backbone_full_report;

class QuizGenerator {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * Generate multiple choice questions
   */
  generateMultipleChoiceQuestions() {
    const questions = [];
    const products = [];
    
    // Collect all products
    report.sectors_registry.forEach(sector => {
      sector.products.forEach(product => {
        products.push({
          ...product,
          sector_name: sector.sector_name,
          sector_icon: sector.sector_icon,
          domain: sector.domain
        });
      });
    });

    // Q: Which product has the highest ROI?
    const sortedByROI = [...products].sort((a, b) => b.roi_percent - a.roi_percent);
    const highestROI = sortedByROI[0];
    const wrongROI = this.getRandomElements(sortedByROI.slice(1), 3);
    questions.push({
      question: 'Which product has the highest ROI?',
      options: this.shuffle([highestROI.name, ...wrongROI.map(p => p.name)]),
      answer: highestROI.name,
      explanation: `${highestROI.name} has the highest ROI at ${highestROI.roi_percent}% in the ${highestROI.sector_name} sector.`,
      type: 'multiple_choice'
    });

    // Q: Which product has the largest overscale?
    const sortedByOverscale = [...products].sort((a, b) => b.overscale_billions - a.overscale_billions);
    const largestOverscale = sortedByOverscale[0];
    const wrongOverscale = this.getRandomElements(sortedByOverscale.slice(1), 3);
    questions.push({
      question: 'Which product has the largest overscale value?',
      options: this.shuffle([largestOverscale.name, ...wrongOverscale.map(p => p.name)]),
      answer: largestOverscale.name,
      explanation: `${largestOverscale.name} has the largest overscale at $${largestOverscale.overscale_billions}B.`,
      type: 'multiple_choice'
    });

    // Q: Domain questions
    questions.push({
      question: 'Which domain has the most products?',
      options: ['CIVILIAN', 'MILITARY', 'COSMIC', 'TRANSDIMENSIONAL'],
      answer: 'CIVILIAN',
      explanation: 'CIVILIAN domain has 17 products across 5 sectors (50.4% of total overscale).',
      type: 'multiple_choice'
    });

    // Q: Sector questions
    report.sectors_registry.forEach(sector => {
      const randomProduct = sector.products[Math.floor(Math.random() * sector.products.length)];
      const wrongSectors = this.getRandomElements(
        report.sectors_registry.filter(s => s.sector_id !== sector.sector_id),
        3
      );
      
      questions.push({
        question: `Which sector does "${randomProduct.signal}" belong to?`,
        options: this.shuffle([sector.sector_name, ...wrongSectors.map(s => s.sector_name)]),
        answer: sector.sector_name,
        explanation: `"${randomProduct.signal}" is the signal for ${randomProduct.name} in the ${sector.sector_name} sector.`,
        type: 'multiple_choice'
      });
    });

    // Q: ROI range questions
    const highROI = products.filter(p => p.roi_percent >= 220);
    if (highROI.length > 0) {
      const product = highROI[Math.floor(Math.random() * highROI.length)];
      questions.push({
        question: `What is the approximate ROI for ${product.name}?`,
        options: this.shuffle([
          `${product.roi_percent}%`,
          `${product.roi_percent - 50}%`,
          `${product.roi_percent + 30}%`,
          `${product.roi_percent - 100}%`
        ]),
        answer: `${product.roi_percent}%`,
        explanation: `${product.name} has an ROI of ${product.roi_percent}% with an overscale of $${product.overscale_billions}B.`,
        type: 'multiple_choice'
      });
    }

    // Q: Use case questions
    products.slice(0, 10).forEach(product => {
      const wrongProducts = this.getRandomElements(
        products.filter(p => p.product_id !== product.product_id),
        3
      );
      
      questions.push({
        question: `What is the primary use case for ${product.name}?`,
        options: this.shuffle([product.use_case, ...wrongProducts.map(p => p.use_case)]),
        answer: product.use_case,
        explanation: `${product.name} is designed for ${product.use_case} with "${product.signal}".`,
        type: 'multiple_choice'
      });
    });

    return questions;
  }

  /**
   * Generate true/false questions
   */
  generateTrueFalseQuestions() {
    const questions = [];

    // Q: Total products
    questions.push({
      question: 'The BLEU Backbone contains exactly 28 products across 8 sectors.',
      answer: 'true',
      explanation: 'Correct! There are 28 products across 8 sovereign sectors.',
      type: 'true_false'
    });

    // Q: Total overscale
    questions.push({
      question: 'The total overscale across all products is more than $20 trillion.',
      answer: 'false',
      explanation: 'False. The total overscale is $19.07 trillion.',
      type: 'true_false'
    });

    // Q: Highest ROI sector
    questions.push({
      question: 'The Culture, Sports & Influence sector has the highest average ROI.',
      answer: 'true',
      explanation: 'True! Culture, Sports & Influence has an average ROI of 246%, the highest of all sectors.',
      type: 'true_false'
    });

    // Q: Military domain
    questions.push({
      question: 'The MILITARY domain has more products than the COSMIC domain.',
      answer: 'false',
      explanation: 'False. MILITARY has 3 products while COSMIC has 9 products.',
      type: 'true_false'
    });

    // Q: Energy sector
    questions.push({
      question: 'The Energy, Agriculture & Planet Systems sector has the largest total overscale.',
      answer: 'true',
      explanation: 'True! This sector has $4.65T in total overscale, the largest of all sectors.',
      type: 'true_false'
    });

    // Q: Average ROI
    questions.push({
      question: 'The average ROI across all products is less than 150%.',
      answer: 'false',
      explanation: 'False. The weighted average ROI across all products is 197.5%.',
      type: 'true_false'
    });

    return questions;
  }

  /**
   * Generate fill-in-the-blank questions
   */
  generateFillInBlankQuestions() {
    const questions = [];

    questions.push({
      question: 'The ceremonial signal for Ziphonate Cores is "_______ beyond limits."',
      answer: 'power',
      alternatives: ['Power'],
      explanation: 'The signal is "Power beyond limits." - emphasizing unlimited energy yield.',
      type: 'fill_blank'
    });

    questions.push({
      question: 'The total overscale for all BLEU Backbone products is $_______ trillion.',
      answer: '19.07',
      alternatives: ['19', '19.1'],
      explanation: 'The combined overscale is $19.07 trillion.',
      type: 'fill_blank'
    });

    questions.push({
      question: 'BLEU SportsVerse Arenas has the highest ROI at _______.',
      answer: '248%',
      alternatives: ['248', '248 percent'],
      explanation: 'BLEU SportsVerse Arenas has the highest ROI at 248%.',
      type: 'fill_blank'
    });

    questions.push({
      question: 'The ceremonial element for Soul Recode Pods is "_______."',
      answer: 'soul light',
      alternatives: ['Soul Light'],
      explanation: 'Soul Recode Pods use Soul Light as their ceremonial element for DNA realignment.',
      type: 'fill_blank'
    });

    return questions;
  }

  /**
   * Run interactive quiz
   */
  async runQuiz(questions, quizName) {
    const shuffled = this.shuffle(questions);
    let correct = 0;
    let total = shuffled.length;

    console.log(`\n${'='.repeat(70)}`);
    console.log(`📝 BLEU BACKBONE QUIZ - ${quizName.toUpperCase()}`);
    console.log(`${'='.repeat(70)}\n`);
    console.log(`Total questions: ${total}`);
    console.log(`Answer carefully - explanations provided after each question!\n`);

    for (let i = 0; i < shuffled.length; i++) {
      const q = shuffled[i];
      console.log(`\n${'-'.repeat(70)}`);
      console.log(`Question ${i + 1} of ${total}`);
      console.log(`${'-'.repeat(70)}\n`);
      console.log(`${q.question}\n`);

      let userAnswer;

      if (q.type === 'multiple_choice') {
        q.options.forEach((opt, idx) => {
          console.log(`  ${String.fromCharCode(65 + idx)}. ${opt}`);
        });
        console.log();
        userAnswer = await this.askQuestion('Your answer (A/B/C/D): ');
        const answerIndex = userAnswer.toUpperCase().charCodeAt(0) - 65;
        userAnswer = q.options[answerIndex] || '';
      } else if (q.type === 'true_false') {
        userAnswer = await this.askQuestion('Your answer (true/false): ');
        userAnswer = userAnswer.toLowerCase();
      } else if (q.type === 'fill_blank') {
        userAnswer = await this.askQuestion('Your answer: ');
      }

      const isCorrect = this.checkAnswer(userAnswer, q.answer, q.alternatives);

      if (isCorrect) {
        console.log('\n✓ Correct!');
        correct++;
      } else {
        console.log(`\n✗ Incorrect. The answer is: ${q.answer}`);
      }
      
      console.log(`\nExplanation: ${q.explanation}`);
      
      await this.waitForEnter('\nPress ENTER to continue...');
    }

    const percentage = ((correct / total) * 100).toFixed(1);
    console.log(`\n${'='.repeat(70)}`);
    console.log(`QUIZ COMPLETE`);
    console.log(`${'='.repeat(70)}`);
    console.log(`Score: ${correct}/${total} (${percentage}%)`);
    
    if (percentage >= 90) {
      console.log(`Grade: A - Excellent mastery! 🌟`);
    } else if (percentage >= 80) {
      console.log(`Grade: B - Great job! 🎯`);
    } else if (percentage >= 70) {
      console.log(`Grade: C - Good effort! 📚`);
    } else if (percentage >= 60) {
      console.log(`Grade: D - Keep studying! 💪`);
    } else {
      console.log(`Grade: F - Review the material! 📖`);
    }
    
    console.log(`${'='.repeat(70)}\n`);

    this.rl.close();
  }

  /**
   * Check if answer is correct
   */
  checkAnswer(userAnswer, correctAnswer, alternatives = []) {
    const normalized = userAnswer.toLowerCase().trim();
    const correct = correctAnswer.toLowerCase().trim();
    
    if (normalized === correct) return true;
    
    return alternatives.some(alt => 
      alt.toLowerCase().trim() === normalized
    );
  }

  /**
   * Get random elements from array
   */
  getRandomElements(array, count) {
    const shuffled = this.shuffle([...array]);
    return shuffled.slice(0, count);
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
║           📝 BLEU BACKBONE QUIZ GENERATOR 📝              ║
╚════════════════════════════════════════════════════════════╝

Choose a quiz type:

  1. Multiple Choice (15 questions)
  2. True/False (6 questions)
  3. Fill in the Blank (4 questions)
  4. Comprehensive Quiz (All types)
  5. Quick Quiz (10 random questions)

Enter your choice (1-5): `);
  }
}

// CLI interface
if (require.main === module) {
  const generator = new QuizGenerator();
  const mode = process.argv[2];

  if (!mode) {
    generator.displayMenu();
    generator.rl.question('', async (choice) => {
      let questions;
      switch (choice) {
        case '1':
          questions = generator.generateMultipleChoiceQuestions();
          await generator.runQuiz(questions, 'Multiple Choice');
          break;
        case '2':
          questions = generator.generateTrueFalseQuestions();
          await generator.runQuiz(questions, 'True/False');
          break;
        case '3':
          questions = generator.generateFillInBlankQuestions();
          await generator.runQuiz(questions, 'Fill in the Blank');
          break;
        case '4':
          questions = [
            ...generator.generateMultipleChoiceQuestions(),
            ...generator.generateTrueFalseQuestions(),
            ...generator.generateFillInBlankQuestions()
          ];
          await generator.runQuiz(questions, 'Comprehensive');
          break;
        case '5':
          const allQuestions = [
            ...generator.generateMultipleChoiceQuestions(),
            ...generator.generateTrueFalseQuestions(),
            ...generator.generateFillInBlankQuestions()
          ];
          questions = generator.getRandomElements(allQuestions, 10);
          await generator.runQuiz(questions, 'Quick Quiz');
          break;
        default:
          console.log('Invalid choice');
          generator.rl.close();
      }
    });
  } else {
    // Direct mode from command line
    let questions;
    switch (mode) {
      case 'multiple-choice':
      case 'mc':
        questions = generator.generateMultipleChoiceQuestions();
        generator.runQuiz(questions, 'Multiple Choice');
        break;
      case 'true-false':
      case 'tf':
        questions = generator.generateTrueFalseQuestions();
        generator.runQuiz(questions, 'True/False');
        break;
      case 'fill-blank':
      case 'fb':
        questions = generator.generateFillInBlankQuestions();
        generator.runQuiz(questions, 'Fill in the Blank');
        break;
      case 'comprehensive':
      case 'full':
        questions = [
          ...generator.generateMultipleChoiceQuestions(),
          ...generator.generateTrueFalseQuestions(),
          ...generator.generateFillInBlankQuestions()
        ];
        generator.runQuiz(questions, 'Comprehensive');
        break;
      case 'quick':
        const allQuestions = [
          ...generator.generateMultipleChoiceQuestions(),
          ...generator.generateTrueFalseQuestions(),
          ...generator.generateFillInBlankQuestions()
        ];
        questions = generator.getRandomElements(allQuestions, 10);
        generator.runQuiz(questions, 'Quick Quiz');
        break;
      default:
        console.log('Usage: node bleu_backbone_quiz.js [mode]');
        console.log('Modes: multiple-choice (mc), true-false (tf), fill-blank (fb), comprehensive (full), quick');
        generator.rl.close();
    }
  }
}

module.exports = QuizGenerator;
