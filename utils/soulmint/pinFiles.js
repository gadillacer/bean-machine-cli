// Load modules and constants
const { RateLimit } = require('async-sema');
const fs = require("fs");
const BASEDIR = process.cwd();
const { FOLDERS } = require(`${BASEDIR}/constants/folders.js`);
const FormData = require("form-data");
const { fetchWithRetry } = require(`${FOLDERS.modulesDir}/fetchWithRetry.js`);
const { MakeSoulMint } = require('./soulmint.js');
const { NFT_DETAILS } = require(`${FOLDERS.constantsDir}/nft_details.js`);

const re = new RegExp("^([0-9]+).png"); // Will be used to ensure only JSON files from the JSONDIR is used in the meta's updated.

// Grab the current date and time to create a backup directory
let date_ob = new Date();
const backupDate = date_ob.getFullYear() + "_" + ("0" + (date_ob.getMonth() + 1)).slice(-2) + "_" + ("0" + date_ob.getDate()).slice(-2) + "_" + date_ob.getHours() + "_" + date_ob.getMinutes() + "_" + date_ob.getSeconds();

// Check if the ipfsMetasDir directory exists and if not, then create it.
if (!fs.existsSync(`${FOLDERS.ipfsMetasDir}`)) {
  fs.mkdirSync(`${FOLDERS.ipfsMetasDir}`);
}

// Check if the backupDir directory exists and if not, then create it.
if (!fs.existsSync(`${FOLDERS.backupDir}`)) {
  fs.mkdirSync(`${FOLDERS.backupDir}`);
}

// Check if the backupJSONDir directory exists and if not, then create it.
if (!fs.existsSync(`${FOLDERS.backupJSONDir}`)) {
  fs.mkdirSync(`${FOLDERS.backupJSONDir}`);
}

// Check if a backupDate directory already exists and if not, then create it.
if (!fs.existsSync(`${FOLDERS.backupJSONDir}/${backupDate}_meta`)) {
  fs.mkdirSync(`${FOLDERS.backupJSONDir}/${backupDate}_meta`);
}

// Make a copy of the metadata.json file into the backupDate directory.
fs.copyFileSync(`${FOLDERS.jsonDir}/_metadata.json`, `${FOLDERS.backupJSONDir}/${backupDate}_meta/_metadata.json`);
console.log(`Backed up _metadata.json to ${FOLDERS.backupJSONDir}/${backupDate}_meta/_metadata.json before starting process.`);

// Main function - called asynchronously
async function main() {

  const soulmint = await MakeSoulMint();

  // Load the list of file names from the imagesDir directory and sort them numerically
  const files = fs.readdirSync(`${FOLDERS.imagesDir}`);
  files.sort(function(a, b){
    return a.split(".")[0] - b.split(".")[0];
  });

  // Loop through each file in the list.
  // for (const file of files) {
  //   console.log(`Starting upload of file ${file}`);

  //   try {
  //     if (re.test(file)) {

  //       // Load the json file that matches the image file's name and parse it as JSON
  //       const fileName = `${file.substring(0, file.length - 4)}`;
  //       let jsonFile = fs.readFileSync(`${FOLDERS.jsonDir}/${fileName}.json`);
  //       let metaData = JSON.parse(jsonFile);

  //       // Check if the file_url field contains a value that starts with https:// and only continue processing if it does not start with it.
  //       if(!metaData.file_url.includes('https://')) {

  //         // Apply rate limit that was set in the account_details.js file
  //         await limit()

  //         const fileImage = fs.readFileSync(`${FOLDERS.imagesDir}/${file}`);

  //         const { assetGatewayURL } = await soulmint.createIPFSFromAssetData(file, fileImage, jsonFile);

  //         console.log(assetGatewayURL)

  //         // Assign the file_url field of the json object being processed to the ipfs_url field that is returned from the API call.
  //         metaData.file_url = assetGatewayURL;
  //         metaData.image = assetGatewayURL;

  //         // Re-wrtie the image file's json object to contain the new file_url field.
  //         fs.writeFileSync(
  //           `${FOLDERS.jsonDir}/${fileName}.json`,
  //           JSON.stringify(metaData, null, 2)
  //         );

  //         console.log(`${file} uploaded & ${fileName}.json updated!`);

  //       } else {
  //         console.log(`${fileName} already uploaded.`);
  //       }

  //       // Add the metadata object that got written to the json file into the allMetaData array.
  //       allMetadata.push(metaData);
  //     }
  //   } catch(err) {
  //     console.log(`Catch: ${err}`)
  //   }
  // }

  // Write the allMetaData array into the metadata.json file.
  // await fs.writeFileSync(
  //   `${FOLDERS.jsonDir}/_metadata.json`,
  //   JSON.stringify(allMetadata, null, 2)
  // );

  const directoryURI = await soulmint.pinDirectory(`${FOLDERS.jsonDir}`);
  // const directoryURI = "https://gateway.pinata.cloud/ipfs/bafybeiea5qtxa7hflgwskwn5xisuhzsjtjxgqmgxsrowfyk4o7izadgnpm"
  console.log(directoryURI)
  const result = await soulmint.setContractBaseURI(directoryURI + "/")
  if (result) console.log("Updated Contract BaseURI")

  if (NFT_DETAILS.isWhitelistOnly) {
    // Must have wallets .json file, or it will abort
    const walletURI = await soulmint.pinFile(`${FOLDERS.ipfsMetasDir}/_walletAddressMintList.json`, '_walletAddressMintList.json')
    console.log(walletURI)
    const isWalletUpdated = await soulmint.setContractWalletMintList(walletURI)
    if (isWalletUpdated) console.log("Updated WalletMintListURI")
  }
  
  process.exit(0);
}

// Start the main process.
main();

// timer function - This function is used to add a timeout in between actions.
function timer(ms) {
  return new Promise(res => setTimeout(res, ms));
}