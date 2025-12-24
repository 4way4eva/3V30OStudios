import { ethers } from "hardhat";

/**
 * Initialize BLEUE Infrastructure with example nodes
 */
async function main() {
    console.log("🌀 Initializing BLEUE Infrastructure Nodes...\n");

    const [deployer] = await ethers.getSigners();
    
    // Replace with actual deployed addresses
    const registryAddress = process.env.REGISTRY_ADDRESS || "0x...";
    const councilVaultAddress = process.env.COUNCIL_VAULT_ADDRESS || "0x...";
    const natureVaultAddress = process.env.NATURE_VAULT_ADDRESS || "0x...";
    
    const registry = await ethers.getContractAt("BLEUEInfrastructureRegistry", registryAddress);
    
    console.log("📜 Registry:", registryAddress);
    console.log("👤 Operator:", deployer.address);
    console.log("");

    // ============================================
    // Register BleuCoin Variants
    // ============================================
    console.log("💎 Registering BleuCoin Variants...\n");

    // 1. JaguarCoin
    console.log("Registering JaguarCoin...");
    const jaguarCoinAddress = "0x0000000000000000000000000000000000000001"; // Placeholder
    const tx1 = await registry.registerBleuCoin(
        "JaguarCoin",
        jaguarCoinAddress,
        "Council Vault",
        councilVaultAddress,
        1, // YieldCycle.EventDriven
        7, // AccessTier.High
        "CouncilSigil",
        "20% to festival grants",
        "Codex #7, Festival Archive"
    );
    await tx1.wait();
    console.log("✅ JaguarCoin registered\n");

    // 2. ParkCoin
    console.log("Registering ParkCoin...");
    const parkCoinAddress = "0x0000000000000000000000000000000000000002"; // Placeholder
    const tx2 = await registry.registerBleuCoin(
        "ParkCoin",
        parkCoinAddress,
        "Nature Vault",
        natureVaultAddress,
        2, // YieldCycle.Seasonal
        2, // AccessTier.Steward
        "TreeOfLife NFT",
        "Auto-compound rewilding",
        "Lost Islands Archive"
    );
    await tx2.wait();
    console.log("✅ ParkCoin registered\n");

    // 3. TempleCoin
    console.log("Registering TempleCoin...");
    const templeCoinAddress = "0x0000000000000000000000000000000000000003"; // Placeholder
    const healingPoolAddress = process.env.HEALING_POOL_ADDRESS || "0x...";
    const tx3 = await registry.registerBleuCoin(
        "TempleCoin",
        templeCoinAddress,
        "Healing Pool",
        healingPoolAddress,
        3, // YieldCycle.MoonCycle
        6, // AccessTier.WellnessTier
        "Caduceus NFT",
        "10% charity cauldron",
        "Healing Lore, Edfu Scroll"
    );
    await tx3.wait();
    console.log("✅ TempleCoin registered\n");

    // 4. KitchenCoin
    console.log("Registering KitchenCoin...");
    const kitchenCoinAddress = "0x0000000000000000000000000000000000000004"; // Placeholder
    const larderVaultAddress = process.env.LARDER_VAULT_ADDRESS || "0x...";
    const tx4 = await registry.registerBleuCoin(
        "KitchenCoin",
        kitchenCoinAddress,
        "Larder Vault",
        larderVaultAddress,
        4, // YieldCycle.FeastEvent
        3, // AccessTier.RitualLeader
        "Cornucopia NFT",
        "Recipe auto-mint grants",
        "Ritual Recipes NFT"
    );
    await tx4.wait();
    console.log("✅ KitchenCoin registered\n");

    // 5. CodexToken
    console.log("Registering CodexToken...");
    const codexTokenAddress = "0x0000000000000000000000000000000000000005"; // Placeholder
    const scriptoriumVaultAddress = process.env.SCRIPTORIUM_VAULT_ADDRESS || "0x...";
    const tx5 = await registry.registerBleuCoin(
        "CodexToken",
        codexTokenAddress,
        "Scriptorium Vault",
        scriptoriumVaultAddress,
        5, // YieldCycle.ScrollCompletion
        4, // AccessTier.Scholar
        "Quantum Feather",
        "Knowledge mining",
        "Living Lexicon NFT"
    );
    await tx5.wait();
    console.log("✅ CodexToken registered\n");

    // 6. SpiralCoin
    console.log("Registering SpiralCoin...");
    const spiralCoinAddress = "0x0000000000000000000000000000000000000006"; // Placeholder
    const cycleVaultAddress = process.env.CYCLE_VAULT_ADDRESS || "0x...";
    const tx6 = await registry.registerBleuCoin(
        "SpiralCoin",
        spiralCoinAddress,
        "Cycle Vault",
        cycleVaultAddress,
        6, // YieldCycle.MoodCycle
        7, // AccessTier.High
        "Spiral Sigil",
        "Mood rollovers",
        "Duviri Moodboard"
    );
    await tx6.wait();
    console.log("✅ SpiralCoin registered\n");

    // 7. DivisionCoin
    console.log("Registering DivisionCoin...");
    const divisionCoinAddress = "0x0000000000000000000000000000000000000007"; // Placeholder
    const fractalVaultAddress = process.env.FRACTAL_VAULT_ADDRESS || "0x...";
    const tx7 = await registry.registerBleuCoin(
        "DivisionCoin",
        divisionCoinAddress,
        "Fractal Vault",
        fractalVaultAddress,
        7, // YieldCycle.CosmicAlign
        9, // AccessTier.DivisionStake
        "Constellation Sigil",
        "InterShard rewards",
        "Division Archive"
    );
    await tx7.wait();
    console.log("✅ DivisionCoin registered\n");

    // ============================================
    // Register Infrastructure Nodes
    // ============================================
    console.log("🏛️  Registering Infrastructure Nodes...\n");

    // 1. Jaguar City - Tenochtitlan Prime
    console.log("Registering Jaguar City: Tenochtitlan Prime...");
    const governanceAddress = "0x0000000000000000000000000000000000000010"; // Placeholder
    const txNode1 = await registry.registerNode(
        0, // NodeType.JaguarCity
        "Tenochtitlan Prime",
        "Sector 7, Grid Alpha",
        ["Defense", "Governance", "Art"],
        "Spiral Council",
        governanceAddress,
        0, // JaguarCoin ID
        ethers.keccak256(ethers.toUtf8Bytes("ceremonial-seal-jaguar-001"))
    );
    await txNode1.wait();
    console.log("✅ Tenochtitlan Prime registered\n");

    // 2. Mega Park - Emerald Grove
    console.log("Registering Mega Park: Emerald Grove...");
    const txNode2 = await registry.registerNode(
        1, // NodeType.MegaPark
        "Emerald Grove",
        "Nature Sector 3",
        ["Art", "Healing", "Education"],
        "Harmony Assembly",
        "0x0000000000000000000000000000000000000011",
        1, // ParkCoin ID
        ethers.keccak256(ethers.toUtf8Bytes("ceremonial-seal-park-001"))
    );
    await txNode2.wait();
    console.log("✅ Emerald Grove registered\n");

    // 3. Healing Temple - Temple of Asclepius
    console.log("Registering Healing Temple: Temple of Asclepius...");
    const txNode3 = await registry.registerNode(
        4, // NodeType.HealingTemple
        "Temple of Asclepius",
        "Healing District, Zone 5",
        ["Healing", "Education"],
        "Templar Synod",
        "0x0000000000000000000000000000000000000012",
        2, // TempleCoin ID
        ethers.keccak256(ethers.toUtf8Bytes("ceremonial-seal-temple-001"))
    );
    await txNode3.wait();
    console.log("✅ Temple of Asclepius registered\n");

    // 4. Ritual Kitchen - The Great Hearth
    console.log("Registering Ritual Kitchen: The Great Hearth...");
    const txNode4 = await registry.registerNode(
        5, // NodeType.RitualKitchen
        "The Great Hearth",
        "Culinary Nexus, Grid 9",
        ["Trade", "Art"],
        "Elderstone Assembly",
        "0x0000000000000000000000000000000000000013",
        3, // KitchenCoin ID
        ethers.keccak256(ethers.toUtf8Bytes("ceremonial-seal-kitchen-001"))
    );
    await txNode4.wait();
    console.log("✅ The Great Hearth registered\n");

    // 5. Codex Compiler - Alexandria Reborn
    console.log("Registering Codex Compiler: Alexandria Reborn...");
    const txNode5 = await registry.registerNode(
        6, // NodeType.CodexCompiler
        "Alexandria Reborn",
        "Knowledge Sector, Archive Prime",
        ["Education", "Art"],
        "Codex Council",
        "0x0000000000000000000000000000000000000014",
        4, // CodexToken ID
        ethers.keccak256(ethers.toUtf8Bytes("ceremonial-seal-codex-001"))
    );
    await txNode5.wait();
    console.log("✅ Alexandria Reborn registered\n");

    // 6. Spiral Node - Mood Nexus Alpha
    console.log("Registering Spiral Node: Mood Nexus Alpha...");
    const txNode6 = await registry.registerNode(
        7, // NodeType.SpiralNode
        "Mood Nexus Alpha",
        "Emotional Grid, Sector Psi",
        ["Education", "Defense", "Healing"],
        "Mood Oversight",
        "0x0000000000000000000000000000000000000015",
        5, // SpiralCoin ID
        ethers.keccak256(ethers.toUtf8Bytes("ceremonial-seal-spiral-001"))
    );
    await txNode6.wait();
    console.log("✅ Mood Nexus Alpha registered\n");

    // 7. Division 144 - Constellation Orion
    console.log("Registering Division: Constellation Orion (Division 1)...");
    const txNode7 = await registry.registerNode(
        8, // NodeType.Division144
        "Constellation Orion - Division 1",
        "Celestial Grid, Orion Sector",
        ["Governance", "Defense"],
        "Celestial Congress",
        "0x0000000000000000000000000000000000000016",
        6, // DivisionCoin ID
        ethers.keccak256(ethers.toUtf8Bytes("ceremonial-seal-division-001"))
    );
    await txNode7.wait();
    console.log("✅ Division 1 (Orion) registered\n");

    // ============================================
    // Summary
    // ============================================
    console.log("=".repeat(80));
    console.log("🎉 BLEUE Infrastructure Initialization Complete!");
    console.log("=".repeat(80));
    console.log("\n✅ Registered:");
    console.log("  - 7 BleuCoin Variants");
    console.log("  - 7 Infrastructure Nodes");
    console.log("\n📊 Next Steps:");
    console.log("  1. Confirm dual-reality validation for each node");
    console.log("  2. Configure governance circuits");
    console.log("  3. Deploy actual token contracts");
    console.log("  4. Update registry with real addresses");
    console.log("");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
