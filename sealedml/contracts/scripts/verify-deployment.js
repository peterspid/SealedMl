const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  console.log(`Verifier: ${signer.address}\n`);

  const MODEL_REGISTRY = "0x93aa420a41cE97aE4946F533a967F5611d139484";
  const SEALED_ML_INFERENCE_NEW = "0xdD055b8C51Fc8f32861A79CE0A847C80cf71FC0F";
  const SEALED_ML_INFERENCE_OLD = "0x3F4867D6279e419feC7A432AeFA2c65c8368d91b";
  const RESULT_MANAGER = "0x206636e6866123186DB0EC244284867ce438DCc3";
  const ACCESS_CONTROL = "0xA1A8475C86BEE09dffb0b76184d5DE3b6a7A3eAb";

  console.log("=== CONTRACT VERIFICATION ===\n");

  // Check ModelRegistry
  const ModelRegistry = await hre.ethers.getContractAt("ModelRegistry", MODEL_REGISTRY, signer);
  const modelCount = await ModelRegistry.modelCount();
  const activeModelId = await ModelRegistry.activeModelId();
  console.log(`ModelRegistry (${MODEL_REGISTRY}):`);
  console.log(`  Model count: ${modelCount}`);
  console.log(`  Active model ID: ${activeModelId}`);

  try {
    const activeModel = await ModelRegistry.getActiveModel();
    console.log(`  Active model: ${activeModel.name} v${activeModel.version}`);
    console.log(`  Inference contract: ${activeModel.inferenceContract}`);
    console.log(`  OLD contract match: ${activeModel.inferenceContract.toLowerCase() === SEALED_ML_INFERENCE_OLD.toLowerCase()}`);
    console.log(`  NEW contract match: ${activeModel.inferenceContract.toLowerCase() === SEALED_ML_INFERENCE_NEW.toLowerCase()}`);
  } catch (e) {
    console.log(`  Error getting active model: ${e.message}`);
  }

  // Check OLD SealedMLInference
  console.log(`\nOLD SealedMLInference (${SEALED_ML_INFERENCE_OLD}):`);
  try {
    const oldContract = await hre.ethers.getContractAt("SealedMLInference", SEALED_ML_INFERENCE_OLD, signer);
    const oldInit = await oldContract.isInitialized();
    console.log(`  Initialized: ${oldInit}`);
    if (oldInit) {
      const oldModelInfo = await oldContract.getModelInfo();
      console.log(`  Weights: [${oldModelInfo[0].join(', ')}]`);
      console.log(`  Bias: ${oldModelInfo[1]}`);
    }
  } catch (e) {
    console.log(`  Contract check failed: ${e.message}`);
  }

  // Check NEW SealedMLInference
  console.log(`\nNEW SealedMLInference (${SEALED_ML_INFERENCE_NEW}):`);
  try {
    const newContract = await hre.ethers.getContractAt("SealedMLInference", SEALED_ML_INFERENCE_NEW, signer);
    const newInit = await newContract.isInitialized();
    console.log(`  Initialized: ${newInit}`);
    if (newInit) {
      const newModelInfo = await newContract.getModelInfo();
      console.log(`  Weights: [${newModelInfo[0].join(', ')}]`);
      console.log(`  Bias: ${newModelInfo[1]}`);
      console.log(`  Inference count: ${await newContract.inferenceCount()}`);
    }
  } catch (e) {
    console.log(`  Contract check failed: ${e.message}`);
  }

  // Check ResultManager
  console.log(`\nResultManager (${RESULT_MANAGER}):`);
  try {
    const ResultManager = await hre.ethers.getContractAt("ResultManager", RESULT_MANAGER, signer);
    const rmOwner = await ResultManager.owner();
    console.log(`  Owner: ${rmOwner}`);
  } catch (e) {
    console.log(`  Contract check failed: ${e.message}`);
  }

  // Check AccessControl
  console.log(`\nAccessControl (${ACCESS_CONTROL}):`);
  try {
    const AccessControl = await hre.ethers.getContractAt("AccessControl", ACCESS_CONTROL, signer);
    const acOwner = await AccessControl.owner();
    console.log(`  Owner: ${acOwner}`);
  } catch (e) {
    console.log(`  Contract check failed: ${e.message}`);
  }

  console.log("\n=== FRONTEND CONFIG ===");
  console.log(`NEXT_PUBLIC_SEALED_ML_ETH=0xdD055b8C51Fc8f32861A79CE0A847C80cf71FC0F`);
  console.log(`NEXT_PUBLIC_MODEL_REGISTRY_ETH=${MODEL_REGISTRY}`);
  console.log(`NEXT_PUBLIC_RESULT_MANAGER_ETH=${RESULT_MANAGER}`);
  console.log(`NEXT_PUBLIC_ACCESS_CONTROL_ETH=${ACCESS_CONTROL}`);
}

main().catch(console.error);
