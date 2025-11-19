import { ethers } from "hardhat";

/**
 * Military Base Status Monitor
 * 
 * Display comprehensive status of the digital military base including:
 * - Base activation and configuration
 * - Soldier statistics by status
 * - Defense grid strength by layer and zone
 * - Active deployments
 * - Recent Watchtower log entries
 */

async function main() {
    console.log("========================================");
    console.log("EV0LVerse Military Base Status Monitor");
    console.log("========================================\n");

    const MILITARY_BASE_ADDRESS = process.env.MILITARY_BASE_ADDRESS || "";
    
    if (!MILITARY_BASE_ADDRESS) {
        console.error("Error: MILITARY_BASE_ADDRESS not set in environment");
        console.log("Please set MILITARY_BASE_ADDRESS to the deployed contract address");
        process.exit(1);
    }

    console.log("Military Base Address:", MILITARY_BASE_ADDRESS, "\n");

    const militaryBase = await ethers.getContractAt("EV0LVerseDigitalMilitaryBase", MILITARY_BASE_ADDRESS);

    // Get base status
    console.log("=== BASE STATUS ===");
    const baseStatus = await militaryBase.getBaseStatus();
    console.log("Activated:", baseStatus.activated);
    
    if (baseStatus.activated) {
        console.log("Activation Time:", new Date(Number(baseStatus.activationTime) * 1000).toISOString());
    }
    
    console.log("Total Soldiers:", baseStatus.totalSoldiers.toString());
    console.log("Total Defense Grids:", baseStatus.totalGrids.toString());
    console.log("Total Defense Strength:", baseStatus.defenseStrength.toString(), "/ 40000 (max quad-layer)");
    
    const strengthPercent = (Number(baseStatus.defenseStrength) / 400).toFixed(1);
    console.log("Defense Coverage:", strengthPercent + "%\n");

    // Get soldiers by status
    console.log("=== SOLDIER ROSTER ===");
    const statusNames = ["RECRUIT", "IN_TRAINING", "ACTIVE", "DEPLOYED", "STANDBY", "RETIRED", "MEMORIAL"];
    let totalSoldiers = 0;
    
    for (let i = 0; i < statusNames.length; i++) {
        const soldiers = await militaryBase.getSoldiersByStatus(i);
        if (soldiers.length > 0) {
            console.log(`${statusNames[i]}: ${soldiers.length}`);
            totalSoldiers += soldiers.length;
        }
    }
    console.log(`Total: ${totalSoldiers}\n`);

    // Display detailed soldier info if there are soldiers
    if (Number(baseStatus.totalSoldiers) > 0) {
        console.log("=== SOLDIER DETAILS ===");
        const maxDisplay = 5;
        const soldierCount = Math.min(Number(baseStatus.totalSoldiers), maxDisplay);
        
        for (let i = 0; i < soldierCount; i++) {
            try {
                const soldier = await militaryBase.getSoldier(i);
                const typeNames = ["AI_ENTITY", "VR_HUMANOID", "HYBRID_AGENT"];
                
                console.log(`\nSoldier #${i}:`);
                console.log(`  Type: ${typeNames[soldier.soldierType]}`);
                console.log(`  Status: ${statusNames[soldier.status]}`);
                console.log(`  VR Compatible: ${soldier.isVRCompatible}`);
                console.log(`  Training Score: ${soldier.trainingScore}/10000`);
                console.log(`  Deployments: ${soldier.deploymentCount}`);
                console.log(`  Successful Missions: ${soldier.successfulMissions}`);
                console.log(`  Commanding Officer: ${soldier.commandingOfficer.slice(0, 10)}...`);
            } catch (error) {
                // Soldier doesn't exist
                break;
            }
        }
        
        if (Number(baseStatus.totalSoldiers) > maxDisplay) {
            console.log(`\n... and ${Number(baseStatus.totalSoldiers) - maxDisplay} more soldiers`);
        }
        console.log();
    }

    // Display defense grids by zone
    if (Number(baseStatus.totalGrids) > 0) {
        console.log("=== DEFENSE GRID CONFIGURATION ===");
        const zoneNames = ["SAFE_HAVEN", "CONFLICT_REGION", "CORRIDOR_TRANSIT", "STRATEGIC_OUTPOST", "NEUTRAL_TERRITORY"];
        const layerNames = ["CYBER", "PHYSICAL", "COSMIC", "LORE"];
        
        for (let zone = 0; zone < zoneNames.length; zone++) {
            const gridsInZone = await militaryBase.getGridsByZone(zone);
            
            if (gridsInZone.length > 0) {
                console.log(`\n${zoneNames[zone]}:`);
                
                for (const gridId of gridsInZone) {
                    const grid = await militaryBase.getDefenseGrid(gridId);
                    console.log(`  Grid #${gridId}: ${layerNames[grid.layer]} - Strength: ${grid.strength}/10000 - ${grid.isActive ? 'ACTIVE' : 'INACTIVE'}`);
                }
            }
        }
        console.log();
    }

    // Display recent Watchtower logs
    console.log("=== RECENT WATCHTOWER LOGS ===");
    try {
        const logCount = 5;
        const logs = await militaryBase.exportWatchtowerLogs(0, logCount);
        
        if (logs.length > 0) {
            for (let i = 0; i < Math.min(logs.length, logCount); i++) {
                const log = logs[i];
                console.log(`\nEntry #${log.entryId}:`);
                console.log(`  Timestamp: ${new Date(Number(log.timestamp) * 1000).toISOString()}`);
                console.log(`  Event Type: ${log.eventType.slice(0, 20)}...`);
                console.log(`  Entity Ref: ${log.entityReference.slice(0, 20)}...`);
                console.log(`  Actor: ${log.actor.slice(0, 10)}...`);
                console.log(`  Tribunal Valid: ${log.tribunalValid}`);
            }
        } else {
            console.log("No log entries found");
        }
    } catch (error) {
        console.log("Unable to retrieve logs");
    }

    console.log("\n========================================");
    console.log("Status Report Complete");
    console.log("========================================\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
