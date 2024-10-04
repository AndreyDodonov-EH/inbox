const HDWalletProvider = require('@truffle/hdwallet-provider');
const { Web3 } = require('web3');
const contract = require('./compile');

require('dotenv').config();


let provider = new HDWalletProvider({
    privateKeys: [process.env.PRIVATE_KEY], 
    providerOrUrl: process.env.INFURA_SEPOLIA_ENDPOINT + process.env.INFURA_API_KEY
  });

const web3 = new Web3(provider);

const initialMessage = "Eternal gays!";

(async () => {
    try {
        const accounts = await web3.eth.getAccounts();
        console.log('Attempting to deploy from account', accounts[0]);
        const web3Contract = new web3.eth.Contract(contract.abi);
        // THIS IS NOT DEPLOYING THE CONTRACT, IT IS CREATING DEPLOYMENT TRANSACTION WHICH SHOULD BE SENT
        const deploymentTranscation = web3Contract
            .deploy({data: contract.evm.bytecode.object, arguments: [initialMessage]});
        const inbox = await deploymentTranscation.send({from: accounts[0],  gas: '1000000',
                maxFeePerGas: web3.utils.toWei('5', 'gwei'),
                maxPriorityFeePerGas: web3.utils.toWei('3.5', 'gwei') 
                }).on('receipt', function(receipt) {
                    console.log('Contract deployed at address:', receipt.contractAddress);
                })
                .on('error', function(error) {
                    console.error('Error deploying contract:', error);
                });
        console.log(inbox);
        console.log('ADDRESS');
        console.log(inbox.options.address);

    } catch (error) {
        console.error(error); 
    }
    provider.engine.stop();
})();