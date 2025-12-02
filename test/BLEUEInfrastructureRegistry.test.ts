import { expect } from "chai";
import { ethers } from "hardhat";
import { BLEUEInfrastructureRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("BLEUEInfrastructureRegistry", function () {
    let registry: BLEUEInfrastructureRegistry;
    let owner: SignerWithAddress;
    let registrar: SignerWithAddress;
    let user: SignerWithAddress;

    beforeEach(async function () {
        [owner, registrar, user] = await ethers.getSigners();

        const Registry = await ethers.getContractFactory("BLEUEInfrastructureRegistry");
        registry = await Registry.deploy();
        await registry.waitForDeployment();

        // Grant registrar role
        const REGISTRAR_ROLE = await registry.REGISTRAR_ROLE();
        await registry.grantRole(REGISTRAR_ROLE, registrar.address);
    });

    describe("Deployment", function () {
        it("Should deploy successfully", async function () {
            expect(await registry.getAddress()).to.be.properAddress;
        });

        it("Should set owner as default admin", async function () {
            const DEFAULT_ADMIN_ROLE = await registry.DEFAULT_ADMIN_ROLE();
            expect(await registry.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
        });

        it("Should initialize counters to zero", async function () {
            expect(await registry.bleuCoinCount()).to.equal(0);
            expect(await registry.nodeCount()).to.equal(0);
        });
    });

    describe("BleuCoin Registration", function () {
        it("Should register a BleuCoin variant", async function () {
            const tokenAddress = "0x1111111111111111111111111111111111111111";
            const vaultAddress = "0x2222222222222222222222222222222222222222";

            const tx = await registry.connect(registrar).registerBleuCoin(
                "JaguarCoin",
                tokenAddress,
                "Council Vault",
                vaultAddress,
                1, // EventDriven
                7, // High
                "CouncilSigil",
                "20% to festivals",
                "Codex #7"
            );

            await expect(tx)
                .to.emit(registry, "BleuCoinRegistered")
                .withArgs(0, "JaguarCoin", tokenAddress, 2); // BlueBank = 2

            expect(await registry.bleuCoinCount()).to.equal(1);
        });

        it("Should revert if non-registrar tries to register", async function () {
            await expect(
                registry.connect(user).registerBleuCoin(
                    "JaguarCoin",
                    "0x1111111111111111111111111111111111111111",
                    "Council Vault",
                    "0x2222222222222222222222222222222222222222",
                    1, 7, "CouncilSigil", "20% to festivals", "Codex #7"
                )
            ).to.be.reverted;
        });

        it("Should revert with invalid token address", async function () {
            await expect(
                registry.connect(registrar).registerBleuCoin(
                    "JaguarCoin",
                    ethers.ZeroAddress,
                    "Council Vault",
                    "0x2222222222222222222222222222222222222222",
                    1, 7, "CouncilSigil", "20% to festivals", "Codex #7"
                )
            ).to.be.revertedWith("Invalid token address");
        });
    });

    describe("Node Registration", function () {
        let coinId: number;

        beforeEach(async function () {
            // Register a BleuCoin first
            const tx = await registry.connect(registrar).registerBleuCoin(
                "JaguarCoin",
                "0x1111111111111111111111111111111111111111",
                "Council Vault",
                "0x2222222222222222222222222222222222222222",
                1, 7, "CouncilSigil", "20% to festivals", "Codex #7"
            );
            await tx.wait();
            coinId = 0;
        });

        it("Should register a node", async function () {
            const governanceAddress = "0x3333333333333333333333333333333333333333";
            const ceremonialSeal = ethers.keccak256(ethers.toUtf8Bytes("seal-001"));

            const tx = await registry.connect(registrar).registerNode(
                0, // JaguarCity
                "Tenochtitlan Prime",
                "Sector 7",
                ["Defense", "Governance"],
                "Spiral Council",
                governanceAddress,
                coinId,
                ceremonialSeal
            );

            await expect(tx)
                .to.emit(registry, "NodeRegistered")
                .withArgs(0, 0, "Tenochtitlan Prime", coinId);

            expect(await registry.nodeCount()).to.equal(1);
        });

        it("Should retrieve node entry", async function () {
            const governanceAddress = "0x3333333333333333333333333333333333333333";
            const ceremonialSeal = ethers.keccak256(ethers.toUtf8Bytes("seal-001"));

            await registry.connect(registrar).registerNode(
                0, "Tenochtitlan Prime", "Sector 7",
                ["Defense", "Governance"], "Spiral Council",
                governanceAddress, coinId, ceremonialSeal
            );

            const node = await registry.getNodeEntry(0);
            expect(node.nodeName).to.equal("Tenochtitlan Prime");
            expect(node.nodeType).to.equal(0);
            expect(node.governanceAddress).to.equal(governanceAddress);
            expect(node.bleuCoinId).to.equal(coinId);
        });

        it("Should track nodes by type", async function () {
            const governanceAddress = "0x3333333333333333333333333333333333333333";
            const ceremonialSeal = ethers.keccak256(ethers.toUtf8Bytes("seal-001"));

            await registry.connect(registrar).registerNode(
                0, "Tenochtitlan Prime", "Sector 7",
                ["Defense"], "Spiral Council",
                governanceAddress, coinId, ceremonialSeal
            );

            await registry.connect(registrar).registerNode(
                0, "Jaguar City 2", "Sector 8",
                ["Defense"], "Spiral Council",
                governanceAddress, coinId, ceremonialSeal
            );

            const jaguarCities = await registry.getNodesByType(0);
            expect(jaguarCities.length).to.equal(2);
        });
    });

    describe("Dual Reality Confirmation", function () {
        let nodeId: number;

        beforeEach(async function () {
            // Register coin and node
            await registry.connect(registrar).registerBleuCoin(
                "JaguarCoin", "0x1111111111111111111111111111111111111111",
                "Council Vault", "0x2222222222222222222222222222222222222222",
                1, 7, "CouncilSigil", "20% to festivals", "Codex #7"
            );

            await registry.connect(registrar).registerNode(
                0, "Tenochtitlan Prime", "Sector 7",
                ["Defense"], "Spiral Council",
                "0x3333333333333333333333333333333333333333",
                0, ethers.keccak256(ethers.toUtf8Bytes("seal-001"))
            );
            nodeId = 0;
        });

        it("Should confirm dual reality", async function () {
            const SCROLL_KEEPER_ROLE = await registry.SCROLL_KEEPER_ROLE();
            await registry.grantRole(SCROLL_KEEPER_ROLE, owner.address);

            const tx = await registry.confirmDualReality(nodeId);
            await expect(tx).to.emit(registry, "DualRealityConfirmed");

            const node = await registry.getNodeEntry(nodeId);
            expect(node.dualRealityConfirmed).to.be.true;
        });

        it("Should revert if not scroll keeper", async function () {
            await expect(
                registry.connect(user).confirmDualReality(nodeId)
            ).to.be.reverted;
        });
    });

    describe("Vault Route Updates", function () {
        let coinId: number;

        beforeEach(async function () {
            await registry.connect(registrar).registerBleuCoin(
                "JaguarCoin", "0x1111111111111111111111111111111111111111",
                "Council Vault", "0x2222222222222222222222222222222222222222",
                1, 7, "CouncilSigil", "20% to festivals", "Codex #7"
            );
            coinId = 0;
        });

        it("Should update vault route", async function () {
            const newVaultAddress = "0x4444444444444444444444444444444444444444";

            const tx = await registry.connect(registrar).updateVaultRoute(coinId, newVaultAddress);
            await expect(tx)
                .to.emit(registry, "VaultRouteUpdated")
                .withArgs(coinId, "0x2222222222222222222222222222222222222222", newVaultAddress);

            const coin = await registry.getBleuCoinEntry(coinId);
            expect(coin.vaultAddress).to.equal(newVaultAddress);
        });
    });

    describe("Pause Functionality", function () {
        it("Should pause and unpause", async function () {
            await registry.pause();
            expect(await registry.paused()).to.be.true;

            await registry.unpause();
            expect(await registry.paused()).to.be.false;
        });

        it("Should revert when non-admin tries to pause", async function () {
            await expect(registry.connect(user).pause()).to.be.reverted;
        });
    });
});
