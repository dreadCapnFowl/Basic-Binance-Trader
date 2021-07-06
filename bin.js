const Binance = require('node-binance-api');
const binance = new Binance().options({
  APIKEY: 'x',
  APISECRET: 'y'
});

function awaitOrder(orderId) {
    return new Promise((resolve, reject) => {
        var t = setInterval(async () => {
        var orderStatus = await binance.orderStatus("BTCUSDT", orderId)
        if (orderStatus.status == 'FILLED') {
            clearInterval(t);
            resolve(orderStatus)        
        }
        }, 1000)
    })
}

(async () => {

var arbitrate = 10;

var price = parseFloat((await binance.prices('BTCUSDT')).BTCUSDT);
var diff = 5;

// Buy price
var buyPrice = (price - diff / 2).toFixed(6)
var sellPrice = (price + diff / 2).toFixed(6);

var buyBtc = (arbitrate / buyPrice).toFixed(4);

var sellBtc = ( arbitrate / sellPrice).toFixed(4);
var diff = buyBtc - sellBtc;


var diffUsd = sellPrice * diff;

console.log(`Buying ${buyBtc} at ${buyPrice} to sell at ${sellPrice}`)
console.log(`Profit BTC: ${diff}`)
console.log(`Profit USD: ${diffUsd}`)
console.log(`Expected: ${arbitrate + diffUsd}`)
try {
var order = await binance.buy("BTCUSDT", buyBtc, buyPrice);

awaitOrder(order.orderId)
.then(async status => {
    console.log('BUY order executed.')
    try {

    var order = await binance.sell("BTCUSDT", sellBtc, sellPrice)
    awaitOrder(order.orderId)
    .then((status) => {
        console.log('Cycle completed', status)
    })
    } catch(e) {
    console.log(e)
    }
    
})


} catch(e) {
    console.log(e);
}
})()
