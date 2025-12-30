# Smart Contract Architecture - Mantle Gas-Less Relayer

## Project Structure

```
smart-contract/
├── src/
│   ├── core/
│   │   ├── Paymaster.sol                 # Main paymaster logic with spending limits
│   │   ├── PaymasterFactory.sol          # Factory for deploying paymasters
│   │   └── RelayerHub.sol                # Central registry and configuration
│   ├── interfaces/
│   │   ├── IPaymaster.sol                # Paymaster interface
│   │   ├── IPaymasterFactory.sol         # Factory interface
│   │   └── IRelayerHub.sol               # Hub interface
│   ├── libraries/
│   │   ├── MetaTxLib.sol                 # EIP-712 meta-transaction utilities
│   │   ├── SpendingLimitLib.sol          # Spending limit calculations
│   │   └── SignatureValidator.sol        # Signature validation helpers
│   └── utils/
│       └── Errors.sol                    # Custom error definitions
├── test/
│   ├── unit/
│   │   ├── Paymaster.t.sol
│   │   ├── PaymasterFactory.t.sol
│   │   └── RelayerHub.t.sol
│   ├── integration/
│   │   ├── EndToEnd.t.sol
│   │   └── SpendingLimits.t.sol
│   └── mocks/
│       ├── MockERC20.sol
│       └── MockTarget.sol
├── script/
│   ├── Deploy.s.sol                      # Deployment script
│   └── Upgrade.s.sol                     # Upgrade script
└── foundry.toml
```

---

## Design Philosophy: Factory & Proxy Pattern

### **Upgradeability Strategy: Hybrid Approach** ⭐

This architecture uses a **hybrid upgradeability pattern** that balances security, cost, and flexibility:

```
┌─────────────────────────────────────────────────────────┐
│         RelayerHub (UUPS Upgradeable)                   │
│  - Platform configuration                               │
│  - Can be upgraded by platform team                     │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│     PaymasterFactory (UUPS Upgradeable)                 │
│  - Deployment logic                                     │
│  - Tracks implementation versions                       │
│  - Can be upgraded to add new features                  │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ Minimal Proxy │   │ Minimal Proxy │   │ Minimal Proxy │
│  (EIP-1167)   │   │  (EIP-1167)   │   │  (EIP-1167)   │
│  Dev A        │   │  Dev B        │   │  Dev C        │
│  ~100k gas    │   │  ~100k gas    │   │  ~100k gas    │
└───────────────┘   └───────────────┘   └───────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            ▼
                ┌───────────────────────┐
                │  Paymaster Logic      │
                │  (Implementation)     │
                │  Shared by all        │
                │  NOT a proxy          │
                └───────────────────────┘
```

### **Why This Pattern?**

#### ✅ **Security First**
- Each developer's Paymaster is **immutable** (clone, not upgradeable)
- Users can trust the audited implementation
- No risk of developer upgrading to malicious code
- Clear security model: "This Paymaster uses audited v1.2.0"

#### ✅ **Gas Efficiency**
- **80% cheaper deployment**: ~100k gas vs ~500k gas for UUPS
- Minimal proxy is just 45 bytes of bytecode
- Lower barrier to entry for developers
- Better for mass adoption

#### ✅ **Controlled Evolution**
- Platform team can deploy new implementations
- New Paymasters automatically use latest version
- Old Paymasters continue working (no breaking changes)
- Optional migration path for developers

#### ✅ **Simplified Developer Experience**
- Developers don't need to understand upgradeability
- No risk of developer making upgrade mistakes
- One-click deployment stays simple
- Platform handles complexity

### **How Upgrades Work**

When bugs are found or features are added:

1. **Platform deploys new Paymaster implementation** (v2.0.0)
2. **Factory is updated** to point to new implementation
3. **New deployments** automatically use v2.0.0
4. **Existing Paymasters** continue using their version (v1.0.0)
5. **Developers can migrate** by deploying new Paymaster and transferring funds

### **Access Control & Ownership**

```
Platform Team (Multisig)
├── Controls: RelayerHub
│   ├── Add/remove relayers
│   ├── System configuration
│   └── Emergency pause
├── Controls: PaymasterFactory
│   ├── Deploy new implementations
│   ├── Set deployment fees
│   └── CANNOT access developer funds ✓
│
Individual Developer (EOA or Multisig)
└── Controls: Their Paymaster instance
    ├── Deposit/withdraw funds
    ├── Configure whitelists
    ├── Set spending limits
    └── Platform CANNOT access these ✓
```

**Key Security Principle:** Complete separation - platform controls system logic, developers control their funds.

---

## Shared Data Structures (For SDK Integration)

### MetaTransaction Struct

**Purpose:** Standardized format for gasless transactions across SDK, Relayer, and contracts.

```solidity
// In interfaces/IPaymaster.sol
struct MetaTransaction {
    address user;           // User who signed the transaction
    address target;         // Target contract to call
    bytes data;            // Encoded function call data
    uint256 gasLimit;      // Maximum gas allowed for execution
    uint256 nonce;         // User's current nonce (replay protection)
    uint256 deadline;      // Expiration timestamp (prevents stale txs)
}
```

