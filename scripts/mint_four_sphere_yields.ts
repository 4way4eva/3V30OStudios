import { ethers } from "hardhat";

/**
 * Mint Four-Sphere Yield ENFTs
 * Mints all four yield streams: Civilian, Military, Cosmic, and Transdimensional
 */
async function main() {
    console.log("🎨 Minting Four-Sphere Yield ENFTs...\n");

    // UPDATE THIS ADDRESS with your deployed FourStackTreasuryLedger contract
    const FOUR_STACK_LEDGER_ADDRESS = process.env.FOUR_STACK_LEDGER_ADDRESS || "0x0000000000000000000000000000000000000000";
    
    if (FOUR_STACK_LEDGER_ADDRESS === "0x0000000000000000000000000000000000000000") {
        console.error("❌ Error: Please set FOUR_STACK_LEDGER_ADDRESS environment variable");
        console.log("   Example: export FOUR_STACK_LEDGER_ADDRESS=0x...");
        process.exit(1);
    }

    const [deployer] = await ethers.getSigners();
    console.log("Minting with account:", deployer.address);
    console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

    // Connect to deployed contract
    const FourStackTreasuryLedger = await ethers.getContractFactory("FourStackTreasuryLedger");
    const fourStackLedger = FourStackTreasuryLedger.attach(FOUR_STACK_LEDGER_ADDRESS);
    console.log("📜 Connected to FourStackTreasuryLedger at:", FOUR_STACK_LEDGER_ADDRESS);

    // Beneficiary address (can be different from deployer)
    const beneficiary = process.env.BENEFICIARY_ADDRESS || deployer.address;
    console.log("Minting to beneficiary:", beneficiary);

    // Generate Blu-Vault authorization tag
    const authTag = ethers.keccak256(
        ethers.toUtf8Bytes(`FOUR_SPHERE_GENESIS_${Date.now()}_${beneficiary}`)
    );
    console.log("Blu-Vault Auth Tag:", authTag);

    // Mint amounts for each sphere (1 ENFT each by default)
    const civilianAmount = 1;
    const militaryAmount = 1;
    const cosmicAmount = 1;
    const transdimensionalAmount = 1;

    console.log("\n🌐 Minting Configuration:");
    console.log("  - Civilian ENFTs:", civilianAmount);
    console.log("  - Military ENFTs:", militaryAmount);
    console.log("  - Cosmic ENFTs:", cosmicAmount);
    console.log("  - Transdimensional ENFTs:", transdimensionalAmount);

    // Mint all four yield streams in one transaction
    console.log("\n🔨 Executing batch mint...");
    const tx = await fourStackLedger.mintAllYieldStreams(
        beneficiary,
        civilianAmount,
        militaryAmount,
        cosmicAmount,
        transdimensionalAmount,
        authTag
    );

    console.log("Transaction hash:", tx.hash);
    console.log("Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed in block:", receipt.blockNumber);

    // Verify minting by checking balances
    console.log("\n📊 Verifying Balances:");
    const balances = [
        { id: 1, name: "Civilian (Ω-CIV-01)" },
        { id: 2, name: "Military (Ω-MIL-01)" },
        { id: 3, name: "Cosmic (Ω-COS-01)" },
        { id: 4, name: "Transdimensional (Ω-TRN-01)" }
    ];

    for (const sphere of balances) {
        const balance = await fourStackLedger.balanceOf(beneficiary, sphere.id);
        console.log(`  ${sphere.name}: ${balance.toString()} ENFT(s)`);
    }

    // Display yield information
    console.log("\n💰 Yield Information:");
    for (const sphere of balances) {
        const metadata = await fourStackLedger.getYieldMetadata(sphere.id);
        const currentYield = await fourStackLedger.calculateCurrentYield(sphere.id);
        
        console.log(`\n${sphere.name}:`);
        if (metadata.isInfinite) {
            const curveData = await fourStackLedger.getInfiniteCurveData(sphere.id);
            console.log("  - Type: Infinite/Unbounded");
            console.log("  - Current n-Exponent:", curveData[0].toString());
            console.log("  - Theoretical Yield/Sec: $", ethers.formatUnits(curveData[1], 18));
            console.log("  - Reality Bending:", curveData[4] ? "Active" : "Inactive");
        } else {
            console.log("  - Yield Rate: $", ethers.formatUnits(metadata.yieldPerSecond, 18), "/sec");
            console.log("  - Compounding: π₄ exponential");
        }
        console.log("  - Total Accumulated: $", ethers.formatUnits(currentYield, 18));
    }

    // Display Blu-Vault authorizations
    console.log("\n🔐 Blu-Vault Authorizations:");
    for (const sphere of balances) {
        const auth = await fourStackLedger.getBluVaultAuth(sphere.id);
        console.log(`  ${sphere.name}:`);
        console.log("    - Auth Tag:", auth.authTag);
        console.log("    - Authorized By:", auth.authorizedBy);
        console.log("    - Valid:", auth.isValid);
    }

    console.log("\n" + "=".repeat(80));
    console.log("🎉 Four-Sphere Yield ENFTs Minted Successfully!");
    console.log("=".repeat(80));

    console.log("\n📋 Summary:");
    console.log("Contract:", FOUR_STACK_LEDGER_ADDRESS);
    console.log("Beneficiary:", beneficiary);
    console.log("Total Visible Yield: $109M/second");
    console.log("Transdimensional Yield: ∞ (Unbounded)");

    console.log("\n📝 Next Steps:");
    console.log("1. Monitor yield accumulation via calculateCurrentYield()");
    console.log("2. Apply π₄ compounding for finite spheres (quarterly)");
    console.log("3. Apply πₙ compounding for Transdimensional (daily)");
    console.log("4. Configure reality engineering parameters");
    console.log("5. Set dual-reality confirmations");
    console.log("6. Activate Ultra-Sovereign Mode if desired");

    return {
        contract: FOUR_STACK_LEDGER_ADDRESS,
        beneficiary,
        authTag,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber
    };
}

// Execute minting
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Minting failed:", error);
        process.exit(1);
    });
