# 🛒 Go To Mart — Premium Hyper-Local Delivery Platform

[![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Glassmorphism](https://img.shields.io/badge/UI-Glassmorphism-blueviolet?style=for-the-badge)](https://en.wikipedia.org/wiki/Glassmorphism)

Go To Mart is a state-of-the-art, multi-role hyper-local delivery ecosystem. Built with a focus on **visual excellence** and **operational efficiency**, it seamlessly connects Customers, Dark Store Staff, and Delivery Partners.

---

## 🚀 Key Features

<details>
<summary><b>✨ Aesthetic Excellence</b></summary>
- **Glassmorphism UI**: High-end translucent surfaces with backdrop blurring.
- **Dynamic Dark Mode**: Signature brand-accurate deep blues and neon accents.
- **Premium Typography**: High-contrast pairing of Playfair Display and system sans-serif.
- **Micro-Animations**: Buttery smooth transitions powered by Framer Motion.
</details>

<details>
<summary><b>💰 Advanced Pricing Engine (India Standard)</b></summary>
- **5% GST Calculation**: Automatic tax calculation on every checkout.
- **₹15 Platform Fee**: Standard flat fee for operational sustainability.
- **Dynamic Delivery Fees**: Distance-based logic (₹30 for <3km, +₹5/km thereafter).
- **Interactive Tipping**: In-cart selection for delivery partner support.
</details>

<details>
<summary><b>📦 Multi-Role Dashboard Management</b></summary>
- **Customer View**: Seamless browsing, cart persistence, and real-time tracking.
- **Store Staff (Dark Store)**: Order fulfillment status tracking (Placed ➡️ Packing ➡️ Ready).
- **Rider Portal**: Dedicated task list, delivery navigation, and an **Earnings Ledger**.
- **Admin Center**: Full control over products, pricing, roles, and global stats.
</details>

---

## 🔐 Role-Based Access

The application dynamically renders interfaces based on the logged-in user's role.

| Role | Access URL | Purpose |
| :--- | :--- | :--- |
| **Customer** | `/` | Browse products and place orders. |
| **Admin** | `/admin` | Manage inventory and user roles. |
| **Store Staff** | `/store` | Mark orders as packed and ready. |
| **Rider** | `/delivery` | Confirm pickups and mark as delivered. |

> [!IMPORTANT]
> To test specialized roles, use the test numbers provided in the internal documentation or assign roles via the Admin Dashboard.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Framer Motion, Lucide Icons.
- **Backend-as-a-Service**: Supabase (Auth, Postgres, Realtime, Storage).
- **Styling**: Vanilla CSS with a centralized Design System.
- **Deployment**: Vercel (CI/CD).

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- Supabase Account

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/1233-check/go-to-mart.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Setup Environment Variables:
   Create a `.env.local` file:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Run locally:
   ```bash
   npm run dev
   ```

---

## 📂 Project Structure

```text
├── src/
│   ├── components/  # Reusable UI elements
│   ├── contexts/    # Global State (Cart, Auth)
│   ├── layouts/     # Role-based wrappers
│   ├── pages/       # Core app views
│   ├── lib/         # API & Supabase config
│   └── index.css    # Centralized Design System
├── public/          # Static assets & 3D models
└── supabase/        # Database migrations & SQL
```

---

*Made with ❤️ by the Go To Mart Team*
