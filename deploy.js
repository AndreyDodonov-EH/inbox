const HDWalletProvider = require('@truffle/hdwallet-provider');
const { Web3 } = require('web3');
const contract = require('./compile');

require('dotenv').config();


let provider = new HDWalletProvider({
    privateKeys: [process.env.PRIVATE_KEY], 
    providerOrUrl: process.env.INFURA_SEPOLIA_ENDPOINT + process.env.INFURA_API_KEY
  });

const web3 = new Web3(provider);

const INITIAL_MESSAGE = "Eternal gays!";
const GAS_MARGIN = 1.1;
const MAX_PRIORITY_FEE_PER_GAS_GWEI = 1;

(async () => {
    try {
        const accounts = await web3.eth.getAccounts();
        const accountToUse = accounts[0];
        console.log('Attempting to deploy from account', accountToUse);
        const web3Contract = new web3.eth.Contract(contract.abi);
        // THIS IS NOT DEPLOYING THE CONTRACT, IT IS CREATING DEPLOYMENT TRANSACTION WHICH SHOULD BE SENT
        const deploymentTranscation = web3Contract
            .deploy({data: contract.evm.bytecode.object, arguments: [INITIAL_MESSAGE]});

        const estimatedGas = Number(await deploymentTranscation.estimateGas({from: accountToUse}));
        console.log('Estimated gas:', estimatedGas);

        const balance = await web3.eth.getBalance(accountToUse);
        console.log("Balance in Wei:", balance);
        console.log("Balance in Ether:", web3.utils.fromWei(balance, 'ether'));

        const gasPrice = await web3.eth.getGasPrice();
        console.log("Current Gas Price in Wei:", gasPrice);
        const gasPriceGwei = Number(web3.utils.fromWei(gasPrice, 'gwei'));
        console.log("Current Gas Price in Gwei:", gasPriceGwei);

        const estimated_cost_gwei = (gasPriceGwei + MAX_PRIORITY_FEE_PER_GAS_GWEI) * estimatedGas * GAS_MARGIN;
        console.log('Estimated cost gwei:', estimated_cost_gwei);
        const estimated_cost_eth = web3.utils.fromWei((estimated_cost_gwei*1e9).toString(), 'ether');
        console.log('Estimated cost ether:', estimated_cost_eth);

        if (balance < estimated_cost_gwei) {
            console.error('Insufficient balance');
            return;
        } else { 
            console.log('Well, your balance might be sufficient, good luck!');
        }

        const inbox = await deploymentTranscation.send({from: accountToUse,  gas: estimatedGas,
                maxFeePerGas: web3.utils.toWei(gasPriceGwei.toString(), 'gwei'),
                maxPriorityFeePerGas: web3.utils.toWei(MAX_PRIORITY_FEE_PER_GAS_GWEI.toString(), 'gwei') 
                }).on('receipt', function(receipt) {
                    console.log('Contract deployed at address:', receipt.contractAddress);
                })
                .on('error', function(error) {
                    console.error('Error deploying contract:', error);
                });

    } catch (error) {
        console.error(error); 
    }
    provider.engine.stop();
})();