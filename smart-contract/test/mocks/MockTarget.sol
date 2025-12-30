// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MockTarget
 * @notice Mock contract with various functions for testing Paymaster meta-transactions
 * @dev Includes functions to test different scenarios: success, revert, reentrancy, gas usage
 */
contract MockTarget {
    // ============================================
    // STATE VARIABLES
    // ============================================

    /// @notice Counter incremented by simpleFunction
    uint256 public counter;

    /// @notice Last value passed to functionWithParams
    uint256 public lastValue;

    /// @notice Last text passed to functionWithParams
    string public lastText;

    /// @notice Address of last caller
    address public lastCaller;

    /// @notice Gas used in last expensiveFunction call
    uint256 public lastGasUsed;

    // ============================================
    // EVENTS
    // ============================================

    /**
     * @notice Emitted when any function is called
     * @param functionName Name of the function called
     * @param caller Address of the caller
     */
    event FunctionCalled(string functionName, address caller);

    /**
     * @notice Emitted when functionWithParams is called
     * @param value The uint256 value parameter
     * @param text The string parameter
     */
    event ParametersReceived(uint256 value, string text);

    /**
     * @notice Emitted when expensiveFunction completes
     * @param iterations Number of iterations executed
     * @param gasUsed Approximate gas consumed
     */
    event ExpensiveOperationCompleted(uint256 iterations, uint256 gasUsed);

    // ============================================
    // TEST FUNCTIONS
    // ============================================

    /**
     * @notice Simple function that increments a counter
     * @dev Used to test basic meta-transaction execution
     */
    function simpleFunction() external {
        counter++;
        lastCaller = msg.sender;
        emit FunctionCalled("simpleFunction", msg.sender);
    }

    /**
     * @notice Function that accepts parameters
     * @dev Used to test meta-transactions with encoded parameters
     * @param value A uint256 value to store
     * @param text A string to store
     */
    function functionWithParams(uint256 value, string calldata text) external {
        lastValue = value;
        lastText = text;
        lastCaller = msg.sender;
        
        emit FunctionCalled("functionWithParams", msg.sender);
        emit ParametersReceived(value, text);
    }

    /**
     * @notice Function that always reverts
     * @dev Used to test meta-transaction failure handling
     */
    function functionThatReverts() external pure {
        revert("Intentional revert");
    }

    /**
     * @notice Function that reverts with custom error
     * @dev Used to test custom error handling
     */
    function functionWithCustomError() external pure {
        revert CustomError();
    }

    /**
     * @notice Function that returns a value
     * @dev Used to test return data from meta-transactions
     * @return The current counter value multiplied by 2
     */
    function functionWithReturn() external view returns (uint256) {
        return counter * 2;
    }

    /**
     * @notice Function that returns multiple values
     * @dev Used to test complex return data
     * @return value The last stored value
     * @return text The last stored text
     * @return count The current counter
     */
    function functionWithMultipleReturns() 
        external 
        view 
        returns (uint256 value, string memory text, uint256 count) 
    {
        return (lastValue, lastText, counter);
    }

    /**
     * @notice Function that consumes significant gas
     * @dev Used to test gas limit enforcement and spending limits
     * @param iterations Number of loop iterations (each ~5k gas)
     */
    function expensiveFunction(uint256 iterations) external {
        uint256 startGas = gasleft();
        
        // Burn gas in a loop
        uint256 temp = 0;
        for (uint256 i = 0; i < iterations; i++) {
            temp += i * i;
            temp = temp % 1000;
        }
        
        // Store to prevent optimization
        lastValue = temp;
        lastGasUsed = startGas - gasleft();
        lastCaller = msg.sender;
        
        emit FunctionCalled("expensiveFunction", msg.sender);
        emit ExpensiveOperationCompleted(iterations, lastGasUsed);
    }

    /**
     * @notice Function that attempts reentrancy attack
     * @dev Used to test reentrancy protection in Paymaster
     * @param paymaster Address of Paymaster to attack
     *
     * SECURITY NOTE: This should FAIL when called via Paymaster
     * because Paymaster has nonReentrant and executionLocked protections
     */
    function reentrancyAttempt(address paymaster) external {
        lastCaller = msg.sender;
        emit FunctionCalled("reentrancyAttempt", msg.sender);
        
        // Attempt to call withdraw on Paymaster during execution
        // This should fail due to executionLocked flag
        (bool success, ) = paymaster.call(
            abi.encodeWithSignature("withdraw(uint256)", 1 ether)
        );
        
        // If reentrancy succeeds, it's a security vulnerability!
        require(!success, "Reentrancy protection failed!");
    }

    /**
     * @notice Function that attempts to call another function
     * @dev Used to test nested calls
     * @param target Address to call
     * @param data Calldata to execute
     * @return success Whether the call succeeded
     * @return returnData Return data from the call
     */
    function nestedCall(
        address target,
        bytes calldata data
    ) external returns (bool success, bytes memory returnData) {
        lastCaller = msg.sender;
        emit FunctionCalled("nestedCall", msg.sender);
        
        (success, returnData) = target.call(data);
        return (success, returnData);
    }

    /**
     * @notice Function that accepts ETH payment
     * @dev Used to test payable meta-transactions (if supported)
     */
    function payableFunction() external payable {
        lastValue = msg.value;
        lastCaller = msg.sender;
        emit FunctionCalled("payableFunction", msg.sender);
    }

    /**
     * @notice Function with access control (only specific caller)
     * @dev Used to test that msg.sender is Paymaster, not user
     * @param expectedCaller Address that should be msg.sender
     */
    function functionWithAccessControl(address expectedCaller) external view {
        require(msg.sender == expectedCaller, "Unauthorized caller");
    }

    /**
     * @notice Function that emits multiple events
     * @dev Used to test event handling
     */
    function functionWithMultipleEvents() external {
        lastCaller = msg.sender;
        counter++;
        
        emit FunctionCalled("functionWithMultipleEvents", msg.sender);
        emit ParametersReceived(counter, "multiple events");
    }

    /**
     * @notice Function that modifies storage extensively
     * @dev Used to test storage gas costs
     */
    function storageHeavyFunction() external {
        for (uint256 i = 0; i < 10; i++) {
            counter++;
        }
        lastValue = counter;
        lastText = "storage heavy";
        lastCaller = msg.sender;
        
        emit FunctionCalled("storageHeavyFunction", msg.sender);
    }

    // ============================================
    // VIEW FUNCTIONS
    // ============================================

    /**
     * @notice Get all stored values
     * @return _counter Current counter value
     * @return _lastValue Last stored value
     * @return _lastText Last stored text
     * @return _lastCaller Last caller address
     */
    function getState() 
        external 
        view 
        returns (
            uint256 _counter,
            uint256 _lastValue,
            string memory _lastText,
            address _lastCaller
        ) 
    {
        return (counter, lastValue, lastText, lastCaller);
    }

    /**
     * @notice Pure function for testing (no state access)
     * @param a First number
     * @param b Second number
     * @return Sum of a and b
     */
    function pureFunction(uint256 a, uint256 b) external pure returns (uint256) {
        return a + b;
    }

    // ============================================
    // RESET FUNCTIONS (for test cleanup)
    // ============================================

    /**
     * @notice Reset all state variables
     * @dev Useful for test cleanup between test cases
     */
    function reset() external {
        counter = 0;
        lastValue = 0;
        lastText = "";
        lastCaller = address(0);
        lastGasUsed = 0;
    }

    // ============================================
    // ERRORS
    // ============================================

    /// @notice Custom error for testing
    error CustomError();

    // ============================================
    // RECEIVE/FALLBACK
    // ============================================

    /**
     * @notice Receive function to accept ETH
     */
    receive() external payable {}

    /**
     * @notice Fallback function
     */
    fallback() external payable {}
}
