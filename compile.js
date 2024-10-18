const path = require('path');
const fs = require('fs');
const solc = require('solc');

const _SOLIDITY_FILE_EXTENSION = '.sol';

/// Expects that the filename is <contractName>.sol
function compile(contractName) {
    // Compiler input and output settings
    const input = {
        language: 'Solidity',
        sources: {},
        settings: {
            outputSelection: {
                '*': {
                    // *,
                    // '*': ['abi', 'evm.bytecode'],
                    "*": ["abi", "evm.bytecode.object"]
                },
            },
        },
    };
    input.sources = {
        [contractName + _SOLIDITY_FILE_EXTENSION]: {
            content: fs.readFileSync(path.resolve(__dirname, 'contracts', contractName + _SOLIDITY_FILE_EXTENSION), 'utf8')
        }
    };
    // Compile the contract
    const stringifiedInput = JSON.stringify(input);;
    const output = solc.compile(stringifiedInput);
    const parsedOutput = JSON.parse(output);
    // console.log(parsedOutput);
    const contract = parsedOutput.contracts[contractName + _SOLIDITY_FILE_EXTENSION][contractName];
    console.log(contract);
    return contract
}

module.exports = compile;
