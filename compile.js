const path = require('path');
const fs = require('fs');
const solc = require('solc');
const { json } = require('mocha/lib/reporters');

const inboxPath = path.resolve(__dirname, 'contracts', 'Inbox.sol');
const source = fs.readFileSync(inboxPath, 'utf8');

// Compiler input and output settings
const input = {
    language: 'Solidity',
    sources: {
        'Inbox.sol': {
            content: source,
        },
    },
    settings: {
        outputSelection: {
            '*': {
                // '*': ['abi', 'evm.bytecode'],
                '*': ['*'],
            },
        },
    },
};

// Compile the contract
const output = solc.compile(JSON.stringify(input));
const parsedOutput = JSON.parse(output);
console.log(parsedOutput);
const contract = parsedOutput.contracts['Inbox.sol']['Inbox'];

// console.log(contract);
module.exports = contract; 
// solc.compile(source, 1).contracts[':Inbox'];
// console.log(solc.compile(source, 1).contracts[':Inbox'].assembly);
