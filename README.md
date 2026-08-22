# Last-Mile Delivery Tracker

A full-stack delivery management platform (MERN) where customers and admins create orders
with auto-calculated shipping charges, agents are assigned intelligently (manual or nearest-available
auto-assignment), and customers are notified by email/SMS at every status change.

**Stack:** MongoDB · Express.js · React (Vite) · Node.js · Tailwind CSS · JWT auth

---

## 1. Project Structure

```
lastmile-delivery-tracker/
├── backend/
│   ├── config/db.js                 # MongoDB connection
│   ├── models/                      # User, Zone, RateCard, Order (with immutable trackingHistory)
│   ├── controllers/                 # auth, zone, rateCard, order, user
│   ├── routes/                      # REST route definitions
│   ├── middleware/                  # JWT auth + role guard, error handler
│   ├── utils/
│   │   ├── rateCalculator.js        # volumetric weight, billable weight, charge engine
│   │   ├── zoneDetector.js          # pincode/city -> zone lookup
│   │   ├── autoAssign.js            # nearest-available-agent engine
│   │   └── notificationService.js   # Email (Nodemailer) + SMS (Twilio)
│   ├── seed/seed.js                 # seeds admin, 2 zones, 2 rate cards, 2 agents, 1 customer
│   ├── tests/                       # Jest unit + supertest integration tests
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/                     # axios client + endpoint wrappers
│   │   ├── context/AuthContext.jsx  # JWT session state
│   │   ├── components/              # Navbar, StatusBadge, OrderTimeline, ProtectedRoute
│   │   └── pages/                   # Login, Register, Customer/Agent/Admin dashboards
│   ├── package.json
│   └── .env.example
├── SYSTEM_DESIGN.md
├── API_DOCUMENTATION.md
└── README.md   (this file)
```

## 2. Prerequisites

- Node.js 18+
- MongoDB (local install OR a free MongoDB Atlas cluster)
- (Optional) An SMTP account for real email (Gmail App Password, Brevo, Mailtrap) and a free
  Twilio trial account for real SMS. Without these, set `NOTIFICATIONS_DRY_RUN=true` and
  notifications will simply be logged to the backend console — the rest of the app works fully.

## 3. Local Setup

### 3.1 Backend

```bash
cd backend
cp .env.example .env
# edit .env: set MONGO_URI, JWT_SECRET, and (optionally) SMTP/Twilio credentials
npm install
npm run seed     # creates admin, 2 zones, 2 rate cards, 2 agents, 1 test customer
npm run dev      # starts on http://localhost:5000
```

Seeded logins (also printed by the seed script):

| Role     | Email                     | Password       |
|----------|----------------------------|----------------|
| Admin    | admin@lastmile.com         | Admin@12345    |
| Agent    | ravi.agent@lastmile.com    | Agent@12345    |
| Agent    | priya.agent@lastmile.com   | Agent@12345    |
| Customer | customer@lastmile.com      | Customer@12345 |

### 3.2 Frontend

```bash
cd frontend
cp .env.example .env
# edit .env: set VITE_API_BASE_URL=http://localhost:5000/api
npm install
npm run dev       # starts on http://localhost:5173
```

Open `http://localhost:5173`, log in with any seeded account, or register a new customer.

### 3.3 Running Tests (backend)

```bash
cd backend
npm test
```

Tests use `mongodb-memory-server` (an in-process MongoDB), so no external database is required
to run them. They cover the rate calculation engine (volumetric weight, intra/inter-zone pricing,
COD surcharge) and a full order lifecycle integration flow (create → assign → status transitions
→ failed delivery → reschedule → auto-reassignment → admin override), asserting the tracking
history is appended correctly at each step.

## 4. Database Schema (summary)

- **User** — `role: customer | agent | admin`. Agents carry an `agentProfile` (availability,
  current lat/lng, assigned zone, active order count for load balancing).
- **Zone** — admin-defined; maps a list of `pincodes` (and optional `areas`) to a zone name.
  A pincode can only belong to one active zone (enforced in the controller).
- **RateCard** — one active document per `orderType` (B2B/B2C): `baseFare`, `baseWeightKg`,
  `perKgIntraZone`, `perKgInterZone`, `codSurchargeType` (flat/percentage), `codSurchargeValue`.
  Fully admin-editable; nothing is hardcoded in application code.
