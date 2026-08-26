Pasted markdown.md
File
i want chage this redme file with this
Pasted markdown(1).md
File
in git with help of vs code
Pasted text.txt
Document

Yes — I see the problem. 👍

You are currently in the project root:

C:\Users\vaish\Downloads\lastmile-delivery-tracker\lastmile-delivery-tracker>

There is no package.json in this folder. The package.json files are inside backend and frontend.

That's why npm says:

Could not read package.json
ENOENT
Do this now

From your current location, type:

cd frontend

Your prompt should become:

C:\Users\vaish\Downloads\lastmile-delivery-tracker\lastmile-delivery-tracker\frontend>

Then run:

dir

You should see a package.json.

Then:

npm install

After it finishes:

npm run dev

You should get something like:

Local: http://localhost:5173/

Then open:

http://localhost:5173/

Important

Your backend is already running in the other Command Prompt:

[DB] MongoDB connected: 127.0.0.1
[Server] Running in development mode on port 5000

So don't close that window.

You should have two CMD windows:

CMD 1 → backend
npm run dev
Port 5000

CMD 2 → frontend
npm run dev
Port 5173

👉 Right now, only run cd frontend, then npm install, then npm run dev. If you get another error, paste it here.

wht are you doing my project is already depoly in vercel and want to only change a redme file

Ah, understood. 👍 Your project is already deployed on Vercel and working. You only want to modify the README.md file in the GitHub repository.

You do not need to run npm install or npm run dev for this.

Your current situation is:

GitHub repository
       ↓
   README.md  ← YOU WANT TO CHANGE THIS
       ↓
   Vercel deployment
If you want to change only README.md

Go to your GitHub repository:

Your Last-Mile Delivery Tracker repository

Then:

Open README.md
Click the pencil/edit icon ✏️
Replace the existing README with the new README content.
Scroll to the bottom.
Click Commit changes.

That's it. ✅

You don't need to touch the backend, frontend, MongoDB, or Vercel configuration.

One important thing

Since you showed me your current README content, I can help you make it look much more professional for your GitHub project.

For example, we can improve it with:

🚀 Project title + description
🔗 Live Demo button
💻 GitHub Repository
📸 Screenshots
✨ Features
🏗️ Architecture
🧮 Pricing algorithm
🤖 Auto-assignment explanation
🔐 Authentication/security
🗄️ Database schema
🛠️ Tech stack
📁 Project structure
⚙️ Local setup
🧪 Testing
🚀 Deployment
👥 Contributors

If your goal is "make my existing README professional without changing my actual project", I can write the complete final README.md for you, ready to copy-paste into GitHub.

<div align="center">
📦 Last-Mile Delivery Tracker

A full-stack MERN delivery management platform — customers and admins create orders with
auto-calculated shipping charges, agents are assigned intelligently (manual or
nearest-available auto-assignment), and customers get notified by email/SMS at every status
change.

Live Demo
Deployed on Vercel
GitHub Repo

<br/>

Node
React
MongoDB
Express
Tailwind
JWT
License
Status

🔗 Live App · ✨ Features · 🏗 Architecture · 🗄 Database Schema · ⚙️ Environment Variables · 🚀 Setup

</div>

⚠️ Before publishing: search this file for ⬅️ REPLACE and swap in your real Vercel/Render URLs (2 spots total).

🔗 Live Demo

This project is connected to GitHub for CI and to Vercel for continuous deployment — every
push to main auto-deploys the frontend.

Part	Status	URL	Hosted On
🌐 Frontend (App)	🟢 Live	your-app-name.vercel.app ⬅️ REPLACE	Vercel
⚙️ Backend (API)	🟢 Live	your-api-name.onrender.com/api ⬅️ REPLACE	Render / Railway
📦 Source Code	—	github.com/VaishnaviUbarhande/-lastmile-delivery-tracker	GitHub

Log in with any of the seeded demo accounts below to explore the app right away — no
registration needed.

