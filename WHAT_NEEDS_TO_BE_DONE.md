# Zerodha Kite Clone — Project Audit & Action Plan ("What Needs To Be Done")

This document provides a comprehensive breakdown of the current state of the Zerodha Clone repository, including critical bugs, security issues, missing features, and a prioritized roadmap of what needs to be updated and implemented.

---

## Executive Summary & Current Status

The project is structured as a 3-part MERN stack monorepo:
1. **`backend/`**: Express.js, MongoDB (Mongoose), JWT Auth with HTTP-only cookies.
2. **`dashboard/`**: React 18, React Router v6, Chart.js, MUI Icons (Trading interface).
3. **`frontend/`**: React 19, React Router v7, Bootstrap 5 (Landing, marketing & auth pages).

### Overall Assessment
While the visual layout and UI styling of the landing pages and trading dashboard closely resemble Zerodha Kite, several **critical blockers** prevent the application from working properly (such as a non-functional user registration controller, hardcoded CORS restrictions, lack of user-specific data isolation, and missing sell/funds features).

---

## 1. Critical Bugs & High-Priority Fixes (Must Fix First)

### 1.1 Backend: Unimplemented `registerUser` Controller
- **Location**: `backend/controllers/authController.js` (Line 5)
- **Issue**: The `registerUser` function is an empty stub:
  ```javascript
  const registerUser = async (req, res) => { /* ... (Ismein koi change nahi) */ };
  ```
- **Impact**: Any user who fills out the signup form at `/signup` will have their request hang indefinitely until it times out. No user accounts can be created.
- **Fix Needed**: Implement full registration logic:
  - Check if email already exists (`UserModel.findOne({ email })`).
  - Hash password with `bcrypt.hash(password, 10)`.
  - Save user to `UserModel`.
  - Return HTTP 201 with success message.

### 1.2 Backend: CORS Configuration Blocks Local Development
- **Location**: `backend/index.js` (Lines 21–27)
- **Issue**: The CORS origins are strictly hardcoded to production Vercel URLs:
  ```javascript
  app.use(cors({
    origin: [
      'https://zerodha-clone-frontend-pa1.vercel.app',
      'https://zerodha-clone-dashboard-pa1.vercel.app'
    ],
    credentials: true,
  }));
  ```
- **Impact**: When running the app locally on `localhost:3000` or `localhost:3001`, all API requests fail with CORS errors.
- **Fix Needed**: Allow `http://localhost:3000` and `http://localhost:3001` (or read allowed origins from `process.env.ALLOWED_ORIGINS`).

### 1.3 Security: Hardcoded Credentials & Exposed `.env`
- **Locations**:
  - `dashboard/src/data/data.js` (Line 203): Contains plaintext credentials `// user : pa10506 pass : Makwanap@1`.
  - `backend/.env`: Contains live MongoDB Atlas credentials (`pa10506:Makwanap%401`).
  - `.gitignore`: Only ignores `backend/.env`; `dashboard/.env` is tracked and unignored.
- **Fix Needed**:
  - Update `.gitignore` to ignore all `.env` files (`*.env`, `**/.env`).
  - Remove plaintext credentials from `data.js`.
  - Rotate MongoDB credentials in MongoDB Atlas immediately.

### 1.4 Architecture Conflict: Dual Dashboard Implementations
- **Issue**:
  - `frontend/src/dashboard/Dashboard.jsx` and `frontend/src/ProtectedRoute.js` attempt to render an internal dashboard inside the landing page app. They expect `localStorage.getItem("token")` and `Authorization: Bearer <token>` headers.
  - However, the backend issues an **HTTP-only cookie** (`res.cookie('token', ...)`), so `localStorage` has no token.
  - Navigating to `/dashboard` inside `frontend` always redirects to `/login`.
  - Meanwhile, the actual trading dashboard is an entirely separate React application located in `dashboard/`.
