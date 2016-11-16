# eth-honestbee

[honestbee](https://honestbee.sg) on [ethereum](https://honestbee.sg)

## How to run

First create a `.env` file and include the following variables:
 - ACCESS_TOKEN
 - BACKEND_URL
 - FRONTEND_URL

To run the _currently-simulated_ demo:

```bash
npm install
npm start
```

Update environment variables.

```bash
cp .env.default .env
# edit .env accordingly
```

## Operations

1. Place an order, currently supports only a restricted set of products.

1. Checks an order status. 


### Products

Only the following products are supported with the ID as shown.

| ID     |  Name     |  Description      |  Item price (SGD)      |
|---    |---    |---    |---    |
| 1     |  Brand A4 paper     |  1 box     | $29.95      |
| 2     |       |       |       |
| 3      |       |       |       |

### Status codes for order status

The following order status codes are **FINAL** and will no longer be reversed. System may halt polling upon receiving the following statuses:

1. Canceled order
    - Held funds to be refunded fully.

1. Order delivered
    - Balance of held funds to be refunded.

The following order status codes are **NON-FINAL** and represent only an order update and may be revised:

1. Order processing

_etc..._
