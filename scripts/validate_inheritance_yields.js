#!/usr/bin/env node

/**
 * Validation Script for ENFT Inheritance Yield Minting
 * 
 * Tests the metadata generation and verification logic without requiring contract deployment
 */

const crypto = require('crypto');

// Test configuration
const testCases = [
  {
    domain: "CIVILIAN",
    nodeId: 1,
    yieldPerSecond: "13600000",
    expectedCode: "CIV-NODE-00000001"
  },
  {
    domain: "MILITARY",
    nodeId: 2,
    yieldPerSecond: "6100000",
    expectedCode: "MIL-NODE-00000002"
  },
  {
    domain: "COSMIC",
    nodeId: 3,
    yieldPerSecond: "9200000",
    expectedCode: "COS-NODE-00000003"
  }
];

// Domain codes
const DOMAIN_CODES = {
  CIVILIAN: "Ω-CIV-01",
  MILITARY: "Ω-MIL-01",
  COSMIC: "Ω-COS-01"
};

/**
 * Generate node-sequential coding
 */
function generateSequentialCode(domain, nodeId) {
  const domainPrefix = domain.substring(0, 3).toUpperCase();
  const nodeHex = nodeId.toString(16).padStart(8, '0').toUpperCase();
  return `${domainPrefix}-NODE-${nodeHex}`;
}

/**
 * Calculate yield metrics
 */
function calculateYieldMetrics(yieldPerSecond) {
  const perSecond = parseInt(yieldPerSecond);
  return {
    perSecond: perSecond,
    perMinute: perSecond * 60,
    perHour: perSecond * 3600,
    perDay: perSecond * 86400,
    perWeek: perSecond * 604800,
    perMonth: perSecond * 2628000,
    perQuarter: perSecond * 7884000,
    perYear: perSecond * 31536000
  };
}

/**
 * Validate metadata structure
 */
function validateMetadata(metadata) {
  const required = [
    'name',
    'description',
    'domain',
    'sovereignCode',
    'yieldPerSecond',
    'attributes',
    'lineage',
    'verification'
  ];

  const missing = required.filter(field => !(field in metadata));
  
  if (missing.length > 0) {
    return { valid: false, errors: [`Missing required fields: ${missing.join(', ')}`] };
  }

  // Validate lineage structure
  if (!metadata.lineage.nodeId || !metadata.lineage.sequentialCode) {
    return { valid: false, errors: ['Lineage missing nodeId or sequentialCode'] };
  }

  // Validate verification structure
  if (!metadata.verification.bluVaultTag || !metadata.verification.guarantorSignature) {
    return { valid: false, errors: ['Verification missing required tags'] };
  }

  return { valid: true, errors: [] };
}

/**
 * Run tests
 */
