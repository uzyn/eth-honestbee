var fetch = require('node-fetch');
var FormData = require('form-data');
const request = require("request");
const accessToken = process.env.ACCESS_TOKEN;


/**
 * Creates cart with valid delivery time and returns cart token
 */
function createCart(options, deliveryParams) {
  return requestPromise(options).then( (body) => {
    var cartId = body.id;
    deliveryParams["qs"]["cartId"] = cartId;
    return deliveryParams;
  }).then( (deliveryParams) => {
    return requestPromise(deliveryParams);
  }).then( (body) => {
    let jsonBody = JSON.parse(body)[0].days[0];
    options.body["brand-carts"]["brand-cart-3"]["delivery"] = {
      deliveryDay: jsonBody.day,
      deliveryTime: jsonBody.times[0].startDate,
      deliveryTimeslotId: jsonBody.times[0].id
    }
    return options
  }).then( (options) => {
    return requestPromise(options);
  });
}


/**
 * Creates order in backend system and returns a response object containing orderGuid and status
 */
function order(productID) {
  return createCart(products[productID],deliveryParams).then(function(cart){
    let cartToken = cart.id;
    console.log(`Attempting to make an order for cart with token: ${cartToken}`);

    let data = new FormData();
    data.append('access_token', accessToken); // Shouldn't be checked into source.
    data.append('cart_token', cartToken); // Needs to be generated for each new order.
    return data
  }).then( (data) => {
    return fetch(`${process.env.BACKEND_URL}/api/checkout/order`, {
      method: 'POST',
      body: data
    });
  }).then( (response) => {
    //  Should do error handling here. Properly.
    if (response.status >= 200 && response.status < 300) {
      console.log("Everything Ok.");
      return response.json();
    } else {
      console.log("Error");
      var error = new Error();
      throw error;
    }
  }).catch( (e) => {
    console.log(e);
  })
}

function mockOrder(productID) {
  return new Promise((resolve, reject) => {
    return resolve({
      id: 9999999999999,
      orderGuid: 'MOCK-ORDER-9999999999999',
      totalAmount: '15.50',
    });
  });
}

function status(orderGuid) {
  console.log(`Checking order status for order guid: ${orderGuid}`);
  return fetch(`${process.env.BACKEND_URL}/api/orders/${orderGuid}?access_token=${accessToken}`)
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
  });
}


function requestPromise(params){
  return new Promise( (resolve, reject) => {
    request(params, function (error, response, body) {
      if (error) return reject(error);
      resolve(body);
    });
  });
}

const deliveryParams = { method: 'GET',
  url: `${process.env.FRONTEND_URL}/api/api/checkout/delivery_timing`,
  qs:
   { zoneId: '12',
     storeTotal3: '30.799999999999997',
     cartId: '',
     access_token: accessToken },
  headers:
   { 'cache-control': 'no-cache',
     accept: 'application/vnd.honestbee+json;version=2',
     'content-type': 'application/json' } };

const options_paper = { method: 'POST',
  url: `${process.env.BACKEND_URL}/api/carts`,
  qs:
   { access_token: accessToken,
     country_code: 'SG',
     namespace: 'grocery' },
  headers:
   { 'cache-control': 'no-cache',
     'content-type': 'application/json' },
  body:
  {
    "brand-carts" : {
      "brand-cart-3" : {
        "brandColor" : "005696",
        "brandId" : 3,
        "brandName" : "FairPrice",
        "conciergeFee" : "0.0",
        "deliveryFee" : "10",
        "description" : "Groceries & Daily Necessities",
        "freeDeliveryAmount" : "30",
        "id" : "brand-cart-3",
        "items" : {
          "cart-3-item-291883" : {
            "alcohol" : false,
            "amount" : "27.6",
            "amountPerUnit" : "1",
            "id" : "cart-3-item-291883",
            "itemTitle" : "Double A A4 White Paper (5 Packs)",
            "notes" : "",
            "previewImageUrl" : "https://honestbees.s3.amazonaws.com/products/images/480/20_11533670_11533670.jpg",
            "productId" : 291883,
            "quantity" : 2,
            "quantityDisplay" : 2,
            "replacementOption" : "pick_specific_replacement",
            "size" : "0",
            "soldBy" : "sold_by_item",
            "totalAmount" : "55.2",
            "unitType" : "unit_type_item"
          }
        },
        "slug" : "fairprice",
        "storeId" : 135
      }
    },
    "countryCode" : "SG",
    "currency" : "SGD",
    "customerReplacements" : {
      "cartItem291883" : {
        "amountPerUnit" : 1,
        "brandId" : "3",
        "cartItemTitle" : "Double A A4 White Paper (5 Packs)",
        "changedByUser" : true,
        "currency" : "SGD",
        "descriptionHtml" : "Sustainable development \n Environmentally friendly \n Smoothness feel the difference \n A4 210 x 297mm, white, 80gsm, 500 sheets, 5S",
        "doNotReplace" : false,
        "id" : "cartItem291883",
        "imageUrl" : "https://honestbees.s3.amazonaws.com/products/images/480/20_10312497_10312497.jpg",
        "inCartProductId" : 291883,
        "normalPrice" : 5.9,
        "previewImageUrl" : "https://honestbees.s3.amazonaws.com/products/images/480/20_10312497_10312497.jpg",
        "price" : 5.9,
        "productBrand" : "Double A",
        "productInfo" : {
          "special_remarks" : "To reduce the logging of natural forests, double A uses fast growing trees planted on khan-na (the farmers' unused land between rice paddles for paper making)."
        },
        "quantity" : 10,
        "replacementProductId" : 291882,
        "requestedProductId" : 291883,
        "size" : "1 pack",
        "tags" : [ {
          "title" : "Eco-friendly"
        } ],
        "title" : "Double A A4 White Paper"
      }
    },
    "shippingAddress" : {
      "address1" : "1 Fusionopolis View",
      "addressType" : "other",
      "city" : "Singapore",
      "country" : "Singapore",
      "latitude" : "1.300085",
      "longitude" : "103.789437",
      "postalCode" : "138577"
    },
    "updatedAt" : 1475586091089,
    "zoneId" : 41
  },

  json: true };

