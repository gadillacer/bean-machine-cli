const NFT_DETAILS = {
  description: "CyberPunks", // Set the description that will be added to each of your NFTs
  namePrefix: "Cyber", // Set the name prefix that will be added for each of your NFTs. Ex. Steaks #1, Steaks #2
  imageFilesBase: "ipfs://QmNSiWcUdWcYBFnwheq2Sb3rHCFnUGqbYDu8hAuHB8rF4q", // Set the pinned IPFS CID when making use of a service like Pinata. Ex. QmP12prm2rp1omr1Ap2orm1oprm12FQWFQOFOGdnasnsda
  metaDataJSONFilesBase: "ipfs://QmNSiWcUdWcYBFnwheq2Sb3rHCFnUGqbYDu8hAuHB8rF4q", // Set the pinned IPFS CID when making use of a service like Pinata. Ex. QmP12prm2rp1omr1Ap2orm1oprm12FQWFQOFOGdnasndca
  ignoreExactBlankName: true, // This value is a boolean with a value of false or true. If true, then any layer items where the image name is blank, then it will skip that layer when adding metadata information. When set to false, then the information will be added to the metadata.
  genericTitle: "GENERIC_NAMEPREFIX_HERE", // Set the generic name prefix that you want the NFTs to have. Only change if you are planning on using NFT reveal. E.x Unknown
  genericDescription: "GENERIC_DESCRIPTION_HERE", // Set the generic description that you want the NFTs to have. Only change if you are planning on using NFT reveal. E.x Unknown
  genericURLs: ["GENERIC_URL_#1_HERE", "GENERIC_URL_#2_HERE", "GENERIC_URL_XXX_HERE"], // Set the generic image URLs that you want the NFTs to have. Only change if you are planning on using NFT reveal. E.x for single generic URL - ["https://ipfs.io/ipfs/bafkreigye3xz72jp2eskhrgq4blhh5ec3wwbj4isqejv4a6mdhqzcuvquy"] E.x for multiple generic URLs ["https://ipfs.io/ipfs/bafkreigye3xz72jp2eskhrgq4blhh5ec3wwbj4isqejv4a6mdhqzcuvquy", "https://ipfs.io/ipfs/bafybeignyrtyoc2ynlbrsl4jgwvyj26gdipmid6cdvleb6yptyhoabugiy", "https://ipfs.io/ipfs/bafybeieg2wctxhtnwmfatzufgthh7sfowwtldlqqcl2noqj26qxzxg5iry"]
  ignoreAllNamesWithBlank: false, // This value is a boolean with a value of false or true. If true, then any layer item that contains the word blank within the filename will be skipped from being added to the metadata information. When set to false, then the information will be added to the metadata. E.x white_eyes_blank #100.png will be added to metadata if set to false, while being skipped if true.
  startCollectionEditionFrom: '0', // Set the starting edition number of your collection. If you need to make use of Collection Contracts from , then be sure to set this to 0. If network is set to sol, then both any value less than 2 will start the collection from 0.
  collectionMintDate: 7744205, // Unix-timestamp
  isWhitelistOnly: false,
  walletMintList: [
    {
      "wallet_address": "0xfED930B2DBbc52996b2E107F1396d82256F41c41",
      "nft_count": "1"
    },
    {
      "wallet_address": "0xcEAa254a4df4f2eB888a09E498b55b618893B0A8",
      "nft_count": "1"
    }
  ] // (Whitelist on) Set your wallet list that consists of multiple wallets along with how many NFTs should be minted to each wallet address. E.x [ {"wallet_address": "WALLET_ADDRESS_ONE", "nft_count": "20"}, {"wallet_address": "WALLET_ADDRESS_TWO", "nft_count": "3"}, {"wallet_address": "WALLET_ADDRESS_THREE", "nft_count": "39"}]
};

module.exports = {
  NFT_DETAILS
};
