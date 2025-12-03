You are an expert full-stack engineer, DevOps engineer, and UI/UX designer.

🎯 GOAL  
Build a modern, production-ready **gamer streaming web app** with:

- Previous streams
- Best moments (highlight clips)
- Tournaments and events + ticket prices
- User accounts: signup with **email** and **email verification**
- **Telegram verification** required to participate in events/tournaments
- Gamified **points & tickets** system:
  - Daily login rewards
  - Code redemption rewards
  - Fortune wheel (spin once per day) awarding points
- **Market** system:
  - Users spend points on **digital products only** (e.g., discount codes, digital keys, vouchers)
- Clean dashboard layout with sidebar + top bar + card-based main content
- Deployed on a single Ubuntu server with Nginx and systemd services

---

## TECH STACK (FIXED)

**Frontend**
- React + TypeScript
- Vite build
- Tailwind CSS
- lucide-react for icons
- Static bundle built by Vite and served via Nginx from `/var/www/<app-name>` (or similar)

**Backend**
- Node.js (LTS)
- Express 5
- PostgreSQL for main data + any persistent logs/stores
- `pg` for DB access (no ORM)
- `multer` for file uploads (for future restore/import if needed)
- `axios` for internal/external HTTP calls
- **JWT cookie auth**:
  - HttpOnly cookies for access & refresh tokens
  - Cookie settings secure enough for production (SameSite, Secure, etc.)

**Workers / Ingester Service**
- Separate Node.js process for background tasks using `pg` & `axios`

**Infra**
- Ubuntu
- Nginx:
  - Serves frontend
  - Proxies `/api/*` to backend
  - Handles SSL via **ZeroSSL** certs
- `systemd` services for:
  - Backend API
  - Worker / ingester
- `rsync`-based deploy scripts

---

## DOMAIN & DATA MODEL

Extend the schema to support email verification, Telegram verification, the market, and the fortune wheel.

### Core Entities

1. **User**
   - `id` (UUID)
   - `email` (unique)
   - `email_verified` (bool, default `false`)
   - `username`
   - `password_hash`
   - `avatar_url` (nullable)
   - **Verification flags**
     - `telegram_verified` (bool, default `false`)
   - **Gamification**
     - `points` (int, default 0)
     - `tickets` (int, default 0)
   - `last_daily_login_at` (timestamp, nullable)
   - `last_fortune_spin_at` (timestamp, nullable)
   - `created_at`, `updated_at`

2. **EmailVerificationToken**
   - `id` (UUID)
   - `user_id` (FK → User)
   - `token` (string, unique)
   - `expires_at` (timestamp)
   - `used_at` (timestamp, nullable)

3. **TelegramLink**
   - `id` (UUID)
   - `user_id` (FK → User)
   - `telegram_user_id` (string, unique per Telegram account)
   - `telegram_username` (nullable)
   - `link_token` (string, unique) – one-time token used to connect web user ↔ Telegram user
   - `created_at`, `linked_at`, `updated_at`

4. **Stream**
   - `id` (UUID)
   - `title`
   - `description`
   - `streamer_name`
   - `thumbnail_url`
   - `video_url` or `embed_url`
   - `game`
   - `started_at`, `ended_at`
   - `is_live` (bool, default false)
   - `views` (int, default 0)
   - `created_at`, `updated_at`

5. **Highlight / BestMoment**
   - `id` (UUID)
   - `stream_id` (FK → Stream)
   - `title`
   - `description`
   - `timestamp_in_stream` (int seconds, nullable)
   - `thumbnail_url`
   - `video_url`
   - `views` (int, default 0)
   - `likes` (int, default 0)
   - `created_at`, `updated_at`

6. **Tournament / Event**
   - `id` (UUID)
   - `name`
   - `description`
   - `game`
   - `start_date`, `end_date`
   - `prize_pool` (numeric)
   - `status` (enum: `upcoming`, `ongoing`, `finished`)
   - `banner_image_url`
   - `created_at`, `updated_at`

7. **TicketOffer**
   - `id` (UUID)
   - `tournament_id` (nullable FK → Tournament; null = generic offer)
   - `name` (e.g. “General Admission”, “VIP”)
   - `price_points` (int, optional)
   - `price_tickets` (int, optional)
   - `quantity_available` (int, nullable; null = unlimited)
   - `created_at`, `updated_at`

