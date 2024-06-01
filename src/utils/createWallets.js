const cw = require('crypto-wallets')
const rippleKeypairs = require('ripple-keypairs')
const web3 = require('@solana/web3.js')
const { Mnemonic } = require('cardano-wallet-js');

// Bitcoin
const generateBitcoinWallet = () => {
    wallet = cw.generateWallet("BTC")
    wallet.chain = "Bitcoin Chain"
    wallet.currency = "BTC"
    return wallet
};

//Ethereum
const generateEthereumWallet = () => {
    wallet = cw.generateWallet("ETH")
    wallet.chain = "ERC-20 Chain"
    wallet.currency = "ETH"
    return wallet
};

// USDT
const generateUSDTWallet = () => {
    wallet = cw.generateWallet("ETH")
    wallet.chain = "ERC-20 Chain"
    wallet.currency = "USDT"
    return wallet
};

// USDC
const generateUSDCWallet = () => {
    wallet = cw.generateWallet("ETH")
    wallet.chain = "ERC-20 Chain"
    wallet.currency = "USDC"
    return wallet
};

// Solana
const generateSolanaWallet = () => {
    const keypair = web3.Keypair.generate();
    const publicKey = keypair.publicKey.toBase58();
    const secretKey = keypair.secretKey;

    // Convert the secret key array to hexadecimal string
    const hexString = secretKey.reduce((acc, curr) => {
        // Convert each integer to its hexadecimal representation
        const hex = curr.toString(16).padStart(2, '0');
        return acc + hex;
    }, '');

    return {
        address: publicKey,
        privateKey: hexString.toUpperCase(),
        chain: "Solana",
        currency: "SOL"
    };
};

// BNB
const generateBNBWallet = () => {
    wallet = cw.generateWallet("ETH")
    wallet.chain = "ERC-20 Chain"
    wallet.currency = "BNB"
    return wallet
};

// Ripple
const generateRippleWallet = () => {
    const keypair = rippleKeypairs.deriveKeypair(rippleKeypairs.generateSeed());
    const address = rippleKeypairs.deriveAddress(keypair.publicKey);

    return {
        address: address,
        privateKey: keypair.privateKey,
        address: keypair.publicKey,
        chain: "XRP Ledger",
        currency: "XRP"
    };
};

// DogeCoin
const generateDogecoinWallet = () => {
    wallet = cw.generateWallet("DOGE")
    wallet.chain = "Litecoin"
    wallet.currency = "DOGE"
    return wallet
};


module.exports = {
    generateBitcoinWallet,
    generateDogecoinWallet,
    generateEthereumWallet,
    generateUSDTWallet,
    generateUSDCWallet,
    generateSolanaWallet,
    generateBNBWallet,
    generateRippleWallet
};