Role	Email	Password
🛡️ Admin	admin@lastmile.com	Admin@12345
🚴 Agent	ravi.agent@lastmile.com	Agent@12345
🚴 Agent	priya.agent@lastmile.com	Agent@12345
👤 Customer	customer@lastmile.com	Customer@12345
📸 Screenshots
Login Page	Customer — Create New Order
Login Page	Customer New Order
Customer — My Orders	Customer — My Orders (Multiple)
Customer My Orders	Customer My Orders Multiple
Delivery Agent Dashboard	Admin — Order Management
Delivery Agent Dashboard	Admin Order Management
✨ Features
👤 Customer
Register/login with JWT-based auth
Create an order with live shipping-price preview before confirming
Track order status on a visual timeline (Created → Assigned → Picked Up → In Transit → Out for Delivery → Delivered/Failed)
Request a reschedule after a failed delivery attempt
View past orders and their frozen (never-changing) price breakdown
🚴 Delivery Agent
View orders assigned to them
Update order status through a strict, validated state machine
Mark a delivery as failed with a reason (triggers customer notification)
Toggle availability and current location for auto-assignment
🛡️ Admin
Full order oversight with manual re-assignment / override
Manage Zones — map pincodes/areas to logistics zones (no code changes needed)
Manage Rate Cards — edit B2B/B2C pricing (base fare, per-kg rate, COD surcharge) live
Manage users (view/deactivate customers & agents)
See auto-assignment "widened search" flags when a zone runs out of available agents
⚙️ Platform-wide
🧮 Dynamic pricing engine — volumetric weight, billable weight, intra/inter-zone rates, COD surcharge — 100% database-driven, zero hardcoded prices
🤖 Smart auto-assignment — nearest-available agent by Haversine distance with load-balancing fallback
🔁 Failed-delivery & reschedule flow with automatic re-assignment
🧾 Append-only audit trail (trackingHistory) — every status change is timestamped and attributed to the actor who made it
📧 Email + SMS notifications (Nodemailer + Twilio) on every status change, with a DRY_RUN mode for local dev without credentials
🔒 Role-based route protection (customer / agent / admin) via JWT + middleware guards
✅ Jest + Supertest test suite (rate engine unit tests + full order-lifecycle integration test) using an in-memory MongoDB
🏗 Architecture
flowchart TB
    subgraph Client["🖥️ Frontend — React (Vite) + Tailwind"]
        UI[Pages: Login/Register, Customer/Agent/Admin Dashboards]
        CTX[AuthContext — JWT session state]
        API_CLIENT[Axios client + endpoint wrappers]
        UI --> CTX --> API_CLIENT
    end

    subgraph Server["⚙️ Backend — Node.js + Express"]
        MW[Middleware: JWT auth guard, role guard, error handler]
        ROUTES[Routes: auth, orders, zones, rate-cards, users]
        CTRL[Controllers]
        subgraph Engines["Core Business Logic (backend/utils)"]
            RC[rateCalculator.js<br/>volumetric + billable weight, charge engine]
            ZD[zoneDetector.js<br/>pincode/city → zone lookup]
            AA[autoAssign.js<br/>nearest-available-agent engine]
            NS[notificationService.js<br/>Email + SMS]
        end
        ROUTES --> MW --> CTRL
        CTRL --> RC
        CTRL --> ZD
        CTRL --> AA
        CTRL --> NS
    end

    subgraph DB["🗄️ MongoDB (Atlas / local)"]
        USER[(User)]
        ZONE[(Zone)]
        RATE[(RateCard)]
        ORDER[(Order)]
    end

    subgraph External["📡 External Services"]
        SMTP[[SMTP — Nodemailer]]
        TWILIO[[Twilio SMS]]
    end

    API_CLIENT -- "REST / JSON, JWT Bearer token" --> ROUTES
    CTRL --> USER
    CTRL --> ZONE
    CTRL --> RATE
    CTRL --> ORDER
    NS --> SMTP
    NS --> TWILIO

Request flow example — creating an order:

Customer Dashboard → POST /api/orders/preview → zoneDetector resolves pickup/drop zone →
rateCalculator computes volumetric weight → billable weight → charge breakdown → price shown
to customer → on confirm, POST /api/orders re-runs the same calculation server-side
(never trusts the previewed price from the client) → autoAssign picks the nearest available
agent → order + frozen charge snapshot + first trackingHistory entry saved to MongoDB →
notificationService emails/texts the customer.

