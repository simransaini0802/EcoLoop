# EcoLoop — Smart Waste Management & Recycling Platform

A full-stack student project built with React + Vite, Node.js, Express, MongoDB, and JWT authentication.

## Features
- Responsive landing page and dashboard
- User registration/login with hashed passwords and JWT
- Roles: `user`, `collector`, `admin`
- Submit and track waste collection requests
- Collector dashboard to view assigned requests and update collection status
- Admin dashboard to manage requests and assign collectors
- Reward points awarded when a request is marked completed
- Recycling activity statistics
- MongoDB persistence

## Requirements
- Node.js 18+
- MongoDB Community Server or a MongoDB Atlas connection string

## Run locally

### 1. Backend
```bash
cd backend
cp .env.example .env
# Update MONGO_URI and JWT_SECRET in .env
npm install
npm run dev
```
Backend runs on `http://localhost:5674`.

### 2. Frontend
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the Vite URL printed in the terminal (usually `http://localhost:5173`).

## Create the first admin
Register a normal account in the UI. Then, in MongoDB, update that user's `role` to `admin` in the `users` collection.
For a local database, MongoDB Compass makes this easy. Do not leave public production registration able to choose the admin role.

## Default waste categories and points
- Plastic: 10 points per kg
- Paper: 8 points per kg
- Glass: 7 points per kg
- Metal: 12 points per kg
- E-waste: 15 points per kg
- Organic: 4 points per kg

Points are awarded only once when a request transitions to `completed`. The quantity is treated as kilograms.

## API overview
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/requests` (role-aware)
- `POST /api/requests`
- `PATCH /api/requests/:id/status`
- `PATCH /api/requests/:id/assign`
- `GET /api/dashboard/stats`
- `GET /api/rewards`

## Notes
- This is an educational starter project. Add production-grade rate limiting, email verification, audit logs, stronger upload validation, and deployment secrets before real-world use.
