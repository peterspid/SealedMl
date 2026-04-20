const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x1b59287d686da03c68c12fcc49147597d33725524b15958879c4f76f45f84178";
  const RPC_URL = process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia.publicnode.com";

  let network;
  if (hre.network.name === "ethereumSepolia") {
    network = hre.ethers;
  } else {
    const provider = new hre.ethers.JsonRpcProvider(RPC_URL);
    const wallet = new hre.ethers.Wallet(PRIVATE_KEY, provider);
    network = wallet;
  }

  const MODEL_REGISTRY = "0x93aa420a41cE97aE4946F533a967F5611d139484";
  const SEALED_ML_INFERENCE = "0xdD055b8C51Fc8f32861A79CE0A847C80cf71FC0F";

  const [signer] = await hre.ethers.getSigners();
  console.log(`Using signer: ${signer.address}`);

  const balance = await hre.ethers.provider.getBalance(signer.address);
  console.log(`Balance: ${hre.ethers.formatEther(balance)} ETH`);

  // Step 1: Register model in ModelRegistry
  console.log("\n1. Registering model in ModelRegistry...");
  const ModelRegistry = await hre.ethers.getContractAt("ModelRegistry", MODEL_REGISTRY, signer);

  const featureSchema = [
    { name: "income_level", decimals: 1, minValue: 0, maxValue: 100, isRequired: true },
    { name: "repayment_history", decimals: 1, minValue: 0, maxValue: 100, isRequired: true },
    { name: "current_liabilities", decimals: 1, minValue: 0, maxValue: 100, isRequired: true },
    { name: "savings_behavior", decimals: 1, minValue: 0, maxValue: 100, isRequired: true },
    { name: "transaction_consistency", decimals: 1, minValue: 0, maxValue: 100, isRequired: true },
    { name: "wallet_activity", decimals: 1, minValue: 0, maxValue: 100, isRequired: true },
  ];

  try {
    const tx1 = await ModelRegistry.registerModel(
      "Credit Risk Scoring v1",
      "1.0.0",
      6,
      0,
      "Privacy-preserving credit risk scoring model using encrypted financial data",
      SEALED_ML_INFERENCE,
      featureSchema,
      { gasLimit: 3000000 }
    );
    await tx1.wait();
    console.log("Model registered!");
  } catch (e) {
    console.log("Model may already be registered, checking...");
    const modelCount = await ModelRegistry.modelCount();
    console.log(`Model count: ${modelCount}`);
  }

  // Step 2: Activate model
  console.log("\n2. Activating model...");
  try {
    const tx2 = await ModelRegistry.activateModel(0, { gasLimit: 500000 });
    await tx2.wait();
    console.log("Model activated!");
  } catch (e) {
    console.log("Model may already be activated");
  }

  // Step 3: Verify
  const activeModel = await ModelRegistry.getActiveModel();
  console.log(`\nActive model: ${activeModel.name} v${activeModel.version}`);
  console.log(`Inference contract: ${activeModel.inferenceContract}`);

  // Step 4: Check inference contract
  const SealedMLInference = await hre.ethers.getContractAt("SealedMLInference", SEALED_ML_INFERENCE, signer);
  const isInit = await SealedMLInference.isInitialized();
  console.log(`\nSealedMLInference initialized: ${isInit}`);

  const modelInfo = await SealedMLInference.getModelInfo();
  console.log(`Bias: ${modelInfo[1]}`);

  console.log("\n=== Deployment Complete ===");
  console.log(`SealedMLInference: ${SEALED_ML_INFERENCE}`);
  console.log(`ModelRegistry: ${MODEL_REGISTRY}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
