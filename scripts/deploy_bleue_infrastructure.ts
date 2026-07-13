import { ethers } from "hardhat";

/**
 * Deploy BLEUE Infrastructure Registry and all vault contracts
 */
async function main() {
    console.log("🌀 Deploying BLEUE Infrastructure Map Scroll Contracts...\n");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

    // ============================================
    // 1. Deploy Main Registry
    // ============================================
    console.log("📜 Deploying BLEUEInfrastructureRegistry...");
    const Registry = await ethers.getContractFactory("BLEUEInfrastructureRegistry");
    const registry = await Registry.deploy();
    await registry.waitForDeployment();
    const registryAddress = await registry.getAddress();
    console.log("✅ Registry deployed to:", registryAddress);
    console.log("");

    // Mock asset token address (replace with actual BleuCoin address)
    const assetAddress = "0x0000000000000000000000000000000000000001"; // Placeholder
    
    // Standard lock duration: 30 days
    const lockDuration = 30 * 24 * 60 * 60;

    // ============================================
    // 2. Deploy Specialized Vaults
    // ============================================
    
    // Council Vault (Jaguar Cities)
    console.log("🏛️  Deploying CouncilVault (Jaguar Cities)...");
    const CouncilVault = await ethers.getContractFactory("CouncilVault");
    const councilVault = await CouncilVault.deploy(
        assetAddress,
        lockDuration,
        3 // Required signatures
    );
    await councilVault.waitForDeployment();
    const councilVaultAddress = await councilVault.getAddress();
    console.log("✅ Council Vault deployed to:", councilVaultAddress);
    console.log("");

    // Nature Vault (Mega Parks)
    console.log("🌳 Deploying NatureVault (Mega Parks)...");
    const NatureVault = await ethers.getContractFactory("NatureVault");
    const natureVault = await NatureVault.deploy(assetAddress, lockDuration);
    await natureVault.waitForDeployment();
    const natureVaultAddress = await natureVault.getAddress();
    console.log("✅ Nature Vault deployed to:", natureVaultAddress);
    console.log("");

    // Embassy Vault (Alien Embassies)
    console.log("👽 Deploying EmbassyVault (Alien Embassies)...");
    const EmbassyVault = await ethers.getContractFactory("EmbassyVault");
    const embassyVault = await EmbassyVault.deploy(assetAddress, lockDuration);
    await embassyVault.waitForDeployment();
    const embassyVaultAddress = await embassyVault.getAddress();
    console.log("✅ Embassy Vault deployed to:", embassyVaultAddress);
    console.log("");

    // Healing Pool (Healing Temples)
    console.log("🏥 Deploying HealingPool (Healing Temples)...");
    const HealingPool = await ethers.getContractFactory("HealingPool");
    const healingPool = await HealingPool.deploy(assetAddress, lockDuration);
    await healingPool.waitForDeployment();
    const healingPoolAddress = await healingPool.getAddress();
    console.log("✅ Healing Pool deployed to:", healingPoolAddress);
    console.log("");

    // Larder Vault (Ritual Kitchens)
    console.log("🍽️  Deploying LarderVault (Ritual Kitchens)...");
    const LarderVault = await ethers.getContractFactory("LarderVault");
    const larderVault = await LarderVault.deploy(assetAddress, lockDuration);
    await larderVault.waitForDeployment();
    const larderVaultAddress = await larderVault.getAddress();
    console.log("✅ Larder Vault deployed to:", larderVaultAddress);
    console.log("");

    // Scriptorium Vault (Codex Compilers)
    console.log("📚 Deploying ScriptoriumVault (Codex Compilers)...");
    const ScriptoriumVault = await ethers.getContractFactory("ScriptoriumVault");
    const scriptoriumVault = await ScriptoriumVault.deploy(assetAddress, lockDuration);
    await scriptoriumVault.waitForDeployment();
    const scriptoriumVaultAddress = await scriptoriumVault.getAddress();
    console.log("✅ Scriptorium Vault deployed to:", scriptoriumVaultAddress);
    console.log("");

    // Cycle Vault (Spiral Nodes)
    console.log("🌀 Deploying CycleVault (Spiral Nodes)...");
    const cycleDuration = 3600; // 1 hour mood cycles
    const CycleVault = await ethers.getContractFactory("CycleVault");
    const cycleVault = await CycleVault.deploy(assetAddress, lockDuration, cycleDuration);
    await cycleVault.waitForDeployment();
    const cycleVaultAddress = await cycleVault.getAddress();
    console.log("✅ Cycle Vault deployed to:", cycleVaultAddress);
    console.log("");

    // Fractal Vault (144 Divisions)
    console.log("⭐ Deploying FractalVault (144 Divisions)...");
    const FractalVault = await ethers.getContractFactory("FractalVault");
    const fractalVault = await FractalVault.deploy(assetAddress, lockDuration);
    await fractalVault.waitForDeployment();
    const fractalVaultAddress = await fractalVault.getAddress();
    console.log("✅ Fractal Vault deployed to:", fractalVaultAddress);
    console.log("");

    // ============================================
    // Summary
    // ============================================
    console.log("=".repeat(80));
    console.log("🎉 BLEUE Infrastructure Deployment Complete!");
    console.log("=".repeat(80));
    console.log("\n📋 Contract Addresses:\n");
    console.log("Registry:            ", registryAddress);
    console.log("Council Vault:       ", councilVaultAddress);
    console.log("Nature Vault:        ", natureVaultAddress);
    console.log("Embassy Vault:       ", embassyVaultAddress);
    console.log("Healing Pool:        ", healingPoolAddress);
    console.log("Larder Vault:        ", larderVaultAddress);
    console.log("Scriptorium Vault:   ", scriptoriumVaultAddress);
    console.log("Cycle Vault:         ", cycleVaultAddress);
    console.log("Fractal Vault:       ", fractalVaultAddress);
    console.log("");

    // Save deployment info to JSON
    const deployment = {
        network: (await ethers.provider.getNetwork()).name,
        chainId: (await ethers.provider.getNetwork()).chainId.toString(),
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        contracts: {
            registry: registryAddress,
            vaults: {
                councilVault: councilVaultAddress,
                natureVault: natureVaultAddress,
                embassyVault: embassyVaultAddress,
                healingPool: healingPoolAddress,
                larderVault: larderVaultAddress,
                scriptoriumVault: scriptoriumVaultAddress,
                cycleVault: cycleVaultAddress,
                fractalVault: fractalVaultAddress
            }
        }
    };

    console.log("💾 Deployment configuration saved.");
    console.log("\n" + JSON.stringify(deployment, null, 2));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
