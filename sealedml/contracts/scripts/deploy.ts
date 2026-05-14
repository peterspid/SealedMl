import { ethers, network } from "hardhat";

async function deployContract(name: string, args: unknown[] = []) {
  const factory = await ethers.getContractFactory(name);
  const contract = await factory.deploy(...args);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  const deploymentTx = contract.deploymentTransaction();
  console.log(`${name} deployed at: ${address}`);
  if (deploymentTx) {
    console.log(`${name} tx: ${deploymentTx.hash}`);
  }

  return contract;
}

async function waitForTx(label: string, txPromise: Promise<{ wait: () => Promise<unknown> }>) {
  const tx = await txPromise;
  await tx.wait();
  console.log(label);
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();

  console.log(`Deploying SealedML contracts to ${network.name}...`);
  console.log(`Deployer: ${deployerAddress}`);

  const modelRegistry = await deployContract("ModelRegistry");
  const resultManager = await deployContract("ResultManager");

  const modelRegistryAddress = await modelRegistry.getAddress();
  const resultManagerAddress = await resultManager.getAddress();
  const sealedMLInference = await deployContract("SealedMLInference", [
    modelRegistryAddress,
    resultManagerAddress,
  ]);
  const sealedMLInferenceAddress = await sealedMLInference.getAddress();

  await waitForTx(
    "Result recorder configured",
    resultManager.setResultRecorder(sealedMLInferenceAddress)
  );

  const accessControl = await deployContract("AccessControl");
  const accessControlAddress = await accessControl.getAddress();

  const featureWeights = [
    -2,   // income factor lowers risk
    -3,   // repayment history lowers risk
    6,    // current liabilities raise risk
    -2,   // savings behavior lowers risk
    -2,   // transaction consistency lowers risk
    -1,   // wallet activity lowers risk
  ];
  const bias = 70;
  const decimals = 1;
  const lowRiskMax = 40;
  const mediumRiskMax = 70;
  const highRiskMax = 100;

  await waitForTx(
    "Model initialized successfully",
    sealedMLInference.initializeModel(
      featureWeights,
      bias,
      decimals,
      lowRiskMax,
      mediumRiskMax,
      highRiskMax
    )
  );

  const featureSchema = [
    { name: "income_level", decimals: 1, minValue: 0, maxValue: 100, isRequired: true },
    { name: "repayment_history", decimals: 1, minValue: 0, maxValue: 100, isRequired: true },
    { name: "current_liabilities", decimals: 1, minValue: 0, maxValue: 100, isRequired: true },
    { name: "savings_behavior", decimals: 1, minValue: 0, maxValue: 100, isRequired: true },
    { name: "transaction_consistency", decimals: 1, minValue: 0, maxValue: 100, isRequired: true },
    { name: "wallet_activity", decimals: 1, minValue: 0, maxValue: 100, isRequired: true },
  ];

  await waitForTx(
    "Model registered successfully",
    modelRegistry.registerModel(
      "Credit Risk Scoring v1.1",
      "1.1.0",
      6,
      0,
      "Privacy-preserving credit risk scoring model using encrypted financial data with bounded on-chain inputs",
      sealedMLInferenceAddress,
      featureSchema
    )
  );

  await waitForTx("Model activated successfully", modelRegistry.activateModel(0));

  await waitForTx(
    "Permissions granted to ResultManager",
    accessControl.grantPermission(resultManagerAddress, 2)
  );

  console.log("\n=== Deployment Summary ===");
  console.log(`Network: ${network.name}`);
  console.log(`ModelRegistry: ${modelRegistryAddress}`);
  console.log(`SealedMLInference: ${sealedMLInferenceAddress}`);
  console.log(`ResultManager: ${resultManagerAddress}`);
  console.log(`AccessControl: ${accessControlAddress}`);
  console.log("==========================\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
