// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AccessControl
 * @dev Handles access control for decryption permissions and result views.
 *      Manages who can request decryption and how temporary permissions are granted.
 */
contract AccessControl is Ownable, ReentrancyGuard {
    enum PermissionLevel {
        None,
        ViewOnly,
        Decrypt,
        Full
    }

    // Role definitions
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant SERVICE_ROLE = keccak256("SERVICE_ROLE");

    // Address -> Permission level
    mapping(address => PermissionLevel) public addressPermissions;

    // User -> Service -> Has access
    mapping(address => mapping(address => bool)) public userServiceAccess;

    // User -> Service -> Expiry
    mapping(address => mapping(address => uint256)) public serviceAccessExpiry;

    // Decryption request tracking
    struct DecryptionRequest {
        address requester;
        bytes32 resultId;
        uint256 timestamp;
        bool fulfilled;
    }

    mapping(bytes32 => DecryptionRequest) public decryptionRequests;
    uint256 public decryptionRequestCount;

    // Rate limiting
    mapping(address => uint256) public lastDecryptionRequest;
    uint256 public rateLimitWindow = 1 hours;
    uint256 public maxRequestsPerWindow = 10;

    // Events
    event PermissionGranted(
        address indexed user,
        PermissionLevel level,
        address indexed granter
    );
    event PermissionRevoked(address indexed user, address indexed revoker);
    event ServiceAccessGranted(
        address indexed user,
        address indexed service,
        uint256 expiresAt
    );
    event ServiceAccessRevoked(
        address indexed user,
        address indexed service
    );
    event DecryptionRequested(
        bytes32 indexed requestId,
        address indexed requester,
        bytes32 indexed resultId
    );
    event DecryptionFulfilled(
        bytes32 indexed requestId,
        address indexed fulfiller
    );
    event RateLimitUpdated(
        uint256 window,
        uint256 maxRequests,
        address indexed updater
    );

    constructor() Ownable(msg.sender) {
        // Owner gets full permissions by default
        addressPermissions[msg.sender] = PermissionLevel.Full;
    }

    /**
     * @notice Grant permission level to an address
     */
    function grantPermission(
        address user,
        PermissionLevel level
    ) external onlyOwner nonReentrant {
        require(user != address(0), "Invalid user");
        require(uint8(level) <= uint8(PermissionLevel.Full), "Invalid level");

        addressPermissions[user] = level;

        emit PermissionGranted(user, level, msg.sender);
    }

    /**
     * @notice Revoke permission from an address
     */
    function revokePermission(address user) external onlyOwner {
        require(user != msg.sender, "Cannot revoke self");
        require(addressPermissions[user] != PermissionLevel.None, "No permission");

        addressPermissions[user] = PermissionLevel.None;

        emit PermissionRevoked(user, msg.sender);
    }

    /**
     * @notice Grant service access to a user
     */
    function grantServiceAccess(
        address user,
        address service,
        uint256 duration
    ) external nonReentrant {
        require(user != address(0), "Invalid user");
        require(service != address(0), "Invalid service");
        require(duration > 0, "Invalid duration");

        userServiceAccess[user][service] = true;
        serviceAccessExpiry[user][service] = block.timestamp + duration;

        emit ServiceAccessGranted(user, service, serviceAccessExpiry[user][service]);
    }

    /**
     * @notice Revoke service access
     */
    function revokeServiceAccess(address user, address service) external {
        require(
            msg.sender == user || msg.sender == owner(),
            "Not authorized"
        );

        userServiceAccess[user][service] = false;
        delete serviceAccessExpiry[user][service];

        emit ServiceAccessRevoked(user, service);
    }

    /**
     * @notice Request decryption of a result
     */
    function requestDecryption(bytes32 resultId) external nonReentrant {
        require(addressPermissions[msg.sender] >= PermissionLevel.Decrypt, "No decrypt permission");
        require(
            userServiceAccess[msg.sender][tx.origin] ||
            addressPermissions[tx.origin] >= PermissionLevel.Full,
            "No service access"
        );

        // Rate limiting
        if (addressPermissions[msg.sender] < PermissionLevel.Full) {
            require(
                block.timestamp - lastDecryptionRequest[msg.sender] >= rateLimitWindow,
                "Rate limited"
            );
            lastDecryptionRequest[msg.sender] = block.timestamp;
        }

        bytes32 requestId = keccak256(
            abi.encodePacked(resultId, msg.sender, block.timestamp)
        );

        decryptionRequests[requestId] = DecryptionRequest({
            requester: msg.sender,
            resultId: resultId,
            timestamp: block.timestamp,
            fulfilled: false
        });

        decryptionRequestCount++;

        emit DecryptionRequested(requestId, msg.sender, resultId);
    }

    /**
     * @notice Mark decryption request as fulfilled
     */
    function fulfillDecryption(bytes32 requestId) external onlyOwner {
        require(!decryptionRequests[requestId].fulfilled, "Already fulfilled");

        decryptionRequests[requestId].fulfilled = true;

        emit DecryptionFulfilled(requestId, msg.sender);
    }

    /**
     * @notice Check if user has specific permission level
     */
    function hasPermissionLevel(
        address user,
        PermissionLevel level
    ) external view returns (bool) {
        return uint8(addressPermissions[user]) >= uint8(level);
    }

    /**
     * @notice Check if user has service access
     */
    function hasServiceAccess(
        address user,
        address service
    ) external view returns (bool) {
        if (!userServiceAccess[user][service]) return false;
        return serviceAccessExpiry[user][service] > block.timestamp;
    }

    /**
     * @notice Update rate limiting parameters
     */
    function updateRateLimit(
        uint256 window,
        uint256 maxRequests
    ) external onlyOwner {
        require(window > 0, "Invalid window");
        require(maxRequests > 0, "Invalid max requests");

        rateLimitWindow = window;
        maxRequestsPerWindow = maxRequests;

        emit RateLimitUpdated(window, maxRequests, msg.sender);
    }

    /**
     * @notice Get permission level for an address
     */
    function getPermissionLevel(address user) external view returns (PermissionLevel) {
        return addressPermissions[user];
    }

    /**
     * @notice Get decryption request details
     */
    function getDecryptionRequest(bytes32 requestId)
        external
        view
        returns (DecryptionRequest memory)
    {
        return decryptionRequests[requestId];
    }

    /**
     * @notice Batch grant permissions
     */
    function batchGrantPermissions(
        address[] calldata users,
        PermissionLevel[] calldata levels
    ) external onlyOwner nonReentrant {
        require(users.length == levels.length, "Length mismatch");

        for (uint256 i = 0; i < users.length; i++) {
            require(users[i] != address(0), "Invalid user");
            addressPermissions[users[i]] = levels[i];
            emit PermissionGranted(users[i], levels[i], msg.sender);
        }
    }
}
