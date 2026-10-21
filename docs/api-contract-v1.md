# Sequence & API Contract

### Customer :

1. **Login via OTP** 

![deepseek_mermaid_20261021_59d2a1.png](Sequence%20&%20API%20Contract/deepseek_mermaid_20261021_59d2a1.png)

API Contract

- Request OTP
    
    
    | **Method** | POST |  |
    | --- | --- | --- |
    | **Endpoint** | {host}}/auth/v1/otp/request |  |
    | **Header** | Content-Type: application/json |  |
    | **REQ** | `{ "phone": "08123456789"}` |  |
    | **RES** | Success 
    
    `{ "status": true, "code": "SUCCESS", "message": "OTP sent successfully", "errorMessage": null, "errorData": null, "data": { "expiresAt": "2026-10-21T12:01:00Z", "cooldownSeconds": 60 }}`
    
    Error 
    
    `{ "status": false, "code": "RATE_LIMITED", "message": "Too many requests", "errorMessage": "You have reached the maximum OTP request limit for this hour.", "errorData": { "retryAfter": 3600 }, "data": nulll }` |  |
- Validate OTP
    
    
    | **Method** | POST |  |
    | --- | --- | --- |
    | **Endpoint** | {{host}}/auth/v1/otp/verify |  |
    | **Header** | Content-Type: application/json |  |
    | **REQ** | `{ "phone": "08123456789", "otp": "123456"}` |  |
    | **RES** | Success 
    
    `{ "status": true, "code": "SUCCESS", "message": "Login successful", "errorMessage": null, "errorData": null, "data": { "accessToken": "eyJhbGciOi...", "refreshToken": "eyJhbGciOi...", "expiresIn": 3600 }}`
    
    Error 
    
    `{ "status": false, "code": "INVALID_OTP", "message": "Verification failed", "errorMessage": "The OTP you entered is incorrect. 2 attempts remaining.", "errorData": { "attemptsRemaining": 2 }, "data": {}}` |  |
- Get Customer
    
    
    | **Method** | POST |  |
    | --- | --- | --- |
    | **Endpoint** | {{host}}/customer/private/customers?phone={phone} |  |
    | **Header** | Content-Type: application/json
    x-api-key: {{secret}} |  |
    | **REQ** | `{ "phone": "08123456789", "otp": "123456"}` |  |
    | **RES** | Success 
    
    `{ "status": true, "code": "SUCCESS", "message": "Customer retrieved", "errorMessage": null, "errorData": null, "data": { "customerId": "c_01HQX...", "phone": "628123456789", "isVerified": false }}`
    
    Error 
    
    `{ "status": false, "code": "INVALID_OTP", "message": "Verification failed", "errorMessage": "The OTP you entered is incorrect. 2 attempts remaining.", "errorData": { "attemptsRemaining": 2 }, "data": {}}` |  |
- Mark Customer as Verified
    
    
    | **Method** | POST |  |
    | --- | --- | --- |
    | **Endpoint** | {{host}}/customer/v1/internal/{customerId}/verify |  |
    | **Header** | Content-Type: application/json
    x-api-key: {{secret}} |  |
    | **REQ** | `{ "verifiedAt": "2026-10-21T12:00:30Z"}` |  |
    | **RES** | Success 
    
    `{ "status": true, "code": "SUCCESS", "message": "Customer verified successfully", "errorMessage": null, "errorData": null, "data": { "customerId": "c_01HQX...", "phoneVerifiedAt": "2026-10-21T12:00:30Z" }}` |  |

1. Dashboard

![deepseek_mermaid_20261021_636fe5.png](Sequence%20&%20API%20Contract/deepseek_mermaid_20261021_636fe5.png)

- Get Active Session Info
    
    
    | **Method** | GET |  |
    | --- | --- | --- |
    | **Endpoint** | {{host}}/product/v1/sessions/active |  |
    | **Header** | Authorization: Bearer {{JWT_TOKEN}} |  |
    | **REQ** | `{ "phone": "08123456789"}` |  |
    | **RES** | Success 
     
    `{
    "status": true,
    "code": "SUCCESS",
    "message": "Active session retrieved",
    "errorMessage": null,
    "errorData": null,
    "data": {
    "sessionId": "s_01HQX...",
    "sessionNumber": 1,
    "status": "OPEN",
    "opensAt": "2026-10-24T05:00:00Z",
    "closesAt": "2026-10-24T05:15:00Z",
    "serverTime": "2026-10-24T05:02:00Z"
    }
    }` |  |
