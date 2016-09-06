const honestbee = require('./lib/honestbee');
const pollSeconds = 5;
const maxPrice = 50.00;
let pollTimer;

function order(callback) {
  const id = 1; // hardcoded ID for A4 papers
  console.log('Making an order of 1 box of A4 papers, setting max price to SGD 50.00');

  return honestbee.order(id, 1, maxPrice, callback);
}

function checkStatus(orderId, callback) {
  console.log('Checking order status...');

  return honestbee.status(orderId, callback);
}


order((err, orderStatus) => {
  if (!err) {
    console.log(`Poll for order status (order id: ${orderStatus.id} every ${pollSeconds} seconds.`);
    pollTimer = setInterval(() => {
      checkStatus(orderStatus.id, (err, polledStatus) => {
        console.log(polledStatus);
        if (polledStatus.status.final) {
          console.log(`Status is final. Final price is ${polledStatus.price.total}`);
          console.log(`Refunding SGD ${maxPrice - polledStatus.price.total} in ETH equivalent to user.`);
          clearInterval(pollTimer);
        }
      });
    }, pollSeconds * 1000);
  }
});