- **Fix Needed**:
  - Unify the architecture: remove the orphaned `frontend/src/dashboard/` and `frontend/src/ProtectedRoute.js`, and direct users to `dashboard/` (or merge dashboard into `frontend/` as a single unified SPA).

### 1.5 Missing Sell Functionality in Dashboard
- **Location**: `dashboard/src/components/WatchList.js` & `BuyActionWindow.js`
- **Issue**: There is only a `BuyActionWindow`. Clicking the "Sell" button on watchlist stocks does nothing.
- **Fix Needed**: Create a `SellActionWindow.js` (or a unified `OrderModal.js` with BUY/SELL toggle), and add backend support for processing sell orders.

---

## 2. Backend Pending Work & Recommended Updates

| Component / File | Current Status | What Needs to be Done |
| :--- | :--- | :--- |
| **`controllers/authController.js`** | `registerUser` is blank; no logout or user profile endpoint. | Implement `registerUser`, `logoutUser` (clearing cookie), and `getCurrentUser` (`GET /api/auth/me`). |
| **`middleware/authMiddleware.js`** | Only checks `req.cookies.token`. | Support both `req.cookies.token` and `Authorization: Bearer <token>` header for flexibility. |
| **Multi-Tenancy (`userId`)** | Holdings, Positions, and Orders have NO `userId` field. | Add `userId` to `HoldingsSchema`, `PositionsSchema`, `OrdersSchema`. Ensure queries return only the authenticated user's records. |
| **Order Execution Logic** | `/newOrder` only saves an order record. It does not update holdings or check balances. | When BUY is executed: deduct funds, add or update holdings. When SELL is executed: check existing holdings, deduct holdings, credit funds. |
| **Database Seeding (`seed.js`)** | No seed script exists. A clean database will display empty holdings and positions. | Create a `backend/seed.js` script with initial mock holdings, positions, and watchlist data. |
| **Input Validation** | `express-validator` is installed in `package.json` but not used. | Add validation rules for email format, password minimum length, order quantity (> 0), price (> 0), and order mode (BUY/SELL). |
| **Funds & Wallet API** | No funds endpoints exist. | Implement `GET /funds` and `POST /funds/add` / `POST /funds/withdraw` endpoints linked to the user account. |
| **Watchlist API** | Watchlist data is hardcoded on the client. | Create `GET /watchlist`, `POST /watchlist/add`, and `DELETE /watchlist/:id` endpoints. |
| **Error Handling** | Raw error messages (`res.status(500).json({ message: err.message })`) expose server internals. | Add a centralized Express error handling middleware. |

---

## 3. Dashboard Pending Work & Recommended Updates

| Feature / Component | Current Status | What Needs to be Done |
| :--- | :--- | :--- |
| **Route Protection** | No route protection. Anyone with the URL can access all tabs. | Add an authentication check on mount (`check-auth`). If unauthorized, redirect to login page. |
| **Environment Variables** | API endpoints are hardcoded to `https://zerodha-clone-pa1.onrender.com/...`. | Replace with `process.env.REACT_APP_API_URL` in `Holdings.js`, `Positions.js`, `Orders.js`, `BuyActionWindow.js`. |
| **Portfolio Calculations** | Total investment, current value, and P&L in `Holdings.js` are hardcoded static numbers. | Calculate values dynamically from `allHoldings` (`curValue`, `totalInvestment`, `totalPL`, `plPercentage`). |
| **Watchlist Search** | Search input in `WatchList.js` has no state or filter logic. | Add `searchTerm` state and filter `watchlist.filter(stock => stock.name.toLowerCase().includes(...))`. |
| **Sell Order Modal** | Clicking "Sell" does nothing. | Implement `SellActionWindow.js` and connect to `POST /newOrder` with `mode: 'SELL'`. |
| **Orders Page** | Displays raw order table with no order status or date. | Add status tags (Executed, Pending, Cancelled), order timestamp, and a "Cancel Order" button. |
| **Funds Tab (`Funds.js`)** | 100% hardcoded static text. | Connect to backend funds balance; make "Add funds" and "Withdraw" open functional modals. |
| **Summary Tab (`Summary.js`)** | 100% hardcoded dummy numbers and "Hi, User!". | Fetch user profile and display live portfolio totals and available margin. |
| **Profile Menu (`Menu.js`)** | Static "ZU" avatar; clicking profile does nothing. | Display user's actual initials; add dropdown menu with "My Profile", "Settings", and "Logout" (calling backend logout). |
| **Apps Tab (`Apps.js`)** | Empty placeholder (`<h1>Apps</h1>`). | Build an apps showcase page (Zerodha Universe tools like Smallcase, Sensibull, Streak, etc.). |
| **TopBar Market Tickers** | NIFTY 50 and SENSEX points are hardcoded to `100.2`. | Connect to mock market ticker or live API feed for real-time price updates. |
| **Table HTML Structure** | Tables in `Holdings.js` and `Positions.js` lack `<thead>` and `<tbody>`. | Wrap table headers and rows in proper semantic HTML to eliminate React console warnings. |
| **Navigation Link Fix** | `Menu.js` has `to="funds"` instead of `to="/funds"`. | Add leading slash to ensure correct routing. |

