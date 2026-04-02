# 🛒 Go-to-Mart

**Fast, Fresh, Everyday Essentials** — A full-stack grocery delivery platform built with React + Supabase.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 7, React Router v7 |
| **Styling** | Tailwind CSS 4, Custom CSS |
| **Backend** | Supabase (PostgreSQL, Auth, Realtime, Edge Functions) |
| **Payments** | Razorpay (Checkout + Payouts) |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Maps** | Google Maps API |
| **AI** | Google Generative AI (Gemini) |
| **Hosting** | Vercel |

---

## 📱 Features

### Customer App
- **Browse & Search** — Categories, product search with instant results
- **Product Detail** — Full product view with pricing, MRP comparison
- **Cart & Checkout** — Add items, manage quantities, delivery address management
- **Online Payments** — Razorpay Checkout (UPI, Cards, Netbanking, Wallets)
- **Cash on Delivery** — Traditional COD option
- **Order Tracking** — Real-time status updates via Supabase Realtime
- **Profile Management** — Edit profile, manage saved addresses
- **Support** — AI-powered customer support

### Delivery Partner App (`/delivery`)
- **Active Deliveries** — Accept, pick up, and deliver orders
- **Earnings Dashboard** — Track delivery fees + tips earned
- **Cash Out** — Withdraw earnings via UPI or Bank Transfer
- **Payout History** — View past withdrawal requests and status
- **Navigation** — Google Maps integration for delivery routes

### Store Staff App (`/store`)
- **Order Management** — View and process incoming orders
- **Inventory Management** — Track and update product stock

### Admin Panel (`/admin`)
- **Dashboard** — Overview of orders, revenue, and activity
- **Order Management** — Update status, assign riders, view payment details
- **Product Management** — Add, edit, and manage product catalog
- **Category Management** — Organize product categories
- **Rider Management** — Appoint riders, track earnings and payouts
- **User Management** — View and manage customer accounts
- **Support Management** — Handle customer queries

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────┐
│                  React Frontend                   │
│  (Customer / Delivery / Store / Admin)            │
├──────────────────────────────────────────────────┤
│              Supabase Client SDK                  │
├──────────────────────────────────────────────────┤
│            Supabase Edge Functions                │
│  ┌──────────────┐  ┌───────────────┐             │
│  │ razorpay-    │  │ razorpay-     │             │
│  │ create-order │  │ verify-payment│             │
│  └──────────────┘  └───────────────┘             │
│  ┌──────────────────┐                            │
│  │ razorpay-create- │                            │
│  │ payout           │                            │
│  └──────────────────┘                            │
├──────────────────────────────────────────────────┤
│   Supabase (PostgreSQL + Auth + Realtime + RLS)  │
├──────────────────────────────────────────────────┤
│              Razorpay Payment API                 │
└──────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
go-to-mart/
├── public/                    # Static assets
├── src/
│   ├── components/            # Shared UI components
│   ├── context/               # React Context (Auth, Cart)
│   ├── hooks/                 # Custom hooks
│   ├── lib/
│   │   ├── supabase.js        # Supabase client
│   │   └── razorpay.js        # Razorpay helper functions
│   ├── pages/
│   │   ├── admin/             # Admin panel pages
│   │   ├── delivery/          # Delivery partner pages
│   │   ├── store/             # Store staff pages
│   │   ├── CartPage.jsx       # Cart + Checkout
│   │   ├── HomePage.jsx       # Product browsing
│   │   ├── OrdersPage.jsx     # Order history + tracking
│   │   └── ...
│   ├── App.jsx                # Routes + Layout
│   └── main.jsx               # Entry point
├── supabase/
│   ├── functions/             # Edge Functions (Deno)
│   │   ├── razorpay-create-order/
│   │   ├── razorpay-verify-payment/
│   │   └── razorpay-create-payout/
│   ├── payment_gateway_migration.sql
│   └── schema_update.sql
├── .env                       # Environment variables
├── SETUP.md                   # Setup guide
└── package.json
```

---

## ⚡ Quick Start

```bash
# Clone the repository
git clone <your-repo-url>
cd go-to-mart

# Install dependencies
npm install

# Set up environment variables
# Edit .env with your Supabase and Razorpay keys

# Run development server
npm run dev
```

For full setup instructions including database migration and edge function deployment, see **[SETUP.md](./SETUP.md)**.

---

## 💳 Payment Integration

### Customer Payments (Razorpay Checkout)
- UPI, Credit/Debit Cards, Netbanking, Wallets
- Server-side payment verification via HMAC-SHA256
- Real-time order status updates on successful payment

### Rider Payouts
- Riders can cash out earnings via UPI or Bank Transfer
- Payout requests visible to admin for processing
- RazorpayX integration ready (activate when available)

### Test Mode
Use Razorpay test credentials for development:
- **Test Card**: `4111 1111 1111 1111` (any future expiry, any CVV)
- **Test UPI**: `success@razorpay`

---

## 🔐 Security

- **Row-Level Security (RLS)** on all database tables
- **JWT Authentication** via Supabase Auth
- **Server-side payment verification** — Razorpay key_secret never exposed to browser
- **Edge Functions** handle all sensitive API calls
- **Role-based access control** — Customer, Store Staff, Delivery Partner, Admin

---

## 📄 License

Private project. All rights reserved.
