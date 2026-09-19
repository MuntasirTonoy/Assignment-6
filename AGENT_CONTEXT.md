# Agent Context

## Project Overview
- **Name**: PH Healthcare System Backend (Assignment 6)
- **Description**: Emergency Ambulance Dispatch API for a healthcare application, handling patient/driver management, emergency requests, trips, payments, and authenticated workflows.
- **Environment**: Node.js, Express, TypeScript (ESM format).
- **Database**: PostgreSQL (hosted on Neon DB) with Prisma ORM v7 (`@prisma/client`) and `prisma.config.ts`.
- **Caching**: Redis integration (`ioredis`).

## Tech Stack & Tooling
- **Language**: TypeScript (`module: "esnext"`, `moduleResolution: "bundler"`).
- **Package Manager**: Strictly `npm` (tracked via `package-lock.json`).
- **Formatting & Linting**: Biome (`@biomejs/biome`).
- **Dev Server**: `tsx watch` for hot-reloading.
- **Authentication**: `@clerk/express`, `bcryptjs`, `jsonwebtoken`, `google-auth-library`.
- **Security & Middleware**: `helmet`, `cors`, `cookie-parser`.
- **Validation**: `zod` for schema and input validation.
- **Payments**: `bkash` for processing transactions.
- **Caching & Queues**: `ioredis` for interacting with Redis.

## Architecture & Structure
The project follows a **modular architecture** design:
```text
src/
├── app/
│   ├── errors/        # Global error handlers
│   │   ├── AppError.ts
│   │   └── globalErrorHandler.ts
│   ├── middlewares/   # Express middlewares (auth, validation, etc.)
│   │   ├── auth.ts
│   │   └── validateRequest.ts
│   ├── modules/       # Feature-based modules (e.g., user, patient, driver)
│   │   ├── ambulance/
│   │   │   ├── ambulance.controller.ts
│   │   │   ├── ambulance.route.ts
│   │   │   ├── ambulance.service.ts
│   │   │   └── ambulance.validation.ts
│   │   ├── audit/
│   │   │   ├── audit.controller.ts
│   │   │   ├── audit.route.ts
│   │   │   ├── audit.service.ts
│   │   │   └── audit.validation.ts
│   │   ├── driver/
│   │   │   ├── driver.controller.ts
│   │   │   ├── driver.route.ts
│   │   │   ├── driver.service.ts
│   │   │   └── driver.validation.ts
│   │   ├── emergency/
│   │   │   ├── emergency.controller.ts
│   │   │   ├── emergency.route.ts
│   │   │   ├── emergency.service.ts
│   │   │   └── emergency.validation.ts
│   │   ├── hospital/
│   │   │   ├── hospital.controller.ts
│   │   │   ├── hospital.route.ts
│   │   │   ├── hospital.service.ts
│   │   │   └── hospital.validation.ts
│   │   ├── payment/
│   │   │   ├── payment.controller.ts
│   │   │   ├── payment.route.ts
│   │   │   ├── payment.service.ts
│   │   │   └── payment.validation.ts
│   │   ├── trip/
│   │   │   ├── trip.controller.ts
│   │   │   ├── trip.route.ts
│   │   │   ├── trip.service.ts
│   │   │   └── trip.validation.ts
│   │   └── user/
│   │       ├── user.controller.ts
│   │       ├── user.interface.ts
│   │       ├── user.model.ts
│   │       ├── user.route.ts
│   │       ├── user.service.ts
│   │       └── user.validation.ts
│   ├── routes/        # Main application router indexing all module routes
│   │   └── index.ts
│   └── utils/         # Shared utilities (redis, sendResponse)
│       ├── prisma.ts
│       ├── redis.ts
│       └── sendResponse.ts
├── config/            # Zod-validated environment configurations
│   └── index.ts
├── app.ts             # Express app setup and middleware registration
└── server.ts          # Server bootstrap entry point
```

## Available Scripts
- `npm run dev`: Starts development server with `tsx watch`.
- `npm run build`: Compiles TypeScript to the `dist/` directory.
- `npm start`: Runs the production build from `dist/src/server.js`.
- `npm run format:check` / `npm run format:fix`: Runs Biome formatter.
- `npm run lint:check` / `npm run lint:fix`: Runs Biome linter.

## Important Conventions
1. **ESM Imports**: All internal imports must explicitly include `.js` extension (e.g., `import app from './app.js';`).
2. **Standard API Response**:
   - Success: `{ "success": true, "message": "...", "data": ... }`
   - Error: `{ "success": false, "message": "...", "errors": [...] }`
3. **Data Integrity**: Soft deletes only via `deletedAt`. Concurrency-safe dispatching via `prisma.$transaction`.
4. **Git**: `package-lock.json` is tracked, other lock files are ignored.
5. **Generated Code**: Any generated code (e.g., Prisma client, if custom) should be placed in `/src/generated` which is git-ignored.

## Progress
- **Step 4 Completed**: User sync, Me endpoints, Driver status, and Redis GEO tracking implemented.

- **Step 5 Completed**: Ambulance fleet inventory, Hospital bed tracking, Redis caching, and RBAC permissions.

- **Step 6 Completed**: Concurrency-safe dispatch engine and emergency request lifecycle implemented with \prisma.$transaction\.

- **Step 8 Completed**: Audit logging module, webhook hardening, and production build verification.

### Final Status
All feature modules (user, driver, ambulance, hospital, emergency, trip, payment, audit) marked as 100% complete.
Concurrency-safe dispatching, Redis GEO indexing, Clerk RBAC, bKash integration, and soft-delete enforcement verified.
**Status: Production Ready.**
