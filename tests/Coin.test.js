const assert = require('assert'); // assertion library
const ganache = require('ganache'); // local test network
const { Web3 } = require('web3');
const compile = require('../compile');

const ganacheOptions = {
    chain: { hardfork: 'shanghai' },
    logging: { debug: true }
};

const provider = ganache.provider(ganacheOptions);
const web3 = new Web3(provider);

let accounts;
let Coin;

beforeEach(async () => {
    const contract = compile('Coin');
    const web3Contract = new web3.eth.Contract(contract.abi);
    console.log(web3Contract)
    // THIS IS NOT DEPLOYING THE CONTRACT, IT IS CREATING DEPLOYMENT TRANSACTION WHICH SHOULD BE SENT
    const deploymentTranscation = web3Contract
        .deploy({ data: contract.evm.bytecode.object });

    accounts = await web3.eth.getAccounts();
    console.log('Accounts length: ', accounts.length);
    Coin = await deploymentTranscation.send({
        from: accounts[0], gas: '1000000',
        maxFeePerGas: web3.utils.toWei('5', 'gwei'),
        maxPriorityFeePerGas: web3.utils.toWei('3.5', 'gwei')
    });

    await Coin.methods.mint(accounts[0], 1000).send({ from: accounts[0] });
});

describe('coin', () => {
    it('can deploy', () => {
        assert.ok(Coin.options.address);
        console.log('METHODS START');
        console.log(Coin.methods);
        console.log('METHODS END');
    });
    it('event works', () => {
        Coin.events.Sent().on('data', async function (event) {
            console.log("Coin transfer: " + event.returnValues.amount +
                " coins were sent from " + event.returnValues.from +
                " to " + event.returnValues.to + ".")
            const senderBalance = await Coin.methods.balances(event.returnValues.from).call();
            const receiverBalance = await Coin.methods.balances(event.returnValues.to).call();
            console.log("Balances now:\n" +
                "Sender: " + senderBalance +
                "\nReceiver: " + receiverBalance);
        })
        Coin.events.Sent().on('error', console.error);
        // Trigger an event by making a transaction
        Coin.methods.send(accounts[1], 10).send({ from: accounts[0] });
        // coin.Sent().watch({}, '', function(error, result) {
        //     if (!error) {
        //         console.log("Coin transfer: " + result.args.amount +
        //             " coins were sent from " + result.args.from +
        //             " to " + result.args.to + ".");
        //         console.log("Balances now:\n" +
        //             "Sender: " + Coin.balances.call(result.args.from) +
        //             "Receiver: " + Coin.balances.call(result.args.to));
        //     } else {
        //         console.error(error);
        //     }
        // });
    })
});
