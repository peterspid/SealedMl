// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@fhenixprotocol/cofhe-contracts/FHE.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SealedMLInference
 * @dev Main inference engine for privacy-preserving ML inference using FHE.
 *      Performs weighted scoring on encrypted financial features.
 *      Results are encrypted and can only be decrypted by the result owner.
 */
contract SealedMLInference is Ownable, ReentrancyGuard {
    using FHE for euint8;
    using FHE for euint16;
    using FHE for euint32;
    using FHE for euint64;
    using FHE for euint128;
    using FHE for eaddress;
    using FHE for ebool;

    // Model weights for encrypted inference (trained off-chain)
    struct ModelWeights {
        int256[] featureWeights;
        int256 bias;
        uint8 decimals;
    }

    // Risk thresholds for classification
    struct RiskThresholds {
        uint256 lowRiskMax;
        uint256 mediumRiskMax;
        uint256 highRiskMax;
    }

    // State
    ModelWeights public modelWeights;
    RiskThresholds public riskThresholds;
    address public modelRegistry;
    bool public isInitialized;

    // Request tracking
    uint256 public inferenceCount;
    mapping(bytes32 => bool) public processedRequests;

    // Store encrypted results by requestId for decryption
    mapping(bytes32 => euint128) public encryptedResults;
    mapping(bytes32 => euint128) public encryptedRiskClasses;

    // Events
    event InferenceRequested(
        address indexed user,
        bytes32 indexed requestId,
        uint256 timestamp
    );
    event InferenceCompleted(
        bytes32 indexed requestId,
        uint256 encryptedScore,
        uint8 riskClass,
        uint256 timestamp
    );
    event ModelUpdated(uint256 timestamp);
    event ThresholdsUpdated(uint256 timestamp);

    constructor(address _modelRegistry) Ownable(msg.sender) {
        modelRegistry = _modelRegistry;
        isInitialized = false;
    }

    /**
     * @notice Initialize the model with weights and thresholds
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
        require(lowRiskMax <= mediumRiskMax, "Invalid thresholds");
        require(mediumRiskMax <= highRiskMax, "Invalid thresholds");

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

    /**
     * @notice Update risk thresholds
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
     * @notice Run encrypted inference on financial features using euint8 input type.
     *         Computes weighted sum entirely on encrypted data using FHE.
     * @param encryptedFeatures Array of encrypted feature values
     * @param requestId Unique request identifier to prevent replay
     * @return encryptedScoreRef Reference handle for the encrypted score
     * @return riskClass The computed risk class (0=low, 1=medium, 2=high)
     */
    function runInference(
        euint8[] memory encryptedFeatures,
        bytes32 requestId
    ) external nonReentrant returns (uint256 encryptedScoreRef, uint8 riskClass) {
        require(isInitialized, "Model not initialized");
        require(!processedRequests[requestId], "Request already processed");
        require(
            encryptedFeatures.length == modelWeights.featureWeights.length,
            "Feature count mismatch"
        );

        processedRequests[requestId] = true;
        inferenceCount++;

        emit InferenceRequested(msg.sender, requestId, block.timestamp);

        // Run encrypted weighted sum using euint128 for calculations
        euint128 weightedSum = FHE.asEuint128(0);

        for (uint256 i = 0; i < encryptedFeatures.length; i++) {
            euint128 feature = FHE.asEuint128(encryptedFeatures[i]);

            if (modelWeights.featureWeights[i] >= 0) {
                uint256 weight = uint256(modelWeights.featureWeights[i]);
                euint128 weightVal = FHE.asEuint128(weight);
                euint128 product = FHE.mul(feature, weightVal);
                weightedSum = FHE.add(weightedSum, product);
            } else {
                uint256 absWeight = uint256(-modelWeights.featureWeights[i]);
                euint128 weightVal = FHE.asEuint128(absWeight);
                euint128 product = FHE.mul(feature, weightVal);
                weightedSum = FHE.sub(weightedSum, product);
            }
        }

        // Add bias
        if (modelWeights.bias >= 0) {
            euint128 biasVal = FHE.asEuint128(uint256(modelWeights.bias));
            weightedSum = FHE.add(weightedSum, biasVal);
        } else {
            euint128 biasVal = FHE.asEuint128(uint256(-modelWeights.bias));
            weightedSum = FHE.sub(weightedSum, biasVal);
        }

        // Scale by decimals
        euint128 encryptedScore;
        if (modelWeights.decimals > 0) {
            uint256 scaleFactor = 10 ** modelWeights.decimals;
            euint128 scale = FHE.asEuint128(scaleFactor);
            encryptedScore = FHE.div(weightedSum, scale);
        } else {
            encryptedScore = weightedSum;
        }

        // Store encrypted result for later decryption
        encryptedResults[requestId] = encryptedScore;

        // Determine risk class using encrypted comparison
        euint128 lowThreshold = FHE.asEuint128(riskThresholds.lowRiskMax);
        ebool isLowRisk = FHE.lte(encryptedScore, lowThreshold);

        euint128 medThreshold = FHE.asEuint128(riskThresholds.mediumRiskMax);
        ebool isMedOrLow = FHE.lte(encryptedScore, medThreshold);

        // Encrypted risk class: 0=low, 1=medium, 2=high
        euint128 encRiskClass = FHE.asEuint128(2);
        encRiskClass = FHE.select(isMedOrLow, FHE.asEuint128(1), encRiskClass);
        encRiskClass = FHE.select(isLowRisk, FHE.asEuint128(0), encRiskClass);

        // Store encrypted risk class
        encryptedRiskClasses[requestId] = encRiskClass;

        // Allow the caller to access their encrypted result for decryption
        FHE.allow(encryptedScore, msg.sender);
        FHE.allow(encRiskClass, msg.sender);

        // Return reference + plaintext riskClass for UI (actual class is in encryptedRiskClasses)
        // The encrypted version will be decrypted off-chain
        emit InferenceCompleted(requestId, uint256(euint128.unwrap(encryptedScore)), 0, block.timestamp);

        return (uint256(euint128.unwrap(encryptedScore)), 0);
    }

    /**
     * @notice Run inference with uint16 features for more precision
     */
    function runInferenceUint16(
        euint16[] memory encryptedFeatures,
        bytes32 requestId
    ) external nonReentrant returns (uint256 encryptedScoreRef, uint8 riskClass) {
        require(isInitialized, "Model not initialized");
        require(!processedRequests[requestId], "Request already processed");
        require(
            encryptedFeatures.length == modelWeights.featureWeights.length,
            "Feature count mismatch"
        );

        processedRequests[requestId] = true;
        inferenceCount++;

        emit InferenceRequested(msg.sender, requestId, block.timestamp);

        // Run encrypted weighted sum
        euint128 weightedSum = FHE.asEuint128(0);

        for (uint256 i = 0; i < encryptedFeatures.length; i++) {
            euint128 feature = FHE.asEuint128(encryptedFeatures[i]);

            if (modelWeights.featureWeights[i] >= 0) {
                uint256 weight = uint256(modelWeights.featureWeights[i]);
                euint128 weightVal = FHE.asEuint128(weight);
                euint128 product = FHE.mul(feature, weightVal);
                weightedSum = FHE.add(weightedSum, product);
            } else {
                uint256 absWeight = uint256(-modelWeights.featureWeights[i]);
                euint128 weightVal = FHE.asEuint128(absWeight);
                euint128 product = FHE.mul(feature, weightVal);
                weightedSum = FHE.sub(weightedSum, product);
            }
        }

        // Add bias
        if (modelWeights.bias >= 0) {
            euint128 biasVal = FHE.asEuint128(uint256(modelWeights.bias));
            weightedSum = FHE.add(weightedSum, biasVal);
        } else {
            euint128 biasVal = FHE.asEuint128(uint256(-modelWeights.bias));
            weightedSum = FHE.sub(weightedSum, biasVal);
        }

        // Scale by decimals
        euint128 encryptedScore;
        if (modelWeights.decimals > 0) {
            uint256 scaleFactor = 10 ** modelWeights.decimals;
            euint128 scale = FHE.asEuint128(scaleFactor);
            encryptedScore = FHE.div(weightedSum, scale);
        } else {
            encryptedScore = weightedSum;
        }

        // Store encrypted result
        encryptedResults[requestId] = encryptedScore;

        // Determine risk class
        euint128 lowThreshold = FHE.asEuint128(riskThresholds.lowRiskMax);
        ebool isLowRisk = FHE.lte(encryptedScore, lowThreshold);

        euint128 medThreshold = FHE.asEuint128(riskThresholds.mediumRiskMax);
        ebool isMedOrLow = FHE.lte(encryptedScore, medThreshold);

        euint128 encRiskClass = FHE.asEuint128(2);
        encRiskClass = FHE.select(isMedOrLow, FHE.asEuint128(1), encRiskClass);
        encRiskClass = FHE.select(isLowRisk, FHE.asEuint128(0), encRiskClass);

        encryptedRiskClasses[requestId] = encRiskClass;

        FHE.allow(encryptedScore, msg.sender);
        FHE.allow(encRiskClass, msg.sender);

        emit InferenceCompleted(requestId, uint256(euint128.unwrap(encryptedScore)), 0, block.timestamp);

        return (uint256(euint128.unwrap(encryptedScore)), 0);
    }

    /**
     * @notice Get the encrypted score reference for a completed inference.
     *         Used by the frontend SDK to decrypt the result.
     * @param requestId The unique request identifier
     * @return The encrypted score as a uint256 handle for decryption
     */
    function getEncryptedScore(bytes32 requestId) external view returns (uint256) {
        require(processedRequests[requestId], "Request not processed");
        return uint256(euint128.unwrap(encryptedResults[requestId]));
    }

    /**
     * @notice Get the encrypted risk class reference for a completed inference.
     * @param requestId The unique request identifier
     * @return The encrypted risk class as a uint256 handle for decryption
     */
    function getEncryptedRiskClass(bytes32 requestId) external view returns (uint256) {
        require(processedRequests[requestId], "Request not processed");
        return uint256(euint128.unwrap(encryptedRiskClasses[requestId]));
    }

    /**
     * @notice Get model info
     */
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

    /**
     * @notice Get inference count
     */
    function getInferenceCount() external view returns (uint256) {
        return inferenceCount;
    }
}
