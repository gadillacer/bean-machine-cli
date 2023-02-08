// Load modules and constants
const { RateLimit } = require('async-sema');
const fs = require("fs");
const chalk = require('chalk');

const BASEDIR = process.cwd();
const { FOLDERS } = require(`${BASEDIR}/constants/folders.js`);
const { fetchWithRetry } = require(`${FOLDERS.modulesDir}/fetchWithRetry.js`);
const { getMintAddress } = require(`${FOLDERS.modulesDir}/getMintAddress.js`);
const fetch = require('node-fetch');
const { MakeSoulMint } = require('./soulmint');


// Check if the mintedDir directory exists, if it does not exist then create it.
if (!fs.existsSync(`${FOLDERS.mintedDir}`)) {
  fs.mkdirSync(`${FOLDERS.mintedDir}`);
}

// Main function - called asynchronously
async function main() {

  // Load _ipfsMetas.json file and parse it as JSON
  const ipfsMetas = JSON.parse(
    fs.readFileSync(`${FOLDERS.ipfsMetasDir}/_ipfsMetas.json`)
  );

  const soulmint = await MakeSoulMint()

  // Loop through each JSON object within the JSON array of the _ipfsMetas.json file
  for (const meta of ipfsMetas) {
    console.log(`Starting check of ${meta.name}.json object`);

    // Set the minted filename for the JSON object
    const mintFile = `${FOLDERS.mintedDir}/${meta.custom_fields.edition}.json`;

    try {

      // Load the minted filename
      fs.accessSync(mintFile);
      const mintedFile = fs.readFileSync(mintFile)

      // If the file exists and contains data then continue processing
      if(mintedFile.length > 0) {

        // Attempt to parse the data as a JSON object
        const mintedMeta = JSON.parse(mintedFile)

        // Check if the value of the response key is not OK or if the value of the error key is not null within the mintData object.
        // Throw an error so that the JSON object can be minted again.

          // Prep the API call to the URL.
        //   let options = {
        //     method: 'GET',
        //     headers: {
        //       'Content-Type': 'application/json'
        //     }
        //   };
        console.log("suck")
        const fetchCreationInfo = true
        const nft = await soulmint.getNFT("0", {fetchCreationInfo})
            
        if (nft.creationInfo) {
            alignOutput([
                ['Token ID:', chalk.green(nft.tokenId)],
                ['Block Number Found:', chalk.blue(nft.creationInfo.blockNumber)]
            ])
        }
            // output.push(['Metadata Address:', chalk.blue(nft.metadataURI)])
            // output.push(['Metadata Gateway URL:', chalk.blue(nft.metadataGatewayURL)])
            // output.push(['Asset Address:', chalk.blue(nft.assetURI)])
            // output.push(['Asset Gateway URL:', chalk.blue(nft.assetGatewayURL)])
            // alignOutput(output)
        //   // Perform an API call to check the transaction on the blockchain.
        //   const txnCheck = await fetch(`${mintedMeta.mintData.transaction_external_url}`, options)
        //     .then(response => {
        //       // Convert the response from the API call into text as it is a HTML response and not a JSON object.
        //       return response.text();
        //     })
        //     .then(text => {
        //       // Check if the HTML text contains the works 'search not found'
        //       // Throw an error so that the JSON object can be minted again.
        //       if (text.toLowerCase().includes('search not found')) {
        //         console.log(`${mintedMeta.mintData.transaction_external_url} was minted, but transaction was not found. Will remint ${FOLDERS.mintedDir}/${meta.custom_fields.edition}.json`);
        //         throw 'Edition minted, but not on blockchain'
        //       } // Check if the HTML text contains the works 'fail or failed'
        //         // Throw an error so that the JSON object can be minted again.
        //         else if (text.toLowerCase().includes('</i>fail</span>') || text.toLowerCase().includes('</i>failed</span>')) {
        //         console.log(`${mintedMeta.mintData.transaction_external_url} was minted, but the transaction has a failed status on the blockchain. Will remint ${FOLDERS.mintedDir}/${meta.custom_fields.edition}.json`);
        //         throw 'Edition minted, but is in a failed status on the blockchain'
        //       }

        //       return ;
        //     })
        //     .catch(err => {
        //       console.error('error:' + err)
        //       throw err;
        //   });
      }

      console.log(`Check done for ${meta.name}.json object.`);
      console.log(`${meta.name} already minted`);

    } // Should any of the above checks in the try block throw an error, then the JSON object that threw the error will be minted again
      catch(err) {
      console.log(`Check done for ${meta.name}.json object.`);
      console.log(`Starting mint of ${meta.name}.json object`);

      try {
        // Apply rate limit that was set in the account_details.js file
        await limit()

        const tokenId = await soulmint.mintToken(getMintAddress(meta.custom_fields.edition), meta.metadata_uri)
        // Setup the API details
        // const options = {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //     Authorization: ACCOUNT_DETAILS.auth,
        //   },
        //   body: JSON.stringify(mintInfo),
        // };

        // Call the fetchWithRetry function that will perform the API call to mint the JSON object

        // Combine the metadata from the JSON object with the mintedData from the API call
        const combinedData = {
          metaData: meta,
          mintData: {tokenId}
        }

        // Write a json file containing the minted data to the mintedDir directory
        writeMintData(`${meta.custom_fields.edition}`, combinedData)

        // Check if the mint was successful at an API level, the Transaction could still have failed on the blockchain itself,
        // so if a transaction is not showing up, then it is best to check the transaction hash / url to determine what happened.
        // The check_mints and remint processes can also be used to attempt to mint missing transactions.
        // if (mintData.response !== 'OK') {
        //   console.log(`Minting ${meta.name} failed! Response: ${mintData.response} , Error: ${mintData.error}`);
        // } else {
        //   console.log(`Minted: ${meta.name}!`);
        // }

      } catch(err) {
        console.log(`Catch: Minting ${meta.name} failed with ${err}!`)
      }
    }
  }
}

// Start the main process.
main();

function alignOutput(labelValuePairs) {
    const maxLabelLength = labelValuePairs
      .map(([l, _]) => l.length)
      .reduce((len, max) => len > max ? len : max)
    for (const [label, value] of labelValuePairs) {
        console.log(label.padEnd(maxLabelLength+1), value)
    }
}

// timer function - This function is used to add a timeout in between actions.
function timer(ms) {
  return new Promise(res => setTimeout(res, ms));
}

// Constant that is used to created a json file within the mintedDir directory for every JSON object that got minted and no errors were thrown.
const writeMintData = (_edition, _data) => {
  fs.writeFileSync(`${FOLDERS.mintedDir}/${_edition}.json`, JSON.stringify(_data, null, 2));
};