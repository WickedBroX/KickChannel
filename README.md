# GamerApp

A modern, full-stack gamer streaming platform with integrated gamification, tournament management, and a digital marketplace.

![GamerApp Dashboard](https://via.placeholder.com/800x400?text=GamerApp+Dashboard)

## 🚀 Features

-   **Live Streaming & Highlights**: Browse mock live streams and curated best moments.
-   **Gamification System**:
    -   **Points & Tickets**: Earn currency through engagement.
    -   **Daily Rewards**: Login bonuses to keep users coming back.
    -   **Fortune Wheel**: Daily spin for random point prizes.
-   **Marketplace**: Redeem points for digital codes (e.g., Steam keys, Discord Nitro).
-   **Tournaments**:
    -   View upcoming and ongoing events.
    -   **Telegram Verification**: Mandatory Telegram linking to participate in competitive events.
    -   Ticket-based entry system.
-   **Admin Panel**: Manage market items, tournaments, ticket offers, and reward codes.
-   **Secure Authentication**: JWT-based auth with HttpOnly cookies and email verification simulation.

## 🛠️ Tech Stack

-   **Frontend**:
    -   React 18 + TypeScript
    -   Vite (Build tool)
    -   Tailwind CSS (Styling)
    -   Lucide React (Icons)
    -   React Router DOM
-   **Backend**:
    -   Node.js + Express
    -   PostgreSQL (Raw SQL via `pg` driver)
    -   JWT (JSON Web Tokens) for Auth
    -   Mock Ingestion Worker (Background service)
-   **Infrastructure**:
    -   Nginx (Reverse Proxy)
    -   Systemd (Process Management)

## 📂 Project Structure

```
├── backend/            # Node.js Express API
│   ├── src/
│   │   ├── controllers/# Route logic
│   │   ├── middleware/ # Auth & validation
│   │   ├── routes/     # API definition
│   │   ├── app.ts      # App setup
│   │   ├── worker.ts   # Background ingestion service
│   │   ├── schema.sql  # Database schema
│   │   └── seed.ts     # Data seeding script
│   └── tests/          # Integration tests
├── frontend/           # React Application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # Auth state management
│   │   ├── pages/      # Application views
│   │   └── api/        # Axios client
├── deploy/             # Deployment scripts (Nginx, Systemd)
└── README.md
```

## ⚡ Getting Started

### Prerequisites

-   Node.js (v18 or higher)
-   PostgreSQL (v14 or higher)

### 1. Setup Backend

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure Environment:
    Create a `.env` file in `backend/` (or use the default provided in dev):
    ```env
    DATABASE_URL=postgres://user:password@localhost:5432/gamerapp
    JWT_SECRET=your_secret_key
    PORT=3000
    FRONTEND_URL=http://localhost:5173
    ```
4.  Setup Database:
    Ensure PostgreSQL is running and the database exists.
    ```bash
    # Run migration
    npm run build
    node dist/migrate.js

    # Seed data (Admin user, items, tournaments)
    node dist/seed.js
    ```
5.  Start the Server:
    ```bash
    npm run dev
    # Or for the background worker
    npm run worker
    ```

### 2. Setup Frontend

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start Development Server:
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:5173`.

## 🧪 Testing

The backend includes an integration test suite using Jest and Supertest.

```bash
cd backend
npm test
```
*Note: Running tests will reset the database schema.*

## 🔒 Verification & Security

-   **Email Verification**: Links are logged to the backend console (Mock service).
-   **Telegram**: Webhook logic is implemented. Verification is simulated via API endpoints.
-   **Admins**: Seeded admin account: `admin@example.com` / `admin123`.

## 📦 Deployment

Scripts are located in the `deploy/` directory.

1.  **Nginx**: Use `deploy/nginx.conf` to configure reverse proxy.
2.  **Systemd**: Use `deploy/backend.service` and `deploy/worker.service` for process management.
3.  **Deploy Script**: `deploy/deploy.sh` provides an rsync-based deployment workflow.

## 📝 License

ISC
