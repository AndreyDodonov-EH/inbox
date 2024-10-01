const assert = require('assert'); // assertion library
const ganache = require('ganache'); // local test network
const {Web3} = require('web3');

const contract = require('../compile');


const ganacheOptions = {
    chain: {hardfork: 'shanghai'},
    logging: {debug: true}
  };

const provider = ganache.provider(ganacheOptions);

// console.log(ethereumProvider);

const web3 = new Web3(provider);
// console.log(web3eth);

// (async () => {
//     // Get the latest block
//     const block = await web3eth.getBlock('latest');
    
//     console.log(block);
    
//     // If you're using the London hardfork, you should see `baseFeePerGas` in the block
//     if (block.baseFeePerGas !== undefined) {
//       console.log('London hardfork is being used!');
//     } else {
//       console.log('Another hardfork is being used.');
//     }
//   })();
  

let accounts;

// console.log(contract.evm.bytecode.object);

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    const web3Contract = new web3.eth.Contract(contract.abi);
    // console.log(web3Contract);
    // THIS IS NOT DEPLOYING THE CONTRACT, IT IS CREATING DEPLOYMENT TRANSACTION WHICH SHOULD BE SENT
    const initialMessage = "Hello, World!";
    const deploymentTranscation = web3Contract
         .deploy({data: contract.evm.bytecode.object, arguments: [initialMessage]});
    
    deploymentTranscation.send({from: accounts[0],  gas: '1000000',
        maxFeePerGas: web3.utils.toWei('5', 'gwei'),
        maxPriorityFeePerGas: web3.utils.toWei('3.5', 'gwei') 
        }).on('receipt', function(receipt) {
            console.log('Contract deployed at address:', receipt.contractAddress);
        })
        .on('error', function(error) {
            console.error('Error deploying contract:', error);
        });
});

describe('Inbox', () => {
    it('test', () => {
        // console.log('Deployed');
    });
});
