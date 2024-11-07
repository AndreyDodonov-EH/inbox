const assert = require('assert'); // assertion library
const ganache = require('ganache'); // local test network
const { Web3 } = require('web3');
const compile = require('../compile');

const ganacheOptions = {
    chain: { hardfork: 'shanghai' },
    // logging: { debug: false }
};

const provider = ganache.provider(ganacheOptions);
const web3 = new Web3(provider);

let accounts;
let deployedContract;

beforeEach(async () => {
    const contract = compile('Lottery');
    const web3Contract = new web3.eth.Contract(contract.abi);
    // THIS IS NOT DEPLOYING THE CONTRACT, IT IS CREATING DEPLOYMENT TRANSACTION WHICH SHOULD BE SENT
    const deploymentTranscation = web3Contract
        .deploy({ data: contract.evm.bytecode.object });

    accounts = await web3.eth.getAccounts();
    deployedContract = await deploymentTranscation.send({
        from: accounts[0], gas: '1000000',
        maxFeePerGas: web3.utils.toWei('5', 'gwei'),
        maxPriorityFeePerGas: web3.utils.toWei('3.5', 'gwei')
    }).on('receipt', function (receipt) {
        // console.log('Contract deployed at address:', receipt.contractAddress);
    })
        .on('error', function (error) {
            console.error('Error deploying contract:', error);
        });
});

describe('Lottery', () => {
    it('can deploy', () => {
        assert.ok(deployedContract.options.address);
        // console.log('METHODS START');
        // console.log(deployedContract.methods);
        // console.log('METHODS END');
    });
    it ('single entry', async () => {
        await deployedContract.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });
        const entries = await deployedContract.methods.getEntries().call({
            from: accounts[0]
        });
        
        assert.equal(accounts[0], entries[0]);
        assert.equal(1, entries.length); 
    });
    it ('muiltiple entries', async () => {
        const entryCount = 5;
        for (let i = 0; i < entryCount; i++) {
            await deployedContract.methods.enter().send({
                from: accounts[i],
                value: web3.utils.toWei('0.02', 'ether')
            });
        }
        const entries = await deployedContract.methods.getEntries().call({
            from: accounts[0]
        });
        for (let i=0; i<entryCount;i++) {
            assert.equal(accounts[i], entries[i]);
        }
        assert.equal(entryCount, entries.length); 
    });
    it ('requires a minimum amount of ether to enter', async () => {
        try {
            await deployedContract.methods.enter().send({
                from: accounts[0],
                value: web3.utils.toWei('0.005', 'ether')
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
    });
    it ('only manager can call pickWinner', async () => {
        try {
            await deployedContract.methods.pickWinner().send({
                from: accounts[1],
            });
            assert(false); 
        } catch (err) {
            assert(err);
        }
    });
    it ('end-to-end', async () => {
        const initialBalance = await web3.eth.getBalance(accounts[0]); 
        await deployedContract.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });
        const balanceAfterEntering = await web3.eth.getBalance(accounts[0]);
        // we spent 0.02 ether, but we also paid for gas
        assert((initialBalance - balanceAfterEntering) > web3.utils.toWei('0.02', 'ether'));
        await deployedContract.methods.pickWinner().send({
            from: accounts[0],
        });
        const balanceAfterWinning = await web3.eth.getBalance(accounts[0]); 
        // check that total gas fees (for participating and picking winner) 
        // are at least less than our bet :-D 
        // ToDo: proper approach would be to check gas fees and then assert with some margin
        assert((initialBalance - balanceAfterWinning) < web3.utils.toWei('0.02', 'ether'));
        // assert that no one is in the lottery anymore
        const entries = await deployedContract.methods.getEntries().call({
            from: accounts[0]
        });
        assert.equal(0, entries.length);
        // assert that contract balance is 0
        const contractBalance = await web3.eth.getBalance(deployedContract.options.address);
        assert.equal(0, contractBalance);
    });
});
