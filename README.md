# Zimbabwe Voice - Advocacy Platform

A platform for Zimbabweans to defend democracy, protect constitutional term limits, and advocate for freedom and good governance.

## Our Mission

Zimbabwe Voice empowers citizens to organize, mobilize, and make their voices heard on critical issues affecting our nation's democracy. We stand united against unconstitutional attempts to extend presidential term limits and any actions that undermine our hard-won democratic freedoms.

## Current Focus

**Protect Constitutional Term Limits**: Join thousands of Zimbabweans in defending our constitution against attempts to extend presidential term limits. Our democracy depends on the peaceful transfer of power and respect for constitutional limits.

## Features

- **Defend Democracy**: Create and sign campaigns to protect Zimbabwe's constitution
- **Mobilize Citizens**: Rally Zimbabweans around critical issues
- **Track Progress**: See real-time signature counts and campaign momentum
- **Secure Platform**: Protected user authentication and data privacy
- **Mobile-Friendly**: Access from any device across Zimbabwe and the diaspora

## Tech Stack

**Backend:**
- Node.js + Express
- PostgreSQL
- JWT authentication
- TypeScript

**Frontend:**
- React 18
- TypeScript
- Vite
- React Router

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Installation

1. Clone the repository
2. Copy environment files:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. Update backend/.env with your PostgreSQL credentials:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=advocacy_platform
   DB_USER=postgres
   DB_PASSWORD=your_password
   JWT_SECRET=your_secret_key_here
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Set up the database:
   ```bash
   # Create database
   createdb advocacy_platform
   
   # Run migrations
   npm run migrate --workspace=backend
   
   # (Optional) Seed with sample data
   npm run seed --workspace=backend
   ```

6. Start the development servers:
   ```bash
   # Terminal 1 - Backend
   npm run dev:backend

   # Terminal 2 - Frontend
   npm run dev:frontend
   ```

The backend will run on http://localhost:3000 and the frontend on http://localhost:5173

## Deployment

The app is ready to deploy! See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

**Quick Deploy:**
1. Backend + Database → Railway (free)
2. Frontend → Vercel (free)
3. Total cost: $0/month to start

Full deployment guide with step-by-step instructions is in DEPLOYMENT.md.

---

Run all tests:
```bash
npm test
```

Run backend tests only:
```bash
npm run test:backend
```

Run frontend tests only:
```bash
npm run test:frontend
```

## Project Structure

```
advocacy-platform/
├── backend/           # Express API server
│   ├── src/
│   │   ├── models/    # Database models
│   │   ├── routes/    # API routes
│   │   ├── middleware/# Express middleware
│   │   └── index.ts   # Entry point
│   └── package.json
├── frontend/          # React application
│   ├── src/
│   │   ├── components/# React components
│   │   ├── contexts/  # React contexts
│   │   └── main.tsx   # Entry point
│   └── package.json
└── package.json       # Root package.json
```

## License

MIT
