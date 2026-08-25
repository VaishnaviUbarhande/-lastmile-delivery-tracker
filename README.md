<div align="center">



\# 📦 Last-Mile Delivery Tracker



A full-stack \*\*MERN-based delivery management platform\*\* for managing customers, delivery agents, orders, pricing, tracking, assignments, and delivery notifications.



The system supports \*\*Customer, Delivery Agent, and Admin\*\* roles with JWT authentication and role-based access control.



\[!\[Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://lastmile-delivery-tracker-frontend-g39dcb042-vaishnavi-0c1c.vercel.app/)

\[!\[Node](https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js\\\&logoColor=white)](https://nodejs.org/)

\[!\[React](https://img.shields.io/badge/react-18.3-61DAFB?logo=react\\\&logoColor=black)](https://react.dev/)

\[!\[MongoDB](https://img.shields.io/badge/mongodb-8.5-47A248?logo=mongodb\\\&logoColor=white)](https://www.mongodb.com/)

\[!\[Express](https://img.shields.io/badge/express-4.19-000000?logo=express\\\&logoColor=white)](https://expressjs.com/)

\[!\[License](https://img.shields.io/badge/license-MIT-blue)](https://opensource.org/licenses/MIT)



\*\*\[🔗 Live Demo](#-live-demo) · \[✨ Features](#-features) · \[🏗️ Architecture](#️-architecture) · \[🗄️ Database Schema](#️-database-schema) · \[⚙️ Environment Variables](#️-environment-variables) · \[🚀 Local Setup](#-local-setup)\*\*



</div>



\---



\## 🔗 Live Demo



\### 🌐 Frontend Application



\*\*Live Application:\*\*

https://lastmile-delivery-tracker-frontend-g39dcb042-vaishnavi-0c1c.vercel.app/



The frontend is deployed on \*\*Vercel\*\*.



> The application provides separate interfaces for Customer, Delivery Agent, and Admin roles.



\### Seeded Test Accounts



| Role        | Email                      | Password         |

| ----------- | -------------------------- | ---------------- |

| 🛡️ Admin   | `admin@lastmile.com`       | `Admin@12345`    |

| 🚴 Agent    | `ravi.agent@lastmile.com`  | `Agent@12345`    |

| 🚴 Agent    | `priya.agent@lastmile.com` | `Agent@12345`    |

| 👤 Customer | `customer@lastmile.com`    | `Customer@12345` |



> \*\*Note:\*\* If these accounts are not available in the deployed database, run the backend seed script against your configured database.



\---



\## 📸 Screenshots



The screenshots below demonstrate the main Customer, Delivery Agent, and Admin workflows.



| Login                                   | Customer — New Order                                |

| --------------------------------------- | --------------------------------------------------- |

| !\[Login](screenshots/01-login-page.png) | !\[New Order](screenshots/02-customer-new-order.png) |



| Customer — My Orders                                | Customer — Multiple Orders                                            |

| --------------------------------------------------- | --------------------------------------------------------------------- |

| !\[My Orders](screenshots/03-customer-my-orders.png) | !\[My Orders Multiple](screenshots/04-customer-my-orders-multiple.png) |



| Delivery Agent Dashboard                                        | Admin — Order Management                                      |

| --------------------------------------------------------------- | ------------------------------------------------------------- |

| !\[Agent Dashboard](screenshots/05-delivery-agent-dashboard.png) | !\[Admin Dashboard](screenshots/06-admin-order-management.png) |



\---



\## ✨ Features



\### 👤 Customer



\* Register and login securely using JWT authentication

\* Create delivery orders

\* Enter pickup and delivery addresses

\* Get live shipping price preview before confirming an order

\* Track order status using a visual timeline

\* View previous orders

\* View complete price breakdown

\* Request rescheduling after failed delivery

\* Receive delivery status notifications



\### 🚴 Delivery Agent



\* Login using an agent account

\* View assigned orders

\* Update delivery status

\* Mark deliveries as failed with a reason

\* Update availability

\* Update current location

\* Participate in automatic order assignment

\* Handle reassigned and rescheduled deliveries



\### 🛡️ Admin



\* View and manage all orders

\* Manually assign or reassign delivery agents

\* Manage delivery zones

\* Manage B2B/B2C rate cards

\* Manage customers and delivery agents

\* Monitor agent availability

\* Monitor order status and tracking history

\* Override assignments when required

\* Manage pricing configuration without changing application code



\### ⚙️ Platform-wide



\* JWT authentication

\* Role-based authorization

\* Dynamic shipping price calculation

\* Volumetric weight calculation

\* Billable weight calculation

\* Intra-zone and inter-zone pricing

\* COD surcharge calculation

\* Nearest-agent auto assignment

\* Agent load balancing

\* Failed delivery and rescheduling

\* Automatic reassignment after rescheduling

\* Email and SMS notification support

\* Append-only order tracking history

\* REST API

\* Jest and Supertest testing

\* MongoDB database integration



\---



\## 🏗️ Architecture



The application follows a three-layer full-stack architecture:



```mermaid

flowchart LR



&#x20;   U\["👤 Customer"]

&#x20;   A\["🚴 Delivery Agent"]

&#x20;   AD\["🛡️ Admin"]



&#x20;   F\["🖥️ React Frontend<br/>Vite + Tailwind CSS"]



&#x20;   B\["⚙️ Node.js + Express Backend<br/>REST API + JWT"]



&#x20;   DB\[("🗄️ MongoDB<br/>Users • Zones • RateCards • Orders")]



&#x20;   N\["📩 Notifications<br/>Nodemailer + Twilio"]



&#x20;   U --> F

&#x20;   A --> F

&#x20;   AD --> F



&#x20;   F -->|"REST API + JWT"| B

&#x20;   B -->|"Read / Write"| DB

&#x20;   B -->|"Status Change"| N

```



\### Request Flow — Creating an Order



```text

Customer Dashboard

&#x20;       ↓

POST /api/orders/preview

&#x20;       ↓

Zone Detector

&#x20;       ↓

Pickup / Drop Zone Resolution

&#x20;       ↓

Rate Calculator

&#x20;       ↓

Volumetric Weight

&#x20;       ↓

Billable Weight

&#x20;       ↓

Shipping Charge Calculation

&#x20;       ↓

Price Preview

&#x20;       ↓

POST /api/orders

&#x20;       ↓

Server Recalculates Price

&#x20;       ↓

Nearest Available Agent Assignment

&#x20;       ↓

Order Saved in MongoDB

&#x20;       ↓

Tracking History Created

&#x20;       ↓

Email / SMS Notification

```



The confirmed order price is \*\*recalculated server-side\*\* during order creation rather than trusting the price sent by the frontend.



\---



\## ⚙️ Environment Variables



\### Backend — `backend/.env`



| Variable                | Example                                     | Purpose                                                |

| ----------------------- | ------------------------------------------- | ------------------------------------------------------ |

| `PORT`                  | `5000`                                      | Port on which the Express server runs                  |

| `NODE\_ENV`              | `development`                               | Application environment                                |

| `CLIENT\_URL`            | `http://localhost:5173`                     | Frontend URL allowed by CORS                           |

| `MONGO\_URI`             | `mongodb://127.0.0.1:27017/lastmile`        | MongoDB connection string                              |

| `JWT\_SECRET`            | `your-long-random-secret`                   | Secret used to sign and verify JWT tokens              |

| `JWT\_EXPIRES\_IN`        | `7d`                                        | JWT expiration duration                                |

| `SMTP\_HOST`             | `smtp.gmail.com`                            | SMTP server used by Nodemailer                         |

| `SMTP\_PORT`             | `587`                                       | SMTP port                                              |

| `SMTP\_SECURE`           | `false`                                     | SMTP security configuration                            |

| `SMTP\_USER`             | `your\_email@gmail.com`                      | SMTP username                                          |

| `SMTP\_PASS`             | `your\_app\_password`                         | SMTP password/app password                             |

| `EMAIL\_FROM`            | `Last-Mile Tracker <no-reply@lastmile.com>` | Sender address for emails                              |

| `TWILIO\_ACCOUNT\_SID`    | `ACxxxxxxxxxxxxxxxx`                        | Twilio account identifier                              |

| `TWILIO\_AUTH\_TOKEN`     | `your\_twilio\_auth\_token`                    | Twilio authentication token                            |

| `TWILIO\_PHONE\_NUMBER`   | `+1xxxxxxxxxx`                              | Twilio sender number                                   |

| `NOTIFICATIONS\_DRY\_RUN` | `true`                                      | Disables real email/SMS and logs notifications instead |

| `SEED\_ADMIN\_EMAIL`      | `admin@lastmile.com`                        | Seeded admin email                                     |

| `SEED\_ADMIN\_PASSWORD`   | `Admin@12345`                               | Seeded admin password                                  |



\### Frontend — `frontend/.env`



| Variable            | Example                     | Purpose              |

| ------------------- | --------------------------- | -------------------- |

| `VITE\_API\_BASE\_URL` | `http://localhost:5000/api` | Backend API base URL |



For production, configure:



```env

VITE\_API\_BASE\_URL=<your-deployed-backend-url>/api

```



> Never commit real `.env` files, JWT secrets, SMTP passwords, or Twilio credentials to GitHub.



\---



\## 🗄️ Database Schema



The application uses MongoDB with Mongoose.



The main collections are:



\* `User`

\* `Zone`

\* `RateCard`

\* `Order`



```mermaid

erDiagram



&#x20;   USER ||--o{ ORDER : "places"

&#x20;   USER ||--o{ ORDER : "delivers"



&#x20;   ZONE ||--o{ USER : "agent zone"

&#x20;   ZONE ||--o{ ORDER : "pickup zone"

&#x20;   ZONE ||--o{ ORDER : "drop zone"



&#x20;   RATECARD ||--o{ ORDER : "pricing snapshot"



&#x20;   USER {

&#x20;       ObjectId \_id PK

&#x20;       string name

&#x20;       string email UK

&#x20;       string password

&#x20;       string phone

&#x20;       string role

&#x20;       object agentProfile

&#x20;       boolean isActive

&#x20;   }



&#x20;   ZONE {

&#x20;       ObjectId \_id PK

&#x20;       string name UK

&#x20;       string description

&#x20;       string\[] pincodes

&#x20;       string\[] areas

&#x20;       boolean isActive

&#x20;   }



&#x20;   RATECARD {

&#x20;       ObjectId \_id PK

&#x20;       string orderType

&#x20;       number baseFare

&#x20;       number baseWeightKg

&#x20;       number perKgIntraZone

&#x20;       number perKgInterZone

&#x20;       string codSurchargeType

&#x20;       number codSurchargeValue

&#x20;       boolean isActive

&#x20;       ObjectId updatedBy FK

&#x20;   }



&#x20;   ORDER {

&#x20;       ObjectId \_id PK

&#x20;       string orderNumber UK

&#x20;       ObjectId customer FK

&#x20;       ObjectId createdBy FK

&#x20;       object pickupAddress

&#x20;       object dropAddress

&#x20;       ObjectId pickupZone FK

&#x20;       ObjectId dropZone FK

&#x20;       object package

&#x20;       string orderType

&#x20;       string paymentType

&#x20;       number codAmount

&#x20;       object charge

&#x20;       string status

&#x20;       ObjectId assignedAgent FK

&#x20;       string assignmentType

&#x20;       object failedDelivery

&#x20;       object\[] trackingHistory

&#x20;       date deliveredAt

&#x20;   }

```



\### Collection Reference



| Collection   | Purpose                                                                      |

| ------------ | ---------------------------------------------------------------------------- |

| \*\*User\*\*     | Stores customers, delivery agents, and admins                                |

| \*\*Zone\*\*     | Maps pincodes and areas to logistics zones                                   |

| \*\*RateCard\*\* | Stores B2B/B2C pricing configuration                                         |

| \*\*Order\*\*    | Stores delivery orders, pricing snapshots, assignments, and tracking history |



\### Order Price Snapshot



When an order is created, the calculated charge is stored as a \*\*frozen snapshot\*\*.



Therefore, changing a rate card later does \*\*not\*\* change the price of an existing order.



\### Tracking History



The `trackingHistory` array works as an \*\*append-only audit trail\*\*.



Each status change records:



\* Status

\* Actor

\* Note

\* Timestamp



\---



\## 🧮 Rate Calculation Logic



The shipping charge is calculated using the following process.



\### 1. Zone Detection



The pickup and drop pincodes are matched against the `Zone` collection.



If a pincode is not available, city information can be used as a fallback depending on the configured zone-detection logic.



\### 2. Volumetric Weight



```text

Volumetric Weight =

(L × B × H) / 5000

```



Dimensions are measured in centimeters.



\### 3. Billable Weight



```text

Billable Weight =

MAX(Actual Weight, Volumetric Weight)

```



\### 4. Rate Card Lookup



The active rate card for the selected order type is retrieved from MongoDB.



Supported order types:



```text

B2B

B2C

```



\### 5. Weight Charge



```text

Weight Charge =

MAX(0, Billable Weight - Base Weight)

× Applicable Per-Kg Rate

```



The applicable rate depends on whether the shipment is:



```text

Intra-Zone

```



or



```text

Inter-Zone

```



\### 6. COD Surcharge



COD surcharge is applied only when:



```text

Payment Type = COD

```



The surcharge can be configured as:



\* Flat amount

\* Percentage



\### 7. Total Charge



```text

Total Charge =

Base Fare

\+ Weight Charge

\+ COD Surcharge

```



The same calculation is performed again on the backend during order creation.



\---



\## 🤖 Auto-Assignment Logic



The delivery agent assignment engine works as follows:



1\. Find agents who are available.

2\. Prefer agents belonging to the pickup zone.

3\. If location data exists, calculate distance using the Haversine formula.

4\. Select the nearest suitable agent.

5\. Use `activeOrderCount` as a load-balancing factor.

6\. If no suitable agent exists in the pickup zone, widen the search.

7\. Mark the assignment as widened when the system searches outside the original zone.

8\. Increment the selected agent's active order count.



\### Assignment Types



Orders can be assigned through:



```text

manual

```



or



```text

auto

```



\---



\## 🔁 Failed Delivery \& Reschedule Flow



The failed delivery workflow is:



```text

Agent

&#x20; ↓

Mark Delivery as Failed

&#x20; ↓

Failure Reason Stored

&#x20; ↓

Customer Notification

&#x20; ↓

Tracking History Updated

&#x20; ↓

Customer/Admin Requests Reschedule

&#x20; ↓

Order Becomes Rescheduled

&#x20; ↓

Auto Assignment Runs Again

&#x20; ↓

New Delivery Attempt

```



The agent can then progress the order through the normal delivery lifecycle again.



\---



\## 📊 Order Status Flow



```text

Created

&#x20;  ↓

Assigned

&#x20;  ↓

Picked Up

&#x20;  ↓

In Transit

&#x20;  ↓

Out for Delivery

&#x20;  ↓

Delivered

```



If delivery fails:



```text

Out for Delivery

&#x20;       ↓

&#x20;     Failed

&#x20;       ↓

&#x20;  Rescheduled

&#x20;       ↓

&#x20;    Assigned

&#x20;       ↓

&#x20;  Picked Up

&#x20;       ↓

&#x20;  In Transit

&#x20;       ↓

&#x20;Out for Delivery

&#x20;       ↓

&#x20;Delivered / Failed

```



\---



\## 🧰 Tech Stack



| Layer               | Technology                                    |

| ------------------- | --------------------------------------------- |

| Frontend            | React 18, Vite, React Router                  |

| Styling             | Tailwind CSS                                  |

| HTTP Client         | Axios                                         |

| Notifications UI    | react-hot-toast                               |

| Backend             | Node.js, Express                              |

| Database            | MongoDB, Mongoose                             |

| Authentication      | JWT                                           |

| Password Security   | bcryptjs                                      |

| Email               | Nodemailer                                    |

| SMS                 | Twilio                                        |

| Security            | Helmet, express-rate-limit, express-validator |

| Testing             | Jest, Supertest                               |

| Test Database       | mongodb-memory-server                         |

| Frontend Deployment | Vercel                                        |

| Backend Deployment  | Render / Railway                              |

| Database Hosting    | MongoDB Atlas                                 |



\---



\## 📁 Project Structure



```text

lastmile-delivery-tracker/

│

├── backend/

│   ├── config/

│   │   └── db.js

│   │

│   ├── models/

│   │   ├── User.js

│   │   ├── Zone.js

│   │   ├── RateCard.js

│   │   └── Order.js

│   │

│   ├── controllers/

│   │   ├── authController.js

│   │   ├── zoneController.js

│   │   ├── rateCardController.js

│   │   ├── orderController.js

│   │   └── userController.js

│   │

│   ├── routes/

│   │   ├── authRoutes.js

│   │   ├── zoneRoutes.js

│   │   ├── rateCardRoutes.js

│   │   ├── orderRoutes.js

│   │   └── userRoutes.js

│   │

│   ├── middleware/

│   │   ├── authMiddleware.js

│   │   ├── roleMiddleware.js

│   │   └── errorMiddleware.js

│   │

│   ├── utils/

│   │   ├── rateCalculator.js

│   │   ├── zoneDetector.js

│   │   ├── autoAssign.js

│   │   └── notificationService.js

│   │

│   ├── seed/

│   │   └── seed.js

│   │

│   ├── tests/

│   │

│   ├── server.js

│   ├── package.json

│   └── .env.example

│

├── frontend/

│   ├── src/

│   │   ├── api/

│   │   ├── context/

│   │   ├── components/

│   │   └── pages/

│   │

│   ├── package.json

│   └── .env.example

│

├── screenshots/

│   ├── 01-login-page.png

│   ├── 02-customer-new-order.png

│   ├── 03-customer-my-orders.png

│   ├── 04-customer-my-orders-multiple.png

│   ├── 05-delivery-agent-dashboard.png

│   └── 06-admin-order-management.png

│

├── SYSTEM\_DESIGN.md

├── API\_DOCUMENTATION.md

└── README.md

```



\---



\## 🚀 Local Setup



\### Prerequisites



Install:



\* Node.js 18+

\* MongoDB local installation or MongoDB Atlas

\* Git

\* VS Code



Optional:



\* SMTP account for email notifications

\* Twilio account for SMS notifications



If notification credentials are unavailable, use:



```env

NOTIFICATIONS\_DRY\_RUN=true

```



\---



\## 🔧 Backend Setup



Open Command Prompt in the project directory.



```bash

cd backend

```



Install dependencies:



```bash

npm install

```



Create your environment file:



```bash

copy .env.example .env

```



Edit `.env` and configure:



```env

MONGO\_URI=your\_mongodb\_connection\_string

JWT\_SECRET=your\_long\_random\_secret

```



For local development:



```env

NOTIFICATIONS\_DRY\_RUN=true

```



Run the seed script:



```bash

npm run seed

```



Start the backend:



```bash

npm run dev

```



The backend will run on:



```text

http://localhost:5000

```



\---



\## 💻 Frontend Setup



Open another Command Prompt.



From the project root:



```bash

cd frontend

```



Install dependencies:



```bash

npm install

```



Create the environment file:



```bash

copy .env.example .env

```



Configure:



```env

VITE\_API\_BASE\_URL=http://localhost:5000/api

```



Start the frontend:



```bash

npm run dev

```



The frontend will normally run on:



```text

http://localhost:5173

```



Open the application in your browser:



```text

http://localhost:5173

```



\---



\## 🧪 Running Tests



From the backend directory:



```bash

cd backend

npm test

```



The test suite uses `mongodb-memory-server`, so an external MongoDB database is not required for the tests.



Tests cover areas such as:



\* Volumetric weight calculation

\* Billable weight calculation

\* Intra-zone pricing

\* Inter-zone pricing

\* COD surcharge

\* Order creation

\* Agent assignment

\* Status transitions

\* Failed delivery

\* Rescheduling

\* Auto-reassignment

\* Admin override



\---



\## 📡 API Reference



Complete API documentation is available in:



\[`API\_DOCUMENTATION.md`](./API\_DOCUMENTATION.md)



The API includes endpoints for:



\* Authentication

\* Customers

\* Orders

\* Order price preview

\* Delivery agents

\* Zones

\* Rate cards

\* Admin management

\* Assignment

\* Rescheduling

\* Tracking history



\---



\## ☁️ Deployment



\### Database — MongoDB Atlas



1\. Create a MongoDB Atlas cluster.

2\. Create a database user.

3\. Configure network access.

4\. Copy the MongoDB connection string.

5\. Add it as:



```env

MONGO\_URI=your\_mongodb\_atlas\_connection\_string

```



\### Backend — Render / Railway



Configure the backend deployment with:



```text

Build Command:

npm install

```



```text

Start Command:

npm start

```



Add all required environment variables from:



```text

backend/.env.example

```



After deployment, configure the frontend API URL using:



```env

VITE\_API\_BASE\_URL=<your-backend-url>/api

```



\### Frontend — Vercel



The frontend is deployed using Vercel.



Production application:



\*\*https://lastmile-delivery-tracker-frontend-g39dcb042-vaishnavi-0c1c.vercel.app/\*\*



Configure the Vercel environment variable:



```env

VITE\_API\_BASE\_URL=<your-backend-url>/api

```



The backend CORS configuration should allow the deployed frontend URL.



\---



\## 🔒 Security



The project includes several security measures:



\* JWT authentication

\* Role-based authorization

\* Password hashing with bcrypt

\* Helmet security middleware

\* Rate limiting

\* Request validation

\* Protected API routes

\* Environment variables for secrets

\* Server-side price recalculation

\* No sensitive credentials committed to Git



> Never upload `.env` files containing real passwords, API keys, JWT secrets, SMTP credentials, or Twilio credentials to GitHub.



\---



\## 📝 Important Notes



\* Pricing is database-driven through the `RateCard` collection.

\* Zones are managed through the `Zone` collection.

\* Historical order prices are frozen at order creation.

\* Tracking history is append-only.

\* The backend recalculates prices during order creation.

\* Agent assignment supports both automatic and manual assignment.

\* Failed deliveries support rescheduling and reassignment.

\* Email/SMS notifications support dry-run mode.

\* The application uses real REST API calls rather than frontend mock order data.



\---



\## 📚 Documentation



\### API Documentation



\[`API\_DOCUMENTATION.md`](./API\_DOCUMENTATION.md)



\### System Design



\[`SYSTEM\_DESIGN.md`](./SYSTEM\_DESIGN.md)



\### Live Application



\*\*https://lastmile-delivery-tracker-frontend-g39dcb042-vaishnavi-0c1c.vercel.app/\*\*



\---



<div align="center">



\### 🚚 Last-Mile Delivery Tracker



Built with ❤️ using the \*\*MERN Stack\*\*



\*\*React • Node.js • Express • MongoDB • JWT\*\*



\[🔗 Live Application](https://lastmile-delivery-tracker-frontend-g39dcb042-vaishnavi-0c1c.vercel.app/)



</div>



