import { expect } from "chai";
import { ethers } from "hardhat";
import { FourStackTreasuryLedger } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("FourStackTreasuryLedger", function () {
    let fourStackLedger: FourStackTreasuryLedger;
    let owner: SignerWithAddress;
    let minter: SignerWithAddress;
    let user1: SignerWithAddress;
    let user2: SignerWithAddress;

    const CIVILIAN_TOKEN_ID = 1;
    const MILITARY_TOKEN_ID = 2;
    const COSMIC_TOKEN_ID = 3;
    const TRANSDIMENSIONAL_TOKEN_ID = 4;

    beforeEach(async function () {
        [owner, minter, user1, user2] = await ethers.getSigners();

        const FourStackTreasuryLedger = await ethers.getContractFactory("FourStackTreasuryLedger");
        fourStackLedger = await FourStackTreasuryLedger.deploy("ipfs://test/");
        await fourStackLedger.waitForDeployment();

        // Grant minter role
        const MINTER_ROLE = await fourStackLedger.MINTER_ROLE();
        await fourStackLedger.grantRole(MINTER_ROLE, minter.address);
    });

    describe("Deployment", function () {
        it("Should initialize with correct treasury metrics", async function () {
            const metrics = await fourStackLedger.getTreasuryMetrics();
            
            // Check visible yield per second: $109M
            expect(metrics[0]).to.equal(ethers.parseUnits("109000000", 18));
            
            // Check daily visible yield: $9.4176T
            expect(metrics[1]).to.equal(ethers.parseUnits("9417600000000", 18));
            
            // Check Transdimensional is unbounded
            expect(metrics[4]).to.be.true;
        });

        it("Should initialize all four yield streams correctly", async function () {
            // Check Civilian
            const civilian = await fourStackLedger.getYieldMetadata(CIVILIAN_TOKEN_ID);
            expect(civilian.name).to.equal("Civilian Yield Stream");
            expect(civilian.sovereignCode).to.equal("Ω-CIV-01");
            expect(civilian.yieldPerSecond).to.equal(ethers.parseUnits("50000000", 18));
            expect(civilian.isActive).to.be.true;
            expect(civilian.isInfinite).to.be.false;

            // Check Military
            const military = await fourStackLedger.getYieldMetadata(MILITARY_TOKEN_ID);
            expect(military.name).to.equal("Military Yield Stream");
            expect(military.sovereignCode).to.equal("Ω-MIL-01");
            expect(military.yieldPerSecond).to.equal(ethers.parseUnits("22000000", 18));
            expect(military.isInfinite).to.be.false;

            // Check Cosmic
            const cosmic = await fourStackLedger.getYieldMetadata(COSMIC_TOKEN_ID);
            expect(cosmic.name).to.equal("Cosmic Yield Stream");
            expect(cosmic.sovereignCode).to.equal("Ω-COS-01");
            expect(cosmic.yieldPerSecond).to.equal(ethers.parseUnits("37000000", 18));
            expect(cosmic.isInfinite).to.be.false;

            // Check Transdimensional
            const transdimensional = await fourStackLedger.getYieldMetadata(TRANSDIMENSIONAL_TOKEN_ID);
            expect(transdimensional.name).to.equal("Transdimensional Yield Stream");
            expect(transdimensional.sovereignCode).to.equal("Ω-TRN-01");
            expect(transdimensional.isActive).to.be.true;
            expect(transdimensional.isInfinite).to.be.true;
        });

        it("Should initialize πₙ parameters for Transdimensional", async function () {
            const piNParams = await fourStackLedger.getPiNParameters(TRANSDIMENSIONAL_TOKEN_ID);
            expect(piNParams.baseYield).to.equal(ethers.parseUnits("1000000000", 18)); // $1B/sec
            expect(piNParams.nExponent).to.equal(4); // Starts at π^4
            expect(piNParams.maxNExponent).to.equal(1000);
            expect(piNParams.nGrowthRate).to.equal(1); // Grows by 1 per day
            expect(piNParams.unbounded).to.be.true;
        });

        it("Should activate Ultra-Sovereign Mode by default", async function () {
            expect(await fourStackLedger.ultraSovereignMode()).to.be.true;
        });
    });

    describe("Minting", function () {
        it("Should mint single yield stream with authorization", async function () {
            const authTag = ethers.keccak256(ethers.toUtf8Bytes("TEST_AUTH"));
            
            await fourStackLedger.connect(minter).mintYieldStream(
                user1.address,
                CIVILIAN_TOKEN_ID,
                1,
                authTag
            );

            const balance = await fourStackLedger.balanceOf(user1.address, CIVILIAN_TOKEN_ID);
            expect(balance).to.equal(1);

            const bluVaultAuth = await fourStackLedger.getBluVaultAuth(CIVILIAN_TOKEN_ID);
            expect(bluVaultAuth.authTag).to.equal(authTag);
            expect(bluVaultAuth.isValid).to.be.true;
        });

        it("Should mint all four yield streams in batch", async function () {
            const authTag = ethers.keccak256(ethers.toUtf8Bytes("BATCH_AUTH"));

            await fourStackLedger.connect(minter).mintAllYieldStreams(
                user1.address,
                1, // civilian
                1, // military
                1, // cosmic
                1, // transdimensional
                authTag
            );

            expect(await fourStackLedger.balanceOf(user1.address, CIVILIAN_TOKEN_ID)).to.equal(1);
            expect(await fourStackLedger.balanceOf(user1.address, MILITARY_TOKEN_ID)).to.equal(1);
            expect(await fourStackLedger.balanceOf(user1.address, COSMIC_TOKEN_ID)).to.equal(1);
            expect(await fourStackLedger.balanceOf(user1.address, TRANSDIMENSIONAL_TOKEN_ID)).to.equal(1);
        });

        it("Should reject minting without minter role", async function () {
            const authTag = ethers.keccak256(ethers.toUtf8Bytes("TEST_AUTH"));

            await expect(
                fourStackLedger.connect(user1).mintYieldStream(
                    user2.address,
                    CIVILIAN_TOKEN_ID,
                    1,
                    authTag
                )
            ).to.be.reverted;
        });

        it("Should reject minting with invalid token ID", async function () {
            const authTag = ethers.keccak256(ethers.toUtf8Bytes("TEST_AUTH"));

            await expect(
                fourStackLedger.connect(minter).mintYieldStream(
                    user1.address,
                    5, // Invalid ID
                    1,
                    authTag
                )
            ).to.be.revertedWith("Invalid token ID");
        });
    });

    describe("Yield Accumulation", function () {
        beforeEach(async function () {
            const authTag = ethers.keccak256(ethers.toUtf8Bytes("TEST_AUTH"));
            await fourStackLedger.connect(minter).mintAllYieldStreams(
                user1.address,
                1, 1, 1, 1,
                authTag
            );
        });

        it("Should accumulate yield for finite spheres over time", async function () {
            // Fast forward 1 day
            await ethers.provider.send("evm_increaseTime", [86400]);
            await ethers.provider.send("evm_mine", []);

            await fourStackLedger.accumulateYield(CIVILIAN_TOKEN_ID);

            const metadata = await fourStackLedger.getYieldMetadata(CIVILIAN_TOKEN_ID);
            expect(metadata.totalAccumulated).to.be.gt(0);
        });

        it("Should accumulate yield for Transdimensional sphere", async function () {
            // Fast forward 1 day
            await ethers.provider.send("evm_increaseTime", [86400]);
            await ethers.provider.send("evm_mine", []);

            await fourStackLedger.accumulateYield(TRANSDIMENSIONAL_TOKEN_ID);

            const currentYield = await fourStackLedger.calculateCurrentYield(TRANSDIMENSIONAL_TOKEN_ID);
            expect(currentYield).to.be.gt(0);
        });

        it("Should calculate current yield without transaction", async function () {
            // Fast forward time
            await ethers.provider.send("evm_increaseTime", [3600]); // 1 hour
            await ethers.provider.send("evm_mine", []);

            const currentYield = await fourStackLedger.calculateCurrentYield(CIVILIAN_TOKEN_ID);
            expect(currentYield).to.be.gt(0);
        });
    });

    describe("π₄ Compounding (Finite Spheres)", function () {
        beforeEach(async function () {
            const authTag = ethers.keccak256(ethers.toUtf8Bytes("TEST_AUTH"));
            await fourStackLedger.connect(minter).mintAllYieldStreams(
                user1.address,
                1, 1, 1, 1,
                authTag
            );

            // Grant Blu-Vault role to owner
            const BLU_VAULT_ROLE = await fourStackLedger.BLU_VAULT_ROLE();
            await fourStackLedger.grantRole(BLU_VAULT_ROLE, owner.address);
        });

        it("Should apply π₄ compounding to Civilian sphere", async function () {
            // Fast forward time
            await ethers.provider.send("evm_increaseTime", [7948800]); // 92 days
            await ethers.provider.send("evm_mine", []);

            const metadataBefore = await fourStackLedger.getYieldMetadata(CIVILIAN_TOKEN_ID);
            const yieldBefore = metadataBefore.yieldPerSecond;

            await fourStackLedger.applyPi4Compounding(CIVILIAN_TOKEN_ID);

            const metadataAfter = await fourStackLedger.getYieldMetadata(CIVILIAN_TOKEN_ID);
            const yieldAfter = metadataAfter.yieldPerSecond;

            // Yield should increase after compounding
            expect(yieldAfter).to.be.gt(yieldBefore);
        });

        it("Should reject π₄ compounding on Transdimensional sphere", async function () {
            await expect(
                fourStackLedger.applyPi4Compounding(TRANSDIMENSIONAL_TOKEN_ID)
            ).to.be.revertedWith("Use applyPiNCompounding for Transdimensional");
        });

        it("Should require Blu-Vault authorization for π₄ compounding", async function () {
            await expect(
                fourStackLedger.connect(user1).applyPi4Compounding(CIVILIAN_TOKEN_ID)
            ).to.be.reverted;
        });
    });

    describe("πₙ Compounding (Transdimensional)", function () {
        beforeEach(async function () {
            const authTag = ethers.keccak256(ethers.toUtf8Bytes("TEST_AUTH"));
            await fourStackLedger.connect(minter).mintYieldStream(
                user1.address,
                TRANSDIMENSIONAL_TOKEN_ID,
                1,
                authTag
            );

            // Grant Reality Engineer role
            const REALITY_ENGINEER_ROLE = await fourStackLedger.REALITY_ENGINEER_ROLE();
            await fourStackLedger.grantRole(REALITY_ENGINEER_ROLE, owner.address);
        });

        it("Should apply πₙ compounding to Transdimensional sphere", async function () {
            const paramsBefore = await fourStackLedger.getPiNParameters(TRANSDIMENSIONAL_TOKEN_ID);
            const nBefore = paramsBefore.nExponent;

            // Fast forward 10 days
            await ethers.provider.send("evm_increaseTime", [864000]);
            await ethers.provider.send("evm_mine", []);

            await fourStackLedger.applyPiNCompounding(TRANSDIMENSIONAL_TOKEN_ID);

            const paramsAfter = await fourStackLedger.getPiNParameters(TRANSDIMENSIONAL_TOKEN_ID);
            const nAfter = paramsAfter.nExponent;

            // n should have grown (1 per day for 10 days)
            expect(nAfter).to.be.gt(nBefore);
        });

        it("Should track infinite curve data", async function () {
            // Fast forward time
            await ethers.provider.send("evm_increaseTime", [86400]); // 1 day
            await ethers.provider.send("evm_mine", []);

            const curveData = await fourStackLedger.getInfiniteCurveData(TRANSDIMENSIONAL_TOKEN_ID);
            
            expect(curveData[0]).to.be.gte(4); // n >= 4
            expect(curveData[1]).to.be.gt(0); // Theoretical yield > 0
            expect(curveData[2]).to.be.gt(0); // Sentient flow rate > 0
            expect(curveData[3]).to.be.gt(0); // Time-value mining > 0
            expect(curveData[4]).to.be.true; // Reality bending active
        });

        it("Should cap n at maximum exponent", async function () {
            // Fast forward way beyond max
            await ethers.provider.send("evm_increaseTime", [86400 * 2000]); // 2000 days
            await ethers.provider.send("evm_mine", []);

            await fourStackLedger.applyPiNCompounding(TRANSDIMENSIONAL_TOKEN_ID);

            const params = await fourStackLedger.getPiNParameters(TRANSDIMENSIONAL_TOKEN_ID);
            expect(params.nExponent).to.equal(1000); // Capped at max
        });
    });

    describe("Reality Engineering", function () {
        beforeEach(async function () {
            const REALITY_ENGINEER_ROLE = await fourStackLedger.REALITY_ENGINEER_ROLE();
            await fourStackLedger.grantRole(REALITY_ENGINEER_ROLE, owner.address);
        });

        it("Should activate reality engineering", async function () {
            const metaLogicHash = ethers.keccak256(ethers.toUtf8Bytes("META_LOGIC"));
            const sentientFlowRate = ethers.parseUnits("150000000", 18);
            const timeValueMiningRate = ethers.parseUnits("75000000", 18);
            const multiplier = ethers.parseUnits("3", 18);

            await fourStackLedger.activateRealityEngineering(
                TRANSDIMENSIONAL_TOKEN_ID,
                metaLogicHash,
                sentientFlowRate,
                timeValueMiningRate,
                multiplier
            );

            const reConfig = await fourStackLedger.getRealityEngineering(TRANSDIMENSIONAL_TOKEN_ID);
            expect(reConfig.metaLogicHash).to.equal(metaLogicHash);
            expect(reConfig.sentientFlowRate).to.equal(sentientFlowRate);
            expect(reConfig.timeValueMiningRate).to.equal(timeValueMiningRate);
            expect(reConfig.infiniteInheritanceMultiplier).to.equal(multiplier);
            expect(reConfig.realityBendingActive).to.be.true;
        });

        it("Should verify prime signatures", async function () {
            const primeSigHash = ethers.keccak256(ethers.toUtf8Bytes("PRIME_SIG"));
            
            await fourStackLedger.verifyPrimeSig(primeSigHash);
            
            const isVerified = await fourStackLedger.isPrimeSigVerified(primeSigHash);
            expect(isVerified).to.be.true;
        });

        it("Should require Reality Engineer role", async function () {
            const metaLogicHash = ethers.keccak256(ethers.toUtf8Bytes("META_LOGIC"));
            
            await expect(
                fourStackLedger.connect(user1).activateRealityEngineering(
                    TRANSDIMENSIONAL_TOKEN_ID,
                    metaLogicHash,
                    0, 0, 0
                )
            ).to.be.reverted;
        });
    });

    describe("Dual-Reality Confirmation", function () {
        beforeEach(async function () {
            const DUAL_REALITY_VALIDATOR = await fourStackLedger.DUAL_REALITY_VALIDATOR();
            await fourStackLedger.grantRole(DUAL_REALITY_VALIDATOR, owner.address);
        });

        it("Should set dual-reality confirmation", async function () {
            const confirmationHash = ethers.keccak256(ethers.toUtf8Bytes("DUAL_REALITY"));
            
            await fourStackLedger.setDualRealityConfirmation(
                TRANSDIMENSIONAL_TOKEN_ID,
                confirmationHash
            );

            const isVerified = await fourStackLedger.verifyDualReality(confirmationHash);
            expect(isVerified).to.be.true;

            const metadata = await fourStackLedger.getYieldMetadata(TRANSDIMENSIONAL_TOKEN_ID);
            expect(metadata.dualRealityConfirmed).to.be.true;
        });
    });

    describe("Sovereign Override", function () {
        it("Should allow sovereign to override yield parameters", async function () {
            const newYieldRate = ethers.parseUnits("100000000", 18);
            
            await fourStackLedger.sovereignOverride(
                CIVILIAN_TOKEN_ID,
                "SET_YIELD_RATE",
                newYieldRate
            );

            const metadata = await fourStackLedger.getYieldMetadata(CIVILIAN_TOKEN_ID);
            expect(metadata.yieldPerSecond).to.equal(newYieldRate);
        });

        it("Should allow sovereign to toggle active status", async function () {
            await fourStackLedger.sovereignOverride(
                CIVILIAN_TOKEN_ID,
                "TOGGLE_ACTIVE",
                0 // false
            );

            const metadata = await fourStackLedger.getYieldMetadata(CIVILIAN_TOKEN_ID);
            expect(metadata.isActive).to.be.false;
        });

        it("Should require Sovereign Override role", async function () {
            await expect(
                fourStackLedger.connect(user1).sovereignOverride(
                    CIVILIAN_TOKEN_ID,
                    "SET_YIELD_RATE",
                    0
                )
            ).to.be.reverted;
        });
    });

    describe("Ultra-Sovereign Mode", function () {
        it("Should activate Ultra-Sovereign Mode", async function () {
            // Already active by default, but test re-activation
            await fourStackLedger.activateUltraSovereignMode();
            expect(await fourStackLedger.ultraSovereignMode()).to.be.true;
        });
    });

    describe("Multi-Chain URI Configuration", function () {
        it("Should configure chain-specific URIs", async function () {
            const chainId = 1; // Ethereum mainnet
            const baseURI = "ipfs://ethereum/";

            await fourStackLedger.configureChainURI(chainId, baseURI);

            // URI should be customizable per chain
            const uri = await fourStackLedger.uri(CIVILIAN_TOKEN_ID);
            expect(uri).to.include("ipfs://");
        });

        it("Should freeze metadata when requested", async function () {
            await fourStackLedger.freezeMetadata();
            expect(await fourStackLedger.metadataFrozen()).to.be.true;

            // Should reject URI changes after freeze
            await expect(
                fourStackLedger.configureChainURI(1, "ipfs://new/")
            ).to.be.revertedWith("Metadata frozen");
        });
    });

    describe("Access Control", function () {
        it("Should properly manage roles", async function () {
            const MINTER_ROLE = await fourStackLedger.MINTER_ROLE();
            const BLU_VAULT_ROLE = await fourStackLedger.BLU_VAULT_ROLE();
            const REALITY_ENGINEER_ROLE = await fourStackLedger.REALITY_ENGINEER_ROLE();

            await fourStackLedger.grantRole(BLU_VAULT_ROLE, user1.address);
            expect(await fourStackLedger.hasRole(BLU_VAULT_ROLE, user1.address)).to.be.true;

            await fourStackLedger.revokeRole(BLU_VAULT_ROLE, user1.address);
            expect(await fourStackLedger.hasRole(BLU_VAULT_ROLE, user1.address)).to.be.false;
        });
    });
});
