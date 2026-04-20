const hre = require("hardhat");

async function main() {
  const MODEL_REGISTRY = "0x93aa420a41cE97aE4946F533a967F5611d139484";
  const NEW_SEALED_ML_INFERENCE = "0xdD055b8C51Fc8f32861A79CE0A847C80cf71FC0F";

  const [signer] = await hre.ethers.getSigners();
  console.log(`Using signer: ${signer.address}`);

  const balance = await hre.ethers.provider.getBalance(signer.address);
  console.log(`Balance: ${hre.ethers.formatEther(balance)} ETH`);

  const ModelRegistry = await hre.ethers.getContractAt("ModelRegistry", MODEL_REGISTRY, signer);

  const featureSchema = [
    { name: "income_level", decimals: 1, minValue: 0, maxValue: 100, isRequired: true },
    { name: "repayment_history", decimals: 1, minValue: 0, maxValue: 100, isRequired: true },
    { name: "current_liabilities", decimals: 1, minValue: 0, maxValue: 100, isRequired: true },
    { name: "savings_behavior", decimals: 1, minValue: 0, maxValue: 100, isRequired: true },
    { name: "transaction_consistency", decimals: 1, minValue: 0, maxValue: 100, isRequired: true },
    { name: "wallet_activity", decimals: 1, minValue: 0, maxValue: 100, isRequired: true },
  ];

  console.log("\n1. Registering NEW model (v1.1) in ModelRegistry...");
  try {
    const tx = await ModelRegistry.registerModel(
      "Credit Risk Scoring v1.1",
      "1.1.0",
      6,
      0,
      "Privacy-preserving credit risk scoring with FHE - FIXED",
      NEW_SEALED_ML_INFERENCE,
      featureSchema,
      { gasLimit: 3000000 }
    );
    await tx.wait();
    console.log("New model registered!");
  } catch (e) {
    console.log("Registration failed:", e.message);
    return;
  }

  const modelCount = await ModelRegistry.modelCount();
  console.log(`Total models: ${modelCount}`);

  // Activate model 1 (the new one)
  console.log("\n2. Activating model 1 (NEW contract)...");
  try {
    const tx2 = await ModelRegistry.activateModel(1, { gasLimit: 500000 });
    await tx2.wait();
    console.log("Model 1 activated!");
  } catch (e) {
    console.log("Activation:", e.message);
    return;
  }

  // Verify
  const activeModel = await ModelRegistry.getActiveModel();
  console.log(`\nActive model: ${activeModel.name} v${activeModel.version}`);
  console.log(`Inference contract: ${activeModel.inferenceContract}`);
  console.log(`Expected: ${NEW_SEALED_ML_INFERENCE}`);
  console.log(`Match: ${activeModel.inferenceContract.toLowerCase() === NEW_SEALED_ML_INFERENCE.toLowerCase() ? 'YES ✓' : 'NO ✗'}`);

  // Check new contract is initialized
  const SealedMLInference = await hre.ethers.getContractAt("SealedMLInference", NEW_SEALED_ML_INFERENCE, signer);
  const isInit = await SealedMLInference.isInitialized();
  const modelInfo = await SealedMLInference.getModelInfo();
  console.log(`\nNew SealedMLInference initialized: ${isInit}`);
  console.log(`Weights: [${modelInfo[0].join(', ')}]`);
  console.log(`Bias: ${modelInfo[1]}`);

  console.log("\n=== NEW CONTRACT ADDRESSES ===");
  console.log(`SealedMLInference (NEW): ${NEW_SEALED_ML_INFERENCE}`);
  console.log(`ModelRegistry: ${MODEL_REGISTRY}`);
  console.log(`ResultManager: 0x206636e6866123186DB0EC244284867ce438DCc3`);
  console.log(`AccessControl: 0xA1A8475C86BEE09dffb0b76184d5DE3b6a7A3eAb`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