**Why this matters:**
- SDK knows exactly what to encode
- Relayer knows exactly what to validate
- Dashboard can display transaction details clearly
- EIP-712 signing is consistent

---

## 1. Paymaster Contract

**Purpose:** Core contract that holds developer funds, validates transactions, and enforces spending limits.

### State Variables

```solidity
// Ownership & Access Control
address public owner;                     // Paymaster owner (developer)

// Fund Management
uint256 public balance;                   // MNT balance available for sponsorship

// Whitelist Management
mapping(address => bool) public whitelistedContracts;
mapping(address => mapping(bytes4 => bool)) public whitelistedFunctions;
address[] public whitelistedContractsList;  // For enumeration

// Nonce Management (Replay Protection)
mapping(address => uint256) public nonces;

// Spending Limits
struct SpendingLimit {
    uint256 perTransactionLimit;          // Max gas per single transaction
    uint256 dailyLimit;                   // Max gas per day
    uint256 monthlyLimit;                 // Max gas per month
    uint256 globalLimit;                  // Total gas limit (lifetime)
    uint256 dailySpent;                   // Gas spent today
    uint256 monthlySpent;                 // Gas spent this month
    uint256 globalSpent;                  // Total gas spent
    uint256 lastResetDay;                 // Last daily reset timestamp
    uint256 lastResetMonth;               // Last monthly reset timestamp
}
SpendingLimit public spendingLimit;

// Analytics Data
struct Analytics {
    uint256 totalTransactions;            // Total sponsored transactions
    uint256 totalGasSpent;                // Total gas spent in wei
    uint256 uniqueUsers;                  // Count of unique users
    mapping(address => bool) hasUsed;     // Track unique users
}
Analytics public analytics;

// Low Balance Alert
uint256 public lowBalanceThreshold;       // Threshold for low balance alert
bool public lowBalanceAlertTriggered;     // Flag to prevent alert spam

// Pause Mechanism
bool public paused;

// Execution Lock (Security: Prevents withdrawal during transaction)
bool private executionLocked;

// EIP-712 Domain Separator
bytes32 public DOMAIN_SEPARATOR;

// Hub Reference
address public relayerHub;
```

### Key Functions

#### Admin Functions (onlyOwner)

```solidity
// Fund Management
function deposit() external payable onlyOwner
function withdraw(uint256 amount) external onlyOwner nonReentrant
function withdrawAll() external onlyOwner nonReentrant
// SECURITY: withdrawals are protected with nonReentrant and check executionLocked

// Whitelist Management
function addWhitelistedContract(address contractAddress) external onlyOwner
function removeWhitelistedContract(address contractAddress) external onlyOwner
function addWhitelistedFunction(address contractAddress, bytes4 selector) external onlyOwner
function removeWhitelistedFunction(address contractAddress, bytes4 selector) external onlyOwner

// BATCH OPERATIONS (Critical for Dashboard UX)
// Whitelist multiple functions at once - much better UX
function batchAddWhitelistedFunctions(
    address contractAddress, 
    bytes4[] calldata selectors
) external onlyOwner

function batchRemoveWhitelistedFunctions(
    address contractAddress,
    bytes4[] calldata selectors
) external onlyOwner

// Whitelist multiple contracts with their functions in one tx
function batchAddWhitelistedContractsWithFunctions(
    address[] calldata contracts,
    bytes4[][] calldata functionSelectors  // Array of arrays
) external onlyOwner

// Spending Limit Configuration
function setPerTransactionLimit(uint256 limit) external onlyOwner
function setDailyLimit(uint256 limit) external onlyOwner
function setMonthlyLimit(uint256 limit) external onlyOwner
function setGlobalLimit(uint256 limit) external onlyOwner

// Alert Configuration
function setLowBalanceThreshold(uint256 threshold) external onlyOwner
function resetLowBalanceAlert() external onlyOwner

// Emergency Controls
function pause() external onlyOwner
function unpause() external onlyOwner

// Ownership Transfer (2-step)
function transferOwnership(address newOwner) external onlyOwner
function acceptOwnership() external
```

#### Core Transaction Functions