8. **CodeReward**
   - `id` (UUID)
   - `code` (string, unique)
   - `description`
   - `points_reward` (int, default 0)
   - `tickets_reward` (int, default 0)
   - `max_uses_per_user` (int, default 1)
   - `global_max_uses` (int, nullable)
   - `used_count` (int, default 0)
   - `valid_from`, `valid_until` (timestamps, nullable)
   - `is_active` (bool, default true)
   - `created_at`, `updated_at`

9. **UserCodeRedemption**
   - `id` (UUID)
   - `user_id` (FK → User)
   - `code_reward_id` (FK → CodeReward)
   - `redeemed_at` (timestamp)

### Market / Digital Products

10. **MarketItem**
    - `id` (UUID)
    - `name`
    - `description`
    - `image_url` (nullable)
    - `price_points` (int) – points cost to purchase
    - `stock_quantity` (int, nullable; null = unlimited)
    - `is_active` (bool, default true)
    - `created_at`, `updated_at`

11. **MarketItemGrant**
    - What the user receives, typically a digital code:
    - `id` (UUID)
    - `market_item_id` (FK → MarketItem)
    - `code` (string) – e.g., discount code, digital token
    - `is_redeemed` (bool, default false)
    - `redeemed_by_user_id` (FK → User, nullable)
    - `redeemed_at` (timestamp, nullable)

12. **UserMarketPurchase**
    - `id` (UUID)
    - `user_id` (FK → User)
    - `market_item_id` (FK → MarketItem)
    - `market_item_grant_id` (FK → MarketItemGrant)
    - `points_spent` (int)
    - `created_at`

### Fortune Wheel

13. **FortunePrizeTier**
    - `id` (UUID)
    - `name` (e.g. “Small Win”, “Big Win”)
    - `points_reward` (int)
    - `weight` (int) – used for random selection probabilities
    - `is_active` (bool)
    - `created_at`, `updated_at`

14. **FortuneSpin**
    - `id` (UUID)
    - `user_id` (FK → User)
    - `prize_tier_id` (FK → FortunePrizeTier)
    - `points_awarded` (int)
    - `spun_at` (timestamp)

Add indexes where appropriate (e.g., on `EmailVerificationToken.token`, `CodeReward.code`, `TelegramLink.telegram_user_id`, `UserMarketPurchase.user_id`).

---

## AUTH, EMAIL & TELEGRAM VERIFICATION

### Email Signup & Verification

- **Signup**
  - `POST /api/auth/signup`
  - Inputs: `email`, `username`, `password`
  - Behavior:
    - Create user with `email_verified = false`
    - Create `EmailVerificationToken` with expiration
    - Send email (mock: log to console + API stub) with verification link:
      - e.g., `https://<frontend>/verify-email?token=<token>`
    - Issue JWT cookies optionally, but user is treated as `email_verified = false` until they verify.

- **Verify Email**
  - `GET /api/auth/verify-email?token=...` (or `POST`)
  - Validate token:
    - Not expired
    - Not used
  - Mark user `email_verified = true`
  - Set `EmailVerificationToken.used_at`
  - Redirect to frontend (e.g., login page or dashboard) with success state

- **Login**
  - `POST /api/auth/login`
  - Check credentials and issue JWT cookies.
  - Frontend:
    - If `email_verified = false`, show a banner/notice urging them to verify email.
- **Access Levels**
  - Non-logged-in users: can view some public parts (some streams/tournaments list).
  - Logged-in but `email_verified = false`: can access dashboard but certain actions may be limited if you choose.
  - Email verification is **required to “fully” use the account**, but they should still be able to browse the site once they at least sign up and verify email.

### Telegram Verification (for Events Participation)

- Users must verify **Telegram** to **participate in events/tournaments** (e.g. redeem event tickets or join).
- Use a Telegram bot created via **BotFather**.

**Flow:**

1. On the **Profile** page, show:
   - Telegram status:
     - “Not verified” / “Verified as @username”
   - Button: **“Verify with Telegram”**
2. When user clicks the button:
   - Backend endpoint: `POST /api/telegram/link/start`
   - Behavior:
     - Generate `link_token` and store in `TelegramLink` linked to `user_id`
     - Return instructions and a deep link like:
       - `https://t.me/<YourBotName>?start=<link_token>`
