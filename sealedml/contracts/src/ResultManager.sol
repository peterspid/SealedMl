// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ResultManager
 * @dev Manages inference results, ownership, retrieval, and selective disclosure metadata.
 *      CoFHE decrypt permissions are granted by the inference recorder, which owns the
 *      typed encrypted handles needed for FHE.allow().
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
        uint256 scoreReference;     // Reference to encrypted score in inference contract
        uint256 riskClassReference; // Reference to encrypted risk class in inference contract
        ResultStatus status;
        uint256 createdAt;
        uint256 expiresAt;
        string metadata;          // Optional JSON metadata
    }

    address public resultRecorder;

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
        uint256 scoreReference,
        uint256 riskClassReference,
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
    event ResultRecorderUpdated(address indexed recorder);

    constructor() Ownable(msg.sender) {}

    modifier onlyRecorder() {
        require(msg.sender == resultRecorder, "Not result recorder");
        _;
    }

    /**
     * @notice Set the inference contract that is allowed to store encrypted results.
     */
    function setResultRecorder(address recorder) external onlyOwner {
        require(recorder != address(0), "Invalid recorder");
        resultRecorder = recorder;
        emit ResultRecorderUpdated(recorder);
    }

    /**
     * @notice Store a new inference result
     */
    function storeResult(
        bytes32 requestId,
        address owner,
        uint256 scoreReference,
        uint256 riskClassReference,
        uint256 validityPeriod,
        string calldata metadata
    ) external onlyRecorder nonReentrant {
        require(results[requestId].status == ResultStatus.Pending, "Result already exists");
        require(owner != address(0), "Invalid owner");
        require(scoreReference != 0, "Invalid score reference");
        require(riskClassReference != 0, "Invalid risk reference");
        require(validityPeriod > 0, "Invalid validity");

        uint256 expiresAt = block.timestamp + validityPeriod;

        results[requestId] = InferenceResult({
            requestId: requestId,
            owner: owner,
            scoreReference: scoreReference,
            riskClassReference: riskClassReference,
            status: ResultStatus.Available,
            createdAt: block.timestamp,
            expiresAt: expiresAt,
            metadata: metadata
        });

        userResults[owner].push(requestId);

        emit ResultStored(requestId, owner, scoreReference, riskClassReference, block.timestamp);
    }

    /**
     * @notice Mark result as retrieved
     */
    function markRetrieved(bytes32 requestId) external {
        require(hasPermission(requestId, msg.sender), "Not authorized");
        require(
            _currentStatus(requestId) == ResultStatus.Available,
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
    ) external pure {
        requestId;
        recipient;
        duration;
        revert("Use inference grantResultAccess");
    }

    /**
     * @notice Record permission after the inference contract grants CoFHE access.
     */
    function grantPermissionFromRecorder(
        bytes32 requestId,
        address owner,
        address recipient,
        uint256 duration
    ) external onlyRecorder nonReentrant {
        require(results[requestId].owner == owner, "Owner mismatch");
        _grantPermission(requestId, recipient, duration);
    }

    /**
     * @notice Grant permission to multiple recipients
     */
    function grantBatchPermissions(
        bytes32 requestId,
        address[] calldata recipients,
        uint256[] calldata durations
    ) external pure {
        requestId;
        recipients;
        durations;
        revert("Use inference grantResultAccess");
    }

    /**
     * @notice Revoke permission for a recipient
     */
    function revokePermission(bytes32 requestId, address recipient) external {
        require(results[requestId].owner == msg.sender, "Not the owner");
        require(recipient != address(0), "Invalid recipient");

        resultPermissions[requestId][recipient] = false;
        delete permissionExpiry[requestId][recipient];

        emit PermissionRevoked(requestId, recipient);
    }

    /**
     * @notice Revoke a result entirely
     */
    function revokeResult(bytes32 requestId) external {
        require(results[requestId].owner == msg.sender, "Not the owner");
        require(_currentStatus(requestId) != ResultStatus.Revoked, "Already revoked");

        results[requestId].status = ResultStatus.Revoked;

        emit ResultRevoked(requestId);
    }

    /**
     * @notice Check if an address has permission to view a result
     */
    function hasPermission(bytes32 requestId, address recipient) public view returns (bool) {
        if (!_isAccessible(requestId)) return false;
        if (results[requestId].owner == recipient) return true;
        if (!resultPermissions[requestId][recipient]) return false;
        if (permissionExpiry[requestId][recipient] <= block.timestamp) return false;
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
        return results[requestId].owner != address(0) && results[requestId].expiresAt <= block.timestamp;
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
        result.status = _currentStatus(requestId);
        hasAccess = hasPermission(requestId, requester);
        return (result, hasAccess);
    }

    function _grantPermission(
        bytes32 requestId,
        address recipient,
        uint256 duration
    ) internal {
        require(_isAccessible(requestId), "Result not available");
        require(recipient != address(0), "Invalid recipient");
        require(recipient != results[requestId].owner, "Recipient is owner");
        require(duration > 0, "Invalid duration");

        resultPermissions[requestId][recipient] = true;
        permissionExpiry[requestId][recipient] = block.timestamp + duration;

        emit PermissionGranted(
            requestId,
            recipient,
            permissionExpiry[requestId][recipient]
        );
    }

    function _isAccessible(bytes32 requestId) internal view returns (bool) {
        ResultStatus status = _currentStatus(requestId);
        return status == ResultStatus.Available || status == ResultStatus.Retrieved;
    }

    function _currentStatus(bytes32 requestId) internal view returns (ResultStatus) {
        InferenceResult storage result = results[requestId];
        if (result.owner == address(0)) return ResultStatus.Pending;
        if (result.status == ResultStatus.Revoked) return ResultStatus.Revoked;
        if (result.expiresAt <= block.timestamp) return ResultStatus.Expired;
        return result.status;
    }
}
