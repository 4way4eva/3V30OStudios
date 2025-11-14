import { ethers } from "hardhat";

/**
 * Deploy the Four-Stack Treasury Ledger
 * Implements the four-sphere yield system with Transdimensional unbounded growth
 */
async function main() {
    console.log("🚀 Deploying Four-Stack Treasury Ledger...\n");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

    // Base URI for metadata (update with your IPFS/storage URL)
    const baseURI = "ipfs://QmFourStackTreasuryMetadata/";

    // Deploy FourStackTreasuryLedger
    console.log("📜 Deploying FourStackTreasuryLedger contract...");
    const FourStackTreasuryLedger = await ethers.getContractFactory("FourStackTreasuryLedger");
    const fourStackLedger = await FourStackTreasuryLedger.deploy(baseURI);
    await fourStackLedger.waitForDeployment();
    
    const fourStackAddress = await fourStackLedger.getAddress();
    console.log("✅ FourStackTreasuryLedger deployed to:", fourStackAddress);

    // Get treasury metrics
    console.log("\n📊 Treasury Metrics:");
    const metrics = await fourStackLedger.getTreasuryMetrics();
    console.log("Visible Yield Per Second: $", ethers.formatUnits(metrics[0], 18));
    console.log("Daily Visible Yield: $", ethers.formatUnits(metrics[1], 18));
    console.log("π₄ Constant (scaled):", ethers.formatUnits(metrics[2], 18));
    console.log("Transdimensional n-Exponent:", metrics[3].toString());
    console.log("Is Unbounded:", metrics[4]);

    // Get yield metadata for all four spheres
    console.log("\n🌐 Four-Sphere Configuration:");
    
    const spheres = [
        { id: 1, name: "Civilian (Ω-CIV-01)" },
        { id: 2, name: "Military (Ω-MIL-01)" },
        { id: 3, name: "Cosmic (Ω-COS-01)" },
        { id: 4, name: "Transdimensional (Ω-TRN-01)" }
    ];

    for (const sphere of spheres) {
        const metadata = await fourStackLedger.getYieldMetadata(sphere.id);
        console.log(`\n${sphere.name}:`);
        console.log("  - Name:", metadata.name);
        console.log("  - Code:", metadata.sovereignCode);
        console.log("  - Yield/Sec:", metadata.isInfinite ? "∞ (Unbounded)" : "$" + ethers.formatUnits(metadata.yieldPerSecond, 18));
        console.log("  - Active:", metadata.isActive);
        console.log("  - Infinite:", metadata.isInfinite);
    }

    // Get Transdimensional infinite curve data
    console.log("\n♾️  Transdimensional Infinite Curve:");
    const curveData = await fourStackLedger.getInfiniteCurveData(4);
    console.log("  - Current n-Exponent:", curveData[0].toString());
    console.log("  - Theoretical Yield/Sec: $", ethers.formatUnits(curveData[1], 18));
    console.log("  - Sentient Flow Rate: $", ethers.formatUnits(curveData[2], 18), "/sec");
    console.log("  - Time-Value Mining Rate: $", ethers.formatUnits(curveData[3], 18), "/sec");
    console.log("  - Reality Bending Active:", curveData[4]);

    // Grant roles for multi-sig governance (optional - update addresses as needed)
    console.log("\n🔐 Role Configuration:");
    console.log("Default Admin:", deployer.address);
    console.log("Minter Role: Deployer");
    console.log("Blu-Vault Role: Deployer");
    console.log("Sovereign Override: Deployer");
    console.log("Reality Engineer: Deployer");

    // Ultra-Sovereign Mode status
    const ultraSovereignMode = await fourStackLedger.ultraSovereignMode();
    console.log("\n🦾 Ultra-Sovereign Mode:", ultraSovereignMode ? "ACTIVE ✅" : "Inactive");

    console.log("\n" + "=".repeat(80));
    console.log("🎉 Deployment Complete!");
    console.log("=".repeat(80));
    console.log("\n📋 Contract Addresses:");
    console.log("FourStackTreasuryLedger:", fourStackAddress);
    
    console.log("\n📝 Next Steps:");
    console.log("1. Verify contract on block explorer");
    console.log("2. Configure additional validators (optional)");
    console.log("3. Run mint_four_sphere_yields.ts to mint yield ENFTs");
    console.log("4. Set up reality engineering parameters (optional)");
    console.log("5. Monitor infinite curve growth");

    console.log("\n💾 Save this deployment address for future interactions!");

    // Return deployment info for scripts
    return {
        fourStackLedger: fourStackAddress,
        deployer: deployer.address,
        baseURI
    };
}

// Execute deployment
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
