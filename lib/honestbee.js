var fetch = require('node-fetch');
var FormData = require('form-data');

/**
 * Placing an order for
 */
function order(cartToken, callback) {
  console.log(`Attempting to make an order for cart with tokken: ${cartToken}`);

  var data = new FormData();
  data.append('access_token', 'a8bde85383691a79191d96efaec1a3ebe6f6352d202783df4e68eabe081c731f'); // Shouldn't be checked into source.
  data.append('cart_token', cartToken); // Needs to be generated for each new order.

  fetch('http://localhost:3000/api/checkout/order', {
    method: 'POST',
    body: data
  }).then(function(response){
    //  Should do error handling here.
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


  return callback(null, {
  });
}

module.exports = {
  order, status
};