- Get Catalog (List Category & Voucher)
    
    
    | **Method** | GET |  |
    | --- | --- | --- |
    | **Endpoint** | {{host}}/product/v1/vouchers |  |
    | **Header** | Authorization: Bearer {{JWT_TOKEN}} |  |
    | **REQ** | `{ "phone": "08123456789"}` |  |
    | **RES** | Success 
    `{
    "status": true,
    "code": "SUCCESS",
    "message": "Catalog retrieved",
    "errorMessage": null,
    "errorData": null,
    "data": [
    {
    "voucherProductId": "vp_fnb",
    "category": "FOOD_BEVERAGE",
    "name": "Voucher F&B Rp50.000",
    "discountValue": { "amount": 50000, "currency": "IDR" },
    "price": { "amount": 10000, "currency": "IDR" },
    "minTransaction": { "amount": 100000, "currency": "IDR" },
    "stockStatus": "AVAILABLE",
    "customerState": "ELIGIBLE"
    },
    {
    "voucherProductId": "vp_fashion",
    "category": "FASHION_LIFESTYLE",
    "name": "Voucher Fashion Rp200.000",
    "discountValue": { "amount": 200000, "currency": "IDR" },
    "price": { "amount": 50000, "currency": "IDR" },
    "minTransaction": { "amount": 400000, "currency": "IDR" },
    "stockStatus": "SOLD_OUT",
    "customerState": "ELIGIBLE"
    }
    ]
    }` |  |
- Get My Voucher
    
    
    | **Method** | GET |  |
    | --- | --- | --- |
    | **Endpoint** | {{host}}/v1/vouchers/my?status=ACTIVE&limit=5 |  |
    | **Header** | Authorization: Bearer {{JWT_TOKEN}} |  |
    | **REQ** | `{ "phone": "08123456789"}` |  |
    | **RES** | Success 
    `{
    "status": true,
    "code": "SUCCESS",
    "message": "My vouchers retrieved",
    "errorMessage": null,
    "errorData": null,
    "data": [
    {
    "voucherId": "v_01HQX...",
    "voucherCode": "PRM-FB-7K2M",
    "category": "FOOD_BEVERAGE",
    "discountValue": { "amount": 50000, "currency": "IDR" },
    "minTransaction": { "amount": 100000, "currency": "IDR" },
    "status": "ACTIVE",
    "expiresAt": "2026-10-31T05:04:00Z"
    }
    ]
    }` |  |

1. Payment & Checkout

![deepseek_mermaid_20261021_260be0.png](Sequence%20&%20API%20Contract/deepseek_mermaid_20261021_260be0.png)

- Get Voucher Detail
    
    
    | **Method** | GET |  |
    | --- | --- | --- |
    | **Endpoint** | {{host}}/product/v1/catalog/{voucherProductId} |  |
    | **Header** | Authorization: Bearer {{JWT_TOKEN}} |  |
    | **REQ** | - |  |
    | **RES** | Success 
     `{
    "status": true,
    "code": "SUCCESS",
    "message": "Voucher detail retrieved",
    "errorMessage": null,
    "errorData": null,
    "data": {
    "voucherProductId": "vp_fnb",
    "name": "Voucher F&B Rp50.000",
    "category": "FOOD_BEVERAGE",
    "discountValue": { "amount": 50000, "currency": "IDR" },
    "price": { "amount": 10000, "currency": "IDR" },
    "minTransaction": { "amount": 100000, "currency": "IDR" },
    "rules": ["Tidak dapat ditukar tunai", "Sisa diskon hangus"],
    "stockStatus": "AVAILABLE",
    "customerState": "ELIGIBLE"
    }
    }` |  |
- Create Order
    
    
    | **Method** | POST |  |
    | --- | --- | --- |
    | **Endpoint** | {{host}}/v1/orders |  |
    | **Header** | Authorization: Bearer {{JWT_TOKEN}}
    Content-Type: application/json |  |
    | **REQ** | `{ "voucherProductId": "vp_fnb"}` |  |
    | **RES** | Success 
     `{
    "status": true,
    "code": "CREATED",
    "message": "Order reserved successfully",
    "errorMessage": null,
    "errorData": null,
    "data": {
    "orderId": "ord_01HQX...",
    "status": "PENDING",
    "price": { "amount": 10000, "currency": "IDR" },
    "reservationDeadline": "2026-10-24T05:05:00Z"
    }
    }` 
    
    Error - Stock Habis
    
    `{ "status": false, "code": "STOCK_UNAVAILABLE", "message": "Checkout failed", "errorMessage": "Voucher stock is empty for this session.", "errorData": { "category": "FOOD_BEVERAGE" }, "data": {}}`
     |  |