3. User opens Telegram, starts the bot with `/start <link_token>`.
4. Telegram bot receives update via webhook:
   - Backend endpoint: `POST /api/telegram/webhook`
   - Extract:
     - `telegram_user_id`
     - `telegram_username`
     - `link_token`
   - Match `TelegramLink` by `link_token`, set:
     - `telegram_user_id`
     - `telegram_username`
     - `linked_at` = now
   - Mark the associated `User.telegram_verified = true`

**Usage / Gating:**

- When user tries to:
  - Redeem event **TicketOffers** tied to tournaments
  - Join/participate in tournaments/events
- Backend checks:
  - `user.telegram_verified === true`
- If not, return error (e.g., `403` with code `TELEGRAM_NOT_VERIFIED`).
- Frontend displays a message and a “Verify Telegram” CTA.

---

## POINTS, TICKETS, MARKET & FORTUNE WHEEL

### Daily Login Reward

- `POST /api/rewards/daily-login`
- Uses `last_daily_login_at` to enforce once per 24h (or per calendar day; choose one and document).
- If eligible:
  - Add configurable amounts:
    - e.g. `+X` points and/or `+Y` tickets
  - Update `last_daily_login_at`
- Return updated balances.

### Code Redemption

- `POST /api/rewards/redeem-code`
- Body: `{ code: string }`
- Validate CodeReward (active, within dates, uses allowed).
- On success:
  - Update `user.points` / `user.tickets`
  - Insert `UserCodeRedemption`
  - Increment `CodeReward.used_count`
- Return updated balances.

### Fortune Wheel (Daily Spin)

- **Frontend**
  - Dedicated card on **Dashboard** and/or a dedicated **Fortune Wheel** page.
  - Shows:
    - “Spin now” if available
    - “Come back in X hours” if already spun today
  - Visual: a simple animated wheel or stylized circle (can be a basic UI, no need for heavy animation in code example).

- **Backend**
  - Endpoint: `POST /api/rewards/fortune-spin`
  - Logic:
    - Check if user has already spun in the last day via `last_fortune_spin_at`
    - If not eligible → return error with “already spun”
    - Select a prize tier:
      - Use `FortunePrizeTier` weights to randomly pick
    - Award `points_reward` to user:
      - Update `user.points`
    - Insert `FortuneSpin` with chosen tier & awarded points
    - Update `last_fortune_spin_at`
  - Return:
    - `points_awarded`
    - `new_points_balance`
    - Basic info about prize tier

- Prizes:
  - Only award **points** (used to buy items in the market).

### Market System (Digital Products Only)

- **MarketItem list**
  - `GET /api/market/items`
  - Returns active items with:
    - `name`, `description`, `image_url`, `price_points`, stock info

- **Purchase**
  - `POST /api/market/items/:id/purchase`
  - Logic:
    - Check user has enough `points`.
    - Check item is active and in stock (if limited).
    - Reserve a `MarketItemGrant` where `is_redeemed = false`.  
      - If none available and stock limited → error “out of stock”.
    - Deduct `price_points` from `user.points`.
    - Mark grant `is_redeemed = true`, set `redeemed_by_user_id`, `redeemed_at`.
    - Insert `UserMarketPurchase` with `points_spent` and references.
  - Return:
    - Item info
    - The **code** (e.g., discount code) or a masked/presentable representation (`XXXX-XXXX-...`).

- **User Purchases**
  - `GET /api/market/my-purchases`
  - Lists purchases and associated codes for the logged-in user.

- You can consider:
  - Admin endpoints to create/edit market items and upload their code pools.

---

## PAGES / UI FLOWS

Use the previously described layout (sidebar + top bar + card-based main area). Add/adjust for the new features.

### Sidebar Navigation

Include nav items (icon + label) such as:

- Dashboard
- Streams
- Best Moments
- Tournaments
- **Market**
- **Fortune Wheel** (if not on Dashboard only)
- Profile
- (Admin) if user is admin

### Dashboard

- Cards/sections:
  - **Points balance** (big number)
  - **Tickets balance**
  - “Daily login reward” card:
    - CTA: “Claim reward” (or “Already claimed today”).
  - **Fortune Wheel** mini-card:
    - If spin available: big “Spin now” button linking to wheel or triggering spin
    - If not: show countdown/“Come back tomorrow”
  - “Upcoming tournaments” list
  - “Recent streams” or “New highlights”

