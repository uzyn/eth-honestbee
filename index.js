const honestbee = require('./lib/honestbee');
const pollSeconds = 5;
let pollTimer;

function order(callback) {
  // We have to order something in the labs environment.
  // The cart needs to be created first.
  const cartToken = '5edda86a-bd4a-51a9-a80b-4c8db9a33743';
  console.log('Making an order using cart token...');

  // This returns the order.
  return honestbee.order(cartToken, callback);
}

function checkStatus(orderGuid, callback) {
  console.log('Checking order status...');
  return honestbee.status(orderGuid, callback);
}


order((err, order) => {
  if (!err) {
    console.log(`Poll for order status (order guid: ${order.orderGuid} every ${pollSeconds} seconds.`);
    pollTimer = setInterval(() => {
      checkStatus(order.orderGuid, (err, polledStatus) => {
        console.log(polledStatus);
        if (polledStatus.status == 'delivered') {
          console.log('Order is delivered.');
          //  In theory, only when an order is reconciled do you transfer the money over to us.
          //  Let's just assume for now, that upon delivery, there will be no discrepancy,
          //  between what's delivered and what's order.
          clearInterval(pollTimer);
        }
      });
    }, pollSeconds * 1000);
  }
  else {
    console.log('Error');
  }
});
