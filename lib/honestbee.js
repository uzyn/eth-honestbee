/**
 * Placing an order for
 */
function order(id, count, maxTotalSGD, callback) {
  console.log(`Attempting to make an order of ${count} product(s) with ID: ${id}, with total not exceeding SGD ${maxTotalSGD}`);

  return callback(null, {
    //
    id: 8882093028,
    status: {
      code: 3,
      description: 'order accepted',
      final: false,
    },
    price: {
      currency: 'SGD',
      total: 34.99 // final price including shipping, currently the contract does not refund based on non-final statuses, but eventually we can allow contract to refund even balance of non-final price.
    }
  });
}

function status(orderId, callback) {
  console.log(`Checking order status for ID: ${orderId}`);

  // For simulation, make it such that 20% chance the order status returned would be final
  let final = false;
  if (Math.random() < 0.2) {
    final = true;
  }

  return callback(null, {
    id: orderId,
    status: {
      code: 5,
      description: 'shipped',
      final: final,
    },
    price: {
      currency: 'SGD',
      total: 34.99
    }
  });
}

module.exports = {
  order, status
};
