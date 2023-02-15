//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol"; // OZ: MerkleProof

contract MerkleWhitelist {
    bytes32 public merkleRoot;

    error NotWhitelisted();

    constructor() {}

    function isWhitelisted(address to, bytes32[] calldata proof) internal {
       // verify merkle proof
       bytes32 leaf = keccak256(abi.encodePacked(to));
       bool isValid = MerkleProof.verify(proof, merkleRoot, leaf);
       if(!isValid) revert NotWhitelisted();
    }

    function changeMerkleRoot(bytes32 _merkleRoot) internal {
        require( _merkleRoot != bytes32(0), "merkleRoot is the zero address");
        merkleRoot = _merkleRoot;
    }
}