import { ethers } from "hardhat";

/**
 * Deploy EV0LVerse Digital Military Base
 * 
 * This script deploys the military base architecture including:
 * - Humanoid soldier ENFT management
 * - Quad-layer defense grid
 * - Training system integration
 * - Deployment tracking
 * - Watchtower logging
 */
async function main() {
    console.log("========================================");
    console.log("EV0LVerse Digital Military Base Deployment");
    console.log("========================================\n");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

    // Deploy Digital Military Base
    console.log("Deploying EV0LVerseDigitalMilitaryBase...");
    const MilitaryBase = await ethers.getContractFactory("EV0LVerseDigitalMilitaryBase");
    const militaryBase = await MilitaryBase.deploy();
    await militaryBase.waitForDeployment();
    
    const militaryBaseAddress = await militaryBase.getAddress();
    console.log("✓ EV0LVerseDigitalMilitaryBase deployed to:", militaryBaseAddress);

    // Activate the base with ceremonial seal
    console.log("\nActivating military base with Flame Crown authority...");
    const ceremonialSeal = ethers.keccak256(
        ethers.solidityPacked(
            ["string", "uint256", "address"],
            ["EV0LVERSE_MILITARY_BASE_GENESIS", await ethers.provider.getBlockNumber(), deployer.address]
        )
    );
    
    const activateTx = await militaryBase.activateBase(ceremonialSeal);
    await activateTx.wait();
    console.log("✓ Base activated with ceremonial seal:", ceremonialSeal);

    // Get base status
    const baseStatus = await militaryBase.getBaseStatus();
    console.log("\nBase Status:");
    console.log("  - Activated:", baseStatus.activated);
    console.log("  - Activation Time:", new Date(Number(baseStatus.activationTime) * 1000).toISOString());
    console.log("  - Total Soldiers:", baseStatus.totalSoldiers.toString());
    console.log("  - Total Defense Grids:", baseStatus.totalGrids.toString());
    console.log("  - Total Defense Strength:", baseStatus.defenseStrength.toString());

    // Setup additional roles
    console.log("\nSetting up command structure...");
    
    // Grant BASE_COMMANDER_ROLE to deployer (already has it from constructor)
    const BASE_COMMANDER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("BASE_COMMANDER_ROLE"));
    const TRAINING_OFFICER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("TRAINING_OFFICER_ROLE"));
    const DEPLOYMENT_OFFICER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("DEPLOYMENT_OFFICER_ROLE"));
    const WATCHTOWER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("WATCHTOWER_ROLE"));

    // Grant roles to deployer for testing/administration
    const grantTrainingTx = await militaryBase.grantRole(TRAINING_OFFICER_ROLE, deployer.address);
    await grantTrainingTx.wait();
    console.log("✓ Granted TRAINING_OFFICER_ROLE to deployer");

    const grantDeploymentTx = await militaryBase.grantRole(DEPLOYMENT_OFFICER_ROLE, deployer.address);
    await grantDeploymentTx.wait();
    console.log("✓ Granted DEPLOYMENT_OFFICER_ROLE to deployer");

    const grantWatchtowerTx = await militaryBase.grantRole(WATCHTOWER_ROLE, deployer.address);
    await grantWatchtowerTx.wait();
    console.log("✓ Granted WATCHTOWER_ROLE to deployer");

    // Create initial quad-layer defense grids
    console.log("\nInitializing Quad-Layer Defense Grid...");
    
    // Defense Layer enum: 0=CYBER, 1=PHYSICAL, 2=COSMIC, 3=LORE
    // ESOILZone enum: 0=SAFE_HAVEN, 1=CONFLICT_REGION, 2=CORRIDOR_TRANSIT, 3=STRATEGIC_OUTPOST, 4=NEUTRAL_TERRITORY
    
    const defenseGrids = [
        { layer: 0, zone: 0, strength: 8500, name: "Cyber Defense - Safe Haven" },
        { layer: 1, zone: 3, strength: 9000, name: "Physical Mapping - Strategic Outpost" },
        { layer: 2, zone: 2, strength: 7500, name: "Cosmic Overwatch - Corridor Transit" },
        { layer: 3, zone: 0, strength: 9500, name: "Lore Integration - Safe Haven" }
    ];

    for (const grid of defenseGrids) {
        const createGridTx = await militaryBase.createDefenseGrid(grid.layer, grid.zone, grid.strength);
        const receipt = await createGridTx.wait();
        
        // Extract grid ID from event
        const event = receipt?.logs.find(
            (log: any) => log.fragment && log.fragment.name === 'DefenseGridCreated'
        );
        
        console.log(`✓ Created ${grid.name} - Strength: ${grid.strength}/10000`);
    }

    // Display final status
    const finalStatus = await militaryBase.getBaseStatus();
    console.log("\n========================================");
    console.log("Deployment Summary");
    console.log("========================================");
    console.log("Contract Address:", militaryBaseAddress);
    console.log("Ceremonial Seal:", ceremonialSeal);
    console.log("Total Defense Strength:", finalStatus.defenseStrength.toString(), "/ 40000 (quad-layer max)");
    console.log("Base Activated:", finalStatus.activated);
    console.log("\nNext Steps:");
    console.log("1. Mint humanoid soldiers using mint_military_soldiers.ts");
    console.log("2. Conduct training simulations via EvolDuty integration");
    console.log("3. Deploy soldiers to E-SOIL corridors and zones");
    console.log("4. Export Watchtower logs for tribunal review");
    console.log("========================================\n");

    // Save deployment info
    const deploymentInfo = {
        network: (await ethers.provider.getNetwork()).name,
        contractAddress: militaryBaseAddress,
        deployer: deployer.address,
        deploymentTime: new Date().toISOString(),
        ceremonialSeal: ceremonialSeal,
        roles: {
            FLAME_CROWN_ROLE: await militaryBase.FLAME_CROWN_ROLE(),
            BASE_COMMANDER_ROLE: await militaryBase.BASE_COMMANDER_ROLE(),
            TRAINING_OFFICER_ROLE: await militaryBase.TRAINING_OFFICER_ROLE(),
            DEPLOYMENT_OFFICER_ROLE: await militaryBase.DEPLOYMENT_OFFICER_ROLE(),
            WATCHTOWER_ROLE: await militaryBase.WATCHTOWER_ROLE()
        }
    };

    console.log("\nDeployment Info:");
    console.log(JSON.stringify(deploymentInfo, null, 2));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
