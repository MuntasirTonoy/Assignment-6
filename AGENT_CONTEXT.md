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
- **Authentication**: `bcryptjs`, `jsonwebtoken`, `cookie-parser`, `google-auth-library`, `@clerk/express`.
- **Validation**: `zod` for schema and input validation.
- **Payments**: `stripe` for processing transactions.
- **Caching & Queues**: `ioredis` for interacting with Redis.

## Architecture & Structure
The project follows a **modular architecture** design:
```text
src/
├── app/
│   ├── errors/        # Global error handlers
│   ├── middlewares/   # Express middlewares (auth, validation, etc.)
│   ├── modules/       # Feature-based modules (e.g., user, patient, doctor)
│   │   └── user/
│   │       ├── user.controller.ts
│   │       ├── user.interface.ts
│   │       ├── user.model.ts
│   │       ├── user.route.ts
│   │       └── user.service.ts
│   ├── routes/        # Main application router indexing all module routes
│   │   └── index.ts
│   └── utils/         # Shared utilities (redis, sendResponse)
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