const options_capsules = { method: 'POST',
  url: `${process.env.BACKEND_URL}/api/carts`,
  qs:
   { access_token: accessToken,
     country_code: 'SG',
     namespace: 'grocery' },
  headers:
   { 'cache-control': 'no-cache',
     'content-type': 'application/json' },
  body:
    {
      "brand-carts" : {
        "brand-cart-3" : {
          "brandColor" : "005696",
          "brandId" : 3,
          "brandName" : "FairPrice",
          "conciergeFee" : "0.0",
          "delivery" : {
            "deliveryDay" : "2016-11-18T00:00:00.000+08:00",
            "deliveryTime" : "2016-11-18T22:00:00.000+08:00",
            "deliveryTimeslotId" : 781585
          },
          "deliveryFee" : "10",
          "description" : "Groceries & Daily Necessities",
          "freeDeliveryAmount" : "30",
          "id" : "brand-cart-3",
          "items" : {
            "cart-3-item-432338" : {
              "alcohol" : false,
              "amount" : "7.45",
              "amountPerUnit" : "1",
              "id" : "cart-3-item-432338",
              "itemTitle" : "Cafedirect Explorers Collection Capsules",
              "notes" : "",
              "previewImageUrl" : "https://honestbees.s3.amazonaws.com/products/images/480/_13074367_13074367-1.jpg",
              "productId" : 432338,
              "quantity" : 5,
              "quantityDisplay" : 5,
              "replacementOption" : "pick_specific_replacement",
              "size" : "10x5.3 g",
              "soldBy" : "sold_by_item",
              "totalAmount" : "37.25",
              "unitType" : "unit_type_item"
            }
          },
          "slug" : "fairprice",
          "storeId" : 135
        }
      },
      "contactPhoneNumber" : "81219388",
      "countryCode" : "SG",
      "currency" : "SGD",
      "customerReplacements" : {
        "cartItem432338" : {
          "amountPerUnit" : 1,
          "brandId" : "3",
          "cartItemTitle" : "Cafedirect Explorers Collection Capsules",
          "changedByUser" : true,
          "currency" : "SGD",
          "doNotReplace" : false,
          "id" : "cartItem432338",
          "imageUrl" : "https://honestbees.s3.amazonaws.com/products/images/480/_13074365_13074365-1.jpg",
          "inCartProductId" : 432338,
          "normalPrice" : 8.9,
          "previewImageUrl" : "https://honestbees.s3.amazonaws.com/products/images/480/_13074365_13074365-1.jpg",
          "price" : 7.45,
          "productBrand" : "Cafedirect",
          "quantity" : 5,
          "replacementProductId" : 432336,
          "requestedProductId" : 432338,
          "size" : "10x5.3 g",
          "title" : "Cafedirect Americano Capsules"
        }
      },
      "lock" : false,
      "paymentDeviceId" : 89707,
      "shippingAddress" : {
        "address1" : "1 Fusionopolis View",
        "addressType" : "other",
        "city" : "Singapore",
        "country" : "Singapore",
        "latitude" : "1.300085",
        "longitude" : "103.789437",
        "postalCode" : "138577"
      },
      "updatedAt" : 1479435759714
    },

  json: true };

const products = { 1: options_paper, 2: options_capsules }
module.exports = {
  order,
  mockOrder,
  status
};