```solidity
// Main entry point for relayer to execute sponsored transaction
function executeMetaTransaction(
    address user,
    address target,
    bytes calldata data,
    uint256 gasLimit,
    uint256 nonce,
    uint256 deadline,  // SECURITY: Prevents stale/front-run transactions
    bytes calldata signature
) external onlyRelayer nonReentrant returns (bool success, bytes memory returnData)

// PRE-FLIGHT VALIDATION (Critical for Relayer & Dashboard)
// Allows checking if transaction WILL succeed before submitting
// Returns (canExecute, errorCode, errorMessage)
function canExecuteMetaTransaction(
    address user,
    address target,
    bytes calldata data,
    uint256 gasLimit,
    uint256 nonce,
    uint256 deadline  // SECURITY: Include deadline in validation
) external view returns (
    bool canExecute, 
    uint8 errorCode,     // 0=success, 1=insufficient balance, 2=not whitelisted, etc.
    string memory reason  // Human-readable error
)

// GAS ESTIMATION (Critical for Dashboard & SDK)
// Estimates total cost for this transaction
function estimateTransactionCost(
    address target,
    bytes calldata data,
    uint256 gasLimit
) external view returns (
    uint256 estimatedGas,      // Estimated gas units
    uint256 estimatedCostWei   // Estimated cost in wei
)

// Internal validation logic
function _validateTransaction(
    address user,
    address target,
    bytes calldata data,
    uint256 gasLimit,
    uint256 nonce,
    uint256 deadline,  // SECURITY: Validate deadline
    bytes calldata signature
) internal view returns (bool)

// SECURITY: Reimburse relayer (called at end of executeMetaTransaction)
function _reimburseRelayer(uint256 gasCost) internal

// Spending limit checks and updates
function _checkAndUpdateSpendingLimits(uint256 gasUsed) internal
function _resetDailyLimitIfNeeded() internal
function _resetMonthlyLimitIfNeeded() internal

// Analytics updates
function _updateAnalytics(address user, uint256 gasUsed) internal

// Low balance check
function _checkLowBalance() internal
```

#### View Functions (Public Getters)

```solidity
// Whitelist Queries
function isContractWhitelisted(address contractAddress) external view returns (bool)
function isFunctionWhitelisted(address contractAddress, bytes4 selector) external view returns (bool)
function getWhitelistedContracts() external view returns (address[] memory)

// Spending Limit Queries
function getRemainingDailyLimit() external view returns (uint256)
function getRemainingMonthlyLimit() external view returns (uint256)
function getRemainingGlobalLimit() external view returns (uint256)
function getSpendingLimitStatus() external view returns (SpendingLimit memory)

// Analytics Queries
function getAnalytics() external view returns (
    uint256 totalTransactions,
    uint256 totalGasSpent,
    uint256 uniqueUsers
)

// Balance Queries
function getBalance() external view returns (uint256)
function isLowBalance() external view returns (bool)
```

### Events

```solidity
event Deposited(address indexed owner, uint256 amount, uint256 newBalance);
event Withdrawn(address indexed owner, uint256 amount, uint256 newBalance);
event MetaTransactionExecuted(
    address indexed user,
    address indexed target,
    bytes4 indexed functionSelector,
    uint256 gasUsed,
    bool success
);
event ContractWhitelisted(address indexed contractAddress);
event ContractRemovedFromWhitelist(address indexed contractAddress);
event FunctionWhitelisted(address indexed contractAddress, bytes4 indexed selector);
event FunctionRemovedFromWhitelist(address indexed contractAddress, bytes4 indexed selector);
event SpendingLimitUpdated(string limitType, uint256 newLimit);
event LowBalanceAlert(uint256 currentBalance, uint256 threshold);
event Paused(address indexed owner);
event Unpaused(address indexed owner);
event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
event PreFlightCheckPerformed(address indexed user, address indexed target, bool canExecute, uint8 errorCode);
event BatchWhitelistUpdated(address indexed contractAddress, uint256 functionsAdded, uint256 functionsRemoved);
```

### Custom Errors

```solidity
error Unauthorized();
error InsufficientBalance();
error ContractNotWhitelisted(address contractAddress);
error FunctionNotWhitelisted(address contractAddress, bytes4 selector);
error InvalidSignature();
error InvalidNonce(uint256 expected, uint256 provided);
error TransactionFailed();
error ExceededPerTransactionLimit(uint256 gasUsed, uint256 limit);
error ExceededDailyLimit(uint256 dailySpent, uint256 limit);
error ExceededMonthlyLimit(uint256 monthlySpent, uint256 limit);
error ExceededGlobalLimit(uint256 globalSpent, uint256 limit);
error ContractPaused();
error ZeroAddress();
error InvalidAmount();
error TransactionExpired(uint256 deadline, uint256 currentTime);
error GasLimitTooHigh(uint256 requested, uint256 maximum);
```

### Modifiers

```solidity
modifier onlyOwner() {
    if (msg.sender != owner) revert Unauthorized();
    _;
}

modifier whenNotPaused() {
    if (paused) revert ContractPaused();
    _;
}

modifier onlyRelayer() {
    // Check if msg.sender is approved relayer via RelayerHub
    if (!IRelayerHub(relayerHub).isApprovedRelayer(msg.sender)) revert Unauthorized();
    _;
}

modifier nonReentrant() {
    // SECURITY: Prevent reentrancy attacks
    // Uses OpenZeppelin's ReentrancyGuard pattern
    require(!executionLocked, "ReentrancyGuard: reentrant call");
    executionLocked = true;
    _;
    executionLocked = false;
}

modifier lockExecution() {
    // SECURITY: Prevent withdrawals during transaction execution
    executionLocked = true;
    _;
    executionLocked = false;
}
```

### Design Patterns Used

