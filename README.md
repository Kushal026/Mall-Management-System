# Mall Management System

A production-ready Mall Management System built with React 19 + TanStack Start on the frontend and an Express + MySQL backend.

## Features

- JWT authentication and protected routes
- Dashboard summary data and charts
- Shop, employee, inventory, billing, parking, complaints, and food court management
- Centralized Axios API service with token persistence
- Build verification for client and SSR output

## Prerequisites

- Node.js 18+
- MySQL 8+
- npm

## Setup

1. Install dependencies

```bash
npm install
```

2. Configure environment variables

Copy `.env.example` to `.env` and update the database and JWT values.

3. Start MySQL

### Option A: Docker (recommended)

```bash
npm run db:start
```

This launches a MySQL 8.4 container with the `smartmall` database preloaded from `docker/mysql/init.sql`.

### Option B: Local MySQL

Create a database named `smartmall` and import the schema and seed data:

```bash
mysql -u <user> -p < server/sql/schema.sql
mysql -u <user> -p < server/sql/seed.sql
```

4. Start the development servers

```bash
npm run dev:api
npm run dev
```

The Vite frontend will run on `http://localhost:5173` and the backend will run on `http://localhost:4000`.

## Scripts

- `npm run dev` - Start the frontend dev server
- `npm run dev:api` - Start the Express backend
- `npm run db:start` - Start MySQL using Docker Compose
- `npm run db:stop` - Stop the Docker Compose MySQL container
- `npm run db:reset` - Reset the Docker MySQL volume and recreate the database
- `npm run build` - Build the production bundle
- `npm run start` - Start the production server (if configured)

## API Base URL

Set `VITE_API_URL` in `.env` to your backend endpoint, for example:

```env
VITE_API_URL=http://localhost:4000/api
```

## Verification

The latest codebase was verified with `npm run build`, which completed successfully and produced the client and server output in `dist/`.
