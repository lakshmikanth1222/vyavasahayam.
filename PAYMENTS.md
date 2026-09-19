# VyavaSahayam – Cashfree Payment Gateway Integration Guide

This document outlines the end-to-end payment integration using **Cashfree Payments** (PG API Version `2023-08-01`) for **VyavaSa(ha)yam (Demand-First Digital Farm-to-Customer Marketplace)**.

---

## 1. Overview & Architecture

VyavaSahayam uses Cashfree Payments for secure, compliant payment processing supporting all major Indian payment methods:
- **UPI**: Google Pay, PhonePe, Paytm, BHIM, Cred, and Any UPI App / VPA
- **Cards**: Visa, MasterCard, RuPay, Maestro Credit & Debit Cards
- **Net Banking**: All major Indian public and private banks
- **Wallets & Apps**: Paytm, Mobikwik, Airtel Money, Freecharge, Ola Money

### Payment & Escrow Workflow

```
Customer (React / React Native)
       │
       ▼
1. "Pay Securely with Cashfree" Clicked
       │
       ▼
2. POST /api/v1/payments/create-order
       │
       ▼
FastAPI Backend (Validates Auth, Fetches Order from DB, Recalculates Amount)
       │
       ▼
Cashfree PG API (POST /orders with client_id & secret)
       │
       ▼
Returns `payment_session_id`
       │
       ▼
Frontend opens Cashfree SDK Checkout (Modal or Seamless Dropin/Redirect)
       │
       ▼
Customer completes payment (UPI, Cards, NetBanking, etc.)
       │
       ├────────────────────────────────────────┐
       │ (Async Webhook)                        │ (Sync Redirect)
       ▼                                        ▼
POST /api/v1/payments/cashfree/webhook     Frontend /payment/callback
       │                                        │
Backend verifies HMAC-SHA256 signature     Calls POST /api/v1/payments/{order_id}/verify
       │                                        │
Updates DB `payments` & `orders` to PAID   Displays verified Order Confirmation UI
       │
Creates Escrow Hold for Farmer Payout
```

> [!IMPORTANT]
> **Server-Side Verification**: Orders are NEVER marked as `PAID` or `CONFIRMED` based solely on frontend callbacks. All state transitions require server-to-server verification or verified webhook events.

---

## 2. Environment Variables & Credentials

### Configuration in `backend/.env`

```env
# Cashfree Payment Gateway Settings
# Set to 'sandbox' for testing or 'production' for live payments
CASHFREE_ENVIRONMENT=sandbox

# Cashfree API Credentials (obtain from Cashfree Merchant Dashboard)
CASHFREE_CLIENT_ID=your_cashfree_app_id_here
CASHFREE_CLIENT_SECRET=your_cashfree_secret_key_here
CASHFREE_API_VERSION=2023-08-01

# Callback URLs
CASHFREE_RETURN_URL=http://localhost:5173/payment/callback?order_id={order_id}
CASHFREE_NOTIFY_URL=http://localhost:8000/api/v1/payments/cashfree/webhook
```

### Security Rules
- **NEVER** expose `CASHFREE_CLIENT_SECRET` in frontend code (`frontend/`).
- All API requests to Cashfree PG are made strictly server-to-server from the FastAPI backend.

---

## 3. Cashfree Account Setup & DevStudio

