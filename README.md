# Ambulance Dispatch Service Backend API

## 🏥 Overview
This is the backend API for the **Ambulance Dispatch Service (Assignment 6)**. It serves as a comprehensive emergency ambulance dispatch system featuring patient and driver management, real-time emergency requests, hospital bed tracking, automated trips, and bKash payment integrations.

## 🚀 Tech Stack
- **Runtime:** Node.js, Express (TypeScript)
- **Database:** PostgreSQL (Neon DB) with Prisma ORM
- **Caching & Geospatial:** Redis (`ioredis`) for driver geolocation tracking and caching
- **Authentication:** Passport.js (Local Strategy, Google OAuth, JWT)
- **Validation:** Zod
- **Payments:** bKash API

## 📂 Folder Structure
The project follows a modular, feature-based architecture to ensure separation of concerns and maintainability.
```text
src/
├── app/
│   ├── errors/        # Global error handlers (AppError, globalErrorHandler)
│   ├── middlewares/   # Express middlewares (auth, validation)
│   ├── modules/       # Feature-based modules (Controllers, Routes, Services, Validations)
│   │   ├── ambulance/
│   │   ├── audit/
│   │   ├── driver/
│   │   ├── emergency/
│   │   ├── hospital/
│   │   ├── payment/
│   │   ├── trip/
│   │   └── user/
│   ├── routes/        # Main application router indexing
│   └── utils/         # Shared utilities (Prisma client, Redis client, sendResponse)
├── config/            # Zod-validated environment variables
├── app.ts             # Express app setup and middleware registration
└── server.ts          # Server bootstrap entry point
```

## 🏗 Architectural Brief
- **Modular Monolith:** Features are separated into individual folders (`modules/*`) containing their respective Routes, Controllers, Services, and Validations.
- **Data Layer:** Prisma ORM manages interactions with PostgreSQL, ensuring type-safe database queries.
- **Caching & Geospatial Indexing:** Redis (`ioredis`) is leveraged heavily for caching hospital bed counts and indexing driver locations (`GEOADD`, `GEOSEARCH`) for hyper-fast ambulance dispatching.
- **Security:** Integrated with Passport.js for Role-Based Access Control (RBAC) via JWTs and Google OAuth. Input validation is handled gracefully at the middleware level via Zod schemas.

## 🔄 System Workflow
1. **Onboarding:** Hospitals, Ambulances, and Users (Patients/Drivers) register on the platform.
2. **Driver Tracking:** Active drivers constantly update their geolocation which gets stored in Redis using Geospatial indexes.
3. **Emergency Dispatch (Core Feature):**
   - A Patient submits an emergency request with their GPS coordinates.
   - The system queries Redis to find the nearest available ambulance of the requested type within a set radius.
   - A concurrency-safe dispatch engine uses Prisma transactions (`$transaction`) to prevent assigning the same driver to multiple concurrent emergencies.
4. **Trip Management:** Once the driver accepts, a Trip is generated. The driver manages the trip lifecycle until patient drop-off.
5. **Payment Processing:** Upon completion, the trip cost is calculated, and an integration with the bKash API processes the user's payment.

## ⚙️ Getting Started

### 1. Environment Setup
Make sure your `.env` file contains the following (based on our recent setup):
```env
DATABASE_URL="postgresql://neondb_owner:***@ep-curly-cherry-b4pni1j6-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
JWT_SECRET="your_super_secret_jwt_key_here"
SESSION_SECRET="your_super_secret_session_key_here"
GOOGLE_CLIENT_ID="your_google_client_id_here"
GOOGLE_CLIENT_SECRET="your_google_client_secret_here"
REDIS_HOST="fang-control-adept-70946.db.redis.io"
REDIS_PORT=15930
REDIS_USERNAME="default"
REDIS_PASSWORD="<your-password>"
BKASH_APP_KEY="***"
BKASH_APP_SECRET="***"
BKASH_USERNAME="sandboxTokenizedUser02x"
BKASH_PASSWORD="sandboxTokenizedUser02@12345"
PORT=5000
```

### 2. Run the Server
```bash
npm install
npm run dev
```
The server will start at `http://localhost:5000`. 
**Root Endpoint:** `GET http://localhost:5000/`

---

## 🧪 Postman Testing Guide & Test Data

**Base URL:** `http://localhost:5000/api/v1`

*Note: For endpoints that are protected, you will need to pass your JWT token (received after login) in the Headers:*
`Authorization: Bearer <YOUR_JWT_TOKEN>`

### 1. Authentication
**Register a Patient** `POST /auth/register`
```json
{
  "email": "patient@example.com",
  "password": "securepassword123",
  "name": "John Doe",
  "role": "PATIENT",
  "phone": "+8801700000000"
}
```

**Register a Driver** `POST /auth/register`
```json
{
  "email": "driver@example.com",
  "password": "securepassword123",
  "name": "Jane Driver",
  "role": "DRIVER",
  "phone": "+8801800000000",
  "licenseNumber": "LIC-2026-XYZ"
}
```

**Login** `POST /auth/login`
```json
{
  "email": "patient@example.com",
  "password": "securepassword123"
}
```
*(Copy the `token` from the response and use it for subsequent protected API requests).*

**Google OAuth Login**
Open `http://localhost:5000/api/v1/auth/google` in a web browser to initiate the Google OAuth flow.

### 2. Users
**Get Current User Profile** `GET /users/me`
*Headers: Authorization: Bearer <JWT_TOKEN>*

**Update Current User Profile** `PATCH /users/me`
*Headers: Authorization: Bearer <JWT_TOKEN>*
```json
{
  "name": "John Doe Jr",
  "phone": "+8801900000000"
}
```

### 2. Hospitals
**Add a Hospital** `POST /hospitals`
```json
{
  "name": "Dhaka Medical College Hospital",
  "address": "Secretariat Road, Dhaka 1000",
  "latitude": 23.7261,
  "longitude": 90.3976,
  "totalBeds": 500,
  "availableBeds": 45,
  "hasICU": true
}
```

### 3. Ambulances
**Add an Ambulance** `POST /ambulances`
```json
{
  "plateNumber": "DHA-11-9999",
  "type": "ICU",
  "status": "AVAILABLE",
  "hospitalId": "<uuid-from-hospital-creation>" 
}
```
*(Leave hospitalId null if it's an independent ambulance)*

### 4. Drivers
*Note: Drivers are registered via the `/auth/register` endpoint with `"role": "DRIVER"`.*

**Update Driver Status & Location (Redis Geo-Tracking)** `PATCH /drivers/status`
*Headers: Authorization: Bearer <JWT_TOKEN_OF_DRIVER>*
```json
{
  "isAvailable": true,
  "currentLat": 23.7311,
  "currentLng": 90.4011
}
```

### 5. Emergencies & Dispatch
**Request Emergency Ambulance** `POST /emergencies`
```json
{
  "patientId": "<uuid-from-user-creation>",
  "pickupLatitude": 23.7461,
  "pickupLongitude": 90.3776,
  "emergencyType": "CARDIAC_ARREST",
  "requiredAmbulanceType": "ICU",
  "notes": "Patient is unconscious, requires immediate oxygen."
}
```

### 6. Trips & Payments
**Complete a Trip** `PATCH /trips/:id/complete`
```json
{
  "dropoffLatitude": 23.7261,
  "dropoffLongitude": 90.3976,
  "distanceKm": 5.4
}
```

**Initiate bKash Payment** `POST /payments/initiate`
```json
{
  "tripId": "<uuid-from-trip>",
  "amount": 1500.00
}
```

---

## 🏗 API Response Structure
**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]
}
```
