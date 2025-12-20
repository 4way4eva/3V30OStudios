import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { EV0LVerseDigitalMilitaryBase } from "../typechain-types";

describe("EV0LVerseDigitalMilitaryBase", function () {
    let militaryBase: EV0LVerseDigitalMilitaryBase;
    let owner: SignerWithAddress;
    let commander: SignerWithAddress;
    let trainer: SignerWithAddress;
    let deployer: SignerWithAddress;
    let officer: SignerWithAddress;

    beforeEach(async function () {
        [owner, commander, trainer, deployer, officer] = await ethers.getSigners();

        const MilitaryBase = await ethers.getContractFactory("EV0LVerseDigitalMilitaryBase");
        militaryBase = await MilitaryBase.deploy();
        await militaryBase.waitForDeployment();

        // Setup roles
        const BASE_COMMANDER_ROLE = await militaryBase.BASE_COMMANDER_ROLE();
        const TRAINING_OFFICER_ROLE = await militaryBase.TRAINING_OFFICER_ROLE();
        const DEPLOYMENT_OFFICER_ROLE = await militaryBase.DEPLOYMENT_OFFICER_ROLE();

        await militaryBase.grantRole(BASE_COMMANDER_ROLE, commander.address);
        await militaryBase.grantRole(TRAINING_OFFICER_ROLE, trainer.address);
        await militaryBase.grantRole(DEPLOYMENT_OFFICER_ROLE, deployer.address);
    });

    describe("Base Activation", function () {
        it("Should activate the base with valid ceremonial seal", async function () {
            const ceremonialSeal = ethers.keccak256(ethers.toUtf8Bytes("TEST_SEAL"));
            
            await expect(militaryBase.activateBase(ceremonialSeal))
                .to.emit(militaryBase, "BaseActivated")
                .withArgs(ceremonialSeal, await ethers.provider.getBlockNumber());

            const status = await militaryBase.getBaseStatus();
            expect(status.activated).to.be.true;
        });

        it("Should not allow activation with zero seal", async function () {
            const zeroSeal = ethers.ZeroHash;
            
            await expect(militaryBase.activateBase(zeroSeal))
                .to.be.revertedWith("Invalid ceremonial seal");
        });

        it("Should not allow double activation", async function () {
            const ceremonialSeal = ethers.keccak256(ethers.toUtf8Bytes("TEST_SEAL"));
            
            await militaryBase.activateBase(ceremonialSeal);
            
            await expect(militaryBase.activateBase(ceremonialSeal))
                .to.be.revertedWith("Base already activated");
        });
    });

    describe("Soldier Minting", function () {
        beforeEach(async function () {
            const ceremonialSeal = ethers.keccak256(ethers.toUtf8Bytes("TEST_SEAL"));
            await militaryBase.activateBase(ceremonialSeal);
        });

        it("Should mint a VR humanoid soldier", async function () {
            const metadataURI = "ipfs://test/soldier1.json";
            
            await expect(
                militaryBase.connect(commander).mintSoldier(
                    1, // VR_HUMANOID
                    true, // VR compatible
                    officer.address,
                    metadataURI
                )
            ).to.emit(militaryBase, "SoldierMinted");

            const soldier = await militaryBase.getSoldier(0);
            expect(soldier.soldierType).to.equal(1); // VR_HUMANOID
            expect(soldier.isVRCompatible).to.be.true;
            expect(soldier.status).to.equal(0); // RECRUIT
            expect(soldier.commandingOfficer).to.equal(officer.address);
        });

        it("Should mint an AI entity soldier", async function () {
            const metadataURI = "ipfs://test/soldier2.json";
            
            await militaryBase.connect(commander).mintSoldier(
                0, // AI_ENTITY
                false,
                officer.address,
                metadataURI
            );

            const soldier = await militaryBase.getSoldier(0);
            expect(soldier.soldierType).to.equal(0); // AI_ENTITY
            expect(soldier.isVRCompatible).to.be.false;
        });

        it("Should not allow minting before base activation", async function () {
            const MilitaryBase = await ethers.getContractFactory("EV0LVerseDigitalMilitaryBase");
            const newBase = await MilitaryBase.deploy();
            await newBase.waitForDeployment();

            const BASE_COMMANDER_ROLE = await newBase.BASE_COMMANDER_ROLE();
            await newBase.grantRole(BASE_COMMANDER_ROLE, commander.address);

            await expect(
                newBase.connect(commander).mintSoldier(1, true, officer.address, "ipfs://test")
            ).to.be.revertedWith("Base not activated");
        });

        it("Should require BASE_COMMANDER_ROLE to mint", async function () {
            await expect(
                militaryBase.connect(officer).mintSoldier(1, true, officer.address, "ipfs://test")
            ).to.be.reverted;
        });
    });

    describe("Training System", function () {
        let tokenId: bigint;

        beforeEach(async function () {
            const ceremonialSeal = ethers.keccak256(ethers.toUtf8Bytes("TEST_SEAL"));
            await militaryBase.activateBase(ceremonialSeal);
            
            // Mint a soldier
            const tx = await militaryBase.connect(commander).mintSoldier(
                1, // VR_HUMANOID
                true,
                officer.address,
                "ipfs://test/soldier.json"
            );
            const receipt = await tx.wait();
            const event = receipt?.logs.find(
                (log: any) => log.fragment && log.fragment.name === 'SoldierMinted'
            );
            tokenId = event?.args?.tokenId;
        });

        it("Should record training simulation and update score", async function () {
            const evolDutySessionId = ethers.keccak256(ethers.toUtf8Bytes("SESSION_001"));
            const score = 8500;
            const objectives = ["Objective1", "Objective2"];

            await expect(
                militaryBase.connect(trainer).recordTrainingSimulation(
                    tokenId,
                    evolDutySessionId,
                    score,
                    objectives
                )
            ).to.emit(militaryBase, "TrainingCompleted");

            const soldier = await militaryBase.getSoldier(tokenId);
            expect(soldier.trainingScore).to.equal(score);
        });

        it("Should promote recruit to active with sufficient score", async function () {
            const evolDutySessionId = ethers.keccak256(ethers.toUtf8Bytes("SESSION_001"));
            const score = 7500; // Above 7000 threshold

            await militaryBase.connect(trainer).recordTrainingSimulation(
                tokenId,
                evolDutySessionId,
                score,
                ["Objective1"]
            );

            const soldier = await militaryBase.getSoldier(tokenId);
            expect(soldier.status).to.equal(2); // ACTIVE
        });

        it("Should not promote with insufficient score", async function () {
            const evolDutySessionId = ethers.keccak256(ethers.toUtf8Bytes("SESSION_001"));
            const score = 6500; // Below 7000 threshold

            await militaryBase.connect(trainer).recordTrainingSimulation(
                tokenId,
                evolDutySessionId,
                score,
                ["Objective1"]
            );

            const soldier = await militaryBase.getSoldier(tokenId);
            expect(soldier.status).to.equal(0); // Still RECRUIT
        });

        it("Should reject invalid training score", async function () {
            const evolDutySessionId = ethers.keccak256(ethers.toUtf8Bytes("SESSION_001"));
            const score = 15000; // Above max 10000

            await expect(
                militaryBase.connect(trainer).recordTrainingSimulation(
                    tokenId,
                    evolDutySessionId,
                    score,
                    ["Objective1"]
                )
            ).to.be.revertedWith("Invalid score");
        });
    });

    describe("Defense Grid", function () {
        beforeEach(async function () {
            const ceremonialSeal = ethers.keccak256(ethers.toUtf8Bytes("TEST_SEAL"));
            await militaryBase.activateBase(ceremonialSeal);
        });

        it("Should create defense grid", async function () {
            await expect(
                militaryBase.connect(commander).createDefenseGrid(
                    0, // CYBER layer
                    0, // SAFE_HAVEN zone
                    8500 // strength
                )
            ).to.emit(militaryBase, "DefenseGridCreated");

            const grid = await militaryBase.getDefenseGrid(0);
            expect(grid.layer).to.equal(0);
            expect(grid.strength).to.equal(8500);
            expect(grid.isActive).to.be.true;
        });

        it("Should update defense grid strength", async function () {
            await militaryBase.connect(commander).createDefenseGrid(0, 0, 8000);

            await expect(
                militaryBase.connect(commander).updateDefenseGrid(0, 9000)
            ).to.emit(militaryBase, "DefenseGridUpdated");

            const grid = await militaryBase.getDefenseGrid(0);
            expect(grid.strength).to.equal(9000);
        });

        it("Should track total defense strength", async function () {
            await militaryBase.connect(commander).createDefenseGrid(0, 0, 5000);
            await militaryBase.connect(commander).createDefenseGrid(1, 1, 6000);

            const status = await militaryBase.getBaseStatus();
            expect(status.defenseStrength).to.equal(11000);
        });

        it("Should reject invalid strength values", async function () {
            await expect(
                militaryBase.connect(commander).createDefenseGrid(0, 0, 15000)
            ).to.be.revertedWith("Invalid strength");
        });
    });

    describe("Deployment System", function () {
        let tokenId1: bigint;
        let tokenId2: bigint;

        beforeEach(async function () {
            const ceremonialSeal = ethers.keccak256(ethers.toUtf8Bytes("TEST_SEAL"));
            await militaryBase.activateBase(ceremonialSeal);
            
            // Mint and train two soldiers
            for (let i = 0; i < 2; i++) {
                const mintTx = await militaryBase.connect(commander).mintSoldier(
                    1, // VR_HUMANOID
                    true,
                    officer.address,
                    `ipfs://test/soldier${i}.json`
                );
                const receipt = await mintTx.wait();
                const event = receipt?.logs.find(
                    (log: any) => log.fragment && log.fragment.name === 'SoldierMinted'
                );
                const tokenId = event?.args?.tokenId;
                
                // Train to active status
                await militaryBase.connect(trainer).recordTrainingSimulation(
                    tokenId,
                    ethers.keccak256(ethers.toUtf8Bytes(`SESSION_${i}`)),
                    8000,
                    ["Training"]
                );

                if (i === 0) tokenId1 = tokenId;
                else tokenId2 = tokenId;
            }
        });

        it("Should deploy soldiers on mission", async function () {
            const missionBrief = ethers.keccak256(ethers.toUtf8Bytes("PATROL_MISSION"));
            
            await expect(
                militaryBase.connect(deployer).deploySoldiers(
                    [tokenId1, tokenId2],
                    3, // PATROL mission
                    2, // CORRIDOR_TRANSIT zone
                    missionBrief,
                    3600 // 1 hour
                )
            ).to.emit(militaryBase, "DeploymentCreated");

            const soldier1 = await militaryBase.getSoldier(tokenId1);
            expect(soldier1.status).to.equal(3); // DEPLOYED
            expect(soldier1.deploymentCount).to.equal(1);
        });

        it("Should complete deployment successfully", async function () {
            const missionBrief = ethers.keccak256(ethers.toUtf8Bytes("PATROL_MISSION"));
            
            const deployTx = await militaryBase.connect(deployer).deploySoldiers(
                [tokenId1],
                3, // PATROL
                2, // CORRIDOR_TRANSIT
                missionBrief,
                3600
            );
            const receipt = await deployTx.wait();
            const event = receipt?.logs.find(
                (log: any) => log.fragment && log.fragment.name === 'DeploymentCreated'
            );
            const deploymentId = event?.args?.deploymentId;

            const afterActionReport = ethers.keccak256(ethers.toUtf8Bytes("MISSION_SUCCESS"));
            
            await expect(
                militaryBase.connect(deployer).completeDeployment(
                    deploymentId,
                    true, // successful
                    afterActionReport
                )
            ).to.emit(militaryBase, "DeploymentCompleted");

            const soldier = await militaryBase.getSoldier(tokenId1);
            expect(soldier.status).to.equal(4); // STANDBY
            expect(soldier.successfulMissions).to.equal(1);
        });

        it("Should not deploy non-active soldiers", async function () {
            // Mint a recruit (not trained)
            const mintTx = await militaryBase.connect(commander).mintSoldier(
                0, // AI_ENTITY
                false,
                officer.address,
                "ipfs://test/recruit.json"
            );
            const receipt = await mintTx.wait();
            const event = receipt?.logs.find(
                (log: any) => log.fragment && log.fragment.name === 'SoldierMinted'
            );
            const recruitTokenId = event?.args?.tokenId;

            const missionBrief = ethers.keccak256(ethers.toUtf8Bytes("MISSION"));
            
            await expect(
                militaryBase.connect(deployer).deploySoldiers(
                    [recruitTokenId],
                    3, // PATROL
                    2, // CORRIDOR_TRANSIT
                    missionBrief,
                    3600
                )
            ).to.be.revertedWith("Soldier not deployable");
        });
    });

    describe("Watchtower Logging", function () {
        it("Should create logs for base activation", async function () {
            const ceremonialSeal = ethers.keccak256(ethers.toUtf8Bytes("TEST_SEAL"));
            await militaryBase.activateBase(ceremonialSeal);

            const logs = await militaryBase.exportWatchtowerLogs(0, 1);
            expect(logs.length).to.equal(1);
            expect(logs[0].tribunalValid).to.be.true;
        });

        it("Should create logs for soldier minting", async function () {
            const ceremonialSeal = ethers.keccak256(ethers.toUtf8Bytes("TEST_SEAL"));
            await militaryBase.activateBase(ceremonialSeal);
            
            await militaryBase.connect(commander).mintSoldier(
                1,
                true,
                officer.address,
                "ipfs://test"
            );

            const logs = await militaryBase.exportWatchtowerLogs(0, 10);
            expect(logs.length).to.be.greaterThan(1);
        });

        it("Should export multiple log entries", async function () {
            const ceremonialSeal = ethers.keccak256(ethers.toUtf8Bytes("TEST_SEAL"));
            await militaryBase.activateBase(ceremonialSeal);
            
            // Create multiple grids to generate logs
            for (let i = 0; i < 3; i++) {
                await militaryBase.connect(commander).createDefenseGrid(i % 4, 0, 8000);
            }

            const logs = await militaryBase.exportWatchtowerLogs(0, 10);
            expect(logs.length).to.be.greaterThan(3);
        });
    });

    describe("Emergency Controls", function () {
        it("Should pause and resume operations", async function () {
            const ceremonialSeal = ethers.keccak256(ethers.toUtf8Bytes("TEST_SEAL"));
            await militaryBase.activateBase(ceremonialSeal);

            await militaryBase.emergencyPause();

            // Should not be able to mint while paused
            await expect(
                militaryBase.connect(commander).mintSoldier(1, true, officer.address, "ipfs://test")
            ).to.be.reverted;

            await militaryBase.resumeOperations();

            // Should work after resume
            await expect(
                militaryBase.connect(commander).mintSoldier(1, true, officer.address, "ipfs://test")
            ).to.emit(militaryBase, "SoldierMinted");
        });
    });
});