1. Sign up on [Cashfree Payments](https://www.cashfree.com/) or log in to the [Merchant Dashboard](https://merchant.cashfree.com/).
2. Navigate to **Payment Gateway** > **Developers** > **API Keys**.
3. For Sandbox testing:
   - Switch to **Sandbox Mode** in the top navigation.
   - Generate your `App ID` (Client ID) and `Secret Key`.
4. Copy credentials into your `backend/.env`.

---

## 4. Webhook Setup & Signature Verification

### Webhook Configuration
1. In the Cashfree Merchant Dashboard, go to **Developers** > **Webhooks**.
2. Add a new Webhook Endpoint:
   - **URL**: `https://your-domain.com/api/v1/payments/cashfree/webhook`
   - **Version**: `2023-08-01`
   - **Events**: `PAYMENT_SUCCESS_WEBHOOK`, `PAYMENT_FAILED_WEBHOOK`, `PAYMENT_USER_DROPPED_WEBHOOK`, `REFUND_SUCCESS_WEBHOOK`
3. For local development, use a tunnel like `ngrok` or `cloudflared`:
   ```bash
   ngrok http 8000
   # Then set notify_url to https://<ngrok-subdomain>.ngrok-free.app/api/v1/payments/cashfree/webhook
   ```

### Webhook HMAC Signature Verification
Cashfree computes signatures using:
$$\text{Signature} = \text{Base64}(\text{HMAC-SHA256}(\text{timestamp} + \text{raw\_body}, \text{secret\_key}))$$

The FastAPI backend automatically verifies headers (`x-webhook-signature` & `x-webhook-timestamp`) using `CashfreePaymentService.verify_webhook_signature`.

### Webhook Idempotency
All incoming webhook payload hashes are recorded in the `payment_events` table (`payload_hash`). Duplicate deliveries are safely ignored with an HTTP 200 response without double-crediting or duplicate status changes.

---

## 5. API Endpoints Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/payments/create-order` | Creates a Cashfree order and returns `payment_session_id` | Authenticated User |
| `GET` | `/api/v1/payments/{order_id}/status` | Queries verified payment status from Cashfree and DB | Authenticated User |
| `POST` | `/api/v1/payments/{order_id}/verify` | Triggers post-redirect server-to-server verification | Authenticated User |
| `POST` | `/api/v1/payments/cashfree/webhook` | Receives and verifies Cashfree webhook notifications | Public (Signature Verified) |
| `POST` | `/api/v1/payments/{order_id}/refund` | Initiates full/partial refund via Cashfree | Admin Only |
| `GET` | `/api/v1/payments/admin/all` | Lists all payment transactions and gateway IDs | Admin Only |

---

## 6. Frontend Web Checkout (SDK v3)

The frontend integrates the official Cashfree Web SDK v3:
- Script loaded in `frontend/index.html`:
  `<script src="https://sdk.cashfree.com/js/v3/cashfree.js"></script>`
- Initialization wrapper in `frontend/src/services/cashfree.js`:
  ```javascript
  import { initiateCashfreeCheckout } from '../../services/cashfree';

  await initiateCashfreeCheckout({
    paymentSessionId: response.data.payment_session_id,
    environment: 'sandbox', // or 'production'
    redirectTarget: '_self'
  });
  ```

---

## 7. Escrow & Settlement Architecture

VyavaSahayam separates the **Payment Gateway Layer** from the **Escrow & Settlement Layer**:
1. **Buyer Payment**: Funds collected via Cashfree.
2. **Escrow Hold**: Recorded in `escrow_transactions` with status `HELD`.
3. **Fulfillment**: Order routed through local Rythu Bazar center for quality grading.
4. **Delivery & Confirmation**: Consumer confirms produce freshness and quality.
5. **Farmer Payout Settlement**: Platform fee (2%) and optional insurance deduction (3%) calculated, and net payout is released to the farmer's bank account.

---

## 8. Switching from Sandbox to Production

1. Complete KYC verification on the Cashfree Merchant Dashboard.
2. Generate Production API Keys under **Production Mode** > **Developers** > **API Keys**.
3. Update `backend/.env`:
   ```env
   CASHFREE_ENVIRONMENT=production
   CASHFREE_CLIENT_ID=your_production_app_id
   CASHFREE_CLIENT_SECRET=your_production_secret_key
   CASHFREE_RETURN_URL=https://your-domain.com/payment/callback?order_id={order_id}
   CASHFREE_NOTIFY_URL=https://your-domain.com/api/v1/payments/cashfree/webhook
   ```
4. Restart the FastAPI backend. The application will automatically route requests to `https://api.cashfree.com/pg`.
