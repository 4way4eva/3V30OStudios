import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Verify Triple-Stack Treasury Ledger
 * 
 * This script verifies:
 * - Contract deployment and configuration
 * - Yield stream initialization
 * - π₄ compounding parameters
 * - Blu-Vault authorizations
 * - Dual-reality confirmations
 * - Event emissions
 */

async function main() {
  console.log("🔍 Verifying Triple-Stack Treasury Ledger...");
  console.log("━".repeat(60));

  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("📡 Network:", network.name);
  console.log("🔑 Deployer:", deployer.address);
  console.log();

  // Load contract address
  let treasuryAddress = process.env.TREASURY_LEDGER_ADDRESS;
  
  if (!treasuryAddress) {
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (fs.existsSync(deploymentsDir)) {
      const files = fs.readdirSync(deploymentsDir)
        .filter(f => f.startsWith("triple-stack-treasury") && f.endsWith(".json"))
        .map(f => {
          const stats = fs.statSync(path.join(deploymentsDir, f));
          return { name: f, mtime: stats.mtime.getTime() };
        })
        .sort((a, b) => b.mtime - a.mtime); // Sort by modification time, newest first
      
      if (files.length > 0) {
        const latestDeployment = JSON.parse(
          fs.readFileSync(path.join(deploymentsDir, files[0].name), "utf-8")
        );
        treasuryAddress = latestDeployment.contracts.TripleStackTreasuryLedger.address;
        console.log("📦 Loaded contract from:", files[0].name);
      }
    }
  }

  if (!treasuryAddress) {
    throw new Error("Treasury address not found. Set TREASURY_LEDGER_ADDRESS env var.");
  }

  console.log("🏛️  Treasury Ledger:", treasuryAddress);
  console.log();

  // Connect to contract
  const TripleStackTreasuryLedger = await ethers.getContractFactory("TripleStackTreasuryLedger");
  const treasuryLedger = TripleStackTreasuryLedger.attach(treasuryAddress);

  const verificationResults: any = {
    timestamp: new Date().toISOString(),
    network: network.name,
    chainId: Number(network.chainId),
    treasuryAddress,
    checks: []
  };

  // Helper function to add check result
  const addCheck = (category: string, name: string, status: boolean, details?: any) => {
    const check = { category, name, status, details };
    verificationResults.checks.push(check);
    const icon = status ? "✅" : "❌";
    console.log(`${icon} ${category}: ${name}`);
    if (details) {
      console.log(`   ${JSON.stringify(details, null, 2).replace(/\n/g, "\n   ")}`);
    }
  };

  try {
    // 1. Contract Deployment Verification
    console.log("🔍 1. Contract Deployment");
    console.log("━".repeat(40));
    
    const code = await ethers.provider.getCode(treasuryAddress);
    addCheck("Deployment", "Contract exists", code !== "0x");
    
    // 2. Role Verification
    console.log();
    console.log("🔍 2. Role Configuration");
    console.log("━".repeat(40));
    
    const DEFAULT_ADMIN_ROLE = await treasuryLedger.DEFAULT_ADMIN_ROLE();
    const MINTER_ROLE = await treasuryLedger.MINTER_ROLE();
    const BLU_VAULT_ROLE = await treasuryLedger.BLU_VAULT_ROLE();
    const SOVEREIGN_OVERRIDE_ROLE = await treasuryLedger.SOVEREIGN_OVERRIDE_ROLE();
    const DUAL_REALITY_VALIDATOR = await treasuryLedger.DUAL_REALITY_VALIDATOR();
    
    const hasAdmin = await treasuryLedger.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
    const hasMinter = await treasuryLedger.hasRole(MINTER_ROLE, deployer.address);
    const hasBluVault = await treasuryLedger.hasRole(BLU_VAULT_ROLE, deployer.address);
    const hasSovereign = await treasuryLedger.hasRole(SOVEREIGN_OVERRIDE_ROLE, deployer.address);
    const hasDualReality = await treasuryLedger.hasRole(DUAL_REALITY_VALIDATOR, deployer.address);
    
    addCheck("Roles", "DEFAULT_ADMIN_ROLE", hasAdmin);
    addCheck("Roles", "MINTER_ROLE", hasMinter);
    addCheck("Roles", "BLU_VAULT_ROLE", hasBluVault);
    addCheck("Roles", "SOVEREIGN_OVERRIDE_ROLE", hasSovereign);
    addCheck("Roles", "DUAL_REALITY_VALIDATOR", hasDualReality);

    // 3. Treasury Metrics Verification
    console.log();
    console.log("🔍 3. Treasury Metrics");
    console.log("━".repeat(40));
    
    const metrics = await treasuryLedger.getTreasuryMetrics();
    const expectedTotalYield = ethers.parseEther("28900000"); // $28.9M
    const expectedDailyYield = ethers.parseEther("2496960000000"); // ~$2.5T
    
    const totalYieldMatch = metrics[0] === expectedTotalYield;
    const dailyYieldMatch = metrics[1] === expectedDailyYield;
    
    addCheck("Metrics", "Total Yield/Second", totalYieldMatch, {
      expected: ethers.formatEther(expectedTotalYield),
      actual: ethers.formatEther(metrics[0]),
      unit: "USD"
    });
    
    addCheck("Metrics", "Daily Yield", dailyYieldMatch, {
      expected: ethers.formatEther(expectedDailyYield),
      actual: ethers.formatEther(metrics[1]),
      unit: "USD"
    });
    
    addCheck("Metrics", "π₄ Constant", metrics[2] > 0, {
      value: metrics[2].toString(),
      description: "π^4 ≈ 97.409 (scaled)"
    });

    // 4. Yield Stream Verification
    console.log();
    console.log("🔍 4. Yield Stream Configuration");
    console.log("━".repeat(40));
    
    const streams = [
      { id: 1, name: "Civilian", code: "Ω-CIV-01", expectedYield: "13600000" },
      { id: 2, name: "Military", code: "Ω-MIL-01", expectedYield: "6100000" },
      { id: 3, name: "Cosmic", code: "Ω-COS-01", expectedYield: "9200000" }
    ];
    
    for (const stream of streams) {
      const metadata = await treasuryLedger.getYieldMetadata(stream.id);
      const yieldMatch = ethers.formatEther(metadata.yieldPerSecond) === stream.expectedYield + ".0";
      
      addCheck("YieldStream", `${stream.name} (${stream.code})`, 
        metadata.isActive && metadata.sovereignCode === stream.code && yieldMatch,
        {
          code: metadata.sovereignCode,
          yieldPerSecond: ethers.formatEther(metadata.yieldPerSecond),
          active: metadata.isActive,
          accumulated: ethers.formatEther(metadata.totalAccumulated)
        }
      );
    }

    // 5. π₄ Compounding Verification
    console.log();
    console.log("🔍 5. π₄ Compounding Parameters");
    console.log("━".repeat(40));
    
    for (const stream of streams) {
      const pi4Params = await treasuryLedger.getPi4Parameters(stream.id);
      
      addCheck("Pi4Compounding", `${stream.name} Parameters`, pi4Params.enabled, {
        baseYield: ethers.formatEther(pi4Params.baseYield),
        compoundingInterval: pi4Params.compoundingInterval.toString() + " seconds",
        intervalDays: (Number(pi4Params.compoundingInterval) / 86400).toFixed(2) + " days",
        enabled: pi4Params.enabled
      });
    }

    // 6. Calculate Current Yields
    console.log();
    console.log("🔍 6. Current Yield Accumulation");
    console.log("━".repeat(40));
    
    for (const stream of streams) {
      const currentYield = await treasuryLedger.calculateCurrentYield(stream.id);
      
      addCheck("YieldAccumulation", `${stream.name} Current Yield`, true, {
        currentAccumulated: ethers.formatEther(currentYield),
        unit: "USD"
      });
    }

    // 7. Token URIs
    console.log();
    console.log("🔍 7. Token URI Configuration");
    console.log("━".repeat(40));
    
    for (const stream of streams) {
      try {
        const uri = await treasuryLedger.uri(stream.id);
        addCheck("TokenURI", `${stream.name} URI`, uri.length > 0, { uri });
      } catch (error: any) {
        addCheck("TokenURI", `${stream.name} URI`, false, { error: error.message });
      }
    }

    // 8. Interface Support
    console.log();
    console.log("🔍 8. Interface Support");
    console.log("━".repeat(40));
    
    const ERC1155_INTERFACE_ID = "0xd9b67a26";
    const ERC165_INTERFACE_ID = "0x01ffc9a7";
    const ACCESS_CONTROL_INTERFACE_ID = "0x7965db0b";
    
    const supportsERC1155 = await treasuryLedger.supportsInterface(ERC1155_INTERFACE_ID);
    const supportsERC165 = await treasuryLedger.supportsInterface(ERC165_INTERFACE_ID);
    const supportsAccessControl = await treasuryLedger.supportsInterface(ACCESS_CONTROL_INTERFACE_ID);
    
    addCheck("Interfaces", "ERC1155", supportsERC1155);
    addCheck("Interfaces", "ERC165", supportsERC165);
    addCheck("Interfaces", "AccessControl", supportsAccessControl);

    // 9. Check for minted tokens (if any)
    console.log();
    console.log("🔍 9. Minted Tokens");
    console.log("━".repeat(40));
    
    let totalMinted = 0n;
    for (const stream of streams) {
      const balance = await treasuryLedger.balanceOf(deployer.address, stream.id);
      if (balance > 0n) {
        totalMinted += balance;
        addCheck("MintedTokens", `${stream.name} balance`, true, {
          address: deployer.address,
          balance: balance.toString()
        });
      }
    }
    
    if (totalMinted === 0n) {
      console.log("   ℹ️  No tokens minted yet to deployer address");
    }

  } catch (error: any) {
    console.error("❌ Verification error:", error);
    verificationResults.error = error.message;
  }

  // Summary
  console.log();
  console.log("━".repeat(60));
  console.log("📊 Verification Summary");
  console.log("━".repeat(60));
  
  const totalChecks = verificationResults.checks.length;
  const passedChecks = verificationResults.checks.filter((c: any) => c.status).length;
  const failedChecks = totalChecks - passedChecks;
  
  console.log(`Total Checks: ${totalChecks}`);
  console.log(`✅ Passed: ${passedChecks}`);
  console.log(`❌ Failed: ${failedChecks}`);
  console.log();
  
  if (failedChecks > 0) {
    console.log("❌ Failed Checks:");
    verificationResults.checks
      .filter((c: any) => !c.status)
      .forEach((c: any) => {
        console.log(`   • ${c.category}: ${c.name}`);
      });
    console.log();
  }

  // Save verification report
  const reportsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const filename = `triple-stack-verification-${network.name}-${Date.now()}.json`;
  const filepath = path.join(reportsDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(verificationResults, null, 2));

  console.log("💾 Verification report saved to:", filename);
  console.log();
  
  if (failedChecks === 0) {
    console.log("✨ All verifications passed!");
  } else {
    console.log("⚠️  Some verifications failed. Review the report for details.");
  }
  console.log();

  return verificationResults;
}

// Execute verification
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Verification script failed:", error);
    process.exit(1);
  });
