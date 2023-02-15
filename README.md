# The Bean Machine

Using this fully-functional minting machine to easily create your SoulBound by uploading image layers, config options, then build and export it the [Bean UI](github.com/gadillacer/bean-machine-frontend.git)

Main Smart contract: contracts/SoulBoundNFT.sol

Features:
- Non-Transferable
- Community Mutisig Recovery (Flexible)
- Gas-Efficient Metadata BaseURI
- Upgradeable
- Votes Power
- WhiteList, MintDate supported

File Uploads can be done via [Pinata](https://app.pinata.cloud/)

**Please note that if you have a Mac with a M1 chip and you run into issues with npm install, then please try to install Node.js version 14 instead of the latest Node version and try the npm install again**

<br/>

## Non-Transferable ERC721 Contract Examples
- [EXAMPLE - ERC721]
     - `npm install`
     - `npm chain`
     - Put your artwork layers at layers/
     - Update src/art_config.js
     - `npm build`
     - Update config/default.js & prepare a wallet
     - `npm deploy_goerli`
     - Update constants/nft_details.js
     - `npm pin_files`
     - `npm update_machine`

<br/>

## Code Repo Guide
- [How To Use The Codebase](#how-to-use-the-codebase)
     - [1. Run `npm install` then `npm chain`]()
     - [2. Update The Main Configuration File For The Art Engine](#2-update-the-main-configuration-file-for-the-art-engine)
          - [a. Update your layer configurations](#a-update-your-layer-configurations)
          - [b. Update the width and height of your canvas](#b-update-the-width-and-height-of-your-canvas)
          - [c. Update the extra metadata that you want to add into your NFT's metadata. You can remove both fields inside of this extraMetadata object or add more if you like](#c-update-the-extra-metadata-that-you-want-to-add-into-your-nfts-metadata-you-can-remove-both-fields-inside-of-this-extrametadata-object-or-add-more-if-you-like)
     - [3. Configure The NFT Creation Details](#3-configure-the-nft-creation-details)
     - [4. Configure The Token Contract and Deployment](#4-configure-the-token-contract-and-deployment)
     - [5. Create Image Layers](#5-create-image-layers)
     - [6. Art Engine](#6-art-engine)
          - [a. Creation / Build](#a-creation--build)
          - [b. Additional Art Creation Options](#b-additional-art-creation-options)
          - [c. Rarity Information](#c-rarity-information)
          - [d. Provenance Information](#d-provenance-information)
          - [e. Generate metadata from images (Experimental)](#e-generate-metadata-from-images-experimental)
     - [7. Update NFT's Info (Description And Name)](#7-update-nfts-info-description-and-name)
     - [8. Uploading Files (Images and Metadata)](#8-uploading-files-images-and-metadata)
          - [a. Pinata Or Similar Service](#a-pinata-or-similar-service)
     - [9. Create Wallet Edition Combo](#9-create-wallet-edition-combo)
     - [10. Minting NFTs](#10-minting-nfts)
     - [11. Checking NFT Mint Files For Issues](#11-checking-nft-mint-files-for-issues)


<br/>

## Commands
- [Art Engine Commands](#art-engine-commands)
     - [Build Command](#build-command)
     - [Create_Provenance Command](#create_provenance-command)
     - [Generate_Metadata Command](#generate_metadata-command)
     - [Pixelate Command](#pixelate-command)
     - [Preview Command](#preview-command)
     - [Preview_Gif Command](#preview_gif-command)
     - [Rarity Command](#rarity-command)


## UPDATES & FIXES


### Added Layer Global Maximum Repeatability Setting
Added a new `layerItemsMaxRepeatedTrait` setting that can be used to set the maximum repeatability for all items within a layer. If this is set to 2 for example and your layer has 8 layer items, then a maximum of 16 images will be generated. This allows users to set the maximum repeatability once off for a layer's items instead of specifying each layer item with the same maximum repeatability.


<br/>


## How To Use The Codebase
Below is a rough guideline of the order in which the processes can be used.

### 1. Run `npm install` then `npm chain`

### 2. Update The Main Configuration File For The Art Engine
Update the `src/art_config.js` file with the different settings for your generative art collection. 
Please watch the videos linked earlier on how to configure the Art Engine.

Modify the following parts at the very least, below are just sample values that I used in a demo.

#### a. Update your layer configurations
- Update your folder names, order in which they need to be processed and the number of images to create
- Optionally add maximum repeatability filtration rule in for the layers
- Optionally add layer combination filtration rules in for the layers
- Optionally add layer dependent traits filtration rules in for the layers

*Example of default configuration along with maximum repeatability and layer compatibility*
<img width="554" alt="Screenshot 2022-05-05 at 17 55 14" src="https://user-images.githubusercontent.com/52892685/166963557-ee08ff09-557e-4898-a484-8dcf07db5607.png">


#### c. Update the width and height of your canvas
<img width="228" alt="Screenshot 2022-01-13 at 12 48 07" src="https://user-images.githubusercontent.com/52892685/149316206-fb068e39-274e-45d2-8376-0eeb16586109.png">


#### d. Update the extra metadata that you want to add into your NFT's metadata. You can remove both fields inside of this extraMetadata object or add more if you like
<img width="1305" alt="Screenshot 2022-01-13 at 12 49 21" src="https://user-images.githubusercontent.com/52892685/149316407-bc9d5970-832c-450a-8e5a-9cd8efa430a7.png">


### 3. Configure The NFT Creation Details
Update the `constants/nft_details.js` file with the details that you want to be added to your metadata for your generative art collection.

- `description` - The description that will be added to each of your NFTs
- `namePrefix` - The name prefix that will be added for each of your NFTs. Ex. Steaks #1, Steaks #2
- `imageFilesBase` - Pinned IPFS CID when making use of a service like Pinata. Ex. QmP12prm2rp1omr1Ap2orm1oprm12FQWFQOFOGdnasnsda .
- `metaDataJSONFilesBase` - Pinned IPFS CID when making use of a service like Pinata. Ex. QmP12prm2rp1omr1Ap2orm1oprm12FQWFQOFOGdnasnsda .
- `ignoreExactBlankName` - This value is a boolean with a value of false or true. If true, then any layer that contains only the name "blank" with a rarity character and value in the metadata will be skipped and not added to the properties of the NFT. When set to false, then the information will be added to the metadata and added to the properties of the NFT.
- `genericTitle` - Replace with what you want the generic titles to say. Only change if you are planning on using NFT reveal and want a different name for your NFTs.
- `genericDescription` - Replace with what you want the generic descriptions to say. Only change if you are planning on using NFT reveal and want a different name for your NFTs.
- `genericURLs` - Replace with the image URLs that your generic NFTs should show. Only change if you are planning on using NFT reveal and want a different name for your NFTs.
- `ignoreAllNamesWithBlank` - This value is a boolean with a value of false or true. If true, then any layer item that contains the word blank within the filename will be skipped from being added to the metadata information. When set to false, then the information will be added to the metadata. E.x white_eyes_blank #100.png will be added to metadata if set to false, while being skipped if true.
- `startCollectionEditionFrom` - This value is used to determine from which edition number the collection creation should start. It is set to `'1'` as default, which will start Sol collections at 0, while starting Eth collections at 1.

Example configuration:
<img width="1351" alt="Screenshot 2022-03-17 at 21 50 54" src="https://user-images.githubusercontent.com/52892685/158884234-3596584e-a1d6-4bb6-9deb-ca8bca5bb1e1.png">

### 4. Configure The Token Contract and Deployment
Config Your SoulBound Token Deployment contract in config/service_config.js

Then run `npm deploy_goerli`

Make sure to place your wallet's mnemonic phrase at /mnemonic.txt

Everytime soulbound deployment costs about 0.03 ETH

### 5. Create Image Layers
Create your different art layers, keeping all of them at the same Canvas size and ensuring they are all exported as .png files. 


### 6. Art Engine
The Art Engine codebases take on Hashlip 

All of the `Art Engine Commands` make use of this configuration file along with the `constants/nft_details.js` file.

Only run the commands from sections a, b and c that you would like to make use of.

#### a. Creation / Build
Use the `Art Engine - Build Command` below to create your generative art collection along with their metadata json files.

#### b. Additional Art Creation Options
- Use the `Art Engine - Pixelate Command` below to create a pixelated art collection from your previous generative art collection.
- Use the `Art Engine - Preview Command` below to create a preview of your generative art collection by combining a few of the images into a single image.
- Use the `Art Engine - Preview_Gif Command` below to create a preview_gif of your generative art collection by combining a few of the images into a single gif that loops through some of your images.

#### c. Rarity Information
Use the `Art Engine - Rarity Command` below to generate a JSON output to the terminal that will show you how your layers will be distributed.

Use the `Custom - Rarity_Md Command` below to generate a JSON file (`_metadata_with_rarity.json`) in the build/json/ directory. This will add a `rarity_score` key to each attribute as well as a `total_rarity_score` and `rank` for each NFT edition. Use the `Custom - Rarity_Rank Command` below to pull information from the `_metadata_with_rarity.json` file, like the top X editions or the rank of a specific NFT edition. 

#### d. Provenance Information
Use the `Art Engine - Create_Provenance Command` below to generate two new JSON files within the `build/json` directory. To read up more on Provenance and how it can be used in your NFT Collections, please see the following [Medium Link](https://medium.com/coinmonks/the-elegance-of-the-nft-provenance-hash-solution-823b39f99473)

- `concatedHash.json` - This is a string that contains the concated hash string of all image URIs.
- `provenanceHash.json` - This is the final proof of your collection. This is a hash based on the `concatedHash.json` file's contents.

`provenanceHash.json` structure:
```Javascript
{
"provenance": "",
collection: [
 {
 "tokenId": ,
      "image": "",
      "imageHash": "",
      "traits": [],
 }],
}
```


#### e. Generate metadata from images (Experimental)
Use the `Art Engine - Generate_Metadata Command` below to generate a json file for each of the image files in the `build/images` folder.

**Please use this with caution as this will delete your `build/json` directory and generate a new directory with new files in it. If you would like to test this out, please be sure to backup your `build/json` directory first if you have one.**


### 7. Update NFT's Info (Description And Name)
Use the `Custom - Update_Nft_Info Command` below to update all NFT JSON files with the new `namePrefix` and `description` from the `constants/nft_details.js` file.

Please note that this should be run before you run the `NFT Upload Files` commands.
Use this only if you want to use a different name and description for your NFTs compared to what got generated with the `Art Engine - Build Command` command.

**Please remember that your contract needs to be updateable to use this, otherwise this image will stay the image of your NFT, before and after purchase.**


### 8. Uploading Files (Images and Metadata)
There are consecutive steps that you can follow to upload your images and json files onto IPFS and start your bean machine

#### a. Pinata
Create an account on [Pinata](https://app.pinata.cloud/) and then upload your images folder. Please note that once you have uploaded your folder, you can't add or remove any files from there. From there copy the CID into the `constants/nft_details.js` file against the `imageFilesBase` key.

Use the `Custom - Update_Image_Info Command` below to update the json files for each NFT.
This process will `only` update the `file_url` and `image` fields within the json file as well as in the `_metadata.json` file.

Upload the json directory onto Pinata and copy the CID into the `constants/nft_details.js` file against the `metaDataJSONFilesBase` key. This should be either of your `json` or `genericJSON` directories, depending on whether you are doing a reveal or not. Just a note, it would make sense to get both of your json directories uploaded if you are doing a reveal so that you can simply update the metadata of your unrevealed NFT, but please see the section on NFT reveal steps to follow in the `EXAMPLE - REVEAL (ERC721)` and `EXAMPLE - REVEAL (ERC1155)` examples below.

Use the `Custom - Update_Metadata_Info Command` below to update the json files for each NFT.
This process will create a new `ipfsMetas` folder, update each NFT json file with a `metadata_uri` field and create a `_ipfsMetas.json` file. All the new json files will be added to the `ipfsMetas` folder.

### b. Update the bean machine
- npm `pin_files`
- npm `update_machine`


### 9. Create Wallet Edition Combo
If you would like to mint your editions to different wallets, then you need to populate the account_details.js file's walletMintList with the wallet address and nft edition count. Once this is done, then run the `Custom - Create_Wallet_Edition_Combo Command`, which will generate a new `_walletAddressMintList.json` in the ipfsMetas directory. When you run the the `Minting NFTs` steps, then it will attempt to get the specific edition's wallet address that it needs to mint towards. If it can't find the `_walletAddressMintList.json` file or the edition is not in the file, then the mint process will default back to the mint_to_address field in the account_details.js file.


### 10. Minting NFTs
- Use the `SoulMint - Mint Command` below to start minting against an ERC721 contract where your mint will happen individually

### 11. WIP: Checking NFT Mint Files For Issues
- Use the `Custom - Check_Mints Command` below to start checking each mint file to determine if there are any issues with the minted files for ERC721 contract files (individual files). 

The check performs validation of the issues experienced in the `Minting NFTs` section and writes out the json files into a `failedMints` directory. 

The checks that this script performs to determine if a NFT mint has failed are done in all of the minting scripts before a mint is attempted for a specific file. The reason for adding this script is so that if you have 10 000 NFTs that you minted and you simply run one of the minting scripts again, then it will first scan the relevant file (depending on the mint command used) and then perform mint. This means if you use the mint script again, it will go through all 10 000 items, every time you run it. Should you use batch minting, then less files will be scanned, depending on your batch sizes.

The check mints scripts will go through the files once off, check all of their data and provide a list of items that need to be re-minted with the `WIP: SoulMint - Remint Command`, which will only scan the files that got picked up by the check mints processes.

**Please note that every time this runs, it clears out the folder and starts again.**

**Please note that this process can take time to complete as it runs through every minted json file.**


### 12. WIP: Re-Mint Failed NFTs 
- Use the `SoulMint - ReMint Command` below to start re-minting each of the json files in the `failedMints` directory for ERC721 (Individual files) contract files. 

This process will write out a newly minted file in the `reMinted` directory as well as update the json file in the original `minted` directory. Due to this, a backup folder will be created every time this process runs with the date to keep a backup of the json file in the minted directory at the time of running this process just as a safe guard so that you have access to the original information or how the information changed in between your processing.

You are done with your minting process!
Well done!
Go and check out your mints on your marketplace and refresh the metadata where needde.

GOOD LUCK!


## Art Engine Commands
### Build Command
- npm run build


### Create_Provenance Command
- npm run create_provenance
- node utils/art_engine/create_provenance.js 


### Generate_Metadata Command
- npm run generate_metadata
- node utils/art_engine/generate_metadata.js 


### Pixelate Command
- node utils/art_engine/pixelate.js
- npm run pixelate


### Preview Command
- node utils/art_engine/preview.js
- npm run preview


### Preview_Gif Command
- node utils/art_engine/preview_gif.js
- npm run preview_gif


### Rarity Command
- node utils/art_engine/rarity.js
- npm run rarity


## Custom Commands
Use the following command from the code's root directory.


### Check_Mints Command
- node utils/custom/check_mints.js
- npm run check_mints


### Create_Wallet_Edition_Combo Command
- node utils/custom/create_wallet_edition_combo.js
- npm run create_wallet_edition_combo


### Rarity_Md Command
- node utils/custom/getRarity_fromMetadata.js
- npm run rarity_md


### Rarity_Rank Command
- node utils/custom/rarity_rank.js
- npm run rarity_rank


### Update_Image_Info Command
- node utils/custom/update_image_info.js
- npm run update_image_info


### Update_Metadata_Info Command
- node utils/custom/update_metadata_info.js
- npm run update_metadata_info


### Update_Nft_Info Command
- node utils/custom/update_nft_info.js
- npm run update_nft_info


## Bean SoulMint Commands
Use the following command from the code's root directory.


### Mint Command
- node utils/soulmint/mint.js
- npm run mint


### UploadFiles & UploadMetas Command
- node utils/soulmint/pinFiles.js
- npm run pin_files