import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deploySealedMLContracts: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy, execute } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log(`Deploying SealedML contracts to ${network.name}...`);
  console.log(`Deployer: ${deployer}`);

  // Deploy ModelRegistry
  const modelRegistry = await deploy("ModelRegistry", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
  console.log(`ModelRegistry deployed at: ${modelRegistry.address}`);

  // Deploy SealedMLInference
  const sealedMLInference = await deploy("SealedMLInference", {
    from: deployer,
    args: [modelRegistry.address],
    log: true,
    autoMine: true,
  });
  console.log(`SealedMLInference deployed at: ${sealedMLInference.address}`);

  // Deploy ResultManager
  const resultManager = await deploy("ResultManager", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
  console.log(`ResultManager deployed at: ${resultManager.address}`);

  // Deploy AccessControl
  const accessControl = await deploy("AccessControl", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
  console.log(`AccessControl deployed at: ${accessControl.address}`);

  // Initialize model with weights
  // Financial scoring model: income, repayment history, liabilities, savings, consistency, activity
  // Weights tuned for credit risk assessment
  const featureWeights = [
    15,   // income factor (positive)
    25,   // repayment history (strong positive)
    -20,  // current liabilities (negative)
    10,   // savings behavior (positive)
    15,   // transaction consistency (positive)
    5,    // wallet activity (positive)
  ];
  const bias = 50;  // Base score
  const decimals = 1;

  // Risk thresholds (0-100 scale)
  const lowRiskMax = 70;
  const mediumRiskMax = 85;
  const highRiskMax = 100;

  console.log("Initializing model with weights...");
  await execute(
    "SealedMLInference",
    { from: deployer, autoMine: true },
    "initializeModel",
    featureWeights,
    bias,
    decimals,
    lowRiskMax,
    mediumRiskMax,
    highRiskMax
  );
  console.log("Model initialized successfully");

  // Register the model
  const featureSchema = [
    { name: "income_level", decimals: 1, minValue: 0, maxValue: 100, isRequired: true },
    { name: "repayment_history", decimals: 1, minValue: 0, maxValue: 100, isRequired: true },
    { name: "current_liabilities", decimals: 1, minValue: 0, maxValue: 100, isRequired: true },
    { name: "savings_behavior", decimals: 1, minValue: 0, maxValue: 100, isRequired: true },
    { name: "transaction_consistency", decimals: 1, minValue: 0, maxValue: 100, isRequired: true },
    { name: "wallet_activity", decimals: 1, minValue: 0, maxValue: 100, isRequired: true },
  ];

  console.log("Registering model in ModelRegistry...");
  await execute(
    "ModelRegistry",
    { from: deployer, autoMine: true },
    "registerModel",
    "Credit Risk Scoring v1",
    "1.0.0",
    6,  // featureCount
    0,  // outputType: score
    "Privacy-preserving credit risk scoring model using encrypted financial data",
    sealedMLInference.address,
    featureSchema
  );
  console.log("Model registered successfully");

  // Activate the model
  console.log("Activating model...");
  await execute(
    "ModelRegistry",
    { from: deployer, autoMine: true },
    "activateModel",
    0  // modelId
  );
  console.log("Model activated successfully");

  // Grant permissions to ResultManager for AccessControl
  await execute(
    "AccessControl",
    { from: deployer, autoMine: true },
    "grantPermission",
    resultManager.address,
    2  // Decrypt level
  );
  console.log("Permissions granted to ResultManager");

  console.log("\n=== Deployment Summary ===");
  console.log(`Network: ${network.name}`);
  console.log(`ModelRegistry: ${modelRegistry.address}`);
  console.log(`SealedMLInference: ${sealedMLInference.address}`);
  console.log(`ResultManager: ${resultManager.address}`);
  console.log(`AccessControl: ${accessControl.address}`);
  console.log("==========================\n");
};

deploySealedMLContracts.tags = ["SealedML", "ModelRegistry", "SealedMLInference", "ResultManager", "AccessControl"];
deploySealedMLContracts.dependencies = [];

export default deploySealedMLContracts;