1. **EIP-712 (Typed Structured Data Signing)**
   - User-friendly signature format
   - Prevents phishing attacks
   - Clear transaction data in wallet

2. **Checks-Effects-Interactions**
   - All validation first
   - State updates second
   - External calls last

3. **Reentrancy Guard**
   - Protect fund management functions
   - Use OpenZeppelin's ReentrancyGuard

4. **Pull Over Push (Withdrawal Pattern)**
   - Owner withdraws funds, contract doesn't push
   - Prevents failure in fund transfers

5. **Circuit Breaker (Pause)**
   - Emergency stop mechanism
   - Owner can pause all operations

6. **Two-Step Ownership Transfer**
   - Prevents accidental ownership loss
   - New owner must accept

7. **Deadline Expiration (Front-Running Protection)**
   - All transactions include deadline timestamp
   - Prevents stale transactions
   - Mitigates front-running attacks

8. **Execution Lock (Withdrawal Protection)**
   - Locks withdrawals during transaction execution
   - Prevents developer from draining funds mid-transaction
   - Critical for relayer reimbursement security

---

## 2. PaymasterFactory Contract

**Purpose:** Deploy and track Paymaster instances for developers using minimal proxy pattern.

### State Variables

```solidity
address public currentImplementation;  // Current Paymaster implementation
address public relayerHub;            // Reference to RelayerHub

// Registry
mapping(address => address[]) public ownerToPaymasters;
mapping(address => address) public paymasterToOwner;
mapping(address => uint256) public paymasterToVersion;  // Track which version each uses
address[] public allPaymasters;

// Implementation Version Tracking (Critical for auditing & debugging)
struct ImplementationVersion {
    address implementation;    // Implementation contract address
    uint256 timestamp;        // When this version was added
    string version;          // Semantic version (e.g., "v1.0.0")
    string description;      // What changed in this version
    bool deprecated;         // Is this version deprecated?
}
ImplementationVersion[] public implementationHistory;
uint256 public currentVersionIndex;

// Deployment fee (optional monetization)
uint256 public deploymentFee;
```

### Key Functions

```solidity
// Deploy new Paymaster for developer
function createPaymaster() external payable returns (address paymaster)

// Deploy with initial configuration
function createPaymasterWithConfig(
    uint256 initialDeposit,
    address[] calldata whitelistedContracts,
    uint256 dailyLimit,
    uint256 monthlyLimit
) external payable returns (address paymaster)

// Registry queries
function getPaymasters(address owner) external view returns (address[] memory)
function getAllPaymasters() external view returns (address[] memory)
function getTotalPaymasters() external view returns (uint256)
function isPaymaster(address addr) external view returns (bool)

// Admin functions (onlyOwner)
function setDeploymentFee(uint256 fee) external onlyOwner
function withdrawFees() external onlyOwner

// IMPLEMENTATION VERSION MANAGEMENT (Critical for system evolution)
function updateImplementation(
    address newImplementation,
    string calldata version,
    string calldata description
) external onlyOwner

function deprecateVersion(uint256 versionIndex) external onlyOwner

// Query functions for Dashboard/SDK
function getCurrentImplementation() external view returns (
    address implementation,
    string memory version,
    uint256 timestamp
)

function getImplementationHistory() external view returns (ImplementationVersion[] memory)

function getPaymasterVersion(address paymaster) external view returns (uint256 versionIndex)

function isPaymasterDeprecated(address paymaster) external view returns (bool)
```

### Events

```solidity
event PaymasterCreated(
    address indexed owner,
    address indexed paymasterAddress,
    uint256 versionIndex,
    uint256 timestamp
);
event DeploymentFeeUpdated(uint256 oldFee, uint256 newFee);
event ImplementationUpdated(
    address indexed oldImplementation, 
    address indexed newImplementation,
    uint256 versionIndex,
    string version
);
event VersionDeprecated(uint256 indexed versionIndex, string version);
```

### Design Patterns Used

1. **Minimal Proxy (EIP-1167 / Clones)**
   - Gas-efficient deployment (~10x cheaper)
   - All Paymasters share same logic
   - Each has isolated storage

2. **Factory Pattern**
   - Centralized deployment
   - Easy tracking of all instances
   - Standardized configuration

3. **Registry Pattern**
   - Track ownership
   - Enable discovery
   - Support dashboard queries

---

## 3. RelayerHub Contract

**Purpose:** Central registry and configuration for the entire system.

### State Variables

```solidity
// Governance
address public owner;
address public pendingOwner;

// Registry
address public paymasterFactory;
mapping(address => bool) public approvedRelayers;
address[] public approvedRelayersList;

// Platform Fee Configuration
struct PlatformFee {
    uint256 feePercentage;      // Basis points (e.g., 100 = 1%)
    address feeRecipient;       // Where fees are sent
    bool enabled;               // Fee on/off switch
}
PlatformFee public platformFee;

// System Configuration
uint256 public minPaymasterBalance;     // Minimum balance for active Paymaster
uint256 public maxGasLimit;             // Maximum gas limit per transaction
```

