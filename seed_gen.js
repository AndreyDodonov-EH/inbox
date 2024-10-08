const bip39 = require('@scure/bip39');
const bip32 = require('@scure/bip32');
const { wordlist } = require('@scure/bip39/wordlists/english');

// Generate x random words. Uses Cryptographically-Secure Random Number Generator.
const mnemonic = bip39.generateMnemonic(wordlist);
console.log(mnemonic);

// Step 1: Convert the mnemonic to seed
const seed = bip39.mnemonicToSeedSync(mnemonic);

// Step 2: Derive private key using BIP32 (e.g., for Bitcoin path "m/44'/0'/0'/0/0")
const root = bip32.HDKey.fromMasterSeed(seed);
const privateKey = root.derive("m/44'/0'/0'/0/0").privateKey;

console.log('Private Key:', privateKey);

const hexString = Array.from(privateKey).map(byte => byte.toString(16).padStart(2, '0')).join('');

console.log(hexString);
