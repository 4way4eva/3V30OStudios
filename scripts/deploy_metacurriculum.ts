import { ethers } from "hardhat";

/**
 * Deploy MetaCurriculum Contract
 * 
 * This script deploys the ENFT proof system for ZIONAIRE certifications
 * and curriculum compliance tracking in the BLEUE Academy infrastructure.
 */
async function main() {
  console.log("🌀 Deploying MetaCurriculum System...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy MetaCurriculum
  console.log("📜 Deploying MetaCurriculum...");
  const MetaCurriculum = await ethers.getContractFactory("MetaCurriculum");
  const curriculum = await MetaCurriculum.deploy(deployer.address);
  await curriculum.waitForDeployment();
  
  const curriculumAddress = await curriculum.getAddress();
  console.log("✅ MetaCurriculum deployed to:", curriculumAddress);

  // Grant additional roles
  console.log("\n👑 Setting up roles...");
  
  const EDUCATOR_ROLE = await curriculum.EDUCATOR_ROLE();
  const CERTIFIER_ROLE = await curriculum.CERTIFIER_ROLE();
  const CURRICULUM_ADMIN_ROLE = await curriculum.CURRICULUM_ADMIN_ROLE();
  
  console.log("- Granting EDUCATOR_ROLE to deployer...");
  await curriculum.grantRole(EDUCATOR_ROLE, deployer.address);
  
  console.log("- Granting CERTIFIER_ROLE to deployer...");
  await curriculum.grantRole(CERTIFIER_ROLE, deployer.address);
  
  console.log("- Granting CURRICULUM_ADMIN_ROLE to deployer...");
  await curriculum.grantRole(CURRICULUM_ADMIN_ROLE, deployer.address);

  // Display level requirements
  console.log("\n🎓 Education Level Requirements (Credit Hours):");
  const levels = [
    { id: 0, name: "Preschool" },
    { id: 1, name: "Elementary" },
    { id: 2, name: "Middle School" },
    { id: 3, name: "High School" },
    { id: 4, name: "Undergraduate" },
    { id: 5, name: "Graduate" },
    { id: 6, name: "Doctoral" },
    { id: 7, name: "Professional" }
  ];
  
  for (const level of levels) {
    const requirement = await curriculum.levelRequirements(level.id);
    console.log(`- ${level.name}: ${requirement} credit hours`);
  }

  // Create example curriculum modules
  console.log("\n📚 Creating example curriculum modules...");
  
  // Elementary module
  console.log("- Creating Elementary Mathematics module...");
  const elemMathTx = await curriculum.createModule(
    "Elementary Mathematics",
    "Foundation mathematics for elementary level",
    1, // ELEMENTARY level
    3, // 3 credit hours
    ethers.keccak256(ethers.toUtf8Bytes("Elementary Math Content")),
    [] // no prerequisites
  );
  await elemMathTx.wait();
  console.log("✅ Elementary Mathematics module created (ID: 0)");

  // High School module with prerequisites
  console.log("- Creating High School Advanced Mathematics module...");
  const hsMathTx = await curriculum.createModule(
    "Advanced Mathematics",
    "Advanced mathematics for high school level",
    3, // HIGH_SCHOOL level
    4, // 4 credit hours
    ethers.keccak256(ethers.toUtf8Bytes("High School Math Content")),
    [0] // requires Elementary Mathematics
  );
  await hsMathTx.wait();
  console.log("✅ Advanced Mathematics module created (ID: 1)");

  // Undergraduate module
  console.log("- Creating Undergraduate Blockchain Technology module...");
  const undergradTx = await curriculum.createModule(
    "Blockchain Technology",
    "Introduction to blockchain and smart contracts",
    4, // UNDERGRADUATE level
    3, // 3 credit hours
    ethers.keccak256(ethers.toUtf8Bytes("Blockchain Content")),
    [] // no prerequisites
  );
  await undergradTx.wait();
  console.log("✅ Blockchain Technology module created (ID: 2)");

  // Graduate module with prerequisites
  console.log("- Creating Graduate Advanced Smart Contracts module...");
  const gradTx = await curriculum.createModule(
    "Advanced Smart Contracts",
    "Deep dive into smart contract security and optimization",
    5, // GRADUATE level
    4, // 4 credit hours
    ethers.keccak256(ethers.toUtf8Bytes("Advanced Smart Contracts Content")),
    [2] // requires Blockchain Technology
  );
  await gradTx.wait();
  console.log("✅ Advanced Smart Contracts module created (ID: 3)");

  // Enroll a student in a module
  console.log("\n👨‍🎓 Enrolling student (deployer) in Elementary Mathematics...");
  const enrollTx = await curriculum.enrollStudent(0, deployer.address);
  await enrollTx.wait();
  console.log("✅ Student enrolled");

  // Complete the module
  console.log("- Completing Elementary Mathematics module...");
  const completeTx = await curriculum.completeModule(
    0, // module ID
    deployer.address,
    95, // score
    ethers.keccak256(ethers.toUtf8Bytes("ENFT Proof of Completion"))
  );
  await completeTx.wait();
  console.log("✅ Module completed with score 95");

  // Verify the module
  console.log("- Verifying Elementary Mathematics module...");
  const verifyTx = await curriculum.verifyModule(0, deployer.address);
  await verifyTx.wait();
  console.log("✅ Module verified");

  // Check compliance
  const compliance = await curriculum.complianceRecords(deployer.address, 1); // ELEMENTARY level
  console.log("\n📊 Student Compliance Status (Elementary Level):");
  console.log(`- Completed Modules: ${compliance.completedModules}`);
  console.log(`- Earned Credits: ${compliance.earnedCredits}`);
  console.log(`- Meets Requirements: ${compliance.meetsRequirements ? "✅ Yes" : "❌ No"}`);

  console.log("\n" + "=".repeat(60));
  console.log("🎉 Deployment Complete!");
  console.log("=".repeat(60));
  console.log("\nContract Addresses:");
  console.log("- MetaCurriculum:", curriculumAddress);
  console.log("\nModules Created:");
  console.log("- Module 0: Elementary Mathematics (3 credits)");
  console.log("- Module 1: Advanced Mathematics (4 credits)");
  console.log("- Module 2: Blockchain Technology (3 credits)");
  console.log("- Module 3: Advanced Smart Contracts (4 credits)");
  console.log("\nNext Steps:");
  console.log("1. Create more curriculum modules using createModule()");
  console.log("2. Enroll students using enrollStudent()");
  console.log("3. Complete and verify modules");
  console.log("4. Issue ZIONAIRE certifications using issueCertification()");
  console.log("5. Verify contract on block explorer:");
  console.log(`   npx hardhat verify --network <network> ${curriculumAddress} ${deployer.address}`);
  console.log("\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