### Key Functions

```solidity
// Relayer Management
function addRelayer(address relayer) external onlyOwner
function removeRelayer(address relayer) external onlyOwner
function isApprovedRelayer(address relayer) external view returns (bool)
function getApprovedRelayers() external view returns (address[] memory)

// Factory Management
function setPaymasterFactory(address factory) external onlyOwner

// Fee Configuration
function setPlatformFee(uint256 feePercentage, address feeRecipient) external onlyOwner
function enablePlatformFee() external onlyOwner
function disablePlatformFee() external onlyOwner

// System Configuration
function setMinPaymasterBalance(uint256 minBalance) external onlyOwner
function setMaxGasLimit(uint256 maxGas) external onlyOwner

// Ownership
function transferOwnership(address newOwner) external onlyOwner
function acceptOwnership() external
```

### Events

```solidity
event RelayerAdded(address indexed relayer);
event RelayerRemoved(address indexed relayer);
event PaymasterFactoryUpdated(address indexed oldFactory, address indexed newFactory);
event PlatformFeeUpdated(uint256 feePercentage, address feeRecipient);
event PlatformFeeEnabled();
event PlatformFeeDisabled();
event SystemConfigUpdated(string parameter, uint256 value);
```

### Design Patterns Used

1. **Service Locator**
   - Central point for configuration
   - Contracts query Hub for addresses
   - Easy to update system-wide settings

2. **Access Control Lists (ACL)**
   - Approved relayer registry
   - Multiple authorized actors
   - Granular permissions

3. **Configuration Management**
   - Single source of truth
   - Version control for settings
   - Audit trail via events

---

## 4. Supporting Libraries

### MetaTxLib.sol

```solidity
library MetaTxLib {
    // EIP-712 type hashes
    bytes32 constant META_TX_TYPEHASH = keccak256(
        "MetaTransaction(address user,address target,bytes data,uint256 gasLimit,uint256 nonce,uint256 deadline)"
    );
    
    function hashMetaTx(...) internal pure returns (bytes32)
    function recoverSigner(bytes32 hash, bytes memory signature) internal pure returns (address)
    function toTypedDataHash(bytes32 domainSeparator, bytes32 structHash) internal pure returns (bytes32)
}
```

### SpendingLimitLib.sol

```solidity
library SpendingLimitLib {
    function isNewDay(uint256 lastReset) internal view returns (bool)
    function isNewMonth(uint256 lastReset) internal view returns (bool)
    function getCurrentDay() internal view returns (uint256)
    function getCurrentMonth() internal view returns (uint256)
    function checkLimit(uint256 spent, uint256 limit, uint256 newAmount) internal pure returns (bool)
}
```

---

## Best Practices & Security Considerations

### 1. Gas Optimization
- Use `uint256` over smaller types (unless packing)
- Cache array lengths in loops
- Use `calldata` instead of `memory` for read-only parameters
- Batch operations where possible
- Use events for data that doesn't need on-chain storage

### 2. Security

#### Critical Security Features (MUST IMPLEMENT)

**A. Reentrancy Protection**
```solidity
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Paymaster is ReentrancyGuard {
    function executeMetaTransaction(...) external nonReentrant {
        // Protected from reentrancy attacks
    }
    
    function withdraw(uint256 amount) external onlyOwner nonReentrant {
        // Protected from reentrancy attacks
    }
}
```

**B. Withdrawal Lock During Execution**
```solidity
bool private executionLocked;

function executeMetaTransaction(...) external {
    executionLocked = true; // Lock withdrawals
    
    // Execute transaction...
    
    // Reimburse relayer BEFORE unlocking
    _reimburseRelayer(gasCost);
    
    executionLocked = false; // Unlock
}

function withdraw(uint256 amount) external onlyOwner {
    require(!executionLocked, "Transaction in progress");
    // Safe to withdraw
}
```

**C. Deadline Protection (Anti-Front-Running)**
```solidity
function executeMetaTransaction(
    ...,
    uint256 deadline
) external {
    // CRITICAL: Check deadline first
    require(block.timestamp <= deadline, "Transaction expired");
    
    // Signature must include deadline
    bytes32 hash = _hashMetaTx(..., deadline);
    address signer = ECDSA.recover(hash, signature);
    require(signer == user, "Invalid signature");
}
```

**D. Nonce Management (Replay Protection)**
```solidity
mapping(address => uint256) public nonces;

function executeMetaTransaction(...) external {
    // Check nonce
    require(nonces[user] == nonce, "Invalid nonce");
    
    // Increment BEFORE external call
    nonces[user]++;
    
    // Now safe to execute
    target.call(data);
}
```

**E. EIP-712 Domain Separation (Cross-Chain Protection)**
```solidity
bytes32 public DOMAIN_SEPARATOR;

constructor() {
    DOMAIN_SEPARATOR = keccak256(abi.encode(
        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
        keccak256(bytes("MantleGaslessRelayer")),
        keccak256(bytes("1")),
        block.chainid,  // Binds to specific chain
        address(this)   // Binds to specific contract
    ));
}
```

