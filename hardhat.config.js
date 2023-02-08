require("@nomiclabs/hardhat-waffle");
const fs = require('fs');
const config = require('getconfig');

const defaultNetwork = 'goerli';
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    solidity: {
      version: "0.8.7",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    },

    defaultNetwork: defaultNetwork,
    networks: {
        hardhat: {},
        localhost: {},
        goerli: {
          url: `https://goerli.infura.io/v3/${config.infuriaProjectId}`, //<---- YOUR INFURA ID! (or it won't work)
          accounts: {
            mnemonic: mnemonic(),
          },
          gas: 2100000,
          gasPrice: 8000000000,
        },
        testnet_aurora: {
          url: 'https://testnet.aurora.dev',
          accounts: {
            mnemonic: mnemonic(),
          },
          chainId: 1313161555,
          gasPrice: 120 * 1000000000
        }
    }
};

function mnemonic() {
  try {
    return fs.readFileSync('./mnemonic.txt').toString().trim();
  } catch (e) {
    if (defaultNetwork !== 'localhost') {
      console.log(
        '☢️ WARNING: No mnemonic file created for a deploy account. Try `yarn run hardhat_generate` and then `yarn run hardhat_account`.',
      );
    }
  }
  return '';
}

const DEBUG = true;


task('generate', 'Create a mnemonic for builder deploys', async (_, {ethers}) => {
  const bip39 = require('bip39');
  const hdkey = require('ethereumjs-wallet/hdkey');
  const mnemonic = bip39.generateMnemonic();
  if (DEBUG) console.log('mnemonic', mnemonic);
  const seed = await bip39.mnemonicToSeed(mnemonic);
  if (DEBUG) console.log('seed', seed);
  const hdwallet = hdkey.fromMasterSeed(seed);
  const wallet_hdpath = "m/44'/60'/0'/0/";
  const account_index = 0;
  let fullPath = wallet_hdpath + account_index;
  if (DEBUG) console.log('fullPath', fullPath);
  const wallet = hdwallet.derivePath(fullPath).getWallet();
  const privateKey = '0x' + wallet._privKey.toString('hex');
  if (DEBUG) console.log('privateKey', privateKey);
  var EthUtil = require('ethereumjs-util');
  const address = '0x' + EthUtil.privateToAddress(wallet._privKey).toString('hex');
  console.log('🔐 Account Generated as ' + address + ' and set as mnemonic in packages/hardhat');
  console.log("💬 Use 'yarn run account' to get more information about the deployment account.");
  console.log("💬 Then find some faucets to fund your wallet");

  fs.writeFileSync('./' + address + '.txt', mnemonic.toString());
  fs.writeFileSync('./mnemonic.txt', mnemonic.toString());
});

task('account', 'Get balance informations for the deployment account.', async (_, {ethers}) => {
  const hdkey = require('ethereumjs-wallet/hdkey');
  const bip39 = require('bip39');
  let mnemonic = fs.readFileSync('./mnemonic.txt').toString().trim();
  if (DEBUG) console.log('mnemonic', mnemonic);
  const seed = await bip39.mnemonicToSeed(mnemonic);
  if (DEBUG) console.log('seed', seed);
  const hdwallet = hdkey.fromMasterSeed(seed);
  const wallet_hdpath = "m/44'/60'/0'/0/";
  const account_index = 0;
  let fullPath = wallet_hdpath + account_index;
  if (DEBUG) console.log('fullPath', fullPath);
  const wallet = hdwallet.derivePath(fullPath).getWallet();
  const privateKey = '0x' + wallet._privKey.toString('hex');
  if (DEBUG) console.log('privateKey', privateKey);
  var EthUtil = require('ethereumjs-util');
  const address = '0x' + EthUtil.privateToAddress(wallet._privKey).toString('hex');

  // var qrcode = require('qrcode-terminal');
  // qrcode.generate(address);
  console.log('‍📬 Deployer Account is ' + address);
  const networks = module.exports.networks;
  for (let n in networks) {
    //console.log(config.networks[n],n)
    try {
      let provider = new ethers.providers.JsonRpcProvider(networks[n].url);
      let balance = await provider.getBalance(address);
      console.log(' -- ' + n + ' --  -- -- 📡 ');
      console.log('   balance: ' + ethers.utils.formatEther(balance));
      console.log('   nonce: ' + (await provider.getTransactionCount(address)));
    } catch (e) {
      if (DEBUG) {
        console.log(e);
      }
    }
  }
});
