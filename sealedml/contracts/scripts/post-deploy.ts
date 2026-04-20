import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const postDeploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { execute } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("Running post-deployment steps...");

  // Contract addresses (already deployed)
  const MODEL_REGISTRY = "0x93aa420a41cE97aE4946F533a967F5611d139484";
  const SEALED_ML_INFERENCE = "0xdD055b8C51Fc8f32861A79CE0A847C80cf71FC0F";
  const RESULT_MANAGER = "0x206636e6866123186DB0EC244284867ce438DCc3";

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
    SEALED_ML_INFERENCE,
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

  // Grant permissions to ResultManager
  console.log("Granting permissions to ResultManager...");
  await execute(
    "AccessControl",
    { from: deployer, autoMine: true },
    "grantPermission",
    RESULT_MANAGER,
    2  // Decrypt level
  );
  console.log("Permissions granted");

  console.log("\n=== Post-Deployment Complete ===");
  console.log(`ModelRegistry: ${MODEL_REGISTRY}`);
  console.log(`SealedMLInference: ${SEALED_ML_INFERENCE}`);
  console.log(`ResultManager: ${RESULT_MANAGER}`);
  console.log("==================================\n");
};

postDeploy.tags = ["PostDeploy"];
postDeploy.dependencies = [];

export default postDeploy;
