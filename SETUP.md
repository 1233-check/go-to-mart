# 🛠️ Go-to-Mart — Setup Guide

Follow these steps to set up the project from a fresh clone.

---

## 1. Install Dependencies

```bash
npm install
```

## 2. Environment Variables

Edit `.env` in the project root:

```env
VITE_SUPABASE_URL=https://ahitvfafdnvmkkfvghbe.supabase.co
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
VITE_RAZORPAY_KEY_ID=rzp_test_<your-test-key-id>
```

> **Note**: The Supabase anon key is already in the repo. Replace the Razorpay key with your actual test key from the [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys).

---

## 3. Database Setup

### Run Migrations
Go to **Supabase Dashboard → SQL Editor** and run these files in order:

1. `supabase/schema_update.sql` — Base schema (rider_earnings, fee columns)
2. `supabase/payment_gateway_migration.sql` — Payment tables (payments, rider_payouts)

---

## 4. Deploy Edge Functions

### Install Supabase CLI
```bash
npm install -g supabase
```

### Login & Link
```bash
supabase login
supabase link --project-ref ahitvfafdnvmkkfvghbe
```

### Set Secrets
```bash
supabase secrets set RAZORPAY_KEY_ID=rzp_test_<your-key-id>
supabase secrets set RAZORPAY_KEY_SECRET=rzp_test_<your-key-secret>
```

### Deploy Functions
```bash
supabase functions deploy razorpay-create-order
supabase functions deploy razorpay-verify-payment
supabase functions deploy razorpay-create-payout
```

---

## 5. Run Development Server

```bash
npm run dev
```

App runs at **http://localhost:5173**

---

## 6. Build for Production

```bash
npm run build
```

The production build outputs to `dist/`. Deployed via **Vercel**.

---

## 📱 App URLs

| Panel | URL | Required Role |
|-------|-----|--------------|
| Customer | `/` | Any |
| Admin | `/admin` | `admin` |
| Store | `/store` | `store_staff` or `admin` |
| Delivery | `/delivery` | `delivery_partner` or `admin` |

---

## 💳 Test Payment Credentials

| Method | Details |
|--------|---------|
| Card | `4111 1111 1111 1111`, any future expiry, any 3-digit CVV |
| UPI | `success@razorpay` (auto-succeeds in test mode) |

---

## 🔑 Going Live (After KYC Approval)

1. Replace `rzp_test_*` keys with `rzp_live_*` in `.env` and Supabase secrets
2. Redeploy edge functions
3. No code changes needed