- **Order** — pickup/drop address + detected zone, package dimensions, computed
  `volumetricWeightKg`/`billableWeightKg`, a frozen `charge` snapshot (so historical orders keep
  their original price even if rate cards change later), current `status`, `assignedAgent`,
  `failedDelivery` sub-object (reason, reschedule date, previous agent), and an **append-only**
  `trackingHistory[]` array — each entry has `status`, `actor {id, role, name}`, `note`, and
  `timestamp`. Entries are never edited or removed, only pushed, so the array is a durable audit
  trail of every status change and who made it.

## 5. Rate Calculation Logic

1. **Zone detection**: pickup/drop pincode is looked up against the `Zone` collection
   (`utils/zoneDetector.js`). City name is used as a fallback if no pincode match exists.
2. **Volumetric weight**: `(L × B × H in cm) / 5000` (`utils/rateCalculator.js`).
3. **Billable weight**: `max(actualWeightKg, volumetricWeightKg)`.
4. **Rate card lookup**: the active `RateCard` document for the order's `orderType` (B2B/B2C)
   is fetched — never hardcoded.
5. **Weight charge**: `max(0, billableWeight - baseWeightKg) × (perKgIntraZone or perKgInterZone)`
   depending on whether the pickup and drop zone IDs match.
6. **COD surcharge**: added only if `paymentType === 'COD'`, either a flat amount or a percentage
   of `(baseFare + weightCharge)`, per the rate card's `codSurchargeType`.
7. **Total** = `baseFare + weightCharge + codSurcharge`. This exact breakdown is returned by the
   `/api/orders/preview` endpoint before confirmation, and re-computed (not trusted from the
   client) at `/api/orders` creation time, so the confirmed price always matches what the
   customer approved and can never be spoofed by the frontend.

## 6. Auto-Assignment Logic

`utils/autoAssign.js`:
1. Candidate pool = agents with `isAvailable = true` in the order's **pickup zone**.
2. If any candidates have a `currentLocation`, they are ranked by Haversine distance to the
   pickup address; the nearest wins (ties broken by lowest current active-order count for load
   balancing).
3. If no candidate has location data, ranking falls back to lowest active-order count only.
4. If **no** agent is available in the pickup zone, the search widens to all available agents
   system-wide (so an order is not left unassignable) and the response flags `widenedSearch: true`.
5. On assignment, the previous agent's `activeOrderCount` is decremented (if reassigning) and the
   new agent's is incremented; this counter is also what deprioritizes an already-busy agent in
   future auto-assignments.

## 7. Failed Delivery & Reschedule Flow

1. Agent marks an order `Failed` with a reason → `failedDelivery.isFailed/reason/failedAt` set,
   customer notified by email+SMS, tracking history appended.
2. Customer (or admin) calls `/api/orders/:id/reschedule` with a new date → order moves to
   `Rescheduled`, `failedDelivery.rescheduledDate` is set, and the system immediately re-runs
   auto-assignment (`findNearestAvailableAgent`) for the new attempt, appending both a
   `Rescheduled` and an `Assigned` tracking entry.
3. Agent then progresses the order through `Picked Up → In Transit → Out for Delivery →
   Delivered/Failed` again, exactly like a fresh order.

## 8. Deployment

See `SYSTEM_DESIGN.md` §5 and the checklist below.

- **Database**: create a free MongoDB Atlas cluster → allow-list `0.0.0.0/0` (or your host's
  egress IPs) → copy the SRV connection string into `MONGO_URI`.
- **Backend**: deploy `backend/` to Render or Railway.
  - Build command: `npm install`
  - Start command: `npm start`
  - Set all variables from `.env.example` in the host's environment settings.
  - After first deploy, run `npm run seed` once (Render/Railway shell) to create the admin.
- **Frontend**: deploy `frontend/` to Vercel.
  - Framework preset: Vite
  - Set `VITE_API_BASE_URL` to your deployed backend's `/api` URL.
  - Update the backend's `CLIENT_URL` env var to the deployed frontend URL (used for CORS).

## 9. Notes

- No pricing, zone, or assignment logic is hardcoded — all of it is driven by the `Zone` and
  `RateCard` collections, editable by an admin from the Admin dashboard, with zero code changes.
- Every frontend page calls real backend REST endpoints; there is no mock/fake data in the
  application itself. `seed/seed.js` only seeds the *configuration* needed to bootstrap the app
  (admin login, zones, rate cards, two agents) — it does not seed any fake orders.