⚙️ Environment Variables
Backend (backend/.env)
Variable	Example	Purpose
PORT	5000	Port the Express server listens on
NODE_ENV	development	Enables/disables dev-only behavior (verbose errors, logging)
CLIENT_URL	http://localhost:5173	Allowed origin for CORS — must match the deployed frontend URL in production
MONGO_URI	mongodb://127.0.0.1:27017/lastmile	MongoDB connection string (local or Atlas SRV URI)
JWT_SECRET	(long random string)	Secret key used to sign/verify JWT auth tokens — keep private, never commit
JWT_EXPIRES_IN	7d	How long an issued JWT stays valid before the user must log in again
SMTP_HOST	smtp.gmail.com	SMTP server host used by Nodemailer to send order-status emails
SMTP_PORT	587	SMTP server port (587 = STARTTLS)
SMTP_SECURE	false	Whether to use implicit TLS (true for port 465, false for 587)
SMTP_USER	your_email@gmail.com	SMTP account username used to authenticate outgoing email
SMTP_PASS	your_app_password	SMTP account password / app password
EMAIL_FROM	"Last-Mile Tracker <no-reply@lastmile.com>"	"From" name/address shown on notification emails
TWILIO_ACCOUNT_SID	ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx	Twilio account identifier used to send SMS notifications
TWILIO_AUTH_TOKEN	your_twilio_auth_token	Twilio auth token — keep private, never commit
TWILIO_PHONE_NUMBER	+1xxxxxxxxxx	Twilio sender phone number that SMS notifications are sent from
NOTIFICATIONS_DRY_RUN	true	When true, skips real email/SMS sending and just logs to console — lets you run the app locally without any SMTP/Twilio credentials
SEED_ADMIN_EMAIL	admin@lastmile.com	Email used for the admin account created by npm run seed
SEED_ADMIN_PASSWORD	Admin@12345	Password used for the seeded admin account — change before any real deployment
Frontend (frontend/.env)
Variable	Example	Purpose
VITE_API_BASE_URL	http://localhost:5000/api	Base URL the React app uses for every backend API call — point this at your deployed backend's /api path in production

💡 Copy .env.example → .env in both backend/ and frontend/, then fill in real values.
.env files are git-ignored and should never be committed.

🗄 Database Schema

