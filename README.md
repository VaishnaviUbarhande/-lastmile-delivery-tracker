# 📦 Last-Mile Delivery Tracker

A full-stack **MERN-based delivery management system** for managing customers, delivery agents, orders, pricing, tracking, and delivery operations.

The system supports **Customer, Delivery Agent, and Admin** roles with JWT authentication and role-based access control.

---

## 🌐 Live Demo

**Frontend:**  
https://lastmile-delivery-tracker-kyyq-8n9v49mr2-vaishnavi-0c1c.vercel.app/customer

**Backend API:**  
Add your deployed backend URL here when available.

---

## 📌 Project Overview

Last-Mile Delivery Tracker is designed to manage the complete delivery lifecycle:

**Customer creates order → Price calculated → Agent assigned → Order picked up → In transit → Out for delivery → Delivered / Failed → Rescheduled if required**

The application automatically calculates shipping charges based on package weight, dimensions, zones, order type, and payment type.

---

## ✨ Key Features

### 👤 Customer

- Register and login
- Create delivery orders
- Get live shipping price preview
- Track orders
- View order history
- View detailed price breakdown
- Track delivery status through a timeline
- Request rescheduling after failed delivery

### 🚴 Delivery Agent

- Login securely
- View assigned deliveries
- View delivery details
- Update delivery status
- Mark deliveries as failed with a reason
- Update availability
- Update current location
- Receive automatically assigned orders

### 🛡️ Admin

- View and manage all orders
- Assign or reassign delivery agents
- Manage customers and agents
- Activate/deactivate users
- Manage delivery zones
- Manage pricing/rate cards
- Monitor order status
- View assignment information
- Handle failed deliveries and rescheduling

### ⚙️ System Features

- JWT authentication
- Role-based authorization
- Automatic delivery-agent assignment
- Nearest-agent selection using Haversine distance
- Load balancing using active order count
- Dynamic shipping calculation
- Volumetric weight calculation
- COD surcharge calculation
- Immutable order tracking history
- Email notifications
- SMS notifications
- Failed-delivery and rescheduling workflow
- RESTful APIs
- MongoDB database
- Jest and Supertest testing

---

# 🏗️ System Architecture

```mermaid
flowchart LR

    Customer["👤 Customer"]
    Agent["🚴 Delivery Agent"]
    Admin["🛡️ Admin"]

    Frontend["💻 React Frontend"]

    Backend["⚙️ Node.js + Express Backend"]

    Auth["🔐 JWT Authentication"]

    Pricing["🧮 Pricing Engine"]

    Assignment["🤖 Auto Assignment"]

    Database[("🗄️ MongoDB")]

    Notification["📩 Email + SMS"]

    Customer --> Frontend
    Agent --> Frontend
    Admin --> Frontend

    Frontend --> Backend

    Backend --> Auth
    Backend --> Pricing
    Backend --> Assignment
    Backend --> Database
    Backend --> Notification

    Pricing --> Database
    Assignment --> Database