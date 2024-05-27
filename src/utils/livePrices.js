const WebSocket = require('ws');
const Asset = require('../models/assetsModel');

function livePrices() {
    // Create WebSocket connection
    const socket = new WebSocket('wss://ws.finnhub.io?token=cou75o9r01qr7r8glccgcou75o9r01qr7r8glcd0');
    console.log("live data socket connected")

    socket.addEventListener('open', function (event) {
        // Subscribe to the symbols you want to track
        const symbols = [
            'BINANCE:BTCUSDT',
            'BINANCE:ETHUSDT',
            'BINANCE:USDCUSDT',
            'BINANCE:BNBUSDT',
            'BINANCE:BUSDUSDT',
            'BINANCE:XRPUSDT',
            'BINANCE:ADAUSDT',
            'BINANCE:SOLUSDT',
            'BINANCE:DOGEUSDT',
            'BINANCE:DOTUSDT',
            'BINANCE:DAIUSDT',
            'BINANCE:MATICUSDT',
            'BINANCE:SHIBUSDT',
            'BINANCE:TRXUSDT',
            'BINANCE:AVAXUSDT',
            'BINANCE:LEOUSDT',
            'BINANCE:LTCUSDT',
            'BINANCE:XLMUSDT',
            'BINANCE:BCHUSDT'
        ];

        symbols.forEach(symbol => {
            socket.send(JSON.stringify({ 'type': 'subscribe', 'symbol': symbol }));
        });
    });

    socket.addEventListener('message', async function (event) {
        const message = JSON.parse(event.data);
        if (message.type === 'trade' && message.data && message.data.length > 0) {
            // Update prices in the database
            for (const trade of message.data) {
                const symbol = trade.s;
                const price = trade.p;
                // Update the asset price in the database
                try {
                    let formattedSymbol = symbol.split(':')[1]; // Remove the exchange prefix
                    formattedSymbol = formattedSymbol.replace('USDT', ''); // Drop 'USDT' suffix
                    await Asset.findOneAndUpdate({ symbol: formattedSymbol }, { price: price });
                    // console.log(`Updated price for ${formattedSymbol} to ${price}`);
                } catch (err) {
                    console.error(`Error updating price for ${symbol}:`, err);
                }
            }
        }
    });

    // Error handling
    socket.addEventListener('error', function (event) {
        console.error('WebSocket error:', event.error);
    });
}

module.exports = livePrices;