---

## 4. Frontend (Landing Page) Pending Work & Recommended Updates

| Feature / Component | Current Status | What Needs to be Done |
| :--- | :--- | :--- |
| **Navbar Login Link** | `Navbar.js` only has Signup, About, Product, Pricing, Support. | Add a prominent **Login** button in the Navbar. |
| **Call-to-Action Buttons** | "Sign up for Free" buttons in `Hero.js`, `OpenAccount.js`, and `Universe.js` are unclickable. | Wrap buttons in `<Link to="/signup">` or add `onClick` navigation. |
| **Character Encoding Issues** | Currency symbols (`₹`) are corrupted to `,1` or `?"` across multiple files. | Fix encoded text in `OpenAccount.js`, `pricing/Hero.js`, `pricing/Brokerage.js`, `Footer.js`, `signup/Login.js`. |
| **Broken Navigation Links** | Multiple links point to `/` or `*`: <br>- "See Pricing" in `home/Pricing.js` points to `/`<br>- Varsity and TradingQ&A in `Education.js` point to `/`<br>- Social links in `Team.js` have `href="*"` | Update links to proper relative paths (`/pricing`) or external URLs (`https://zerodha.com/varsity`). |
| **Products Page Details** | `Universe.js` has blank descriptions for partner apps; `LeftSection.js` / `RightSection.js` have empty demo and download links. | Fill in descriptions for Smallcase, Sensibull, Streak, Ditto; provide demo links and store badges. |
| **Support Page (`CreateTicket.js`)** | Contains 20+ dead links pointing to `/` and several typos (`sahres`, `Seling`, `Securiries`). | Fix typos; convert into an interactive ticket creation modal/form or expandable accordion. |
| **HTML Attribute Warnings** | `Navbar.js` and `CreateTicket.js` use `class=` instead of `className=`. | Replace all `class=` with `className=`. |
| **Environment Variables** | `Signup.js` and `Login.js` have hardcoded backend URLs. | Use `process.env.REACT_APP_API_URL` and `process.env.REACT_APP_DASHBOARD_URL`. |

---

## 5. DevOps, Architecture & Code Hygiene

1. **Root Monorepo Setup**:
   - Add a root `package.json` with `concurrently` to run backend, frontend, and dashboard with a single command:
     ```json
     "scripts": {
       "start": "concurrently \"npm run start:backend\" \"npm run start:frontend\" \"npm run start:dashboard\"",
       "start:backend": "cd backend && npm start",
       "start:frontend": "cd frontend && npm start",
       "start:dashboard": "cd dashboard && npm start"
     }
     ```
2. **Standardize Dependencies**:
   - `frontend` uses React 19 and React Router v7.
   - `dashboard` uses React 18 and React Router v6.
   - Align dependencies to avoid inconsistencies across the monorepo.
