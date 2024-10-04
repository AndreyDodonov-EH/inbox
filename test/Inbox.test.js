const assert = require('assert'); // assertion library
const ganache = require('ganache'); // local test network
const {Web3} = require('web3');
const contract = require('../compile');

const ganacheOptions = {
    chain: {hardfork: 'shanghai'},
    logging: {debug: true}
  };
 
const provider = ganache.provider(ganacheOptions);
const web3 = new Web3(provider);

const initialMessage = "Eternal gays!";
let accounts;
let inbox;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    const web3Contract = new web3.eth.Contract(contract.abi);
    // THIS IS NOT DEPLOYING THE CONTRACT, IT IS CREATING DEPLOYMENT TRANSACTION WHICH SHOULD BE SENT
    const deploymentTranscation = web3Contract
         .deploy({data: contract.evm.bytecode.object, arguments: [initialMessage]});
    
    inbox = await deploymentTranscation.send({from: accounts[0],  gas: '1000000',
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
    it('can deploy', () => {
        assert.ok(inbox.options.address); 
        console.log('METHODS START');
        console.log(inbox.methods);
        console.log('METHODS END');
    });
    it ('has a default message', async () => {
        const message = await inbox.methods.message().call();
        assert.strictEqual(message, initialMessage);
    });

    it ('can change the message', async () => {
        const newMessage = 'Temporary gays!';
        await inbox.methods.setMessage(newMessage).send( {from: accounts[0]});
        const message = await inbox.methods.message().call();
        assert.strictEqual(message, newMessage);
    });
});
