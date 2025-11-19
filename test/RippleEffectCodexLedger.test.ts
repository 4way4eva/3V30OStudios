import { expect } from "chai";
import { ethers } from "hardhat";

/**
 * Tests for RippleEffectCodexLedger contract
 * 
 * Note: These tests validate the contract structure and core functionality
 * for the Ripple Effect system with zone-specific signatures.
 */

describe("RippleEffectCodexLedger", function () {
  let rippleContract: any;
  let owner: any;
  let addr1: any;
  let addr2: any;

  const ZONES = {
    AQUATIC_VORTEX: 0,
    TROPICORE_DOME: 1,
    VOLCANIC_RIFT: 2,
    POLAR_WOMB: 3,
    DIMENSIONAL_SPIRAL: 4,
    GALACTIC_NEXUS: 5
  };

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const RippleEffectCodexLedger = await ethers.getContractFactory("RippleEffectCodexLedger");
    rippleContract = await RippleEffectCodexLedger.deploy();
    await rippleContract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct roles for deployer", async function () {
      const DEFAULT_ADMIN_ROLE = await rippleContract.DEFAULT_ADMIN_ROLE();
      const RIPPLE_GENERATOR_ROLE = await rippleContract.RIPPLE_GENERATOR_ROLE();
      const TRIBUNAL_AUDITOR_ROLE = await rippleContract.TRIBUNAL_AUDITOR_ROLE();
      const WATCHTOWER_ROLE = await rippleContract.WATCHTOWER_ROLE();
      const SORA_COMPLIANCE_ROLE = await rippleContract.SORA_COMPLIANCE_ROLE();

      expect(await rippleContract.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
      expect(await rippleContract.hasRole(RIPPLE_GENERATOR_ROLE, owner.address)).to.be.true;
      expect(await rippleContract.hasRole(TRIBUNAL_AUDITOR_ROLE, owner.address)).to.be.true;
      expect(await rippleContract.hasRole(WATCHTOWER_ROLE, owner.address)).to.be.true;
      expect(await rippleContract.hasRole(SORA_COMPLIANCE_ROLE, owner.address)).to.be.true;
    });

    it("Should activate all zones by default", async function () {
      for (let i = 0; i < 6; i++) {
        expect(await rippleContract.zoneActive(i)).to.be.true;
      }
    });

    it("Should start with zero ripples and logs", async function () {
      expect(await rippleContract.getTotalRipples()).to.equal(0);
      expect(await rippleContract.getTotalLogs()).to.equal(0);
    });
  });

  describe("Zone Names", function () {
    it("Should return correct zone names", async function () {
      expect(await rippleContract.getZoneName(ZONES.AQUATIC_VORTEX)).to.equal("Aquatic Vortex");
      expect(await rippleContract.getZoneName(ZONES.TROPICORE_DOME)).to.equal("TropiCore Dome");
      expect(await rippleContract.getZoneName(ZONES.VOLCANIC_RIFT)).to.equal("Volcanic Rift");
      expect(await rippleContract.getZoneName(ZONES.POLAR_WOMB)).to.equal("Polar Womb");
      expect(await rippleContract.getZoneName(ZONES.DIMENSIONAL_SPIRAL)).to.equal("Dimensional Spiral");
      expect(await rippleContract.getZoneName(ZONES.GALACTIC_NEXUS)).to.equal("Galactic Nexus");
    });
  });

  describe("Ripple Signature Creation", function () {
    it("Should create a ripple signature with all components", async function () {
      const originShard = ethers.id("SHARD-AQUA-001");
      
      const temporalWave = {
        waveId: 0,
        timestamp: Math.floor(Date.now() / 1000),
        frequency: ethers.parseEther("432"),
        amplitude: ethers.parseEther("7500"),
        phase: "0",
        waveSignature: ethers.id("WAVE-TEST")
      };

      const auditEcho = {
        echoId: 0,
        auditor: owner.address,
        auditTimestamp: Math.floor(Date.now() / 1000),
        auditHash: ethers.id("AUDIT-TEST"),
        auditNotes: "Test audit",
        isVerified: true
      };

      const ancestorShards = [
        ethers.id("ANCESTOR-1"),
        ethers.id("ANCESTOR-2"),
        ethers.id("ANCESTOR-3")
      ];

      const lineageResonance = {
        originShard: originShard,
        ancestorShards: ancestorShards,
        resonanceDepth: ancestorShards.length,
        resonanceStrength: ethers.parseEther("0.95"),
        lineageHash: ethers.id("LINEAGE-TEST")
      };

      const pulseIntent = {
        intentHash: ethers.id("INTENT-TEST"),
        intentDescription: "Test intent description",
        initiator: owner.address,
        energyAllocation: ethers.parseEther("15000"),
        intentMetadata: ethers.toUtf8Bytes("test metadata")
      };

      const sovereigntySeals = ethers.id("SEAL-TEST");

      await expect(
        rippleContract.createRippleSignature(
          ZONES.AQUATIC_VORTEX,
          originShard,
          temporalWave,
          auditEcho,
          lineageResonance,
          pulseIntent,
          sovereigntySeals
        )
      ).to.emit(rippleContract, "RippleSignatureCreated")
        .and.to.emit(rippleContract, "TemporalWaveGenerated")
        .and.to.emit(rippleContract, "AuditEchoRecorded")
        .and.to.emit(rippleContract, "LineageResonanceEstablished")
        .and.to.emit(rippleContract, "PulseIntentLogged")
        .and.to.emit(rippleContract, "WatchtowerLogCreated");

      expect(await rippleContract.getTotalRipples()).to.equal(1);
      expect(await rippleContract.getTotalLogs()).to.equal(1);
    });

    it("Should fail if zone is not active", async function () {
      await rippleContract.deactivateZone(ZONES.AQUATIC_VORTEX);

      const originShard = ethers.id("SHARD-AQUA-001");
      const temporalWave = {
        waveId: 0,
        timestamp: Math.floor(Date.now() / 1000),
        frequency: ethers.parseEther("432"),
        amplitude: ethers.parseEther("7500"),
        phase: "0",
        waveSignature: ethers.id("WAVE-TEST")
      };

      await expect(
        rippleContract.createRippleSignature(
          ZONES.AQUATIC_VORTEX,
          originShard,
          temporalWave,
          { echoId: 0, auditor: owner.address, auditTimestamp: 0, auditHash: ethers.id("TEST"), auditNotes: "", isVerified: true },
          { originShard: originShard, ancestorShards: [], resonanceDepth: 0, resonanceStrength: 0, lineageHash: ethers.id("TEST") },
          { intentHash: ethers.id("TEST"), intentDescription: "", initiator: owner.address, energyAllocation: 0, intentMetadata: "0x" },
          ethers.id("SEAL-TEST")
        )
      ).to.be.revertedWith("Zone is not active");
    });

    it("Should fail if origin shard is invalid", async function () {
      const temporalWave = {
        waveId: 0,
        timestamp: Math.floor(Date.now() / 1000),
        frequency: ethers.parseEther("432"),
        amplitude: ethers.parseEther("7500"),
        phase: "0",
        waveSignature: ethers.id("WAVE-TEST")
      };

      await expect(
        rippleContract.createRippleSignature(
          ZONES.AQUATIC_VORTEX,
          ethers.ZeroHash,
          temporalWave,
          { echoId: 0, auditor: owner.address, auditTimestamp: 0, auditHash: ethers.id("TEST"), auditNotes: "", isVerified: true },
          { originShard: ethers.ZeroHash, ancestorShards: [], resonanceDepth: 0, resonanceStrength: 0, lineageHash: ethers.id("TEST") },
          { intentHash: ethers.id("TEST"), intentDescription: "", initiator: owner.address, energyAllocation: 0, intentMetadata: "0x" },
          ethers.id("SEAL-TEST")
        )
      ).to.be.revertedWith("Invalid origin shard");
    });
  });

  describe("SORA Compliance", function () {
    it("Should update SORA compliance status", async function () {
      // First create a ripple
      const originShard = ethers.id("SHARD-TEST");
      const temporalWave = {
        waveId: 0,
        timestamp: Math.floor(Date.now() / 1000),
        frequency: ethers.parseEther("432"),
        amplitude: ethers.parseEther("7500"),
        phase: "0",
        waveSignature: ethers.id("WAVE-TEST")
      };

      await rippleContract.createRippleSignature(
        ZONES.AQUATIC_VORTEX,
        originShard,
        temporalWave,
        { echoId: 0, auditor: owner.address, auditTimestamp: 0, auditHash: ethers.id("TEST"), auditNotes: "", isVerified: true },
        { originShard: originShard, ancestorShards: [], resonanceDepth: 0, resonanceStrength: 0, lineageHash: ethers.id("TEST") },
        { intentHash: ethers.id("TEST"), intentDescription: "", initiator: owner.address, energyAllocation: 0, intentMetadata: "0x" },
        ethers.id("SEAL-TEST")
      );

      // Update SORA compliance to COMPLIANT (enum value 1)
      await expect(rippleContract.updateSORACompliance(0, 1))
        .to.emit(rippleContract, "SORAComplianceUpdated");

      expect(await rippleContract.rippleSORAStatus(0)).to.equal(1);
    });
  });

  describe("Zone Management", function () {
    it("Should activate and deactivate zones", async function () {
      await expect(rippleContract.deactivateZone(ZONES.AQUATIC_VORTEX))
        .to.emit(rippleContract, "ZoneDeactivated");

      expect(await rippleContract.zoneActive(ZONES.AQUATIC_VORTEX)).to.be.false;

      await expect(rippleContract.activateZone(ZONES.AQUATIC_VORTEX))
        .to.emit(rippleContract, "ZoneActivated");

      expect(await rippleContract.zoneActive(ZONES.AQUATIC_VORTEX)).to.be.true;
    });
  });

  describe("Access Control", function () {
    it("Should restrict ripple creation to RIPPLE_GENERATOR_ROLE", async function () {
      const originShard = ethers.id("SHARD-TEST");
      const temporalWave = {
        waveId: 0,
        timestamp: Math.floor(Date.now() / 1000),
        frequency: ethers.parseEther("432"),
        amplitude: ethers.parseEther("7500"),
        phase: "0",
        waveSignature: ethers.id("WAVE-TEST")
      };

      await expect(
        rippleContract.connect(addr1).createRippleSignature(
          ZONES.AQUATIC_VORTEX,
          originShard,
          temporalWave,
          { echoId: 0, auditor: owner.address, auditTimestamp: 0, auditHash: ethers.id("TEST"), auditNotes: "", isVerified: true },
          { originShard: originShard, ancestorShards: [], resonanceDepth: 0, resonanceStrength: 0, lineageHash: ethers.id("TEST") },
          { intentHash: ethers.id("TEST"), intentDescription: "", initiator: owner.address, energyAllocation: 0, intentMetadata: "0x" },
          ethers.id("SEAL-TEST")
        )
      ).to.be.reverted;
    });

    it("Should restrict SORA compliance updates to SORA_COMPLIANCE_ROLE", async function () {
      await expect(
        rippleContract.connect(addr1).updateSORACompliance(0, 1)
      ).to.be.reverted;
    });
  });

  describe("Tribunal Notes", function () {
    it("Should allow tribunal auditors to add notes", async function () {
      // First create a ripple to generate a log
      const originShard = ethers.id("SHARD-TEST");
      const temporalWave = {
        waveId: 0,
        timestamp: Math.floor(Date.now() / 1000),
        frequency: ethers.parseEther("432"),
        amplitude: ethers.parseEther("7500"),
        phase: "0",
        waveSignature: ethers.id("WAVE-TEST")
      };

      await rippleContract.createRippleSignature(
        ZONES.AQUATIC_VORTEX,
        originShard,
        temporalWave,
        { echoId: 0, auditor: owner.address, auditTimestamp: 0, auditHash: ethers.id("TEST"), auditNotes: "", isVerified: true },
        { originShard: originShard, ancestorShards: [], resonanceDepth: 0, resonanceStrength: 0, lineageHash: ethers.id("TEST") },
        { intentHash: ethers.id("TEST"), intentDescription: "", initiator: owner.address, energyAllocation: 0, intentMetadata: "0x" },
        ethers.id("SEAL-TEST")
      );

      const log = await rippleContract.getWatchtowerLog(0);
      expect(log.tribunalNotes).to.equal("Ripple effect logged for tribunal review");

      await rippleContract.addTribunalNotes(0, "Additional tribunal notes");
      
      const updatedLog = await rippleContract.getWatchtowerLog(0);
      expect(updatedLog.tribunalNotes).to.equal("Additional tribunal notes");
    });
  });
});
