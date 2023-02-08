const { MerkleTree } = require('merkletreejs')
// const SHA256 = require('crypto-js/sha256')
const keccak256 = require('keccak256');
const fs = require("fs");
const BASEDIR = process.cwd();
const { FOLDERS } = require(`${BASEDIR}/constants/folders.js`);
const { NFT_DETAILS } = require(`${FOLDERS.constantsDir}/nft_details.js`);
const { MakeSoulMint } = require('./soulmint');
// const {Command} = require('commander')

async function main() {
    const soulmint = await MakeSoulMint();
    // start date
    if (NFT_DETAILS.collectionMintDate)
        await soulmint.setContractMintDate(NFT_DETAILS.collectionMintDate);
    else 
        console.log("mint date not set yet");


    if (NFT_DETAILS.isWhitelistOnly) {
        // create merkle tree
        const walletAddressMintList = await JSON.parse(fs.readFileSync(`${FOLDERS.ipfsMetasDir}/_walletAddressMintList.json`));
        
        const leaves = walletAddressMintList.map(x => keccak256(x))
        const tree = new MerkleTree(leaves, keccak256, { sort: true })
        const root = tree.getRoot()

        await soulmint.setContractWhiteListOnly(root)
        console.log("Upload Whitelist Merkle Root Successfully")
    }

    process.exit(0);
}

main();