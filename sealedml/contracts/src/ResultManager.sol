// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ResultManager
 * @dev Manages inference results, ownership, retrieval, and selective disclosure.
 *      Users can share results with third parties like lenders, DeFi protocols, or auditors.
 */
contract ResultManager is Ownable, ReentrancyGuard {
    enum ResultStatus {
        Pending,
        Available,
        Retrieved,
        Expired,
        Revoked
    }

    struct InferenceResult {
        bytes32 requestId;
        address owner;
        uint8 riskClass;        // 0=low, 1=medium, 2=high
        uint256 scoreReference;   // Reference to encrypted score in inference contract
        ResultStatus status;
        uint256 createdAt;
        uint256 expiresAt;
        string metadata;          // Optional JSON metadata
    }

    // Result hash -> Result data
    mapping(bytes32 => InferenceResult) public results;

    // Owner -> Result hashes
    mapping(address => bytes32[]) public userResults;

    // Selective permissions: Result hash -> Allowed address -> Has permission
    mapping(bytes32 => mapping(address => bool)) public resultPermissions;

    // Result hash -> Permission expiration
    mapping(bytes32 => mapping(address => uint256)) public permissionExpiry;

    // Events
    event ResultStored(
        bytes32 indexed requestId,
        address indexed owner,
        uint8 riskClass,
        uint256 timestamp
    );
    event ResultRetrieved(
        bytes32 indexed requestId,
        address indexed recipient,
        uint256 timestamp
    );
    event PermissionGranted(
        bytes32 indexed requestId,
        address indexed recipient,
        uint256 expiresAt
    );
    event PermissionRevoked(
        bytes32 indexed requestId,
        address indexed recipient
    );
    event ResultRevoked(bytes32 indexed requestId);

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Store a new inference result
     */
    function storeResult(
        bytes32 requestId,
        address owner,
        uint8 riskClass,
        uint256 scoreReference,
        uint256 validityPeriod,
        string calldata metadata
    ) external onlyOwner nonReentrant {
        require(results[requestId].status == ResultStatus.Pending, "Result already exists");

        uint256 expiresAt = block.timestamp + validityPeriod;

        results[requestId] = InferenceResult({
            requestId: requestId,
            owner: owner,
            riskClass: riskClass,
            scoreReference: scoreReference,
            status: ResultStatus.Available,
            createdAt: block.timestamp,
            expiresAt: expiresAt,
            metadata: metadata
        });

        userResults[owner].push(requestId);

        emit ResultStored(requestId, owner, riskClass, block.timestamp);
    }

    /**
     * @notice Mark result as retrieved
     */
    function markRetrieved(bytes32 requestId) external {
        require(
            results[requestId].owner == msg.sender ||
            resultPermissions[requestId][msg.sender],
            "Not authorized"
        );
        require(
            results[requestId].status == ResultStatus.Available,
            "Result not available"
        );

        results[requestId].status = ResultStatus.Retrieved;

        emit ResultRetrieved(requestId, msg.sender, block.timestamp);
    }

    /**
     * @notice Grant permission to access a result
     */
    function grantPermission(
        bytes32 requestId,
        address recipient,
        uint256 duration
    ) external nonReentrant {
        require(results[requestId].owner == msg.sender, "Not the owner");
        require(recipient != address(0), "Invalid recipient");
        require(duration > 0, "Invalid duration");

        resultPermissions[requestId][recipient] = true;
        permissionExpiry[requestId][recipient] = block.timestamp + duration;

        emit PermissionGranted(
            requestId,
            recipient,
            permissionExpiry[requestId][recipient]
        );
    }

    /**
     * @notice Grant permission to multiple recipients
     */
    function grantBatchPermissions(
        bytes32 requestId,
        address[] calldata recipients,
        uint256[] calldata durations
    ) external nonReentrant {
        require(recipients.length == durations.length, "Length mismatch");
        require(results[requestId].owner == msg.sender, "Not the owner");

        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient");
            resultPermissions[requestId][recipients[i]] = true;
            permissionExpiry[requestId][recipients[i]] = block.timestamp + durations[i];

            emit PermissionGranted(
                requestId,
                recipients[i],
                permissionExpiry[requestId][recipients[i]]
            );
        }
    }

    /**
     * @notice Revoke permission for a recipient
     */
    function revokePermission(bytes32 requestId, address recipient) external {
        require(results[requestId].owner == msg.sender, "Not the owner");

        resultPermissions[requestId][recipient] = false;
        delete permissionExpiry[requestId][recipient];

        emit PermissionRevoked(requestId, recipient);
    }

    /**
     * @notice Revoke a result entirely
     */
    function revokeResult(bytes32 requestId) external {
        require(results[requestId].owner == msg.sender, "Not the owner");

        results[requestId].status = ResultStatus.Revoked;

        emit ResultRevoked(requestId);
    }

    /**
     * @notice Check if an address has permission to view a result
     */
    function hasPermission(bytes32 requestId, address recipient) public view returns (bool) {
        if (results[requestId].owner == recipient) return true;
        if (!resultPermissions[requestId][recipient]) return false;
        if (permissionExpiry[requestId][recipient] < block.timestamp) return false;
        return true;
    }

    /**
     * @notice Get result by request ID
     */
    function getResult(bytes32 requestId) external view returns (InferenceResult memory) {
        return results[requestId];
    }

    /**
     * @notice Get all results for a user
     */
    function getUserResults(address user) external view returns (bytes32[] memory) {
        return userResults[user];
    }

    /**
     * @notice Get result count for a user
     */
    function getUserResultCount(address user) external view returns (uint256) {
        return userResults[user].length;
    }

    /**
     * @notice Check if a result is expired
     */
    function isExpired(bytes32 requestId) external view returns (bool) {
        return results[requestId].expiresAt < block.timestamp;
    }

    /**
     * @notice Get result with permission check
     */
    function getResultWithAccess(bytes32 requestId, address requester)
        external
        view
        returns (InferenceResult memory result, bool hasAccess)
    {
        result = results[requestId];
        hasAccess = hasPermission(requestId, requester);
        return (result, hasAccess);
    }
}
