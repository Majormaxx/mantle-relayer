// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {IPaymaster} from "../interfaces/IPaymaster.sol";

library MetaTxLib {
    bytes32 internal constant META_TX_TYPEHASH = keccak256(
        "MetaTransaction(address user,address target,bytes data,uint256 gasLimit,uint256 nonce,uint256 deadline)"
    );

    function hashMetaTx(IPaymaster.MetaTransaction memory metaTx) internal pure returns (bytes32) {
        return keccak256(
            abi.encode(
                META_TX_TYPEHASH,
                metaTx.user,
                metaTx.target,
                keccak256(metaTx.data), // Hash dynamic data separately per EIP-712
                metaTx.gasLimit,
                metaTx.nonce,
                metaTx.deadline // CRITICAL: Prevents stale/front-run transactions
            )
        );
    }

    function toTypedDataHash(bytes32 domainSeparator, bytes32 structHash)
        internal
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));
    }

    function recoverSigner(bytes32 digest, bytes memory signature)
        internal
        pure
        returns (address signer)
    {
        // ECDSA.recover handles:
        // - Signature format validation
        // - Malleable signature prevention (EIP-2)
        // - Returns address(0) on invalid signature
        // - Supports both 65-byte and 64-byte (EIP-2098) signatures
        signer = ECDSA.recover(digest, signature);
        
        // Note: Caller MUST check if signer == address(0) to catch invalid signatures
        // This library returns address(0) rather than reverting for gas efficiency
        // and to allow the caller to provide custom error messages
    }

    function getMetaTxSigner(
        bytes32 domainSeparator,
        IPaymaster.MetaTransaction memory metaTx,
        bytes memory signature
    ) internal pure returns (address) {
        bytes32 structHash = hashMetaTx(metaTx);
        bytes32 digest = toTypedDataHash(domainSeparator, structHash);
        return recoverSigner(digest, signature);
    }

    function validateSignature(
        bytes32 domainSeparator,
        IPaymaster.MetaTransaction memory metaTx,
        bytes memory signature,
        address expectedSigner
    ) internal pure returns (bool) {
        address signer = getMetaTxSigner(domainSeparator, metaTx, signature);
        
        // Check for invalid signature (ECDSA.recover returns address(0))
        require(signer != address(0), "MetaTxLib: invalid signature format");
        
        // Check signer matches expected
        require(signer == expectedSigner, "MetaTxLib: signer mismatch");
        
        return true;
    }
}
