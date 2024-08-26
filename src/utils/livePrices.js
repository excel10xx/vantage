const WebSocket = require('ws');
const Asset = require('../models/assetsModel');

function livePrices() {
    // Create WebSocket connection for Finnhub
    const socket = new WebSocket('wss://ws.finnhub.io?token=cou75o9r01qr7r8glccgcou75o9r01qr7r8glcd0');
    console.log("Finnhub socket connected");

    socket.addEventListener('open', function (event) {
        // Subscribe to the symbols you want to track
        const symbols = [
            'AAPL',
            'MSFT',
            'AMZN',
            'NVDA',
            'GOOGL',
            'TSLA',
            'BRK.B',
            'META',
            'UNH',
            'XOM',
            'LLY',
            'JPM',
            'JNJ',
            'V',
            'PG',
            'MA',
            'AVGO',
            'HD',
            'CVX',
            'MRK',
            'ABBV',
            'COST',
            'PEP',
            'ADBE',
            'ASML',
            'NXPI',
            'STLA',
            'ING',
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
            'BINANCE:UNIUSDT',
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
                    let formattedSymbol = symbol.includes(':') ? symbol.split(':')[1].replace('USDT', '') : symbol; // Format symbol if it's a crypto
                    await Asset.findOneAndUpdate({ symbol: formattedSymbol }, { price: price });
                    // console.log(`Updated price for ${formattedSymbol} to ${price}`);
                } catch (err) {
                    console.error(`Error updating price for ${symbol}:`, err);
                }
            }
        }
    });

    // Error handling for socket
    socket.addEventListener('error', function (event) {
        console.error('Finnhub WebSocket error:', event.error);
    });
}

module.exports = livePrices;