**F. Gas Limits (Anti-Griefing)**
```solidity
function executeMetaTransaction(
    ...,
    uint256 gasLimit
) external {
    // Check per-transaction limit
    require(
        gasLimit * tx.gasprice <= spendingLimit.perTransactionLimit,
        "Exceeds per-tx limit"
    );
    
    // Check system-wide limit
    uint256 maxGas = IRelayerHub(relayerHub).maxGasLimit();
    require(gasLimit <= maxGas, "Gas limit too high");
    
    // Execute with limited gas
    target.call{gas: gasLimit}(data);
}
```

**G. Checks-Effects-Interactions Pattern**
```solidity
function executeMetaTransaction(...) external {
    // STEP 1: CHECKS (Validation)
    require(whitelistedContracts[target], "Not whitelisted");
    require(nonces[user] == nonce, "Invalid nonce");
    require(block.timestamp <= deadline, "Expired");
    
    // STEP 2: EFFECTS (State Changes)
    nonces[user]++; // Update state BEFORE external call
    
    // STEP 3: INTERACTIONS (External Calls)
    (bool success, ) = target.call{gas: gasLimit}(data);
    
    // State updates after external call are OK if protected
    balance -= gasCost;
    _reimburseRelayer(gasCost);
}
```

#### Attack Vectors & Mitigations

| Attack | Description | Mitigation |
|--------|-------------|------------|
| **Developer Withdrawal During TX** | Developer drains Paymaster while relayer submits transaction | `executionLocked` + `nonReentrant` |
| **Front-Running** | Attacker submits transaction first with higher gas | `deadline` (5 min expiry) |
| **Reentrancy** | Malicious contract calls back into Paymaster | `ReentrancyGuard` modifier |
| **Replay Attack** | Signature reused multiple times | `nonce` incremented |
| **Cross-Chain Replay** | Signature used on different chain | `chainId` in EIP-712 |
| **Gas Griefing** | Malicious contract wastes gas | `gasLimit` caps + per-tx limits |
| **Signature Forgery** | Attacker creates fake signature | EIP-712 + ECDSA verification |

#### Backend Security Checklist

```typescript
// Pre-flight validation (CRITICAL!)
async validateBeforeSubmit(metaTx, paymasterAddress) {
    // 1. Check Paymaster balance
    const balance = await paymaster.getBalance();
    const estimatedCost = await this.estimateGas(metaTx);
    if (balance < estimatedCost) {
        throw new Error("Insufficient Paymaster balance");
    }
    
    // 2. Check for pending withdrawals
    const pendingTxs = await this.getPendingTransactions(paymasterAddress);
    const hasWithdrawal = pendingTxs.some(tx => 
        tx.method === 'withdraw' || tx.method === 'withdrawAll'
    );
    if (hasWithdrawal) {
        throw new Error("Withdrawal pending - transaction blocked");
    }
    
    // 3. Verify deadline
    if (metaTx.deadline < Math.floor(Date.now() / 1000)) {
        throw new Error("Transaction expired");
    }
    
    // 4. Contract pre-flight check
    const { canExecute, reason } = await paymaster.canExecuteMetaTransaction(...);
    if (!canExecute) {
        throw new Error(reason);
    }
    
    // 5. Rate limiting
    await this.rateLimiter.checkLimit(metaTx.user);
    
    return true;
}
```

### 3. Upgradeability
- Use UUPS proxy pattern (cheaper than Transparent)
- Include upgrade authorization checks
- Test upgrade paths thoroughly
- Document storage layout carefully

### 4. Testing Strategy
- **Unit Tests:** Each function in isolation
- **Integration Tests:** Full transaction flows
- **Fuzz Tests:** Random inputs to find edge cases
- **Invariant Tests:** Properties that should always hold
- **Gas Benchmarks:** Track optimization progress

### 5. Code Quality
- Use NatSpec documentation for all public functions
- Follow Solidity style guide
- Use custom errors (cheaper than require strings)
- Emit events for all state changes
- Use interfaces for contract interactions

---

## Testing Checklist

### Paymaster Tests
- ✅ Deposit and withdrawal flows
- ✅ Whitelist management (add/remove contracts and functions)
- ✅ Meta-transaction execution (happy path)
- ✅ Signature validation and replay protection
- ✅ Spending limits (per-tx, daily, monthly, global)
- ✅ Spending limit resets (daily, monthly)
- ✅ Analytics tracking (tx count, gas, unique users)
- ✅ Low balance alerts
- ✅ Pause/unpause functionality
- ✅ Ownership transfer (2-step)
- ✅ Edge cases: insufficient balance, invalid signatures, unauthorized calls

### Factory Tests
- ✅ Paymaster deployment via minimal proxy
- ✅ Registry tracking (owner -> paymasters)
- ✅ Deployment with initial configuration
- ✅ Deployment fee collection
- ✅ Multiple paymasters per owner