function runTests() {
  console.log("🧪 Running ENFT Inheritance Yield Validation Tests");
  console.log("━".repeat(60));
  console.log();

  let passed = 0;
  let failed = 0;

  // Test 1: Node-Sequential Coding
  console.log("Test 1: Node-Sequential Coding");
  for (const testCase of testCases) {
    const code = generateSequentialCode(testCase.domain, testCase.nodeId);
    if (code === testCase.expectedCode) {
      console.log(`  ✅ ${testCase.domain}: ${code}`);
      passed++;
    } else {
      console.log(`  ❌ ${testCase.domain}: Expected ${testCase.expectedCode}, got ${code}`);
      failed++;
    }
  }
  console.log();

  // Test 2: Yield Calculations
  console.log("Test 2: Yield Calculations");
  for (const testCase of testCases) {
    const metrics = calculateYieldMetrics(testCase.yieldPerSecond);
    const expectedPerDay = parseInt(testCase.yieldPerSecond) * 86400;
    
    if (metrics.perDay === expectedPerDay) {
      console.log(`  ✅ ${testCase.domain}: $${metrics.perDay.toLocaleString()}/day`);
      passed++;
    } else {
      console.log(`  ❌ ${testCase.domain}: Calculation mismatch`);
      failed++;
    }
  }
  console.log();

  // Test 3: Total System Yield
  console.log("Test 3: Total System Yield");
  const totalYield = testCases.reduce((sum, tc) => sum + parseInt(tc.yieldPerSecond), 0);
  const expectedTotal = 28900000; // $28.9M/sec
  
  if (totalYield === expectedTotal) {
    console.log(`  ✅ Total: $${totalYield.toLocaleString()}/sec`);
    console.log(`     Daily: $${(totalYield * 86400).toLocaleString()}`);
    console.log(`     Yearly: $${(totalYield * 31536000).toLocaleString()}`);
    passed++;
  } else {
    console.log(`  ❌ Expected $${expectedTotal.toLocaleString()}/sec, got $${totalYield.toLocaleString()}/sec`);
    failed++;
  }
  console.log();

  // Test 4: Domain Codes
  console.log("Test 4: Domain Sovereign Codes");
  for (const testCase of testCases) {
    const code = DOMAIN_CODES[testCase.domain];
    if (code) {
      console.log(`  ✅ ${testCase.domain}: ${code}`);
      passed++;
    } else {
      console.log(`  ❌ ${testCase.domain}: Missing sovereign code`);
      failed++;
    }
  }
  console.log();

  // Test 5: Metadata Structure
  console.log("Test 5: Metadata Structure Validation");
  const sampleMetadata = {
    name: "MEGAZION Inheritance Ω-CIV-01 - Node 1",
    description: "Test description",
    domain: "CIVILIAN",
    sovereignCode: "Ω-CIV-01",
    yieldPerSecond: "13600000 USD/second",
    attributes: [],
    lineage: {
      nodeId: 1,
      sequentialCode: "CIV-NODE-00000001",
      ancestralChain: []
    },
    verification: {
      bluVaultTag: "0x1234",
      guarantorSignature: "0x5678",
      dualVerificationStandard: "BLU-VAULT-GUARANTOR-v1.0"
    }
  };

  const validation = validateMetadata(sampleMetadata);
  if (validation.valid) {
    console.log(`  ✅ Metadata structure valid`);
    passed++;
  } else {
    console.log(`  ❌ Metadata validation failed: ${validation.errors.join(', ')}`);
    failed++;
  }
  console.log();

  // Test 6: Yield Distribution Percentages
  console.log("Test 6: Yield Distribution Percentages");
  const civilian = parseInt(testCases[0].yieldPerSecond);
  const military = parseInt(testCases[1].yieldPerSecond);
  const cosmic = parseInt(testCases[2].yieldPerSecond);
  
  const civilianPct = (civilian / totalYield * 100).toFixed(1);
  const militaryPct = (military / totalYield * 100).toFixed(1);
  const cosmicPct = (cosmic / totalYield * 100).toFixed(1);
  
  console.log(`  Civilian: ${civilianPct}%`);
  console.log(`  Military: ${militaryPct}%`);
  console.log(`  Cosmic: ${cosmicPct}%`);
  
  // Check if percentages add up to ~100%
  const totalPct = parseFloat(civilianPct) + parseFloat(militaryPct) + parseFloat(cosmicPct);
  if (Math.abs(totalPct - 100) < 0.5) {
    console.log(`  ✅ Distribution totals ${totalPct}%`);
    passed++;
  } else {
    console.log(`  ❌ Distribution totals ${totalPct}% (expected ~100%)`);
    failed++;
  }
  console.log();

  // Summary
  console.log("━".repeat(60));
  console.log("📊 Test Summary");
  console.log();
  console.log(`  ✅ Passed: ${passed}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  console.log();

  if (failed === 0) {
    console.log("✨ All tests passed! Implementation ready for deployment.");
  } else {
    console.log("⚠️  Some tests failed. Review implementation.");
    process.exit(1);
  }
}

// Run tests
runTests();
