import { ethers } from "hardhat";
import { writeFileSync } from "fs";
import { join } from "path";

/**
 * Export Watchtower Logs to CSV
 * 
 * This script exports tribunal-valid Watchtower logs from the military base
 * to CSV format for dashboard integration and tribunal review.
 */

async function main() {
    console.log("========================================");
    console.log("Watchtower CSV Export Utility");
    console.log("========================================\n");

    const MILITARY_BASE_ADDRESS = process.env.MILITARY_BASE_ADDRESS || "";
    
    if (!MILITARY_BASE_ADDRESS) {
        console.error("Error: MILITARY_BASE_ADDRESS not set in environment");
        process.exit(1);
    }

    console.log("Military Base Address:", MILITARY_BASE_ADDRESS, "\n");

    const militaryBase = await ethers.getContractAt("EV0LVerseDigitalMilitaryBase", MILITARY_BASE_ADDRESS);

    // Get base status to determine log count
    const baseStatus = await militaryBase.getBaseStatus();
    console.log("Base Activated:", baseStatus.activated);
    console.log("Fetching Watchtower logs...\n");

    // Determine how many logs to export
    const batchSize = 100;
    let currentIndex = 0;
    let allLogs: any[] = [];
    let hasMore = true;

    while (hasMore) {
        try {
            const logs = await militaryBase.exportWatchtowerLogs(currentIndex, batchSize);
            
            if (logs.length === 0) {
                hasMore = false;
                break;
            }

            allLogs = allLogs.concat(logs);
            currentIndex += logs.length;
            
            console.log(`Fetched ${logs.length} logs (total: ${allLogs.length})...`);

            if (logs.length < batchSize) {
                hasMore = false;
            }
        } catch (error) {
            hasMore = false;
        }
    }

    console.log(`\nTotal logs retrieved: ${allLogs.length}\n`);

    if (allLogs.length === 0) {
        console.log("No logs to export");
        process.exit(0);
    }

    // Convert to CSV format
    console.log("Converting to CSV format...");

    const csvHeader = "EntryID,Timestamp,ISO_DateTime,EventType,EntityReference,Actor,DataHash,TribunalValid\n";
    
    const csvRows = allLogs.map((log) => {
        const timestamp = Number(log.timestamp);
        const isoDateTime = new Date(timestamp * 1000).toISOString();
        
        return [
            log.entryId.toString(),
            timestamp.toString(),
            isoDateTime,
            log.eventType,
            log.entityReference,
            log.actor,
            log.dataHash,
            log.tribunalValid.toString()
        ].join(',');
    });

    const csvContent = csvHeader + csvRows.join('\n');

    // Save to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `watchtower_logs_${timestamp}.csv`;
    const filepath = join(process.cwd(), 'deployments', filename);

    writeFileSync(filepath, csvContent);
    console.log(`✓ CSV exported to: ${filepath}\n`);

    // Generate summary statistics
    console.log("========================================");
    console.log("Export Summary");
    console.log("========================================");
    console.log("Total Entries:", allLogs.length);
    console.log("Tribunal-Valid Entries:", allLogs.filter(l => l.tribunalValid).length);
    
    // Event type breakdown
    const eventTypes = new Map<string, number>();
    allLogs.forEach(log => {
        const eventType = log.eventType;
        eventTypes.set(eventType, (eventTypes.get(eventType) || 0) + 1);
    });

    console.log("\nEvent Type Breakdown:");
    eventTypes.forEach((count, eventType) => {
        console.log(`  ${eventType.slice(0, 30)}...: ${count}`);
    });

    // Time range
    if (allLogs.length > 0) {
        const timestamps = allLogs.map(l => Number(l.timestamp));
        const minTime = Math.min(...timestamps);
        const maxTime = Math.max(...timestamps);
        
        console.log("\nTime Range:");
        console.log("  First Entry:", new Date(minTime * 1000).toISOString());
        console.log("  Last Entry:", new Date(maxTime * 1000).toISOString());
        console.log("  Duration:", ((maxTime - minTime) / 3600).toFixed(2), "hours");
    }

    // Actor breakdown
    const actors = new Map<string, number>();
    allLogs.forEach(log => {
        const actor = log.actor;
        actors.set(actor, (actors.get(actor) || 0) + 1);
    });

    console.log("\nActor Activity:");
    const sortedActors = Array.from(actors.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    sortedActors.forEach(([actor, count]) => {
        console.log(`  ${actor.slice(0, 10)}...: ${count} actions`);
    });

    console.log("\n========================================");
    console.log("Export Complete");
    console.log("========================================");
    console.log("\nNext Steps:");
    console.log("1. Import CSV into Watchtower Dashboard");
    console.log("2. Review tribunal-valid entries");
    console.log("3. Analyze event patterns and actor activity");
    console.log("4. Generate compliance reports\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
