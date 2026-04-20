// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ModelRegistry
 * @dev Stores model metadata, version, feature schema, and activation status.
 *      Provides controlled model evolution without breaking trust in the scoring process.
 */
contract ModelRegistry is Ownable, ReentrancyGuard {
    struct ModelInfo {
        string name;
        string version;
        uint256 createdAt;
        bool isActive;
        uint8 featureCount;
        uint8 outputType; // 0: score, 1: class, 2: boolean
        string description;
        address inferenceContract;
    }

    struct FeatureSchema {
        string name;
        uint8 decimals; // for fixed-point precision
        uint256 minValue;
        uint256 maxValue;
        bool isRequired;
    }

    // Model ID -> ModelInfo
    mapping(uint256 => ModelInfo) public models;
    uint256 public modelCount;

    // Model ID -> Feature Index -> FeatureSchema
    mapping(uint256 => FeatureSchema[]) public modelFeatures;

    // Track active model
    uint256 public activeModelId;

    // Events
    event ModelRegistered(
        uint256 indexed modelId,
        string name,
        string version,
        uint256 timestamp
    );
    event ModelActivated(uint256 indexed modelId, uint256 timestamp);
    event ModelDeactivated(uint256 indexed modelId, uint256 timestamp);
    event FeatureSchemaUpdated(uint256 indexed modelId, uint256 featureCount);

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Register a new model version
     */
    function registerModel(
        string calldata name,
        string calldata version,
        uint8 featureCount,
        uint8 outputType,
        string calldata description,
        address inferenceContract,
        FeatureSchema[] calldata features
    ) external onlyOwner nonReentrant {
        require(bytes(name).length > 0, "Name required");
        require(featureCount > 0, "At least one feature required");
        require(features.length == featureCount, "Feature count mismatch");
        require(inferenceContract != address(0), "Invalid inference contract");

        uint256 modelId = modelCount++;
        models[modelId] = ModelInfo({
            name: name,
            version: version,
            createdAt: block.timestamp,
            isActive: false,
            featureCount: featureCount,
            outputType: outputType,
            description: description,
            inferenceContract: inferenceContract
        });

        for (uint8 i = 0; i < featureCount; i++) {
            modelFeatures[modelId].push(features[i]);
        }

        emit ModelRegistered(modelId, name, version, block.timestamp);
    }

    /**
     * @notice Activate a registered model
     */
    function activateModel(uint256 modelId) external onlyOwner {
        require(modelId < modelCount, "Model does not exist");
        require(!models[modelId].isActive, "Already active");

        // Deactivate current active model if exists
        if (activeModelId < modelCount && models[activeModelId].isActive) {
            models[activeModelId].isActive = false;
            emit ModelDeactivated(activeModelId, block.timestamp);
        }

        models[modelId].isActive = true;
        activeModelId = modelId;

        emit ModelActivated(modelId, block.timestamp);
    }

    /**
     * @notice Deactivate a model
     */
    function deactivateModel(uint256 modelId) external onlyOwner {
        require(modelId < modelCount, "Model does not exist");
        require(models[modelId].isActive, "Not active");

        models[modelId].isActive = false;
        if (activeModelId == modelId) {
            activeModelId = modelCount; // Reset if this was the active one
        }

        emit ModelDeactivated(modelId, block.timestamp);
    }

    /**
     * @notice Get model information
     */
    function getModel(uint256 modelId) external view returns (ModelInfo memory) {
        require(modelId < modelCount, "Model does not exist");
        return models[modelId];
    }

    /**
     * @notice Get active model information
     */
    function getActiveModel() external view returns (ModelInfo memory) {
        require(activeModelId < modelCount, "No active model");
        return models[activeModelId];
    }

    /**
     * @notice Get feature schema for a model
     */
    function getFeatureSchema(uint256 modelId) external view returns (FeatureSchema[] memory) {
        require(modelId < modelCount, "Model does not exist");
        return modelFeatures[modelId];
    }

    /**
     * @notice Update feature schema for a model
     */
    function updateFeatureSchema(
        uint256 modelId,
        FeatureSchema[] calldata features
    ) external onlyOwner {
        require(modelId < modelCount, "Model does not exist");
        require(features.length == models[modelId].featureCount, "Feature count mismatch");

        delete modelFeatures[modelId];
        for (uint8 i = 0; i < features.length; i++) {
            modelFeatures[modelId].push(features[i]);
        }

        emit FeatureSchemaUpdated(modelId, features.length);
    }
}
