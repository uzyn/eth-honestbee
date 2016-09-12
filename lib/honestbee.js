var fetch = require('node-fetch');
var FormData = require('form-data');
const accessToken = '';
/**
 * Placing an order for
 */
function order(cartToken, callback) {
  console.log(`Attempting to make an order for cart with tokken: ${cartToken}`);

  var data = new FormData();
  data.append('access_token', accessToken); // Shouldn't be checked into source.
  data.append('cart_token', cartToken); // Needs to be generated for each new order.

  fetch('http://localhost:3000/api/checkout/order', {
    method: 'POST',
    body: data
  }).then(function(response){
    //  Should do error handling here. Properly.
    if (response.status >= 200 && response.status < 300) {
      console.log("Everything Ok.");
      return response.json();
    } else {
      console.log("Error");
      var error = new Error();
      throw error;
    }
  }).then(function(json){
    console.log(json);
    return callback(null, json);
  });
}

function status(orderGuid, callback) {
  console.log(`Checking order status for order guid: ${orderGuid}`);



  fetch(`http://localhost:3000/api/orders/${orderGuid}?access_token=${accessToken}`)
    //  Should do error handling here. Properly.
  .then(function(response){
      if (response.status >= 200 && response.status < 300) {
        console.log("Everything Ok.");
        return response.json();
      } else {
        console.log("Error");
        var error = new Error();
        throw error;
      }
  }).then(function(json){
    return callback(null, json);
  });
}

module.exports = {
  order, status
};
