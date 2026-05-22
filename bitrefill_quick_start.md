

# Quickstart

Make your first API call and complete a purchase in minutes.

### Prerequisites

* A Bitrefill account — [Sign up free](https://www.bitrefill.com/signup)
* An API key — [Generate one here](https://www.bitrefill.com/account/developers)

### Step 1: Set Up Authentication

```javascript
const API_KEY = process.env.BITREFILL_API_KEY;
const BASE_URL = 'https://api.bitrefill.com/v2';

const headers = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json'
};
```

### Step 2: Test Your Connection

Verify your credentials work by calling the ping endpoint:

```javascript
const response = await fetch(`${BASE_URL}/ping`, { headers });
const data = await response.json();
console.log(data); // { meta: {...}, data: { message: 'pong' } }
```

If you see `pong`, you're authenticated and ready to go.

### Step 3: Check Your Balance

```javascript
const response = await fetch(`${BASE_URL}/accounts/balance`, { headers });
const { data } = await response.json();
console.log(`Balance: ${data.balance} ${data.currency}`);
```

### Step 4: Find a Product

List available products or search for a specific one:

```javascript
// List products
const products = await fetch(`${BASE_URL}/products?limit=10`, { headers });

// Search for a product
const search = await fetch(`${BASE_URL}/products/search?q=amazon`, { headers });
```

### Step 5: Get Product Details

Get available denominations for a product:

```javascript
const response = await fetch(`${BASE_URL}/products/amazon-us`, { headers });
const { data: product } = await response.json();

// Fixed denominations
console.log(product.packages); // [{ package_id: 'amazon-us<&>25', value: 25 }, ...]

// Or flexible range
console.log(product.range); // { min: 1, max: 200, step: 0.01 }
```

See [Core Concepts](/docs/core-concepts#denominations-packages-vs-ranges) for more on packages vs ranges.

### Step 6: Create and Pay an Invoice

Purchase a product using your account balance:

```javascript
const response = await fetch(`${BASE_URL}/invoices`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    products: [{
      product_id: 'amazon-us',
      package_id: 'amazon-us<&>50',
      quantity: 1
    }],
    payment_method: 'balance',
    auto_pay: true
  })
});

const { data: invoice } = await response.json();
console.log(`Invoice: ${invoice.id}, Status: ${invoice.status}`);
```

With `auto_pay: true`, the invoice is paid immediately from your balance.

### Step 7: Get the Redemption Code

Retrieve the order with the gift card code:

```javascript
const orderId = invoice.orders[0].id;
const response = await fetch(`${BASE_URL}/orders/${orderId}`, { headers });
const { data: order } = await response.json();

console.log('Gift card code:', order.redemption_info.code);
console.log('Instructions:', order.redemption_info.instructions);
```

### Complete Example

```javascript
const API_KEY = process.env.BITREFILL_API_KEY; // or use Basic auth for Business API
const BASE_URL = 'https://api.bitrefill.com/v2';

async function purchaseGiftCard(productId, packageId) {
  const headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  };

  // Create and pay invoice
  const invoiceRes = await fetch(`${BASE_URL}/invoices`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      products: [{ product_id: productId, package_id: packageId, quantity: 1 }],
      payment_method: 'balance',
      auto_pay: true
    })
  });
  
  const { data: invoice } = await invoiceRes.json();
  
  if (invoice.status !== 'complete') {
    throw new Error(`Invoice status: ${invoice.status}`);
  }
  
  // Get redemption info
  const orderId = invoice.orders[0].id;
  const orderRes = await fetch(`${BASE_URL}/orders/${orderId}`, { headers });
  const { data: order } = await orderRes.json();
  
  return order.redemption_info;
}

// Usage
const code = await purchaseGiftCard('amazon-us', 'amazon-us<&>50');
console.log('Gift card code:', code.code);
```

### Using Test Products

For development, use test products that don't cost money. See [Test Products](/docs/test-products) for the full list.

```javascript
const response = await fetch(`${BASE_URL}/invoices`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    products: [{
      product_id: 'test-gift-card-code',
      value: 10,
      quantity: 1
    }],
    payment_method: 'balance',
    auto_pay: true
  })
});
```