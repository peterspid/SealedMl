import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { Encryptable } from "@cofhe/sdk";

const WEIGHTS = [-2, -3, 6, -2, -2, -1];
const BIAS = 70;
const DECIMALS = 1;
const LOW_RISK_MAX = 40;
const MEDIUM_RISK_MAX = 70;
const HIGH_RISK_MAX = 100;

function expectedScore(values: number[]) {
  const scale = 10 ** DECIMALS;
  const positive = BIAS * scale + values.reduce((sum, value, index) => {
    const weight = WEIGHTS[index] ?? 0;
    return weight > 0 ? sum + value * weight : sum;
  }, 0);
  const negative = values.reduce((sum, value, index) => {
    const weight = WEIGHTS[index] ?? 0;
    return weight < 0 ? sum + value * Math.abs(weight) : sum;
  }, 0);

  return Math.min(HIGH_RISK_MAX, Math.floor(Math.max(0, positive - negative) / scale));
}

function expectedRiskClass(score: number) {
  if (score <= LOW_RISK_MAX) return 0;
  if (score <= MEDIUM_RISK_MAX) return 1;
  return 2;
}

async function deployFixture() {
  const [owner, borrower, lender, outsider] = await ethers.getSigners();

  const modelRegistry = await ethers.deployContract("ModelRegistry");
  const resultManager = await ethers.deployContract("ResultManager");
  const inference = await ethers.deployContract("SealedMLInference", [
    await modelRegistry.getAddress(),
    await resultManager.getAddress(),
  ]);

  await resultManager.setResultRecorder(await inference.getAddress());
  await inference.initializeModel(
    WEIGHTS,
    BIAS,
    DECIMALS,
    LOW_RISK_MAX,
    MEDIUM_RISK_MAX,
    HIGH_RISK_MAX
  );

  return { owner, borrower, lender, outsider, modelRegistry, resultManager, inference };
}

async function encryptUint8Features(signer: Awaited<ReturnType<typeof ethers.getSigners>>[number], values: number[]) {
  const client = await hre.cofhe.createClientWithBatteries(signer);
  return client
    .encryptInputs(values.map((value) => Encryptable.uint8(BigInt(value))))
    .execute();
}

async function encryptUint16Features(signer: Awaited<ReturnType<typeof ethers.getSigners>>[number], values: number[]) {
  const client = await hre.cofhe.createClientWithBatteries(signer);
  return client
    .encryptInputs(values.map((value) => Encryptable.uint16(BigInt(value))))
    .execute();
}

function requestId(label: string) {
  return ethers.keccak256(ethers.toUtf8Bytes(label));
}

describe("SealedML production blockers", function () {
  this.timeout(120_000);

  it("scores strong, neutral, and stressed profiles without saturation", async function () {
    const { borrower, inference } = await deployFixture();

    const cases = [
      { label: "strong", values: [90, 95, 20, 80, 85, 70] },
      { label: "neutral", values: [50, 50, 50, 50, 50, 50] },
      { label: "stressed", values: [35, 35, 80, 20, 30, 20] },
    ];

    for (const item of cases) {
      const encrypted = await encryptUint8Features(borrower, item.values);
      const id = requestId(item.label);

      await inference.connect(borrower).runInference(encrypted, id);

      const scoreHandle = await inference.getEncryptedScore(id);
      const riskHandle = await inference.getEncryptedRiskClass(id);
      const score = expectedScore(item.values);

      await hre.cofhe.mocks.expectPlaintext(scoreHandle, BigInt(score));
      await hre.cofhe.mocks.expectPlaintext(riskHandle, BigInt(expectedRiskClass(score)));
    }
  });

  it("caps encrypted uint16 inputs to the published 0-100 feature range", async function () {
    const { borrower, inference } = await deployFixture();
    const values = [250, 0, 250, 0, 0, 0];
    const cappedValues = [100, 0, 100, 0, 0, 0];
    const encrypted = await encryptUint16Features(borrower, values);
    const id = requestId("capped-uint16");

    await inference.connect(borrower).runInferenceUint16(encrypted, id);

    const scoreHandle = await inference.getEncryptedScore(id);
    const riskHandle = await inference.getEncryptedRiskClass(id);
    const score = expectedScore(cappedValues);

    await hre.cofhe.mocks.expectPlaintext(scoreHandle, BigInt(score));
    await hre.cofhe.mocks.expectPlaintext(riskHandle, BigInt(expectedRiskClass(score)));
  });

  it("grants CoFHE decrypt access through the inference contract", async function () {
    const { borrower, lender, inference, resultManager } = await deployFixture();
    const encrypted = await encryptUint8Features(borrower, [55, 75, 30, 60, 70, 65]);
    const id = requestId("share-access");

    await inference.connect(borrower).runInference(encrypted, id);
    await inference.connect(borrower).grantResultAccess(id, lender.address, 3600);

    const scoreHandle = await inference.getEncryptedScore(id);
    const riskHandle = await inference.getEncryptedRiskClass(id);
    const taskManager = await hre.cofhe.mocks.getMockTaskManager();

    expect(await resultManager.hasPermission(id, lender.address)).to.equal(true);
    expect(await taskManager.isAllowed(scoreHandle, lender.address)).to.equal(true);
    expect(await taskManager.isAllowed(riskHandle, lender.address)).to.equal(true);
  });

  it("blocks ResultManager-only sharing so metadata cannot lie about decrypt access", async function () {
    const { borrower, lender, inference, resultManager } = await deployFixture();
    const encrypted = await encryptUint8Features(borrower, [55, 75, 30, 60, 70, 65]);
    const id = requestId("result-manager-only");

    await inference.connect(borrower).runInference(encrypted, id);

    await expect(
      resultManager.connect(borrower).grantPermission(id, lender.address, 3600)
    ).to.be.revertedWith("Use inference grantResultAccess");
  });

  it("enforces expiry and revoked status in permission checks", async function () {
    const { borrower, lender, inference, resultManager } = await deployFixture();
    const encrypted = await encryptUint8Features(borrower, [55, 75, 30, 60, 70, 65]);
    const id = requestId("expiry");

    await inference.connect(borrower).runInference(encrypted, id);
    await inference.connect(borrower).grantResultAccess(id, lender.address, 60);

    expect(await resultManager.hasPermission(id, lender.address)).to.equal(true);
    await time.increase(61);
    expect(await resultManager.hasPermission(id, lender.address)).to.equal(false);

    const secondId = requestId("revoke");
    const secondEncrypted = await encryptUint8Features(borrower, [55, 75, 30, 60, 70, 65]);
    await inference.connect(borrower).runInference(secondEncrypted, secondId);
    await inference.connect(borrower).grantResultAccess(secondId, lender.address, 3600);
    await resultManager.connect(borrower).revokeResult(secondId);

    expect(await resultManager.hasPermission(secondId, lender.address)).to.equal(false);
  });
});
