const fs = require('fs/promises')
const {F_OK} = require('fs')

const inquirer = require('inquirer')
const {utils} = require('ethers')
const config = require('getconfig')

const SHOULD_DEPLOY_AGAIN = true

const FACTORY_NAME = "SoulBoundNFTFactory"
const PROXY_NAME = "SoulBoundNFTProxyRegistry"
const CONTRACT_NAME = "SoulBoundNFT"

async function main() {
    // const filename = config.deploymentConfigFile || 'factory-deployment.json'
    const contractName = config.deploymentContractName || 'Soulbound'
    const contractSymbol = config.deploymentContractSymbol || 'SBT'

    const soulbound = await deploySoulBoundContract(contractName, contractSymbol)
    await saveDeploymentInfo(soulbound, "soulbound-deployment.json")

    if (config.shouldDeployNewFactory) {
        const proxy = await deployProxyContract()
        await saveDeploymentInfo(proxy, "proxy-deployment.json")
        const factory = await deployFactoryContract(proxy.contract.address)
        await saveDeploymentInfo(factory, "factory-deployment.json")
    }

    const soulboundInfo = await loadDeploymentInfo("soulbound-deployment.json")
    const proxy = await loadDeploymentInfo("proxy-deployment.json")
    const factory = await loadDeploymentInfo("factory-deployment.json")
    const bean = await deployBeanMachine(soulboundInfo, proxy, factory)
    await saveDeploymentInfo(bean, "bean-machine-deployment.json")
}

async function deployFactoryContract(proxyAddress) {
    const hardhat = require('hardhat')
    const network = hardhat.network.name

    console.log(`deploying factory contract for proxy (${proxyAddress}) to network "${network}"...`)
    const Factory = await hardhat.ethers.getContractFactory(FACTORY_NAME)
    const factory = await Factory.deploy(proxyAddress)

    await factory.deployed()
    console.log(`deployed factory contract to ${factory.address} (network: ${network})`);

    return deploymentInfo(hardhat, FACTORY_NAME, factory)
}

async function deployProxyContract() {
    const hardhat = require('hardhat')
    const network = hardhat.network.name

    console.log(`deploying proxy contract to network "${network}"...`)
    const Proxy = await hardhat.ethers.getContractFactory(PROXY_NAME)
    const proxy = await Proxy.deploy()
    await proxy.deployed()

    console.log(`deployed proxy contract to ${proxy.address} (network: ${network})`);

    return deploymentInfo(hardhat, PROXY_NAME, proxy)
}

async function deploySoulBoundContract(name, symbol) {
    const hardhat = require('hardhat')
    const network = hardhat.network.name
    const [deployer] = await hardhat.ethers.getSigners();

    console.log(`deploying soulbound contract for token ${name} (${symbol}) to network "${network}"...`)
    const Soulbound = await hardhat.ethers.getContractFactory(CONTRACT_NAME)
    const soulbound = await Soulbound.deploy()
    await soulbound.deployed()

    console.log(`deployed soulbound contract to ${soulbound.address} (network: ${network})`);

    return deploymentInfo(hardhat, CONTRACT_NAME, soulbound)
}

/**
 * Still a soulbound contract, but it runs the proxy initialization
 */
async function deployBeanMachine(soulbound, proxy, factory) {
    const hardhat = require('hardhat')
    const network = hardhat.network.name
    const [deployer] = await hardhat.ethers.getSigners();

    const proxyContract = await hardhat.ethers.getContractAt(proxy.contract.abi, proxy.contract.address)
    const factoryContract = await hardhat.ethers.getContractAt(factory.contract.abi, factory.contract.address)

    await proxyContract.setProxyFactory(factory.contract.address)
    await timeout(30000);
    console.log("Set Proxy Factory Done!")
    await factoryContract.newUpgradeableBeacon(soulbound.contract.address)
    await timeout(30000);
    console.log("Created New Upgradeable Beacon For SoulBound!")
    const contractName = config.deploymentContractName || 'Soulbound'
    const contractSymbol = config.deploymentContractSymbol || 'SBT'
    await factoryContract.newBeaconProxy(contractName, contractSymbol, false, true, utils.parseEther("0.05"), deployer.address)
    await timeout(30000);
    console.log("Created New Beacon Proxy!")
    const soulbounds = await proxyContract.getProxiesByOwnerAddress(deployer.address)
    console.log(soulbounds)
    const newestBean = soulbounds[soulbounds.length - 1]
    console.log("New Bean Proxy at Address: " + newestBean)

    return {
        network: network,
        contract: {
            name: "BeanMachine",
            address: newestBean,
            signerAddress: deployer.address,
            abi: soulbound.contract.abi
        }
    }
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function deploymentInfo(hardhat, fileName, contract) {
    return {
        network: hardhat.network.name,
        contract: {
            name: fileName,
            address: contract.address,
            signerAddress: contract.signer.address,
            abi: contract.interface.format(),
        },
    }
}

async function saveDeploymentInfo(info, filename = undefined) {
    if (!filename) {
        filename = config.deploymentConfigFile || 'soulbound-deployment.json'
    }
    const exists = await fileExists(filename)
    if (exists) {
        const overwrite = await confirmOverwrite(filename)
        if (!overwrite) {
            return false
        }
    }

    console.log(`Writing deployment info to ${filename}`)
    const content = JSON.stringify(info, null, 2)
    await fs.writeFile(filename, content, {encoding: 'utf-8'})
    return true
}

async function loadDeploymentInfo(deploymentFile) {
    const content = await fs.readFile(deploymentFile, {encoding: 'utf8'})
    deployInfo = JSON.parse(content)
    try {
        validateDeploymentInfo(deployInfo)
    } catch (e) {
        throw new Error(`error reading deploy info from ${deploymentConfigFile}: ${e.message}`)
    } 
    return deployInfo
}

function validateDeploymentInfo(deployInfo) {
    const {contract} = deployInfo
    if (!contract) {
        throw new Error('required field "contract" not found')
    }
    const required = arg => {
        if (!deployInfo.contract.hasOwnProperty(arg)) {
            throw new Error(`required field "contract.${arg}" not found`)
        }
    }

    required('name')
    required('address')
    required('abi')
}

async function fileExists(path) {
    try {
        await fs.access(path, F_OK)
        return true
    } catch (e) {
        return false
    }
}

async function confirmOverwrite(filename) {
    const answers = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'overwrite',
            message: `File ${filename} exists. Overwrite it?`,
            default: false,
        }
    ])
    return answers.overwrite
}

// Start the main process.
main();

module.exports = {
    saveDeploymentInfo
}
