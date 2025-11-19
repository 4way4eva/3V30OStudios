import { ethers } from "hardhat";

/**
 * Mint and Manage Humanoid Soldiers
 * 
 * This script demonstrates:
 * - Minting VR-compatible and AI humanoid soldiers
 * - Conducting EvolDuty training simulations
 * - Deploying soldiers to missions
 * - Tracking deployments and generating Watchtower logs
 */

interface SoldierConfig {
    type: number;
    isVRCompatible: boolean;
    name: string;
    description: string;
}

async function main() {
    console.log("========================================");
    console.log("EV0LVerse Military Soldier Management");
    console.log("========================================\n");

    const [deployer, officer1, officer2] = await ethers.getSigners();
    console.log("Managing as:", deployer.address);

    // Get deployed contract address (update this after deployment)
    const MILITARY_BASE_ADDRESS = process.env.MILITARY_BASE_ADDRESS || "";
    
    if (!MILITARY_BASE_ADDRESS) {
        console.error("Error: MILITARY_BASE_ADDRESS not set in environment");
        console.log("Please set MILITARY_BASE_ADDRESS to the deployed contract address");
        process.exit(1);
    }

    console.log("Military Base Address:", MILITARY_BASE_ADDRESS, "\n");

    const militaryBase = await ethers.getContractAt("EV0LVerseDigitalMilitaryBase", MILITARY_BASE_ADDRESS);

    // Verify base is activated
    const baseStatus = await militaryBase.getBaseStatus();
    if (!baseStatus.activated) {
        console.error("Error: Military base is not activated");
        process.exit(1);
    }

    console.log("Base Status: ACTIVATED");
    console.log("Current Soldiers:", baseStatus.totalSoldiers.toString());
    console.log("Current Defense Grids:", baseStatus.totalGrids.toString());
    console.log("Total Defense Strength:", baseStatus.defenseStrength.toString(), "\n");

    // Define soldier configurations
    // SoldierType: 0=AI_ENTITY, 1=VR_HUMANOID, 2=HYBRID_AGENT
    const soldierConfigs: SoldierConfig[] = [
        {
            type: 1, // VR_HUMANOID
            isVRCompatible: true,
            name: "VR Tactical Unit Alpha-01",
            description: "VR-controlled humanoid soldier specialized in tactical operations"
        },
        {
            type: 0, // AI_ENTITY
            isVRCompatible: false,
            name: "AI Reconnaissance Unit Beta-01",
            description: "Autonomous AI soldier for reconnaissance and surveillance"
        },
        {
            type: 2, // HYBRID_AGENT
            isVRCompatible: true,
            name: "Hybrid Command Unit Gamma-01",
            description: "Hybrid AI-VR soldier for command and control operations"
        },
        {
            type: 1, // VR_HUMANOID
            isVRCompatible: true,
            name: "VR Defense Unit Delta-01",
            description: "VR-controlled soldier for base fortification"
        },
        {
            type: 0, // AI_ENTITY
            isVRCompatible: false,
            name: "AI Patrol Unit Epsilon-01",
            description: "Autonomous patrol AI for E-SOIL corridor security"
        }
    ];

    // Mint soldiers
    console.log("Minting Humanoid Soldiers...\n");
    const mintedTokenIds: bigint[] = [];

    for (let i = 0; i < soldierConfigs.length; i++) {
        const config = soldierConfigs[i];
        
        // Create metadata URI (would point to IPFS in production)
        const metadataURI = `ipfs://QmEV0LVerse/soldiers/${i}/${config.name.replace(/\s/g, '_')}.json`;
        
        console.log(`Minting Soldier ${i + 1}/${soldierConfigs.length}: ${config.name}`);
        console.log(`  Type: ${config.type === 0 ? 'AI_ENTITY' : config.type === 1 ? 'VR_HUMANOID' : 'HYBRID_AGENT'}`);
        console.log(`  VR Compatible: ${config.isVRCompatible}`);
        
        const mintTx = await militaryBase.mintSoldier(
            config.type,
            config.isVRCompatible,
            deployer.address, // commanding officer
            metadataURI
        );
        
        const receipt = await mintTx.wait();
        
        // Extract token ID from event
        const event = receipt?.logs.find(
            (log: any) => log.fragment && log.fragment.name === 'SoldierMinted'
        );
        
        const tokenId = event?.args?.tokenId;
        mintedTokenIds.push(tokenId);
        
        console.log(`  ✓ Minted with Token ID: ${tokenId}\n`);
    }

    // Conduct training simulations
    console.log("========================================");
    console.log("Conducting EvolDuty Training Simulations");
    console.log("========================================\n");

    for (let i = 0; i < mintedTokenIds.length; i++) {
        const tokenId = mintedTokenIds[i];
        const config = soldierConfigs[i];
        
        // Generate mock EvolDuty session ID
        const evolDutySessionId = ethers.keccak256(
            ethers.solidityPacked(
                ["string", "uint256", "uint256"],
                ["EVOLDUTY_TRAINING_SESSION", tokenId, Date.now()]
            )
        );
        
        // Simulate training score based on soldier type
        // VR and Hybrid units score higher due to human control
        const baseScore = config.type === 1 || config.type === 2 ? 8000 : 7500;
        const randomVariation = Math.floor(Math.random() * 1000);
        const trainingScore = baseScore + randomVariation;
        
        // Training objectives
        const objectives = [
            "Base Fortification Procedures",
            "E-SOIL Corridor Navigation",
            "Tactical Combat Protocols",
            "EV0LVerse Codex Compliance"
        ];
        
        console.log(`Training Soldier ${tokenId}: ${config.name}`);
        console.log(`  EvolDuty Session: ${evolDutySessionId.slice(0, 16)}...`);
        console.log(`  Training Score: ${trainingScore}/10000`);
        
        const trainingTx = await militaryBase.recordTrainingSimulation(
            tokenId,
            evolDutySessionId,
            trainingScore,
            objectives
        );
        
        await trainingTx.wait();
        console.log(`  ✓ Training completed - Status updated\n`);
    }

    // Check soldier statuses
    console.log("========================================");
    console.log("Soldier Status Report");
    console.log("========================================\n");

    for (const tokenId of mintedTokenIds) {
        const soldier = await militaryBase.getSoldier(tokenId);
        console.log(`Soldier ${tokenId}:`);
        console.log(`  Status: ${getStatusName(Number(soldier.status))}`);
        console.log(`  Training Score: ${soldier.trainingScore}/10000`);
        console.log(`  Deployments: ${soldier.deploymentCount}`);
        console.log(`  Successful Missions: ${soldier.successfulMissions}`);
        console.log(`  VR Compatible: ${soldier.isVRCompatible}\n`);
    }

    // Deploy soldiers on a mission
    console.log("========================================");
    console.log("Deploying Soldiers on Mission");
    console.log("========================================\n");

    // Select active/standby soldiers for deployment
    const deployableSoldiers = mintedTokenIds.slice(0, 3); // Deploy first 3 soldiers
    
    // MissionType: 0=BASE_FORTIFICATION, 1=RECONNAISSANCE, 2=NARRATIVE_ADHERENCE, 3=PATROL, 4=TACTICAL_STRIKE, 5=RESOURCE_SECURITY
    const missionType = 3; // PATROL
    
    // ESOILZone: 0=SAFE_HAVEN, 1=CONFLICT_REGION, 2=CORRIDOR_TRANSIT, 3=STRATEGIC_OUTPOST, 4=NEUTRAL_TERRITORY
    const targetZone = 2; // CORRIDOR_TRANSIT
    
    const missionBrief = ethers.keccak256(
        ethers.toUtf8Bytes("E-SOIL Corridor Patrol - Secure corridor between Safe Haven Alpha and Strategic Outpost Beta")
    );
    
    const expectedDuration = 3600 * 4; // 4 hours in seconds
    
    console.log("Mission Details:");
    console.log(`  Type: PATROL`);
    console.log(`  Target Zone: CORRIDOR_TRANSIT`);
    console.log(`  Soldiers Deployed: ${deployableSoldiers.length}`);
    console.log(`  Expected Duration: ${expectedDuration / 3600} hours\n`);
    
    const deployTx = await militaryBase.deploySoldiers(
        deployableSoldiers,
        missionType,
        targetZone,
        missionBrief,
        expectedDuration
    );
    
    const deployReceipt = await deployTx.wait();
    const deployEvent = deployReceipt?.logs.find(
        (log: any) => log.fragment && log.fragment.name === 'DeploymentCreated'
    );
    const deploymentId = deployEvent?.args?.deploymentId;
    
    console.log("✓ Deployment Created");
    console.log(`  Deployment ID: ${deploymentId}\n`);

    // Export Watchtower logs
    console.log("========================================");
    console.log("Exporting Watchtower Logs");
    console.log("========================================\n");

    const logCount = 10; // Export last 10 logs
    const logs = await militaryBase.exportWatchtowerLogs(0, Math.min(logCount, 10));
    
    console.log(`Total Log Entries Available: ${logs.length}`);
    console.log("\nSample Watchtower Log Entries:");
    
    for (let i = 0; i < Math.min(3, logs.length); i++) {
        const log = logs[i];
        console.log(`\nEntry ${log.entryId}:`);
        console.log(`  Timestamp: ${new Date(Number(log.timestamp) * 1000).toISOString()}`);
        console.log(`  Event Type: ${log.eventType}`);
        console.log(`  Entity Reference: ${log.entityReference}`);
        console.log(`  Actor: ${log.actor}`);
        console.log(`  Tribunal Valid: ${log.tribunalValid}`);
    }

    // Display summary
    const finalStatus = await militaryBase.getBaseStatus();
    console.log("\n========================================");
    console.log("Mission Management Summary");
    console.log("========================================");
    console.log("Total Soldiers Minted:", finalStatus.totalSoldiers.toString());
    console.log("Total Soldiers Trained:", mintedTokenIds.length);
    console.log("Active Deployments: 1");
    console.log("Defense Grid Strength:", finalStatus.defenseStrength.toString());
    console.log("\nAll operations logged to Watchtower for tribunal review");
    console.log("========================================\n");
}

function getStatusName(status: number): string {
    const statuses = [
        "RECRUIT",
        "IN_TRAINING", 
        "ACTIVE",
        "DEPLOYED",
        "STANDBY",
        "RETIRED",
        "MEMORIAL"
    ];
    return statuses[status] || "UNKNOWN";
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
