<div align="center">

# 📦 Last-Mile Delivery Tracker

### 🚚 Full-Stack MERN Delivery Management Platform

A full-stack logistics platform that helps **customers create and track deliveries, delivery agents manage shipments, and admins manage orders, pricing, zones, and assignments**.

The system automatically calculates delivery charges and intelligently assigns orders to available delivery agents.

[**🌐 Live Demo**](https://lastmile-delivery-tracker-kyyq-ks6zhgjn2-vaishnavi-0c1c.vercel.app/)

![Demo](https://img.shields.io/badge/Live-Demo-brightgreen)
![MERN](https://img.shields.io/badge/MERN-Stack-blue)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-8.5-47A248?logo=mongodb)

</div>

---

## 🎯 About the Project

**Last-Mile Delivery Tracker** is a MERN-based delivery management system designed to simplify the complete delivery lifecycle.

It provides separate dashboards for:

* 👤 **Customers** — create and track orders
* 🚴 **Delivery Agents** — manage assigned deliveries
* 🛡️ **Admins** — manage orders, agents, zones, and pricing

The platform automatically calculates shipping costs based on **package weight, dimensions, delivery zones, order type, and payment type**.

It also supports **nearest-agent auto-assignment**, delivery status tracking, failed-delivery rescheduling, and notifications.

---

## 💡 Problem Statement

Traditional delivery management requires multiple manual processes for:

* Calculating shipping charges
* Assigning delivery agents
* Tracking delivery status
* Managing failed deliveries
* Maintaining pricing and zone information

This project provides a centralized platform to automate these operations and make delivery management more efficient.

---

## 🚀 Key Features

### 👤 Customer

* Register and login securely
* Create new delivery orders
* Get **live shipping-price preview**
* View all orders
* Track delivery status using a timeline
* View complete price breakdown
* Request rescheduling after failed delivery

### 🚴 Delivery Agent

* View assigned orders
* Update delivery status
* Mark delivery as failed with a reason
* Change availability status
* Update current location
* Receive automatically reassigned orders

### 🛡️ Admin

* View all customer orders
* Assign and reassign delivery agents
* Manage delivery agents
* Manage delivery zones
* Manage B2B/B2C pricing
* Activate/deactivate users
* Monitor order status and tracking history

### ⚙️ Smart Backend Features

* 🧮 Automatic shipping-price calculation
* 📦 Volumetric and billable weight calculation
* 📍 Zone-based pricing
* 🤖 Nearest-agent auto-assignment
* ⚖️ Agent load balancing
* 🔁 Failed-delivery and rescheduling workflow
* 🧾 Complete order tracking history
* 🔐 JWT authentication and role-based authorization
* 📧 Email/SMS notification support
* ✅ Backend API testing with Jest and Supertest

---

## 🧮 Smart Pricing System

The application calculates shipping charges automatically.

### Volumetric Weight

```text
Volumetric Weight = (Length × Width × Height) / 5000
```

### Billable Weight

```text
Billable Weight =
MAX(Actual Weight, Volumetric Weight)
```

The final price depends on:

```text
Base Fare
+ Weight Charge
+ COD Surcharge
```

Pricing is stored in the database through **Rate Cards**, so administrators can change prices without modifying the source code.

---

## 🤖 Smart Delivery Agent Assignment

When an order is created, the backend automatically searches for available delivery agents.

The system considers:

1. Agent availability
2. Pickup zone
3. Distance from pickup location
4. Current number of active deliveries

The nearest suitable agent is selected while also considering workload.

If no agent is available in the pickup zone, the system expands the search to other available agents.

---

## 🔄 Delivery Lifecycle

```text
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
```

If delivery fails:

```text
Failed
   ↓
Reschedule
   ↓
Reassignment
   ↓
Delivery Attempt
```

Every status change is stored in the order's tracking history.

---

## 🏗️ System Architecture

```text
┌──────────────────────┐
│      React Frontend  │
│ Customer / Agent /   │
│ Admin Dashboards     │
└──────────┬───────────┘
           │ REST API
           │ JWT Auth
           ▼
┌──────────────────────┐
│ Node.js + Express    │
│ Business Logic       │
│ Pricing              │
│ Assignment           │
│ Authentication       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│       MongoDB        │
│ Users                │
│ Orders               │
│ Zones                │
│ Rate Cards           │
└──────────────────────┘
```

---

## 🛠️ Tech Stack

| Category              | Technologies                               |
| --------------------- | ------------------------------------------ |
| **Frontend**          | React.js, Vite, Tailwind CSS, React Router |
| **Backend**           | Node.js, Express.js                        |
| **Database**          | MongoDB, Mongoose                          |
| **Authentication**    | JWT, bcryptjs                              |
| **API Communication** | Axios, REST APIs                           |
| **Notifications**     | Nodemailer, Twilio                         |
| **Security**          | Helmet, Rate Limiting, Express Validator   |
| **Testing**           | Jest, Supertest, MongoDB Memory Server     |
| **Deployment**        | Vercel, Render/Railway, MongoDB Atlas      |
| **Version Control**   | Git, GitHub                                |

---

## 📸 Screenshots

A few screens from the running application:

| **Login Page**                               | **Customer — New Order**                                     |
| -------------------------------------------- | ------------------------------------------------------------ |
| ![Login Page](screenshots/01-login-page.png) | ![Customer New Order](screenshots/02-customer-new-order.png) |

| **Customer — My Orders**                                     | **Customer — Multiple Orders**                                              |
| ------------------------------------------------------------ | --------------------------------------------------------------------------- |
| ![Customer My Orders](screenshots/03-customer-my-orders.png) | ![Customer Multiple Orders](screenshots/04-customer-my-orders-multiple.png) |

| **Delivery Agent Dashboard**                                             | **Admin — Order Management**                                         |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| ![Delivery Agent Dashboard](screenshots/05-delivery-agent-dashboard.png) | ![Admin Order Management](screenshots/06-admin-order-management.png) |

---

## 🔐 Demo Accounts

| Role        | Email                      | Password         |
| ----------- | -------------------------- | ---------------- |
| 🛡️ Admin   | `admin@lastmile.com`       | `Admin@12345`    |
| 🚴 Agent    | `ravi.agent@lastmile.com`  | `Agent@12345`    |
| 🚴 Agent    | `priya.agent@lastmile.com` | `Agent@12345`    |
| 👤 Customer | `customer@lastmile.com`    | `Customer@12345` |

**Live Application:**
https://lastmile-delivery-tracker-kyyq-ks6zhgjn2-vaishnavi-0c1c.vercel.app/

---

## 📁 Project Structure

```text
lastmile-delivery-tracker/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── seed/
│   ├── tests/
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   └── pages/
│   └── package.json
│
├── screenshots/
├── SYSTEM_DESIGN.md
├── API_DOCUMENTATION.md
└── README.md
```

---

## ▶️ Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/VaishnaviUbarhande/-lastmile-delivery-tracker.git
cd -lastmile-delivery-tracker
```

### 2. Start Backend

```bash
cd backend
npm install
npm run seed
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

### 3. Start Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

## 🧪 Testing

Backend tests can be executed using:

```bash
cd backend
npm test
```

The project includes tests for:

* Pricing calculations
* Order creation
* Agent assignment
* Delivery status updates
* Failed delivery
* Rescheduling
* Order lifecycle

---

## 🔒 Security

The application implements:

* JWT-based authentication
* Password hashing using bcrypt
* Role-based authorization
* Protected API routes
* Request rate limiting
* Helmet security headers
* Server-side price validation
* Environment-variable based secrets

---

## 📚 Documentation

For detailed technical information:

* [`SYSTEM_DESIGN.md`](SYSTEM_DESIGN.md) — System architecture and design
* [`API_DOCUMENTATION.md`](API_DOCUMENTATION.md) — REST API documentation

---

## 🌐 Live Demo

### 🚀 Try the application

**[Open Last-Mile Delivery Tracker →](https://lastmile-delivery-tracker-kyyq-ks6zhgjn2-vaishnavi-0c1c.vercel.app/)**

---

<div align="center">

### Built with ❤️ using the MERN Stack

**React • Node.js • Express • MongoDB**

</div>