MongoDB / Mongoose, 4 collections. Order is the central document, referencing User (customer

agent) and Zone (pickup + drop), and snapshotting the RateCard used at creation time.
erDiagram
    USER ||--o{ ORDER : "places (as customer)"
    USER ||--o{ ORDER : "delivers (as assignedAgent)"
    ZONE ||--o{ USER : "assigned to (agentProfile.zone)"
    ZONE ||--o{ ORDER : "pickupZone"
    ZONE ||--o{ ORDER : "dropZone"
    RATECARD ||--o{ ORDER : "priced by (charge.rateCardUsed)"

    USER {
        ObjectId _id PK
        string name
        string email UK
        string password "hashed, select false"
        string phone
        string role "customer | agent | admin"
        object agentProfile "isAvailable, currentLocation, zone, activeOrderCount"
        boolean isActive
    }

    ZONE {
        ObjectId _id PK
        string name UK
        string description
        string[] pincodes
        string[] areas
        boolean isActive
    }

    RATECARD {
        ObjectId _id PK
        string orderType UK "B2B | B2C"
        number baseFare
        number baseWeightKg
        number perKgIntraZone
        number perKgInterZone
        string codSurchargeType "flat | percentage"
        number codSurchargeValue
        boolean isActive
        ObjectId updatedBy FK
    }

    ORDER {
        ObjectId _id PK
        string orderNumber UK
        ObjectId customer FK
        ObjectId createdBy FK
        object pickupAddress
        object dropAddress
        ObjectId pickupZone FK
        ObjectId dropZone FK
        object package "dims, actualWeightKg, volumetricWeightKg, billableWeightKg"
        string orderType "B2B | B2C"
        string paymentType "Prepaid | COD"
        number codAmount
        object charge "frozen snapshot: baseFare, weightCharge, codSurcharge, totalCharge, rateCardUsed, isIntraZone"
        string status
        ObjectId assignedAgent FK
        string assignmentType "manual | auto"
        object failedDelivery "isFailed, reason, failedAt, rescheduledDate, previousAgent"
        object[] trackingHistory "append-only: status, actor, note, timestamp"
        date deliveredAt
    }
Collection reference
Collection	Purpose	Key fields & notes
User	Stores all three account types in one collection, differentiated by role.	password is bcrypt-hashed and excluded from queries by default (select: false). Agents carry an embedded agentProfile (availability, live lat/lng, home zone, activeOrderCount) used entirely by the auto-assignment engine. Indexed on role and on agentProfile.zone + agentProfile.isAvailable for fast candidate lookup.
Zone	Admin-defined mapping of pincodes/areas → a named logistics zone.	A pincode may only belong to one active zone — enforced in the controller (not the schema, since Mongo doesn't do cross-document uniqueness natively). Drives both zone detection and intra/inter-zone pricing.
RateCard	One active pricing document per orderType (B2B or B2C).	Fully admin-editable from the dashboard — no price is ever hardcoded in application code. codSurchargeType decides whether the COD surcharge is a flat fee or a percentage of the freight subtotal.
Order	The central transactional record — one per shipment.	charge is a frozen snapshot taken at creation time (including which RateCard doc was used), so a later rate-card edit never changes the price of a historical order. trackingHistory[] is append-only — a full, timestamped, actor-attributed audit trail that both the customer timeline UI and admin tooling read from directly. failedDelivery holds everything needed to support the reschedule flow.
🧮 Rate Calculation Logic
Zone detection — pickup/drop pincode is looked up against the Zone collection; city name is a fallback if no pincode match exists.
Volumetric weight = (L × B × H in cm) / 5000 — the industry-standard courier divisor.
Billable weight = max(actualWeightKg, volumetricWeightKg).
Rate card lookup — the active RateCard for the order's orderType (B2B/B2C) is fetched, never hardcoded.
Weight charge = max(0, billableWeight − baseWeightKg) × (perKgIntraZone or perKgInterZone), chosen by whether pickup/drop zones match.
COD surcharge — added only if paymentType === 'COD': flat amount or a percentage of (baseFare + weightCharge).
Total = baseFare + weightCharge + codSurcharge. This exact breakdown is returned by /api/orders/preview and re-computed server-side (never trusted from the client) at /api/orders creation — so the confirmed price can never be spoofed by the frontend.
🤖 Auto-Assignment Logic
Candidate pool = agents with isAvailable = true in the order's pickup zone.
If candidates report a location, rank by Haversine distance to pickup; ties broken by lowest activeOrderCount (load balancing).
No location data → rank by lowest activeOrderCount only.
Zero agents available in-zone → search widens system-wide (widenedSearch: true flagged in the response) rather than leaving the order unassignable.
activeOrderCount is incremented/decremented on assignment/reassignment, doubling as a live load counter.
🔁 Failed Delivery & Reschedule Flow
Agent marks an order Failed with a reason → failedDelivery populated, customer notified, tracking history appended.
Customer/admin calls /api/orders/:id/reschedule → order moves to Rescheduled, auto-assignment re-runs immediately for the new attempt.
Agent progresses the order through the same status pipeline again: Picked Up → In Transit → Out for Delivery → Delivered/Failed.
🧰 Tech Stack
Layer	Technology
Frontend	React 18 (Vite), React Router, Tailwind CSS, Axios, react-hot-toast
Backend	Node.js, Express 4, Mongoose 8
Database	MongoDB (local or Atlas)
Auth	JWT (jsonwebtoken) + bcryptjs password hashing
Notifications	Nodemailer (email), Twilio (SMS)
Security	Helmet, express-rate-limit, express-validator
Testing	Jest, Supertest, mongodb-memory-server
Deployment targets	Vercel (frontend), Render/Railway (backend), MongoDB Atlas (database)
📁 Project Structure
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
🚀 Local Setup
Prerequisites
Node.js 18+
MongoDB (local install OR a free MongoDB Atlas cluster)
(Optional) an SMTP account (Gmail App Password, Brevo, Mailtrap) and a free Twilio trial account. Without these, set NOTIFICATIONS_DRY_RUN=true and notifications just log to console — the rest of the app works fully.
Backend
cd backend
cp .env.example .env
# edit .env: set MONGO_URI, JWT_SECRET, and (optionally) SMTP/Twilio credentials
npm install
npm run seed     # creates admin, 2 zones, 2 rate cards, 2 agents, 1 test customer
npm run dev      # starts on http://localhost:5000
Frontend
cd frontend
cp .env.example .env
# edit .env: set VITE_API_BASE_URL=http://localhost:5000/api
npm install
npm run dev       # starts on http://localhost:5173

Open http://localhost:5173 and log in with any seeded account (see Live Demo table above), or register a new customer.

Running Tests (backend)
cd backend 
npm test 

Uses mongodb-memory-server (in-process MongoDB), so no external database is needed. Covers the rate calculation engine (volumetric weight, intra/inter-zone pricing, COD surcharge) and a full order-lifecycle integration flow (create → assign → status transitions → failed delivery → reschedule → auto-reassignment → admin override).

📡 API Reference

Full endpoint-by-endpoint documentation (request/response bodies, auth requirements) lives in
API_DOCUMENTATION.md.

☁️ Deployment
Database — create a free MongoDB Atlas cluster → allow-list 0.0.0.0/0 (or your host's egress IPs) → copy the SRV connection string into MONGO_URI.
Backend → Render or Railway
Build command: npm install
Start command: npm start
Set all variables from backend/.env.example in the host's environment settings
After first deploy, run npm run seed once (via the host's shell) to create the admin
Frontend → Vercel
Framework preset: Vite
Set VITE_API_BASE_URL to your deployed backend's /api URL
Update the backend's CLIENT_URL env var to the deployed frontend URL (used for CORS)

More detail in SYSTEM_DESIGN.md §5.

📝 Notes
No pricing, zone, or assignment logic is hardcoded — it's all driven by the Zone and RateCard collections, editable by an admin with zero code changes.
Every frontend page calls real backend REST endpoints — no mock/fake data in the application itself. seed/seed.js only seeds configuration (admin login, zones, rate cards, two agents), not fake orders.
<div align="center">

Built with ❤️ using the MERN stack — API Docs · System Design

</div> in this redme mile screemshort is not vissible and also remove this
🔗 Live Demo

svg

This project is connected to GitHub for CI and to Vercel for continuous deployment — every push to main auto-deploys the frontend.

PartStatusURLHosted On			
🌐 Frontend (App)	🟢 Live	your-app-name.vercel.app ⬅️ REPLACE	Vercel
⚙️ Backend (API)	🟢 Live	your-api-name.onrender.com/api ⬅️ REPLACE	Render / Railway
📦 Source Code	—	github.com/VaishnaviUbarhande/-lastmile-delivery-tracker	GitHub

Log in with any of the seeded demo accounts below to explore the app right away — no registration needed. and live app linke should behttps://lastmile-delivery-tracker-kyyq-ks6zhgjn2-vaishnavi-0c1c.vercel.app/ this screenshort link and also change the diagram

Yes — now I understand. Your project is already deployed, so we should not run npm install, npm run dev, seed, or change the deployment. We only need to update README.md.

I made the updated README with:

✅ Your actual Vercel live app URL
✅ Removed the old your-app-name.vercel.app / Render placeholder section
✅ Updated the screenshots to use GitHub raw image URLs, which should make them display correctly
✅ Changed the architecture diagram to a cleaner diagram showing:
Users → Vercel React → Express API → Auth/Business Logic → MongoDB + Email/SMS
✅ Kept the important project documentation
✅ Removed the ⬅️ REPLACE instructions
✅ Added a simple Live App section instead of the old table
Download the updated README

Download README-updated.md

What you need to do now

Since your terminal is currently in:

C:\Users\vaish\Downloads\lastmile-delivery-tracker\lastmile-delivery-tracker>

Do not run npm install or npm run dev there.

Simply replace your existing README.md with the downloaded README-updated.md, rename it to:

README.md

Then run only:

git status
git add README.md
git commit -m "Update README with live app and screenshots"
git push origin main

After GitHub receives the commit, Vercel may redeploy automatically, but your application code itself is not being changed. Only the README is being updated. 

README-updated.md
Document

Library
/
README-updated.md

<div align="center">

📦 Last-Mile Delivery Tracker

A full-stack MERN delivery management platform — customers and admins create orders with
auto-calculated shipping charges, agents are assigned intelligently (manual or
nearest-available auto-assignment), and customers get notified by email/SMS at every status
change.






<br/>











🚀 Live App · ✨ Features · 🏗 Architecture · 🗄 Database Schema · ⚙️ Environment Variables · 🚀 Setup

</div>

🚀 Live App

Open the deployed application

The frontend is deployed on Vercel and connects to the deployed backend API.

Demo Accounts
Role	Email	Password
🛡️ Admin	admin@lastmile.com	Admin@12345
🚴 Agent	ravi.agent@lastmile.com	Agent@12345
🚴 Agent	priya.agent@lastmile.com	Agent@12345
👤 Customer	customer@lastmile.com	Customer@12345
📸 Screenshots

Screenshots are stored in the GitHub repository root and linked directly through GitHub's raw file URLs so they render correctly on the README page.

Login Page	Customer — Create New Order

	

Customer — My Orders	Customer — My Orders (Multiple)

	

Delivery Agent Dashboard	Admin — Order Management

	

✨ Features
👤 Customer
Register/login with JWT-based auth
Create an order with live shipping-price preview before confirming
Track order status on a visual timeline (Created → Assigned → Picked Up → In Transit → Out for Delivery → Delivered/Failed)
Request a reschedule after a failed delivery attempt
View past orders and their frozen price breakdown
🚴 Delivery Agent
View orders assigned to them
Update order status through a strict, validated state machine
Mark a delivery as failed with a reason
Toggle availability and current location for auto-assignment
🛡️ Admin
Full order oversight with manual re-assignment / override
Manage Zones
Manage B2B/B2C Rate Cards
Manage users
See auto-assignment "widened search" flags
⚙️ Platform-wide
🧮 Dynamic pricing engine using volumetric and billable weight
🤖 Smart auto-assignment using Haversine distance and load balancing
🔁 Failed-delivery and reschedule flow
🧾 Append-only audit trail using trackingHistory
📧 Email + SMS notifications
🔒 JWT-based role protection
✅ Jest + Supertest test suite with in-memory MongoDB
🏗 Architecture
flowchart LR
    U[👤 Customer / 🚴 Agent / 🛡️ Admin]
    V[🌐 React + Vite Frontend<br/>Vercel]
    API[⚙️ Node.js + Express API]
    AUTH[🔐 JWT Auth + Role Guards]
    LOGIC[🧠 Business Logic<br/>Pricing • Zones • Assignment • Orders]
    DB[(🗄️ MongoDB Atlas)]
    EMAIL[📧 Nodemailer / SMTP]
    SMS[📱 Twilio SMS]

    U --> V
    V -->|REST API / JSON| API
    API --> AUTH
    AUTH --> LOGIC
    LOGIC --> DB
    LOGIC --> EMAIL
    LOGIC --> SMS

    subgraph Frontend["Frontend — Vercel"]
        V
    end

    subgraph Backend["Backend — Node.js / Express"]
        API
        AUTH
        LOGIC
    end

    subgraph Services["External Services"]
        DB
        EMAIL
        SMS
    end
Request Flow
Customer
   ↓
React Dashboard
   ↓
POST /api/orders/preview
   ↓
Zone Detection → Rate Calculation
   ↓
Price Preview
   ↓
POST /api/orders
   ↓
Server-side Price Recalculation
   ↓
Auto Assignment
   ↓
MongoDB Order + Tracking History
   ↓
Email / SMS Notification
🗄 Database Schema

MongoDB / Mongoose, 4 collections. Order is the central document, referencing User
(customer + agent) and Zone (pickup + drop), and snapshotting the RateCard used at creation time.

erDiagram
    USER ||--o{ ORDER : places
    USER ||--o{ ORDER : delivers
    ZONE ||--o{ USER : assigned_to
    ZONE ||--o{ ORDER : pickupZone
    ZONE ||--o{ ORDER : dropZone
    RATECARD ||--o{ ORDER : priced_by

    USER {
        ObjectId _id PK
        string name
        string email UK
        string password
        string phone
        string role
        boolean isActive
    }

    ZONE {
        ObjectId _id PK
        string name UK
        string description
        string[] pincodes
        string[] areas
        boolean isActive
    }

    RATECARD {
        ObjectId _id PK
        string orderType UK
        number baseFare
        number baseWeightKg
        number perKgIntraZone
        number perKgInterZone
        string codSurchargeType
        number codSurchargeValue
        boolean isActive
    }

    ORDER {
        ObjectId _id PK
        string orderNumber UK
        ObjectId customer FK
        ObjectId assignedAgent FK
        ObjectId pickupZone FK
        ObjectId dropZone FK
        string orderType
        string paymentType
        number codAmount
        string status
        string assignmentType
        date deliveredAt
    }
Collection Reference
Collection	Purpose
User	Stores customer, agent and admin accounts
Zone	Maps pincodes/areas to logistics zones
RateCard	Stores editable B2B/B2C pricing
Order	Central shipment record with pricing, assignment and tracking history
🧮 Rate Calculation Logic
Zone detection uses pickup/drop pincode and city fallback.
Volumetric weight = (L × B × H in cm) / 5000.
Billable weight = max(actualWeightKg, volumetricWeightKg).
Active B2B/B2C RateCard is loaded from the database.
Weight charge is calculated using intra-zone or inter-zone pricing.
COD surcharge is added only for COD orders.
Total charge is recalculated server-side when the order is created.
🤖 Auto-Assignment Logic
Find available agents in the pickup zone.
Rank agents by Haversine distance when location data is available.
Use activeOrderCount as a load-balancing tie breaker.
If no agent is available in-zone, widen the search system-wide.
Update the agent's active order count after assignment/reassignment.
🔁 Failed Delivery & Reschedule Flow
Agent marks an order as Failed with a reason.
The failed-delivery information is saved and the customer is notified.
Customer/admin requests rescheduling.
Auto-assignment runs again for the new attempt.
Agent continues through the delivery status pipeline.
🧰 Tech Stack
Layer	Technology
Frontend	React 18, Vite, React Router, Tailwind CSS, Axios
Backend	Node.js, Express 4, Mongoose 8
Database	MongoDB / MongoDB Atlas
Authentication	JWT + bcryptjs
Notifications	Nodemailer + Twilio
Security	Helmet, express-rate-limit, express-validator
Testing	Jest, Supertest, mongodb-memory-server
Deployment	Vercel + Render/Railway + MongoDB Atlas
📁 Project Structure
lastmile-delivery-tracker/
├── backend/
│   ├── config/
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── seed/
│   ├── tests/
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── context/
│   │   ├── components/
│   │   └── pages/
│   ├── package.json
│   └── .env.example
├── SYSTEM_DESIGN.md
├── API_DOCUMENTATION.md
└── README.md
⚙️ Environment Variables
Backend (backend/.env)
Variable	Purpose
PORT	Express server port
NODE_ENV	Application environment
CLIENT_URL	Frontend URL allowed by CORS
MONGO_URI	MongoDB connection string
JWT_SECRET	JWT signing secret
JWT_EXPIRES_IN	JWT expiration time
SMTP_HOST	SMTP server
SMTP_PORT	SMTP server port
SMTP_SECURE	SMTP TLS setting
SMTP_USER	SMTP username
SMTP_PASS	SMTP password/app password
EMAIL_FROM	Sender email
TWILIO_ACCOUNT_SID	Twilio account ID
TWILIO_AUTH_TOKEN	Twilio authentication token
TWILIO_PHONE_NUMBER	Twilio sender number
NOTIFICATIONS_DRY_RUN	Disable real notifications for local development
Frontend (frontend/.env)
VITE_API_BASE_URL=http://localhost:5000/api

.env files are git-ignored and should never be committed.

🚀 Local Setup
Prerequisites
Node.js 18+
MongoDB local installation or MongoDB Atlas
Backend
cd backend
npm install
npm run seed
npm run dev

Backend runs on:

http://localhost:5000
Frontend
cd frontend
npm install
npm run dev

Frontend runs on:

http://localhost:5173
📡 API Reference

Full endpoint documentation is available in API_DOCUMENTATION.md.

☁️ Deployment
Frontend: Vercel
Backend: Render or Railway
Database: MongoDB Atlas
Set VITE_API_BASE_URL to the deployed backend /api URL.
Set the backend CLIENT_URL to the deployed frontend URL.
📝 Notes
Pricing, zone and assignment logic are database-driven.
Historical order prices are stored as frozen snapshots.
trackingHistory provides an append-only audit trail.
The application uses real backend REST APIs rather than mock order data.

<div align="center">

Built with ❤️ using the MERN stack

🚀 Open Live App ·
📡 API Docs ·
🏗 System Design

</div>
