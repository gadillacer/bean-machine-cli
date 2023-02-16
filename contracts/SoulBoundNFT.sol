//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721VotesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import "@openzeppelin/contracts/utils/Counters.sol";
import "./MerkleWhitelist.sol";

/**
 *
 * Account-Bound NFT
 *
 * Assumes the tokens are non-transferable.
 *
 * Assume at extreme condition (lost private key), community multisig (supervisor) can transfer the token to the new wallet under the approvement of the token holder.
 *
 */

contract SoulBoundNFT is Initializable, AccessControlUpgradeable, ERC721VotesUpgradeable, ERC721BurnableUpgradeable, PausableUpgradeable, UUPSUpgradeable, MerkleWhitelist {
  using Counters for Counters.Counter;
  bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
  bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
  bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
  bytes32 public constant SUPERVISOR_ROLE = keccak256("SUPERVISOR_ROLE");

  //===== Interfaces =====//

  struct TokenOwnerInfo {
    string nickName;
    string role;
  }

  //===== State =====//
  Counters.Counter internal _counter;

  address payable devVault;

  bool internal _transferable;
  bool internal _mintable;
  uint256 internal _mintPrice;

  address internal _vault;
  address internal _supervisor;

  mapping(uint256 => TokenOwnerInfo) internal _tokenOwnerInfo;
  mapping(uint256 => address) internal _mintedTo;

  string private walletMintListURI;
  uint256 public mintDate = block.timestamp + 5 minutes;
  bool public whitelistOnly = false;
  string private _baseTokenURI = "";

  //===== Events =====//

  event ToggleTransferable(bool transferable);
  event ToggleMintable(bool mintable);

  //===== Initializer =====//

  /// @custom:oz-upgrades-unsafe-allow constructor
  // `initializer` marks the contract as initialized to prevent third parties to
  // call the `initialize` method on the implementation (this contract)
  constructor() initializer {}

  function initialize(
    string memory name_,
    string memory symbol_,
    bool transferable_,
    bool mintable_,
    uint256 mintPrice_,
    address ownerOfToken
  ) public initializer {
    __ERC721_init(name_, symbol_);
    __AccessControl_init();

    _transferable = transferable_;
    _mintable = mintable_;
    _mintPrice = mintPrice_;


    _vault = ownerOfToken;

    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _grantRole(UPGRADER_ROLE, msg.sender);

    _grantRole(DEFAULT_ADMIN_ROLE, ownerOfToken);
    _grantRole(PAUSER_ROLE, ownerOfToken);
    _grantRole(MINTER_ROLE, ownerOfToken);
  }

  //===== Internal Functions =====//

  //===== External Functions =====//
  fallback() external payable {
    return;
  }

  receive() external payable {
    return;
  }

  function batchMint(
    address[] calldata toAddresses
  ) external onlyRole(MINTER_ROLE) whenNotPaused {

    for (uint256 i = 0; i < toAddresses.length; i++) {
      _mint(toAddresses[i]);
    }
  }

  function burn(uint256 tokenId) public override(ERC721BurnableUpgradeable) exists(tokenId) onlyMinterOrTokenOwner(tokenId) {
    _burn(tokenId);
  }

  function batchBurn(uint256[] calldata tokenIds) external onlyRole(MINTER_ROLE) {
    for (uint256 i = 0; i < tokenIds.length; i++) {
      require(_exists(tokenIds[i]), "SoulBoundNFT: Non-existent token");
      burn(tokenIds[i]);
    }
  }
  
  function _baseURI() internal view override virtual returns(string memory) {
    return _baseTokenURI;
  }

  function _setBaseURI(string memory baseTokenURI) public virtual onlyRole(DEFAULT_ADMIN_ROLE) {
    _baseTokenURI = baseTokenURI;
  }

  function toggleTransferable() external onlyRole(PAUSER_ROLE) returns (bool) {
    if (_transferable) {
      _transferable = false;
    } else {
      _transferable = true;
    }
    emit ToggleTransferable(_transferable);
    return _transferable;
  }

  function toggleMintable() external onlyRole(MINTER_ROLE) returns (bool) {
    if (_mintable) {
      _mintable = false;
    } else {
      _mintable = true;
    }
    emit ToggleMintable(_mintable);
    return _mintable;
  }

  function setMintPrice(uint256 mintPrice) external onlyRole(MINTER_ROLE) {
    _mintPrice = mintPrice;
  }

  /**
    * @dev onlyOwner can set the Supervisor - A multisig DAO or any trustable smart contract. It's flexible
  **/
  function setSupervisor(address _dao) external onlyRole(DEFAULT_ADMIN_ROLE) {
    // WIP: Should make a more careful check (ERC165 - Multisig Standard)
    _supervisor = _dao;
  }

  //===== Public Functions =====//

  function version() public pure returns (uint256) {
    return 1;
  }

  function mint() public payable whenNotPaused {
    // MINTER_ROLE can mint for free - gifting memberships
    // Otherwise users have to pay
    if (_mintable) {
      require(msg.value >= _mintPrice, "SoulBoundNFT: insufficient funds!");
      require(!whitelistOnly, "SoulBoundNFT: whitelist only mint!");
      require(block.timestamp > mintDate, "Minting not yet started");
      _mint(msg.sender);
    } else {
      revert("SoulBoundNFT: not allowed to mint!");
    }
  }

  function whitelistMint(bytes32[] calldata merkleProof) external payable {
    if (_mintable) {
        require(whitelistOnly, "require whitelisted option enabled");
        isWhitelisted(msg.sender, merkleProof);
        require(msg.value >= _mintPrice, "SoulBoundNFT: insufficient funds!");
        require(block.timestamp > mintDate, "Minting not yet started");
        _mint(msg.sender);
    } else {
        revert("SoulBoundNFT: not allowed to mint!");
    }
  }

  function setMintDate(uint256 _mintDate) public onlyRole(DEFAULT_ADMIN_ROLE) {
    mintDate = _mintDate;
  }

  function setWalletMintListURI(string memory _walletMintList) public virtual onlyRole(DEFAULT_ADMIN_ROLE) {
    walletMintListURI = _walletMintList;
  }

  function setWhitelistOnly(bool _state, bytes32 _merkleRoot) public onlyRole(DEFAULT_ADMIN_ROLE) {
    whitelistOnly = _state;
    changeMerkleRoot(_merkleRoot);
  }

  function transferable() public view returns (bool) {
    return _transferable;
  }

  function mintable() public view returns (bool) {
    return _mintable;
  }

  function mintPrice() public view returns (uint256) {
    return _mintPrice;
  }

  function nextId() public view returns (uint256) {
    return _counter.current();
  }

  function getWalletMintListURI() public view virtual returns (string memory) {
    return bytes(walletMintListURI).length > 0 ? walletMintListURI : "";
  }

  function withdraw() public {
    uint256 devFee = (address(this).balance / 100) * 1;
    (bool donation, ) = devVault.call{ value: devFee }("");
    require(donation);

    (bool release, ) = payable(_vault).call{ value: address(this).balance }("");
    require(release);
  }

  // Added isTransferable only
  function approve(address to, uint256 tokenId) public override isTransferable {
    address ownerOfToken = ownerOf(tokenId);
    require(to != ownerOfToken, "ERC721: approval to current owner");

    require(_msgSender() == ownerOfToken || isApprovedForAll(ownerOfToken, _msgSender()), "ERC721: approve caller is not owner nor approved for all");

    _approve(to, tokenId);
  }

  /**
    * @dev onlySupervisor (Community Multisig) can transfer, also see {IERC721-transferFrom}.
    */
  function transferFrom(
    address from,
    address to,
    uint256 tokenId
  ) public override onlySupervisor {
    //solhint-disable-next-line max-line-length
    // require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: transfer caller is not owner nor approved");

    _transfer(from, to, tokenId);
  }

  /**
    * @dev onlySupervisor (Community Multisig) can transfer, also see {IERC721-safeTransferFrom}.
    */
  function safeTransferFrom(
    address from,
    address to,
    uint256 tokenId,
    bytes memory _data
  ) public override onlySupervisor {
    // require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: transfer caller is not owner nor approved");
    _safeTransfer(from, to, tokenId, _data);
  }

  //===== Internal Functions =====//

  function _mint(
    address to
  ) internal whenNotPaused {
    uint256 tokenId = _counter.current();
    _mintedTo[tokenId] = to;
    _safeMint(to, tokenId);
    _counter.increment();
  }

  function _afterTokenTransfer(
      address from,
      address to,
      uint256 firstTokenId,
      uint256 batchSize
  ) internal virtual override(ERC721Upgradeable, ERC721VotesUpgradeable) {
      super._afterTokenTransfer(from, to, firstTokenId, batchSize);
  }

  function _authorizeUpgrade(
    address /*newImplementation*/
  ) internal virtual override {
    require(hasRole(UPGRADER_ROLE, msg.sender), "Unauthorized Upgrade");
  }

  //===== Modifiers =====//

  modifier isTransferable() {
    require(transferable() == true, "SoulBoundNFT: not transferable");
    _;
  }

  modifier exists(uint256 tokenId) {
    require(_exists(tokenId), "token doesn't exist or has been burnt");
    _;
  }

  modifier onlySupervisor() {
    require(_msgSender() == _supervisor, "sender is not the mighty supervisor");
    _;
  }

  modifier onlyMinterOrTokenOwner(uint256 tokenId) {
    require(_exists(tokenId), "token doesn't exist or has been burnt");
    require(_msgSender() == ownerOf(tokenId) || hasRole(MINTER_ROLE, msg.sender), "sender not owner or token owner");
    _;
  }

  // The following functions are overrides required by Solidity.

  function supportsInterface(bytes4 interfaceId) public view override(ERC721Upgradeable, AccessControlUpgradeable) returns (bool) {
    return super.supportsInterface(interfaceId);
  }
}