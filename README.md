<div align="center">

# 📦 Last-Mile Delivery Tracker

A full-stack **MERN** delivery management platform — customers and admins create orders with
auto-calculated shipping charges, agents are assigned intelligently (manual or
nearest-available auto-assignment), and customers get notified by email/SMS at every status
change.

[![🚀 Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Open_App-brightgreen?style=for-the-badge)](https://lastmile-delivery-tracker-kyyq-ks6zhgjn2-vaishnavi-0c1c.vercel.app/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://lastmile-delivery-tracker-kyyq-ks6zhgjn2-vaishnavi-0c1c.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/VaishnaviUbarhande/-lastmile-delivery-tracker)

<br/>

![Node](https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/react-18.3-61DAFB?logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/mongodb-8.5-47A248?logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/express-4.19-000000?logo=express&logoColor=white)
![Tailwind](https://img.shields.io/badge/tailwind-3.4-06B6D4?logo=tailwindcss&logoColor=white)
![JWT](https://img.shields.io/badge/auth-JWT-000000?logo=jsonwebtokens&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)
![Status](https://img.shields.io/badge/status-active-success)

**[🚀 Live App](#-live-app) · [✨ Features](#-features) · [🏗 Architecture](#-architecture) · [🗄 Database Schema](#-database-schema) · [⚙️ Environment Variables](#️-environment-variables) · [🚀 Local Setup](#-local-setup)**

</div>

---

## 🚀 Live App

### 🌐 Deployed Application

**[👉 Open Last-Mile Delivery Tracker](https://lastmile-delivery-tracker-kyyq-ks6zhgjn2-vaishnavi-0c1c.vercel.app/)**

The application is deployed on **Vercel**.

---

## 📸 Screenshots

### Login

![Login](screenshots/01-login-page.png)

### Customer — New Order

![Customer New Order](screenshots/02-customer-new-order.png)

### Customer — My Orders

![Customer My Orders](screenshots/03-customer-my-orders.png)

### Customer — Multiple Orders

![Customer Multiple Orders](screenshots/04-customer-my-orders-multiple.png)

### Delivery Agent Dashboard

![Delivery Agent Dashboard](screenshots/05-delivery-agent-dashboard.png)

### Admin — Order Management

![Admin Order Management](screenshots/06-admin-order-management.png)

---

## ✨ Features

### 👤 Customer

- Register/login with JWT-based authentication
- Create an order with live shipping-price preview
- Track order status through a visual timeline
- View previous orders
- View detailed price breakdown
- Request a reschedule after a failed delivery attempt
- Receive email/SMS notifications for order status changes

### 🚴 Delivery Agent

- View orders assigned to them
- Update order status
- Follow a validated delivery status workflow
- Mark delivery as failed with a reason
- Toggle availability
- Update current location
- Automatically receive orders through the assignment system

### 🛡️ Admin

- View and manage all orders
- Manually assign/reassign delivery agents
- Manage delivery zones
- Manage B2B and B2C rate cards
- Manage customers and delivery agents
- Activate/deactivate users
- Monitor automatic agent assignment

### ⚙️ Platform-wide

- 🧮 Dynamic shipping-price calculation
- 📦 Volumetric and billable weight calculation
- 🤖 Smart automatic delivery-agent assignment
- 📍 Zone-based delivery management
- 🔁 Failed-delivery and reschedule workflow
- 🧾 Append-only tracking history
- 📧 Email notifications using Nodemailer
- 📱 SMS notifications using Twilio
- 🔒 JWT authentication
- 🛡️ Role-based access control
- ✅ Jest and Supertest testing
- 🗄️ MongoDB database

---

## 🏗 Architecture

```mermaid
flowchart LR

    CUSTOMER["👤 Customer"]
    AGENT["🚴 Delivery Agent"]
    ADMIN["🛡️ Admin"]

    FRONTEND["🌐 React + Vite Frontend<br/>Vercel"]

    API["⚙️ Node.js + Express API"]

    AUTH["🔐 JWT Authentication<br/>Role-Based Authorization"]

    ORDERS["📦 Order Management"]

    PRICING["🧮 Pricing Engine"]

    ZONES["📍 Zone Detection"]

    ASSIGN["🤖 Auto Assignment"]

    NOTIFY["🔔 Notification Service"]

    DB[("🗄️ MongoDB Atlas")]

    EMAIL["📧 Email<br/>Nodemailer / SMTP"]

    SMS["📱 SMS<br/>Twilio"]

    CUSTOMER --> FRONTEND
    AGENT --> FRONTEND
    ADMIN --> FRONTEND

    FRONTEND --> API

    API --> AUTH

    AUTH --> ORDERS
    AUTH --> PRICING
    AUTH --> ZONES
    AUTH --> ASSIGN

    ORDERS --> PRICING
    ORDERS --> ZONES
    ORDERS --> ASSIGN
    ORDERS --> NOTIFY

    ORDERS --> DB
    PRICING --> DB
    ZONES --> DB
    ASSIGN --> DB

    NOTIFY --> EMAIL
    NOTIFY --> SMS