3. **Automated Testing**:
   - Add backend API integration tests using `supertest` and `jest` (testing auth, holdings, order placement).
   - Add React testing library tests for core components.
4. **Clean UTF-8 `README.md`**:
   - Re-encode `README.md` in standard UTF-8 (currently UTF-16LE with broken characters).
   - Document environment setup, local development steps, and API endpoint documentation.

---

## 6. Implementation Status & Progress Tracker

```
[Phase 1: Urgent Blockers] - COMPLETED ✅
   ├── [x] Implement registerUser in backend/controllers/authController.js
   ├── [x] Implement logoutUser and getCurrentUser in backend
   ├── [x] Fix CORS in backend/index.js (allow localhost 3000/3001/3002 + dynamic origins)
   ├── [x] Fix character encoding (₹ symbol corrupted to ,1 / ?" across all files)
   ├── [x] Remove leaked credentials from dashboard/src/data/data.js
   └── [x] Update .gitignore to ignore all .env files across all directories

[Phase 2: Core Trading & Dashboard Completeness] - COMPLETED ✅
   ├── [x] Implement Sell capability in BuyActionWindow (toggle BUY/SELL mode)
   ├── [x] Wire up "Sell" buttons in WatchList.js to open Sell window
   ├── [x] Update backend /newOrder to execute both BUY and SELL (updating holdings)
   ├── [x] Calculate dynamic portfolio values in Holdings.js & Summary.js (Total Inv, Current Val, P&L)
   ├── [x] Add profile dropdown with Logout functionality in Menu.js
   ├── [x] Implement WatchList live search filter
   ├── [x] Add interactive UPI funds deposit/withdraw simulator in Funds.js
   ├── [x] Build rich Apps ecosystem showcase in Apps.js
   ├── [x] Add semantic <thead> and <tbody> to Holdings.js and Positions.js tables
   ├── [x] Add "Buy" and "Sell" quick actions on each holding row in Holdings.js
   ├── [x] Add session verification check on Dashboard mount in Home.js
   ├── [x] Update TopBar with authentic NIFTY 50 and SENSEX market levels
   └── [x] Create database seed script (backend/seed.js)

[Phase 3: Landing Page & UX Polish] - COMPLETED ✅
   ├── [x] Add Login link to Navbar.js (with dynamic user greeting / logout when logged in)
   ├── [x] Connect all CTA buttons ("Sign up for Free") to /signup
   ├── [x] Fix broken links and typos across Products, Pricing, Support, About, and Home pages
   ├── [x] Replace class= with className= across JSX files
   ├── [x] Support dual auth: HTTP-only cookies + Authorization: Bearer <token> fallback
   ├── [x] Redirect /dashboard in frontend to the Kite Trading Dashboard app
   ├── [x] Add root package.json for monorepo script management
   ├── [x] Update HTML page titles in public/index.html
   └── [x] Re-encode README.md to clean UTF-8 with full setup instructions

[Phase 4: Advanced Features & Multi-Tenancy] - COMPLETED ✅
   ├── [x] Associate Holdings, Positions, and Orders with user IDs (multi-tenancy)
   ├── [x] Automatic portfolio cloning for newly registered users on first login
   ├── [x] Replace static WatchList with database-backed user watchlist (GET, POST, DELETE)
   ├── [x] Real-time simulated price ticks in WatchList
   ├── [x] Link user wallet funds to Orders (balance deduction on Buy, credit on Sell)
   ├── [x] Connected Funds and Summary components to backend /funds endpoint
   ├── [x] Automated Integration Test Suite in backend/test/
   ├── [x] Clean zero-warning Production Builds for Dashboard and Frontend
   └── [x] Root monorepo scripts for install, start, build, and test

[Phase 5: Cloud Deployment & Resilience Architecture] - COMPLETED ✅
   ├── [x] Resilient in-memory fallback store (backend/utils/memoryStore.js) for zero-downtime availability
   ├── [x] Instant port binding on Render (uncoupled app.listen from database connection status)
   ├── [x] Express /health and / status endpoints returning uptime and database mode
   ├── [x] Render blueprint specification (render.yaml) for automated container builds
   ├── [x] Root package.json scripts for automatic backend installation on Render
   ├── [x] Vercel SPA client-side route rewrites (vercel.json) verified for both Frontend and Dashboard
   └── [x] Pre-seeded demo trader credentials (pa10506@zerodha.com / Makwanap@1)

[Phase 6: Modern UI Overhaul, 10s Notification Cards & Portfolio Charts] - COMPLETED ✅
   ├── [x] Built modern floating 10-second notification cards (Toast.js & Toast.css) with animated progress bar
   ├── [x] Replaced all browser window.alert() and window.confirm() popups with non-blocking toasts
   ├── [x] Redesigned Buy/Sell window with authentic Zerodha Kite colors: Vibrant Blue (#387ed1) & Coral Red (#df514c)
   ├── [x] Added +/- stepper quantity controls, CNC/MIS product pills, and Market/Limit order type pills
   ├── [x] Live dynamic margin required vs available margin status bar with insufficient funds warnings
   ├── [x] Added interactive Portfolio Allocation Doughnut Chart to Summary.js with percentage tooltips
   ├── [x] Added stock-by-stock Profit & Loss Bar Chart to Summary.js (emerald green for profit, coral red for loss)
   ├── [x] Replaced generic "Hi, User!" with dynamic user profile greeting and account ID badge
   ├── [x] Replaced squeezed sidebar chart with authentic Zerodha Kite watchlist pagination footer (1-7)
   └── [x] Replaced browser alert() in Frontend Login and Signup with sleek inline feedback banners

[Phase 7: Account Profile & Funds High-Contrast Overhaul] - COMPLETED ✅
   ├── [x] Overhauled Account Menu (Menu.js) with dynamic initials (PM), Client ID (PA10506), and cash margin pill
   ├── [x] Built rich Kite Profile Dropdown with user avatar, email, profile navigation, and logout
   ├── [x] Completely redesigned Funds page (Funds.js) eliminating all washed-out/faded low-contrast text
   ├── [x] High-contrast Equity card with 2rem available margin callout, NSE/BSE active badge, and breakdown grid
   ├── [x] Commodity Segment card with MCX trading status and segment manager
   ├── [x] Interactive UPI Deposit Modal with quick amount chips (+₹1k, +₹5k, +₹10k, +₹25k) and 10s toast notification
   ├── [x] Interactive Withdrawal Modal replacing browser prompt() with bank destination (HDFC Bank ****1981)
   ├── [x] Fixed search input color bug in index.css (was white-on-white text) to crisp dark slate (#0f172a)
   ├── [x] Harmonized TopBar NIFTY 50 and SENSEX green indices and percentage levels
   └── [x] Rebuilt production bundles with zero ESLint warnings and zero errors

[Phase 8: Session-Aware Navigation & One-Click Demo Access] - COMPLETED ✅
   ├── [x] Fixed Navbar item wrapping (eliminated 3-line wrapping of 'Go to Dashboard' and 'Hi, Demo Trader')
   ├── [x] Constrained brand logo width to 135px and removed wrapping <form> inside navbar-collapse
   ├── [x] Built session-aware Login page: detects active session and shows 'Go to Dashboard' card instead of blank form
   ├── [x] Added 'Switch Account' option allowing users to easily re-authenticate as another user
   ├── [x] Built session-aware Signup page displaying current logged-in status
   ├── [x] Added One-Click Demo Access panel on Login: 1-click buttons for Demo Trader and Pavan Makwana
   ├── [x] Guaranteed demo credentials reliability: backend auto-seeds demo accounts if connecting to fresh database
   └── [x] Shared explicit demo credentials for instant evaluation (demo@zerodha.com / demo1234, pa10506@zerodha.com / Makwanap@1)
```
