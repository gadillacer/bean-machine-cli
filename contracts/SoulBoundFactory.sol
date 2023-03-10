//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./SoulBoundProxyRegistry.sol";

// TODO: make pausable
contract SoulBoundNFTFactory is Ownable {
  //===== State =====//

  SoulBoundNFTProxyRegistry public proxyRegistry;
  address[] soulbounds;
  mapping(address => address) private soulboundAddressToCreator;
  mapping(address => address[]) private creatorToSoulBoundAddresses;

  //===== Events =====//

  event UpgradeableBeaconCreated(address indexed createdBy, address beacon, address initialImplementation);
  event BeaconProxyCreated(address indexed beacon, address beaconProxy);

  constructor(address _proxyRegistry) {
    proxyRegistry = SoulBoundNFTProxyRegistry(_proxyRegistry);
  }

  function payload(
    string memory name,
    string memory symbol,
    bool transferable,
    bool mintable,
    uint256 mintPrice,
    address tokenOwner
  ) internal pure returns (bytes memory) {
    return
      abi.encodeWithSignature(
        "initialize(string,string,bool,bool,uint256,address)",
        name,
        symbol,
        transferable,
        mintable,
        mintPrice,
        tokenOwner
      );
  }

  /// newUpgradeableBeacon creates a new beacon with an initial implementation set
  /// @param initialImplementation sets the first iteration of logic for proxies
  function newUpgradeableBeacon(address initialImplementation) public onlyOwner returns (UpgradeableBeacon beacon) {
    beacon = new UpgradeableBeacon(initialImplementation);
    beacon.transferOwnership(msg.sender);

    emit UpgradeableBeaconCreated(msg.sender, address(beacon), initialImplementation);

    // beaconAddress = address(beacon);
    proxyRegistry.setBeaconAddress(address(beacon));
  }

  /// newBeaconProxy creates and initializes a new proxy for the given UpgradeableBeacon
  function newBeaconProxy(
    string memory name,
    string memory symbol,
    bool transferable,
    bool mintable,
    uint256 mintPrice,
    address tokenOwner
  ) public returns (BeaconProxy beaconProxy) {
    address beaconAddress = proxyRegistry.beaconAddress();
    bytes memory data = payload(name, symbol, transferable, mintable, mintPrice, tokenOwner);
    beaconProxy = new BeaconProxy(beaconAddress, data);
    proxyRegistry.registerBeaconProxy(address(beaconProxy), name, symbol, tokenOwner);
    emit BeaconProxyCreated(beaconAddress, address(beaconProxy));
  }
}
