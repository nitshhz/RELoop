# ReLoop — Peer-to-Peer Resale Marketplace

> **Tagline:** Buy smarter. Sell easier. Waste less.  
> **Status:** Full-Stack MVP (Production-Minded, Real PostgreSQL Schema, Real Authentication, Hosted AI Integration, PWA).

---

## 1. Product Overview

**ReLoop** is a general-purpose secondhand marketplace designed for practical circular commerce. It brings the familiar discovery and selling experience of OLX, enhanced with modern capabilities:

- **Hosted AI Listing Creator:** Sellers enter raw product notes or rough bullet points, and hosted Google Gemini AI generates a structured, compelling title, readable description, recommended category, tags, and missing-field advisories.
- **Built-in Offers & Counteroffers:** Eliminates endless friction. Buyers propose formal offers, sellers can counter with one click, and database transactions prevent conflicting double-sales.
- **Saved Searches & Price-Drop Alerts:** In-app notifications are automatically triggered whenever a seller reduces the price on a saved listing.
- **Seller Analytics Dashboard:** Real database aggregations for active/pending/sold listings, views, saves, and completeness guidance.
- **Buyer-Seller Messaging:** Persistent listing-linked conversations with unread counters, quick reply chips, and block controls.
- **Installable PWA:** Standalone web app manifest, custom icons, service worker with offline fallback page, and strict privacy cache boundaries.
- **Admin Moderation Control Hub:** Functional `/admin` panel protected by role-based authorization for approving pending submissions, resolving reports, managing user suspensions, and viewing immutable audit trails.

---

## 2. Technology Stack (Pure JavaScript)

- **Frontend:**
  - React 18 & Vite
  - JavaScript & JSX (No TypeScript)
  - React Router v6
  - Tailwind CSS with custom Claymorphic utility components
  - Lucide React icons
  - Manrope typography (Google Fonts)
  - React Hook Form & Zod
  - TanStack Query
- **Backend:**
  - Node.js & Express.js (ES modules: `"type": "module"`)
  - RESTful architecture with centralized error handling
  - Request validation via Zod
  - Server-side authorization & authentication (bcryptjs, JWT, HTTP-only cookies)
  - Sensitive endpoint rate limiting (`express-rate-limit`)
  - Helmet security headers & CORS origin isolation
- **Database:**
  - PostgreSQL (Neon Free Tier ready)
  - Prisma ORM with versioned SQL migrations (`prisma/migrations/20261014000000_init/migration.sql`)
  - Repeatable seed script (`prisma/seed.js`)
- **Hosted AI:**
  - Google Gemini API (`gemini-2.5-flash`)
  - Backend-only execution with rate limiting, timeouts, schema validation, and intelligent rule-based fallback
- **File Storage:**
  - Dual-mode: Cloudinary free tier or local static directory (`server/uploads/`)
- **PWA:**
  - Manifest (`manifest.json`), Service Worker (`sw.js`), and Claymorphic Offline Fallback (`offline.html`)

---

## 3. Design System & Visual Identity

ReLoop features a restrained claymorphism aesthetic with soft tactile shadows and rounded cards:

| Token | Hex | Role |
|---|---|---|
| **Main Background** | `#F7F5F0` | Warm primary canvas |
| **Secondary Background** | `#EFEEE8` | Subtle card & track contrast |
| **Primary Text** | `#20251F` | High-contrast readable typography |
| **Muted Text** | `#74786F` | Secondary labels & timestamps |
| **Primary Green** | `#356B50` | Primary action buttons & positive states |
| **Green Hover** | `#28523D` | Interactive hover depth |
| **Soft Green Surface** | `#DCE9DD` | Badges, tags, and highlights |
| **Terracotta Accent** | `#D98169` | Deals, discounts, and notifications |
| **Border Subtle** | `#E2E0D8` | Crisp tactile dividers |
| **White** | `#FFFFFF` | Clay cards and surfaces |

Tested and responsive across all target breakpoints: **360px, 390px, 430px, 768px, 1024px, 1440px, 1920px**.

---

## 4. Project Structure