- Initiate Payment
    
    
    | **Method** | POST |  |
    | --- | --- | --- |
    | **Endpoint** | {{host}}/order/v1/{orderId}/payments |  |
    | **Header** | Authorization: Bearer {{JWT_TOKEN}}
    Content-Type: application/json |  |
    | **REQ** | `{ "gateway": "XENDIT"}` |  |
    | **RES** | Success 
     `{ "status": true, "code": "SUCCESS", "message": "Payment initiated", "errorMessage": null, "errorData": null, "data": { "paymentAttemptId": "pay_01HQX...", "orderId": "ord_01HQX...", "gateway": "XENDIT", "status": "PENDING", "amount": { "amount": 10000, "currency": "IDR" }, "invoiceId": "inv_01HQX...", "invoiceUrl": "https://checkout-stub.xendit.co/xxx", "expiresAt": "2026-10-24T05:05:00Z" }}` 
    
    Error - Order Expired > 5mnt
    
    `{ "status": false, "code": "ORDER_EXPIRED", "message": "Payment failed", "errorMessage": "The order reservation time has expired.", "errorData": { "orderId": "ord_01HQX..." }, "data": {}}`
     |  |
1. Detail Owned Voucher

![deepseek_mermaid_20261021_945128.png](Sequence%20&%20API%20Contract/deepseek_mermaid_20261021_945128.png)

- Get Owned Voucher Detail
    
    
    | **Method** | GET |  |
    | --- | --- | --- |
    | **Endpoint** | {{host}}/v1/vouchers/{voucherId} |  |
    | **Header** | Authorization: Bearer {{JWT_TOKEN}} |  |
    | **REQ** | - |  |
    | **RES** | Success 
     `{ "status": true, "code": "SUCCESS", "message": "Voucher detail retrieved", "errorMessage": null, "errorData": null, "data": { "voucherId": "v_01HQX...", "orderId": "ord_01HQX...", "voucherCode": "PRM-FB-7K2M", "qrPayload": "promorush:v1:v_01HQX...:sig_abc123", "category": "FOOD_BEVERAGE", "discountValue": { "amount": 50000, "currency": "IDR" }, "minTransaction": { "amount": 100000, "currency": "IDR" }, "issuedAt": "2026-10-24T05:04:00Z", "expiresAt": "2026-10-31T05:04:00Z", "status": "ACTIVE", "redemption": null }}` 
    
    Error - 404
    
    `{ "status": false, "code": "NOT_FOUND", "message": "Voucher not found", "errorMessage": "Voucher does not exist or does not belong to you.", "errorData": null, "data": {}}` |  |

### Merchant :

1. **Merchant Redeem Voucher**
    
    ![deepseek_mermaid_20261021_6e8e22.png](Sequence%20&%20API%20Contract/deepseek_mermaid_20261021_6e8e22.png)
    
- Redeem Voucher
    
    
    | **Method** | GET |  |
    | --- | --- | --- |
    | **Endpoint** | {{host}}/v1/merchant/redemptions |  |
    | **Header** | `Content-Type: application/json` 
    `Authorization: Bearer {{JWT_TOKEN}}` |  |
    | **REQ** | - |  |
    | **RES** | Success 
     `{ "status": true, "code": "SUCCESS", "message": "Voucher detail retrieved", "errorMessage": null, "errorData": null, "data": { "voucherId": "v_01HQX...", "orderId": "ord_01HQX...", "voucherCode": "PRM-FB-7K2M", "qrPayload": "promorush:v1:v_01HQX...:sig_abc123", "category": "FOOD_BEVERAGE", "discountValue": { "amount": 50000, "currency": "IDR" }, "minTransaction": { "amount": 100000, "currency": "IDR" }, "issuedAt": "2026-10-24T05:04:00Z", "expiresAt": "2026-10-31T05:04:00Z", "status": "ACTIVE", "redemption": null }}` 
    
    Error - 404
    
    `{ "status": false, "code": "NOT_FOUND", "message": "Voucher not found", "errorMessage": "Voucher does not exist or does not belong to you.", "errorData": null, "data": {}}` |  |