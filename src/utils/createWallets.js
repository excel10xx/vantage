require('dotenv').config();

// Bitcoin
const getBitcoinWallet = () => {
    const address = process.env.BITCOIN_ADDRESS;

    if (!address) {
        throw new Error('BITCOIN_ADDRESS environment variable not set.');
    }

    return {
        address: address,
        chain: 'Bitcoin',
        currency: 'BTC'
    };
};

// Ethereum
const getEthereumWallet = () => {
    const address = process.env.ETHEREUM_ADDRESS;

    if (!address) {
        throw new Error('ETHEREUM_ADDRESS environment variable not set.');
    }

    return {
        address: address,
        chain: 'Ethereum',
        currency: 'ETH'
    };
};

// USDT on Ethereum
const getUSDTETHWallet = () => {
    const address = process.env.USDT_ETH_ADDRESS;

    if (!address) {
        throw new Error('USDT_ETH_ADDRESS environment variable not set.');
    }

    return {
        address: address,
        chain: 'Ethereum',
        currency: 'USDT'
    };
};

// USDT on Tron
const getUSDTTRONWallet = () => {
    const address = process.env.USDT_TRON_ADDRESS;

    if (!address) {
        throw new Error('USDT_TRON_ADDRESS environment variable not set.');
    }

    return {
        address: address,
        chain: 'Tron',
        currency: 'USDT'
    };
};

// USDC on Ethereum
const getUSDCETHWallet = () => {
    const address = process.env.USDC_ETH_ADDRESS;

    if (!address) {
        throw new Error('USDC_ETH_ADDRESS environment variable not set.');
    }

    return {
        address: address,
        chain: 'Ethereum',
        currency: 'USDC'
    };
};

// USDC on Binance Smart Chain
const getUSDCBSCWallet = () => {
    const address = process.env.USDC_BSC_ADDRESS;

    if (!address) {
        throw new Error('USDC_BSC_ADDRESS environment variable not set.');
    }

    return {
        address: address,
        chain: 'Binance Smart Chain',
        currency: 'USDC'
    };
};

// Solana
const getSolanaWallet = () => {
    const address = process.env.SOLANA_ADDRESS;

    if (!address) {
        throw new Error('SOLANA_ADDRESS environment variable not set.');
    }

    return {
        address: address,
        chain: 'Solana',
        currency: 'SOL'
    };
};

// BNB on Binance Smart Chain
const getBNBBSCWallet = () => {
    const address = process.env.BNB_BSC_ADDRESS;

    if (!address) {
        throw new Error('BNB_BSC_ADDRESS environment variable not set.');
    }

    return {
        address: address,
        chain: 'Binance Smart Chain',
        currency: 'BNB'
    };
};

// BNB on Binance Chain
const getBNBCHAINWallet = () => {
    const address = process.env.BNB_CHAIN_ADDRESS;

    if (!address) {
        throw new Error('BNB_CHAIN_ADDRESS environment variable not set.');
    }

    return {
        address: address,
        chain: 'Binance Chain',
        currency: 'BNB'
    };
};

// Ripple
const getRippleWallet = () => {
    const address = process.env.RIPPLE_ADDRESS;

    if (!address) {
        throw new Error('RIPPLE_ADDRESS environment variable not set.');
    }

    return {
        address: address,
        chain: 'Ripple',
        currency: 'XRP'
    };
};

// Dogecoin
const getDogecoinWallet = () => {
    const address = process.env.DOGE_ADDRESS;

    if (!address) {
        throw new Error('DOGE_ADDRESS environment variable not set.');
    }

    return {
        address: address,
        chain: 'Dogecoin',
        currency: 'DOGE'
    };
};

module.exports = {
    getBitcoinWallet,
    getEthereumWallet,
    getUSDTETHWallet,
    getUSDTTRONWallet,
    getUSDCETHWallet,
    getUSDCBSCWallet,
    getSolanaWallet,
    getBNBBSCWallet,
    getBNBCHAINWallet,
    getRippleWallet,
    getDogecoinWallet
};
