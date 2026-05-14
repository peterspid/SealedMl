// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@fhenixprotocol/cofhe-contracts/FHE.sol";
import {InEuint8, InEuint16} from "@fhenixprotocol/cofhe-contracts/ICofhe.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IResultManager {
    function storeResult(
        bytes32 requestId,
        address owner,
        uint256 scoreReference,
        uint256 riskClassReference,
        uint256 validityPeriod,
        string calldata metadata
    ) external;

    function grantPermissionFromRecorder(
        bytes32 requestId,
        address owner,
        address recipient,
        uint256 duration
    ) external;
}

/**
 * @title SealedMLInference
 * @dev Main inference engine for privacy-preserving ML inference using CoFHE.
 *      Accepts verifier-signed encrypted inputs, computes a bounded weighted
 *      score on ciphertexts, and stores encrypted result handles for the user.
 */
contract SealedMLInference is Ownable, ReentrancyGuard {
    using FHE for euint8;
    using FHE for euint16;
    using FHE for euint128;
    using FHE for ebool;

    uint256 public constant FEATURE_MAX = 100;
    uint256 public constant DEFAULT_RESULT_VALIDITY = 30 days;

    struct ModelWeights {
        int256[] featureWeights;
        int256 bias;
        uint8 decimals;
    }

    struct RiskThresholds {
        uint256 lowRiskMax;
        uint256 mediumRiskMax;
        uint256 highRiskMax;
    }

    ModelWeights public modelWeights;
    RiskThresholds public riskThresholds;
    address public modelRegistry;
    address public resultManager;
    bool public isInitialized;

    uint256 public inferenceCount;
    mapping(bytes32 => bool) public processedRequests;
    mapping(bytes32 => address) public requestOwners;
    mapping(bytes32 => euint128) public encryptedResults;
    mapping(bytes32 => euint128) public encryptedRiskClasses;

    event InferenceRequested(
        address indexed user,
        bytes32 indexed requestId,
        uint256 timestamp
    );
    event InferenceCompleted(
        bytes32 indexed requestId,
        uint256 encryptedScore,
        uint256 encryptedRiskClass,
        uint256 timestamp
    );
    event ModelUpdated(uint256 timestamp);
    event ThresholdsUpdated(uint256 timestamp);
    event ResultManagerUpdated(address indexed resultManager);
    event ResultAccessGranted(
        bytes32 indexed requestId,
        address indexed owner,
        address indexed recipient,
        uint256 duration
    );

    constructor(address _modelRegistry, address _resultManager) Ownable(msg.sender) {
        require(_modelRegistry != address(0), "Invalid model registry");
        require(_resultManager != address(0), "Invalid result manager");
        modelRegistry = _modelRegistry;
        resultManager = _resultManager;
    }

    /**
     * @notice Initialize or replace the active scoring model.
     */
    function initializeModel(
        int256[] calldata weights,
        int256 bias,
        uint8 decimals,
        uint256 lowRiskMax,
        uint256 mediumRiskMax,
        uint256 highRiskMax
    ) external onlyOwner {
        require(weights.length > 0, "Weights required");
        require(decimals <= 6, "Decimals too large");
        require(lowRiskMax <= mediumRiskMax, "Invalid thresholds");
        require(mediumRiskMax <= highRiskMax, "Invalid thresholds");
        require(highRiskMax <= FEATURE_MAX, "Score max too high");

        modelWeights = ModelWeights({
            featureWeights: weights,
            bias: bias,
            decimals: decimals
        });

        riskThresholds = RiskThresholds({
            lowRiskMax: lowRiskMax,
            mediumRiskMax: mediumRiskMax,
            highRiskMax: highRiskMax
        });

        isInitialized = true;
        emit ModelUpdated(block.timestamp);
    }

    function setResultManager(address _resultManager) external onlyOwner {
        require(_resultManager != address(0), "Invalid result manager");
        resultManager = _resultManager;
        emit ResultManagerUpdated(_resultManager);
    }

    /**
     * @notice Update risk thresholds.
     */
    function updateThresholds(
        uint256 lowRiskMax,
        uint256 mediumRiskMax,
        uint256 highRiskMax
    ) external onlyOwner {
        require(lowRiskMax <= mediumRiskMax, "Invalid thresholds");
        require(mediumRiskMax <= highRiskMax, "Invalid thresholds");

        riskThresholds = RiskThresholds({
            lowRiskMax: lowRiskMax,
            mediumRiskMax: mediumRiskMax,
            highRiskMax: highRiskMax
        });

        emit ThresholdsUpdated(block.timestamp);
    }

    /**
     * @notice Run encrypted inference using verifier-signed uint8 inputs from the CoFHE SDK.
     */
    function runInference(
        InEuint8[] memory encryptedFeatures,
        bytes32 requestId
    ) external nonReentrant returns (uint256 encryptedScoreRef, uint256 encryptedRiskClassRef) {
        require(encryptedFeatures.length == modelWeights.featureWeights.length, "Feature count mismatch");

        euint128[] memory features = new euint128[](encryptedFeatures.length);
        for (uint256 i = 0; i < encryptedFeatures.length; i++) {
            euint8 feature = FHE.asEuint8(encryptedFeatures[i]);
            features[i] = _capFeature(FHE.asEuint128(feature));
        }

        return _runInference(features, requestId, "sealedml:v1.1:credit-risk");
    }

    /**
     * @notice Run encrypted inference using verifier-signed uint16 inputs for future model precision.
     */
    function runInferenceUint16(
        InEuint16[] memory encryptedFeatures,
        bytes32 requestId
    ) external nonReentrant returns (uint256 encryptedScoreRef, uint256 encryptedRiskClassRef) {
        require(encryptedFeatures.length == modelWeights.featureWeights.length, "Feature count mismatch");

        euint128[] memory features = new euint128[](encryptedFeatures.length);
        for (uint256 i = 0; i < encryptedFeatures.length; i++) {
            euint16 feature = FHE.asEuint16(encryptedFeatures[i]);
            features[i] = _capFeature(FHE.asEuint128(feature));
        }

        return _runInference(features, requestId, "sealedml:v1.1:credit-risk:uint16");
    }

    /**
     * @notice Grant another wallet CoFHE decrypt access to this result and record
     *         the app-level verification window in ResultManager.
     */
    function grantResultAccess(
        bytes32 requestId,
        address recipient,
        uint256 duration
    ) external nonReentrant {
        require(processedRequests[requestId], "Request not processed");
        require(requestOwners[requestId] == msg.sender, "Not request owner");
        require(recipient != address(0), "Invalid recipient");
        require(recipient != msg.sender, "Cannot share with self");
        require(duration > 0, "Invalid duration");

        FHE.allow(encryptedResults[requestId], recipient);
        FHE.allow(encryptedRiskClasses[requestId], recipient);

        IResultManager(resultManager).grantPermissionFromRecorder(
            requestId,
            msg.sender,
            recipient,
            duration
        );

        emit ResultAccessGranted(requestId, msg.sender, recipient, duration);
    }

    function _runInference(
        euint128[] memory encryptedFeatures,
        bytes32 requestId,
        string memory metadata
    ) internal returns (uint256 encryptedScoreRef, uint256 encryptedRiskClassRef) {
        require(isInitialized, "Model not initialized");
        require(requestId != bytes32(0), "Invalid request ID");
        require(!processedRequests[requestId], "Request already processed");
        require(encryptedFeatures.length == modelWeights.featureWeights.length, "Feature count mismatch");

        processedRequests[requestId] = true;
        requestOwners[requestId] = msg.sender;
        inferenceCount++;

        emit InferenceRequested(msg.sender, requestId, block.timestamp);

        (euint128 encryptedScore, euint128 encryptedRiskClass) = _computeScore(encryptedFeatures);

        encryptedResults[requestId] = encryptedScore;
        encryptedRiskClasses[requestId] = encryptedRiskClass;

        FHE.allowThis(encryptedScore);
        FHE.allowThis(encryptedRiskClass);
        FHE.allowSender(encryptedScore);
        FHE.allowSender(encryptedRiskClass);

        encryptedScoreRef = uint256(euint128.unwrap(encryptedScore));
        encryptedRiskClassRef = uint256(euint128.unwrap(encryptedRiskClass));

        IResultManager(resultManager).storeResult(
            requestId,
            msg.sender,
            encryptedScoreRef,
            encryptedRiskClassRef,
            DEFAULT_RESULT_VALIDITY,
            metadata
        );

        emit InferenceCompleted(
            requestId,
            encryptedScoreRef,
            encryptedRiskClassRef,
            block.timestamp
        );

        return (encryptedScoreRef, encryptedRiskClassRef);
    }

    function _computeScore(
        euint128[] memory encryptedFeatures
    ) internal returns (euint128 encryptedScore, euint128 encryptedRiskClass) {
        uint256 scaleFactor = 10 ** modelWeights.decimals;

        euint128 positiveSum = FHE.asEuint128(0);
        euint128 negativeSum = FHE.asEuint128(0);

        if (modelWeights.bias >= 0) {
            positiveSum = FHE.add(
                positiveSum,
                FHE.asEuint128(uint256(modelWeights.bias) * scaleFactor)
            );
        } else {
            negativeSum = FHE.add(
                negativeSum,
                FHE.asEuint128(uint256(-modelWeights.bias) * scaleFactor)
            );
        }

        for (uint256 i = 0; i < encryptedFeatures.length; i++) {
            int256 signedWeight = modelWeights.featureWeights[i];
            uint256 absWeight = signedWeight >= 0 ? uint256(signedWeight) : uint256(-signedWeight);
            euint128 product = FHE.mul(encryptedFeatures[i], FHE.asEuint128(absWeight));

            if (signedWeight >= 0) {
                positiveSum = FHE.add(positiveSum, product);
            } else {
                negativeSum = FHE.add(negativeSum, product);
            }
        }

        ebool canSubtract = FHE.gte(positiveSum, negativeSum);
        euint128 rawScore = FHE.select(
            canSubtract,
            FHE.sub(positiveSum, negativeSum),
            FHE.asEuint128(0)
        );

        if (scaleFactor > 1) {
            rawScore = FHE.div(rawScore, FHE.asEuint128(scaleFactor));
        }

        euint128 maxScore = FHE.asEuint128(riskThresholds.highRiskMax);
        encryptedScore = FHE.select(
            FHE.gte(rawScore, maxScore),
            maxScore,
            rawScore
        );

        ebool isLowRisk = FHE.lte(encryptedScore, FHE.asEuint128(riskThresholds.lowRiskMax));
        ebool isMediumOrLow = FHE.lte(encryptedScore, FHE.asEuint128(riskThresholds.mediumRiskMax));

        encryptedRiskClass = FHE.asEuint128(2);
        encryptedRiskClass = FHE.select(isMediumOrLow, FHE.asEuint128(1), encryptedRiskClass);
        encryptedRiskClass = FHE.select(isLowRisk, FHE.asEuint128(0), encryptedRiskClass);
    }

    function _capFeature(euint128 feature) internal returns (euint128) {
        return FHE.min(feature, FHE.asEuint128(FEATURE_MAX));
    }

    function getEncryptedScore(bytes32 requestId) external view returns (uint256) {
        require(processedRequests[requestId], "Request not processed");
        return uint256(euint128.unwrap(encryptedResults[requestId]));
    }

    function getEncryptedRiskClass(bytes32 requestId) external view returns (uint256) {
        require(processedRequests[requestId], "Request not processed");
        return uint256(euint128.unwrap(encryptedRiskClasses[requestId]));
    }

    function getModelInfo() external view returns (
        int256[] memory weights,
        int256 bias,
        uint8 decimals,
        uint256 lowRiskMax,
        uint256 mediumRiskMax,
        uint256 highRiskMax
    ) {
        return (
            modelWeights.featureWeights,
            modelWeights.bias,
            modelWeights.decimals,
            riskThresholds.lowRiskMax,
            riskThresholds.mediumRiskMax,
            riskThresholds.highRiskMax
        );
    }

    function getInferenceCount() external view returns (uint256) {
        return inferenceCount;
    }
}