```
ReLoop/
├── client/                     # React + Vite Frontend
│   ├── index.html              # HTML shell with Manrope & PWA meta
│   ├── vite.config.js          # Vite config with /api proxy
│   ├── tailwind.config.js      # Custom claymorphic theme & palette
│   ├── public/
│   │   ├── manifest.json       # PWA manifest
│   │   ├── sw.js               # Service worker with private cache guards
│   │   ├── offline.html        # Offline fallback page
│   │   ├── icon-192.png        # PWA app icon
│   │   └── icon-512.png        # High-res PWA icon
│   └── src/
│       ├── components/
│       │   ├── ui/             # Button, Input, Modal, Badge, CompletenessMeter
│       │   ├── layout/         # Navbar, Footer, MobileNav
│       │   └── marketplace/    # ListingCard, CategoryPills, MakeOfferModal, ShareModal, ReportModal
│       ├── context/            # AuthContext, NotificationContext
│       ├── lib/                # api.js client
│       └── pages/
│           ├── HomePage.jsx
│           ├── BrowsePage.jsx
│           ├── ListingDetailPage.jsx
│           ├── CreateListingPage.jsx
│           ├── EditListingPage.jsx
│           ├── AiListingCreatorPage.jsx
│           ├── SellerDashboardPage.jsx
│           ├── OffersPage.jsx
│           ├── MessagesPage.jsx
│           ├── SavedListingsPage.jsx
│           ├── NotificationsPage.jsx
│           ├── ProfilePage.jsx
│           ├── UserPublicProfilePage.jsx
│           ├── LoginPage.jsx
│           ├── RegisterPage.jsx
│           ├── admin/          # Moderation, Users, Reports, AuditLogs
│           └── static/         # About, Safety, Prohibited, Terms, Privacy
├── server/                     # Express.js Backend API
│   ├── prisma/
│   │   ├── schema.prisma       # PostgreSQL schema
│   │   ├── migrations/         # Versioned PostgreSQL migrations
│   │   └── seed.js             # Demo data seed script
│   ├── src/
│   │   ├── config/             # env.js, prisma.js, cloudinary.js
│   │   ├── middleware/         # auth.js, role.js, validate.js, rateLimiter.js, upload.js, errorHandler.js
│   │   ├── controllers/        # auth, listing, offer, chat, notification, ai, admin, etc.
│   │   ├── services/           # auth, listing, offer, chat, gemini, price, audit, analytics
│   │   ├── routes/             # REST route modules
│   │   ├── validators/         # Zod schemas & completeness calculator
│   │   └── app.js              # Express app assembly
│   ├── tests/
│   │   └── businessRules.test.js # 18 automated rule & security tests
│   └── uploads/                # Local development image storage
├── .env.example                # Documented configuration template
├── package.json                # Workspace orchestration
└── README.md
```

---

## 5. Getting Started (Local Setup)

### Prerequisites
- Node.js `>= 18.0.0`
- npm `>= 9.0.0`

### 1. Install Dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables
Create `server/.env` based on `.env.example`:
```bash
cp .env.example server/.env
```

Key variables in `server/.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# PostgreSQL / Neon Database URL
DATABASE_URL=postgresql://user:password@ep-example.neon.tech/reloop?sslmode=require

# JWT Secret
JWT_SECRET=super-secret-jwt-key-min-32-chars-replace-in-production
JWT_EXPIRES_IN=7d

# File Storage (local or cloudinary)
STORAGE_TYPE=local

# Hosted Google Gemini Free Tier API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Initial Admin
ADMIN_INITIAL_EMAIL=admin@reloop.dev
ADMIN_INITIAL_PASSWORD=Admin@ReLoop2026!
```

*(Note: If `GEMINI_API_KEY` is not provided, ReLoop automatically and seamlessly uses an intelligent rule-based listing generator so you are never blocked).*

### 3. Generate Prisma Client & Run Migrations
```bash
cd server
npm run prisma:generate

# Apply migrations to your PostgreSQL/Neon database:
npm run prisma:push
# or
npm run prisma:migrate
```

### 4. Seed Demo Data
```bash
cd server
npm run seed
```

This seeds 4 accounts, 9 categories, realistic listings, active offers, conversations, price-drop histories, and moderation reports.

### 5. Start the Development Servers
From the root directory:
```bash
npm run dev
```
Or individually:
```bash
# Terminal 1: Backend API (port 5000)
cd server && npm run dev

# Terminal 2: Frontend Client (port 5173)
cd client && npm run dev
```

Open **`http://localhost:5173`** in your browser.

---

## 6. Demo Accounts & Credentials

| Role | Email | Password | Primary Purpose |
|---|---|---|---|
| **Admin** | `admin@reloop.dev` | `Admin@ReLoop2026!` | Access `/admin` moderation queue, user management, and audit logs |
| **Seller** | `seller@reloop.dev` | `Password123!` | Manages active listings, views analytics, responds to incoming offers |
| **Buyer 1** | `buyer1@reloop.dev` | `Password123!` | Submits offers, saves items, chats with seller |
| **Buyer 2** | `buyer2@reloop.dev` | `Password123!` | Second prospective buyer for multi-offer concurrency demos |