### Hub Tests
- ✅ Relayer approval/removal
- ✅ Factory registration
- ✅ Platform fee configuration
- ✅ System parameter updates

### Integration Tests
- ✅ End-to-end flow: deploy -> fund -> whitelist -> execute
- ✅ Multiple users with same Paymaster
- ✅ Multiple Paymasters with same factory
- ✅ Spending limit scenarios across time periods
- ✅ Low balance alert triggering

---

## Deployment Sequence

1. Deploy `RelayerHub`
2. Deploy `Paymaster` implementation
3. Deploy `PaymasterFactory` with implementation address
4. Register factory in `RelayerHub`
5. Add initial relayer address to `RelayerHub`
6. Verify all contracts on block explorer
7. Deploy test Paymaster via factory
8. Fund and configure test Paymaster
9. Execute test meta-transaction

---

## Solidity Version & Dependencies

```toml
# foundry.toml additions
[profile.default]
solc_version = "0.8.24"
optimizer = true
optimizer_runs = 200
via_ir = true
```

### OpenZeppelin Contracts (v5.0+)

**CRITICAL DEPENDENCIES:**
- `@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol` - For Factory upgradeability
- `@openzeppelin/contracts/proxy/utils/Initializable.sol` - For proxy initialization
- `@openzeppelin/contracts/security/ReentrancyGuard.sol` - **CRITICAL: Prevents reentrancy attacks**
- `@openzeppelin/contracts/security/Pausable.sol` - Emergency circuit breaker
- `@openzeppelin/contracts/utils/cryptography/ECDSA.sol` - **CRITICAL: Signature verification**
- `@openzeppelin/contracts/utils/cryptography/EIP712.sol` - **CRITICAL: Typed data signing**
- `@openzeppelin/contracts/proxy/Clones.sol` - **CRITICAL: Minimal proxy (EIP-1167)**
- `@openzeppelin/contracts/access/Ownable2Step.sol` - Two-step ownership transfer

**Installation:**
```bash
forge install OpenZeppelin/openzeppelin-contracts@v5.0.0
```

---

## Interface Contracts for Phase 2 & 3 Integration

### For Phase 2 (Relayer & SDK) Developers

The Relayer and SDK need these interfaces to interact with contracts:

```solidity
// interfaces/IPaymaster.sol
interface IPaymaster {
    // Meta-transaction structure (for SDK encoding)
    struct MetaTransaction {
        address user;
        address target;
        bytes data;
        uint256 gasLimit;
        uint256 nonce;
        uint256 deadline;
    }
    
    // Core execution function (Relayer calls this)
    function executeMetaTransaction(
        address user,
        address target,
        bytes calldata data,
        uint256 gasLimit,
        uint256 nonce,
        uint256 deadline,  // SECURITY: Required for front-run protection
        bytes calldata signature
    ) external returns (bool success, bytes memory returnData);
    
    // Pre-flight validation (Relayer checks before submitting)
    function canExecuteMetaTransaction(
        address user,
        address target,
        bytes calldata data,
        uint256 gasLimit,
        uint256 nonce,
        uint256 deadline  // SECURITY: Include in validation
    ) external view returns (bool canExecute, uint8 errorCode, string memory reason);
    
    // Gas estimation (SDK uses for fee display)
    function estimateTransactionCost(
        address target,
        bytes calldata data,
        uint256 gasLimit
    ) external view returns (uint256 estimatedGas, uint256 estimatedCostWei);
    
    // Nonce management (SDK needs for signing)
    function nonces(address user) external view returns (uint256);
    
    // Balance checks (SDK shows to users)
    function getBalance() external view returns (uint256);
    
    // EIP-712 domain separator (SDK needs for signing)
    function DOMAIN_SEPARATOR() external view returns (bytes32);
}

// interfaces/IRelayerHub.sol
interface IRelayerHub {
    // Relayer authorization check
    function isApprovedRelayer(address relayer) external view returns (bool);
    
    // Platform fee info (Relayer needs for calculations)
    function platformFee() external view returns (
        uint256 feePercentage,
        address feeRecipient,
        bool enabled
    );
    
    // System limits (SDK needs for validation)
    function maxGasLimit() external view returns (uint256);
}
```

### For Phase 3 (Dashboard) Developers

The Dashboard needs these interfaces for UI interactions:

```solidity
// interfaces/IPaymasterFactory.sol
interface IPaymasterFactory {
    // Deploy new Paymaster
    function createPaymaster() external payable returns (address);
    
    // Deploy with initial config (advanced UI)
    function createPaymasterWithConfig(
        uint256 initialDeposit,
        address[] calldata whitelistedContracts,
        uint256 dailyLimit,
        uint256 monthlyLimit
    ) external payable returns (address);
    
    // Get developer's Paymasters (for Dashboard list view)
    function getPaymasters(address owner) external view returns (address[] memory);
    
    // Check deployment fee (show to user before deploying)
    function deploymentFee() external view returns (uint256);
    
    // Version info (display in UI)
    function getCurrentImplementation() external view returns (
        address implementation,
        string memory version,
        uint256 timestamp
    );
    
    function getPaymasterVersion(address paymaster) external view returns (uint256);
}

// interfaces/IPaymaster.sol (Dashboard-specific functions)
interface IPaymasterDashboard {
    // Fund management
    function deposit() external payable;
    function withdraw(uint256 amount) external;
    function getBalance() external view returns (uint256);
    
    // Whitelist management (UI needs CRUD operations)
    function addWhitelistedContract(address contractAddress) external;
    function removeWhitelistedContract(address contractAddress) external;
    function addWhitelistedFunction(address contractAddress, bytes4 selector) external;
    function batchAddWhitelistedFunctions(address contractAddress, bytes4[] calldata selectors) external;
    function getWhitelistedContracts() external view returns (address[] memory);
    function isFunctionWhitelisted(address contractAddress, bytes4 selector) external view returns (bool);
    
    // Spending limits configuration
    function setPerTransactionLimit(uint256 limit) external;
    function setDailyLimit(uint256 limit) external;
    function setMonthlyLimit(uint256 limit) external;
    function setGlobalLimit(uint256 limit) external;
    function getSpendingLimitStatus() external view returns (
        uint256 perTransactionLimit,
        uint256 dailyLimit,
        uint256 monthlyLimit,
        uint256 globalLimit,
        uint256 dailySpent,
        uint256 monthlySpent,
        uint256 globalSpent,
        uint256 lastResetDay,
        uint256 lastResetMonth
    );
    
    // Analytics (Dashboard charts & stats)
    function getAnalytics() external view returns (
        uint256 totalTransactions,
        uint256 totalGasSpent,
        uint256 uniqueUsers
    );
    
    // Low balance alerts
    function setLowBalanceThreshold(uint256 threshold) external;
    function isLowBalance() external view returns (bool);
    
    // Emergency controls
    function pause() external;
    function unpause() external;
}
```

### Error Codes for SDK/Dashboard (Pre-flight validation)

```solidity
// Standardized error codes returned by canExecuteMetaTransaction
uint8 constant ERROR_SUCCESS = 0;
uint8 constant ERROR_INSUFFICIENT_BALANCE = 1;
uint8 constant ERROR_CONTRACT_NOT_WHITELISTED = 2;
uint8 constant ERROR_FUNCTION_NOT_WHITELISTED = 3;
uint8 constant ERROR_INVALID_SIGNATURE = 4;
uint8 constant ERROR_INVALID_NONCE = 5;
uint8 constant ERROR_TRANSACTION_EXPIRED = 6;
uint8 constant ERROR_EXCEEDED_PER_TX_LIMIT = 7;
uint8 constant ERROR_EXCEEDED_DAILY_LIMIT = 8;
uint8 constant ERROR_EXCEEDED_MONTHLY_LIMIT = 9;
uint8 constant ERROR_EXCEEDED_GLOBAL_LIMIT = 10;
uint8 constant ERROR_PAUSED = 11;
uint8 constant ERROR_GAS_LIMIT_TOO_HIGH = 12;
```

### Events for Real-Time Dashboard Updates

```solidity
// Dashboard should listen to these events for live updates
event MetaTransactionExecuted(
    address indexed user,
    address indexed target,
    bytes4 indexed functionSelector,
    uint256 gasUsed,
    bool success
);

event Deposited(address indexed owner, uint256 amount, uint256 newBalance);
event Withdrawn(address indexed owner, uint256 amount, uint256 newBalance);
event LowBalanceAlert(uint256 currentBalance, uint256 threshold);

event ContractWhitelisted(address indexed contractAddress);
event FunctionWhitelisted(address indexed contractAddress, bytes4 indexed selector);
event BatchWhitelistUpdated(address indexed contractAddress, uint256 functionsAdded, uint256 functionsRemoved);

event SpendingLimitUpdated(string limitType, uint256 newLimit);
```

### SDK TypeScript Types (Example)

```typescript
// For Phase 2 SDK Developer
interface MetaTransaction {
  user: string;           // address
  target: string;         // address
  data: string;          // bytes (hex string)
  gasLimit: bigint;
  nonce: bigint;
  deadline: bigint;
}

interface PreFlightResult {
  canExecute: boolean;
  errorCode: number;
  reason: string;
}

interface GasEstimate {
  estimatedGas: bigint;
  estimatedCostWei: bigint;
}
```

---

## Next Steps for Implementation

1. Set up OpenZeppelin dependencies
2. Create custom error definitions in `Errors.sol`
3. Build libraries (MetaTxLib, SpendingLimitLib)
4. Implement `Paymaster.sol` with all features
5. Implement `PaymasterFactory.sol` with minimal proxy
6. Implement `RelayerHub.sol`
7. Write comprehensive unit tests
8. Write integration tests
9. Deploy to local Anvil node
10. Deploy to Mantle testnet
11. Verify and document

---

This architecture balances **security, flexibility, and gas efficiency** while incorporating all "Should Have" features into the contracts themselves, making them production-ready from day one.
