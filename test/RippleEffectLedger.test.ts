import { expect } from "chai";
import { ethers } from "hardhat";
import { RippleEffectLedger } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("RippleEffectLedger", function () {
  let rippleEffectLedger: RippleEffectLedger;
  let owner: SignerWithAddress;
  let activator: SignerWithAddress;
  let guardian: SignerWithAddress;
  let watchtower: SignerWithAddress;

  beforeEach(async function () {
    [owner, activator, guardian, watchtower] = await ethers.getSigners();

    const RippleEffectLedger = await ethers.getContractFactory("RippleEffectLedger");
    rippleEffectLedger = await RippleEffectLedger.deploy(owner.address);
    await rippleEffectLedger.waitForDeployment();

    // Grant roles
    const RIPPLE_ACTIVATOR_ROLE = await rippleEffectLedger.RIPPLE_ACTIVATOR_ROLE();
    const SORA_GUARDIAN_ROLE = await rippleEffectLedger.SORA_GUARDIAN_ROLE();
    const WATCHTOWER_ROLE = await rippleEffectLedger.WATCHTOWER_ROLE();

    await rippleEffectLedger.grantRole(RIPPLE_ACTIVATOR_ROLE, activator.address);
    await rippleEffectLedger.grantRole(SORA_GUARDIAN_ROLE, guardian.address);
    await rippleEffectLedger.grantRole(WATCHTOWER_ROLE, watchtower.address);
  });

  describe("Deployment", function () {
    it("Should initialize with correct admin", async function () {
      const DEFAULT_ADMIN_ROLE = await rippleEffectLedger.DEFAULT_ADMIN_ROLE();
      expect(await rippleEffectLedger.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
    });

    it("Should initialize all six zone signatures", async function () {
      const zones = [0, 1, 2, 3, 4, 5]; // Six zones
      
      for (const zoneId of zones) {
        const signature = await rippleEffectLedger.zoneSignatures(zoneId);
        expect(signature.isActive).to.be.true;
        expect(signature.amplificationFactor).to.be.gte(10000); // At least 1.00x
      }
    });

    it("Should set correct amplification factors for zones", async function () {
      // Check Dimensional Spiral has highest amplification (2.00x = 20000 basis points)
      const dimensionalSpiral = await rippleEffectLedger.zoneSignatures(4);
      expect(dimensionalSpiral.amplificationFactor).to.equal(20000);

      // Check Aquatic Vortex (1.10x = 11000 basis points)
      const aquaticVortex = await rippleEffectLedger.zoneSignatures(0);
      expect(aquaticVortex.amplificationFactor).to.equal(11000);
    });
  });

  describe("Ripple Activation", function () {
    it("Should activate a ripple successfully", async function () {
      const ceremorialHash = ethers.keccak256(ethers.toUtf8Bytes("TEST_CEREMONIAL_HASH"));
      
      await expect(
        rippleEffectLedger.connect(activator).activateRipple(
          "Test Shard",
          ethers.ZeroAddress !== "0x0000000000000000000000000000000000000001" 
            ? "0x0000000000000000000000000000000000000001" 
            : await owner.getAddress(),
          0, // ShardType.HEALING
          0, // Zone.AQUATIC_VORTEX
          0, // Umbrella.SORA
          ceremorialHash
        )
      ).to.emit(rippleEffectLedger, "RippleActivated");
    });

    it("Should fail when non-activator tries to activate ripple", async function () {
      const ceremorialHash = ethers.keccak256(ethers.toUtf8Bytes("TEST_CEREMONIAL_HASH"));
      
      await expect(
        rippleEffectLedger.connect(guardian).activateRipple(
          "Test Shard",
          "0x0000000000000000000000000000000000000001",
          0,
          0,
          0,
          ceremorialHash
        )
      ).to.be.reverted;
    });

    it("Should generate unique ripple signatures", async function () {
      const ceremorialHash1 = ethers.keccak256(ethers.toUtf8Bytes("HASH_1"));
      const ceremorialHash2 = ethers.keccak256(ethers.toUtf8Bytes("HASH_2"));

      await rippleEffectLedger.connect(activator).activateRipple(
        "Shard 1",
        "0x0000000000000000000000000000000000000001",
        0,
        0,
        0,
        ceremorialHash1
      );

      await rippleEffectLedger.connect(activator).activateRipple(
        "Shard 2",
        "0x0000000000000000000000000000000000000001",
        0,
        0,
        0,
        ceremorialHash2
      );

      const [event1] = await rippleEffectLedger.getRippleTrace(0);
      const [event2] = await rippleEffectLedger.getRippleTrace(1);

      expect(event1.rippleSignature).to.not.equal(event2.rippleSignature);
    });
  });

  describe("SORA Amplification", function () {
    it("Should amplify a ripple and update density score", async function () {
      const ceremorialHash = ethers.keccak256(ethers.toUtf8Bytes("TEST_HASH"));
      
      await rippleEffectLedger.connect(activator).activateRipple(
        "Test Shard",
        "0x0000000000000000000000000000000000000001",
        0,
        0,
        0,
        ceremorialHash
      );

      await rippleEffectLedger.connect(guardian).amplifyRipple(0);

      const [event] = await rippleEffectLedger.getRippleTrace(0);
      expect(event.isAmplified).to.be.true;
      expect(event.densityScore).to.be.gte(70); // Green tier minimum
    });

    it("Should fail when amplifying already amplified ripple", async function () {
      const ceremorialHash = ethers.keccak256(ethers.toUtf8Bytes("TEST_HASH"));
      
      await rippleEffectLedger.connect(activator).activateRipple(
        "Test Shard",
        "0x0000000000000000000000000000000000000001",
        0,
        0,
        0,
        ceremorialHash
      );

      await rippleEffectLedger.connect(guardian).amplifyRipple(0);

      await expect(
        rippleEffectLedger.connect(guardian).amplifyRipple(0)
      ).to.be.revertedWith("RippleEffectLedger: already amplified");
    });
  });

  describe("Echoes", function () {
    it("Should add echoes to a ripple", async function () {
      const ceremorialHash = ethers.keccak256(ethers.toUtf8Bytes("TEST_HASH"));
      
      await rippleEffectLedger.connect(activator).activateRipple(
        "Test Shard",
        "0x0000000000000000000000000000000000000001",
        0,
        0,
        0,
        ceremorialHash
      );

      await rippleEffectLedger.connect(activator).addEcho(0, "First echo");
      await rippleEffectLedger.connect(activator).addEcho(0, "Second echo");

      const [, effect] = await rippleEffectLedger.getRippleTrace(0);
      expect(effect.echoes.length).to.equal(2);
      expect(effect.echoes[0]).to.equal("First echo");
      expect(effect.echoes[1]).to.equal("Second echo");
    });

    it("Should increase interlink count when adding echoes", async function () {
      const ceremorialHash = ethers.keccak256(ethers.toUtf8Bytes("TEST_HASH"));
      
      await rippleEffectLedger.connect(activator).activateRipple(
        "Test Shard",
        "0x0000000000000000000000000000000000000001",
        0,
        0,
        0,
        ceremorialHash
      );

      await rippleEffectLedger.connect(activator).addEcho(0, "Echo 1");
      await rippleEffectLedger.connect(activator).addEcho(0, "Echo 2");
      await rippleEffectLedger.connect(activator).addEcho(0, "Echo 3");

      const [, effect] = await rippleEffectLedger.getRippleTrace(0);
      expect(effect.interlinkCount).to.equal(3);
      expect(effect.impactScore).to.equal(30); // 10 per echo
    });
  });

  describe("Lineage", function () {
    it("Should extend lineage between parent and child ripples", async function () {
      const hash1 = ethers.keccak256(ethers.toUtf8Bytes("HASH_1"));
      const hash2 = ethers.keccak256(ethers.toUtf8Bytes("HASH_2"));

      await rippleEffectLedger.connect(activator).activateRipple(
        "Parent Shard", "0x0000000000000000000000000000000000000001", 0, 0, 0, hash1
      );

      await rippleEffectLedger.connect(activator).activateRipple(
        "Child Shard", "0x0000000000000000000000000000000000000002", 0, 0, 0, hash2
      );

      await rippleEffectLedger.connect(activator).extendLineage(0, 1);

      const [, , parentLineage] = await rippleEffectLedger.getRippleTrace(0);
      const [, , childLineage] = await rippleEffectLedger.getRippleTrace(1);

      expect(childLineage.generationDepth).to.equal(1);
      expect(childLineage.ancestralRoot).to.equal(parentLineage.ancestralRoot);
    });
  });

  describe("Watchtower Integration", function () {
    it("Should record audit echo", async function () {
      const ceremorialHash = ethers.keccak256(ethers.toUtf8Bytes("TEST_HASH"));
      
      await rippleEffectLedger.connect(activator).activateRipple(
        "Test Shard",
        "0x0000000000000000000000000000000000000001",
        0,
        0,
        0,
        ceremorialHash
      );

      const auditHash = ethers.keccak256(ethers.toUtf8Bytes("AUDIT_DATA"));
      const watchtowerEntry = "2025-11-18T23:45:00Z,TEST_SHARD,0,ACTIVATED,SORA,GREEN_TIER";

      await expect(
        rippleEffectLedger.connect(watchtower).recordAuditEcho(0, auditHash, watchtowerEntry)
      ).to.emit(rippleEffectLedger, "AuditEchoRecorded");

      const entry = await rippleEffectLedger.watchtowerEntries(0);
      expect(entry).to.equal(watchtowerEntry);
    });
  });

  describe("Pulse Archive", function () {
    it("Should archive pulse data", async function () {
      const ceremorialHash = ethers.keccak256(ethers.toUtf8Bytes("TEST_HASH"));
      
      await rippleEffectLedger.connect(activator).activateRipple(
        "Test Shard",
        "0x0000000000000000000000000000000000000001",
        0,
        0,
        0,
        ceremorialHash
      );

      const pulseData = ethers.toUtf8Bytes("ELECTROMAGNETIC_PULSE_DATA");

      await expect(
        rippleEffectLedger.connect(activator).archivePulse(0, pulseData)
      ).to.emit(rippleEffectLedger, "PulseArchived");

      const [, effect] = await rippleEffectLedger.getRippleTrace(0);
      expect(effect.pulseArchiveHash).to.not.equal(ethers.ZeroHash);
    });
  });

  describe("Ripple Sealing", function () {
    it("Should seal a ripple", async function () {
      const ceremorialHash = ethers.keccak256(ethers.toUtf8Bytes("TEST_HASH"));
      
      await rippleEffectLedger.connect(activator).activateRipple(
        "Test Shard",
        "0x0000000000000000000000000000000000000001",
        0,
        0,
        0,
        ceremorialHash
      );

      await expect(
        rippleEffectLedger.connect(guardian).sealRipple(0)
      ).to.emit(rippleEffectLedger, "RippleSealed");

      const [, effect] = await rippleEffectLedger.getRippleTrace(0);
      expect(effect.isSealed).to.be.true;
    });

    it("Should prevent modifications after sealing", async function () {
      const ceremorialHash = ethers.keccak256(ethers.toUtf8Bytes("TEST_HASH"));
      
      await rippleEffectLedger.connect(activator).activateRipple(
        "Test Shard",
        "0x0000000000000000000000000000000000000001",
        0,
        0,
        0,
        ceremorialHash
      );

      await rippleEffectLedger.connect(guardian).sealRipple(0);

      await expect(
        rippleEffectLedger.connect(activator).addEcho(0, "Cannot add")
      ).to.be.revertedWith("RippleEffectLedger: ripple is sealed");
    });
  });

  describe("Query Functions", function () {
    it("Should retrieve ripples by contract address", async function () {
      const hash1 = ethers.keccak256(ethers.toUtf8Bytes("HASH_1"));
      const hash2 = ethers.keccak256(ethers.toUtf8Bytes("HASH_2"));
      const contractAddr = "0x0000000000000000000000000000000000000001";

      await rippleEffectLedger.connect(activator).activateRipple(
        "Shard 1", contractAddr, 0, 0, 0, hash1
      );
      await rippleEffectLedger.connect(activator).activateRipple(
        "Shard 2", contractAddr, 0, 0, 0, hash2
      );

      const ripples = await rippleEffectLedger.getRipplesByContract(contractAddr);
      expect(ripples.length).to.equal(2);
    });

    it("Should retrieve ripples by shard type", async function () {
      const hash1 = ethers.keccak256(ethers.toUtf8Bytes("HASH_1"));
      const hash2 = ethers.keccak256(ethers.toUtf8Bytes("HASH_2"));

      await rippleEffectLedger.connect(activator).activateRipple(
        "Gem 1", "0x0000000000000000000000000000000000000001", 1, 0, 0, hash1
      );
      await rippleEffectLedger.connect(activator).activateRipple(
        "Gem 2", "0x0000000000000000000000000000000000000002", 1, 0, 0, hash2
      );

      const ripples = await rippleEffectLedger.getRipplesByShardType(1); // GEM type
      expect(ripples.length).to.equal(2);
    });
  });
});
