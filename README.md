📦 Last-Mile Delivery Tracker

A full-stack MERN-based delivery management platform for managing customers, delivery agents, orders, pricing, tracking, assignments, and delivery notifications.

The system supports Customer, Delivery Agent, and Admin roles with JWT authentication and role-based access control.

🔗 Live Demo
🚀 App Demo

Live Application:
https://lastmile-delivery-tracker-kyyq-lgfcoh3fs-vaishnavi-0c1c.vercel.app/

Click the link above to open the live application.

✨ Key Features
👤 Customer
Register and login securely using JWT authentication
Create delivery orders
Enter pickup and delivery addresses
Get shipping price preview before confirming an order
Track order status using a visual timeline
View previous orders
View complete price breakdown
Request rescheduling after failed delivery
Receive delivery status notifications
🚴 Delivery Agent
Login using an agent account
View assigned orders
Update delivery status
Mark deliveries as failed with a reason
Update availability
Update current location
Participate in automatic order assignment
🛡️ Admin
View and manage all orders
Manually assign or reassign delivery agents
Manage delivery zones
Manage B2B/B2C rate cards
Manage customers and delivery agents
Monitor agent availability
Monitor order status and tracking history
Override assignments when required
⚙️ Platform
JWT authentication
Role-based authorization
Dynamic shipping price calculation
Volumetric weight calculation
Intra-zone and inter-zone pricing
COD surcharge calculation
Nearest-agent auto assignment
Agent load balancing
Failed delivery and rescheduling
Email and SMS notification support
Append-only order tracking history
REST API
Jest and Supertest testing
📸 Screenshots

A few screens from the running application showing the customer, delivery agent, and admin experiences.

🔐 Login




📦 Customer — New Order




📋 Customer — My Orders




📋 Customer — Multiple Orders




🚴 Delivery Agent Dashboard




🛡️ Admin — Order Management




🏗️ System Architecture

The application follows a three-layer full-stack architecture:

Customer / Delivery Agent / Admin
              |
              v
       React Frontend
              |
              v
      Node.js + Express
              |
              v
          MongoDB
              |
              v
    Email + SMS Notifications
Request Flow
User
 |
 v
React Frontend
 |
 | REST API + JWT
 v
Node.js + Express
 |
 +-----------> MongoDB
 |
 +-----------> Email / SMS Notifications
🧮 Rate Calculation Logic

The platform uses a dynamic pricing engine to calculate delivery charges.

1. Volumetric Weight
Volumetric Weight = (Length × Width × Height) / 5000
2. Billable Weight
Billable Weight = MAX(Actual Weight, Volumetric Weight)
3. Shipping Charge

The final shipping charge is calculated using:

Base fare
Billable weight
Intra-zone rate
Inter-zone rate
COD surcharge
B2B/B2C rate card

The price is calculated on the server before an order is confirmed.

🤖 Automatic Agent Assignment

The system supports intelligent delivery-agent assignment.

Assignment Process
Find available agents in the pickup zone.
Check the agent's current location.
Calculate distance using the Haversine formula.
Select the nearest available agent.
Use active order count for load balancing.
If no agent is available in the zone, widen the search.
Assign the order and update the agent's active order count.
🔁 Failed Delivery & Rescheduling

The platform supports failed delivery handling and rescheduling.

Flow
Order
  |
  v
Assigned
  |
  v
Picked Up
  |
  v
In Transit
  |
  v
Out for Delivery
  |
  +-------> Delivered
  |
  +-------> Failed
               |
               v
          Reschedule
               |
               v
        Auto Assignment
               |
               v
        Delivery Attempt

When a delivery fails:

The failure reason is recorded.
Tracking history is updated.
The customer is notified.
The order can be rescheduled.
A delivery agent can be reassigned automatically.
🧾 Order Tracking History

Every order maintains an append-only tracking history.

Each tracking entry contains:

Order status
Timestamp
Actor who performed the action
Optional note

Example:

Created
   ↓
Assigned
   ↓
Picked Up
   ↓
In Transit
   ↓
Out for Delivery
   ↓
Delivered

This provides a complete audit trail for each shipment.

🗄️ Database Schema

The application uses MongoDB with Mongoose.

Main Collections
Collection	Purpose
User	Customers, delivery agents, and admins
Zone	Delivery zones and pincode mappings
RateCard	B2B/B2C pricing configuration
Order	Orders, charges, assignments, and tracking history
User

Stores:

Name
Email
Phone
Password hash
Role
Agent profile
Availability
Active status
Zone

Stores:

Zone name
Description
Pincodes
Areas
Active status
RateCard

Stores:

Order type
Base fare
Base weight
Intra-zone rate
Inter-zone rate
COD surcharge
Active status
Order

Stores:

Order number
Customer
Pickup address
Drop address
Pickup zone
Drop zone
Package information
Order type
Payment type
Calculated charge
Assigned agent
Assignment type
Delivery status
Failed-delivery information
Tracking history
🧰 Tech Stack
Layer	Technology
Frontend	React 18, Vite, React Router
Styling	Tailwind CSS
HTTP Client	Axios
Backend	Node.js, Express
Database	MongoDB, Mongoose
Authentication	JWT
Password Security	bcryptjs
Notifications	Nodemailer, Twilio
Security	Helmet, express-rate-limit, express-validator
Testing	Jest, Supertest
Test Database	mongodb-memory-server
Version Control	Git, GitHub
📁 Project Structure
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
│   │   ├── auth.js
│   │   ├── role.js
│   │   └── errorHandler.js
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
│   ├── 05-delivery