---

## 7. Multi-User Verification Flow (3+ Accounts)

To demonstrate the full circular lifecycle:

1. **Step 1 (Seller):** Log in as `seller@reloop.dev`. Navigate to **AI Listing Creator** (`/ai-creator`). Enter item notes: *"MacBook Air M2, Space Gray, mint condition, 8GB RAM 256GB SSD, original charger and box"*. Click **Generate Listing with AI**. Review the structured title, tags, and description. Set price to `₹72,000` and submit for review.
2. **Step 2 (Admin):** Log in as `admin@reloop.dev` in an incognito window. Visit `/admin/moderation`. View the submitted listing and click **Approve Listing**. The listing instantly transitions to `ACTIVE` and creates a permanent security audit record.
3. **Step 3 (Buyer 1):** Log in as `buyer1@reloop.dev`. Open the listing from `/browse`. Click **Make an Offer** and propose `₹68,000`. Open **Chat with Seller** and send a quick message: *"Is this still available?"*.
4. **Step 4 (Buyer 2):** Log in as `buyer2@reloop.dev`. View the same listing and submit a competing offer of `₹70,000`.
5. **Step 5 (Seller Response & Concurrency Guard):** Return to the seller account at `/offers`. Counter Buyer 1 with `₹69,500` and accept Buyer 2's `₹70,000` offer. 
   - A database transaction marks the listing as `RESERVED`, marks Buyer 2's offer as `ACCEPTED`, and automatically declines competing pending offers to prevent duplicate sales.
   - Both buyers receive real in-app notifications.
6. **Step 6 (Price Drop):** Edit an active listing and lower its price. Any user who clicked the heart to bookmark the listing receives an automatic in-app notification alerting them of the deal.

---

## 8. Automated Tests & Build Results

### Running Automated Business Rule Tests
```bash
cd server
npm test
```

### Verified Test Suite (18/18 Passing):
```
 ✓ tests/businessRules.test.js (18 tests)
   ✓ 1. An unauthenticated user cannot create a listing
   ✓ 2. A regular user cannot access admin endpoints
   ✓ 3. A user cannot edit or delete another user's listing
   ✓ 4. Pending or rejected listings are not publicly visible
   ✓ 5. A user cannot make an offer on their own listing
   ✓ 6. A user cannot submit invalid prices
   ✓ 7. Offers cannot be accepted after becoming invalid or expired
   ✓ 8. Concurrent offer acceptance does not sell the same listing twice
   ✓ 9. A user cannot read another user's private conversations
   ✓ 10. A user cannot modify another user's saved items
   ✓ 11. An unauthorized user cannot access private notifications
   ✓ 12. Suspended accounts cannot perform prohibited actions
   ✓ 13. Invalid image uploads are rejected
   ✓ 14. AI quota exhaustion produces a usable fallback
   ✓ 15. AI-generated content is validated before being used
   ✓ 16. Admin actions create audit records
   ✓ 17. The PWA has a valid manifest and working offline fallback
   ✓ 18. Public caching never exposes private user data
```

### Production Build Verification
```bash
cd client
npm run build
```
- Output: Zero build or JSX errors. Generates optimized standalone bundle in `client/dist/`.

---

## 9. ₹0 Free-Tier Deployment Guide

ReLoop is engineered to run at **₹0 in mandatory hosting costs**:

1. **Database (Neon Free Tier):**
   - Create a free project at [neon.tech](https://neon.tech).
   - Copy the PostgreSQL connection string into `DATABASE_URL`.
   - Run `npm run prisma:push` and `npm run seed`.
2. **Backend (Render / Railway Free Tier):**
   - Connect the repository on Render or Railway.
   - Root directory: `server`.
   - Build command: `npm install && npx prisma generate`.
   - Start command: `node src/index.js`.
   - Add environment variables (`DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL`, etc.).
3. **Frontend (Vercel Free Tier):**
   - Import the repository on [vercel.com](https://vercel.com).
   - Root directory: `client`.
   - Framework preset: Vite.
   - Build command: `npm run build`.
   - Output directory: `dist`.
   - Set `VITE_API_URL` to your deployed backend URL.
4. **Image Storage (Cloudinary Free Tier):**
   - Sign up at [cloudinary.com](https://cloudinary.com) and add credentials to backend env variables. Or use the built-in local disk fallback.
5. **Hosted AI (Google Gemini Free Tier):**
   - Generate a free API key at [ai.google.dev](https://ai.google.dev) and set `GEMINI_API_KEY` on your backend.

---

## 10. License

Released under the MIT License. Developed for sustainable, circular secondhand trade.