### Market Page

- Grid of **MarketItem** cards:
  - Name, description, price in points, maybe small image
  - “Buy with X points” button
- Show user’s current points at the top.
- On purchase:
  - Show success UI with the digital code.
  - Provide a link to “My Purchases”.

### Fortune Wheel Page

- Centered wheel UI:
  - Visual segments or stylized representation showing prize tiers.
  - “Spin now” button (disabled if not eligible).
- After spin:
  - Show animated result (or simple reveal) with points awarded.
  - Update points balance.
  - Show next available time.

### Tournaments Page

- Same as before, but with gating:
  - If user tries to join or redeem a ticket:
    - If `telegram_verified` is `false` → show tooltip/banner:
      - “You must verify Telegram to join events.”
      - Button “Verify Telegram” linking to Profile’s Telegram section.

### Profile Page

- Sections:
  1. **Account info**
     - Email + email verification status
     - Button to resend verification email if not verified
  2. **Telegram verification**
     - If not verified:
       - Explanation + button “Verify with Telegram”
       - After clicking, display generated deep link or instructions to open the bot.
     - If verified:
       - Show `telegram_username` and status “Verified”
  3. **Points & tickets overview**
  4. **Code redemption form**
     - Input for reward code + submit
     - Show success/error messages
  5. Optional: small history list (last few rewards or purchases)

---

## API DESIGN (IMPORTANT ROUTES)

Add to the existing REST-style API:

- **Auth**
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `GET /api/auth/me`
  - `POST /api/auth/logout`
  - `POST /api/auth/resend-verification-email`
  - `GET /api/auth/verify-email?token=...`

- **Telegram**
  - `POST /api/telegram/link/start` – start linking, returns deep link token or URL
  - `POST /api/telegram/webhook` – webhook endpoint for Telegram bot updates

- **Rewards**
  - `POST /api/rewards/daily-login`
  - `POST /api/rewards/redeem-code`
  - `POST /api/rewards/fortune-spin`

- **Market**
  - `GET /api/market/items`
  - `POST /api/market/items/:id/purchase`
  - `GET /api/market/my-purchases`

- **Tournaments / Events**
  - `GET /api/tournaments`
  - `GET /api/tournaments/:id`
  - `POST /api/ticket-offers/:id/redeem`  
    - Require `telegram_verified = true` when offer relates to event participation.

Continue to include streams and highlights routes as before.

---

## BACKEND & FRONTEND STRUCTURE

Follow the previously described structure but include:

- Backend:
  - `routes/telegram.ts`
  - `routes/market.ts`
  - `routes/rewards.ts` including fortune wheel logic
  - SQL migrations for:
    - EmailVerificationToken
    - TelegramLink
    - MarketItem, MarketItemGrant, UserMarketPurchase
    - FortunePrizeTier, FortuneSpin

- Frontend:
  - Pages/components:
    - `Market.tsx`
    - `FortuneWheel.tsx`
    - Profile’s Telegram verification section
  - API client functions:
    - `startTelegramLink()`
    - `getMarketItems()`, `purchaseMarketItem(id)`
    - `spinFortuneWheel()`, etc.

---

## INFRA & DEPLOYMENT

Same as before, but ensure:

- Environment variables for:
  - `TELEGRAM_BOT_TOKEN`
  - `TELEGRAM_WEBHOOK_SECRET` (if using)
  - `FRONTEND_BASE_URL`
- Nginx continues to:
  - Serve frontend
  - Proxy `/api/` to Node
- systemd services:
  - API and worker remain

---

## OUTPUT FORMAT

When implementing, your answer should:

1. Give a high-level architecture diagram/description (frontend ↔ backend ↔ PostgreSQL ↔ worker ↔ Telegram bot ↔ Nginx).
2. Show backend code structure + key routes (auth, telegram, rewards, market).
3. Show frontend structure with layout and main pages (Dashboard, Market, Fortune Wheel, Profile with Telegram verification).
4. Provide SQL migration snippets for new tables (TelegramLink, MarketItem, MarketItemGrant, FortunePrizeTier, FortuneSpin, etc.).
5. Provide sample Nginx, systemd, and rsync deploy scripts as before.

Build the app exactly according to this specification and stack.
