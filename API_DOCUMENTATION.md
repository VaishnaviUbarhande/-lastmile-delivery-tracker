# API Documentation — Last-Mile Delivery Tracker

Base URL (local): `http://localhost:5000/api`

All protected routes require header: `Authorization: Bearer <JWT>`

Response envelope (success): `{ "success": true, "data": ... }`
Response envelope (error): `{ "success": false, "message": "..." }`

---

## Auth

### `POST /auth/register`
Public. Registers a new **customer** account.

Body:
```json
{ "name": "Jane Doe", "email": "jane@example.com", "password": "secret123", "phone": "+919000000000" }
```
Response `201`: `{ data: { id, name, email, role: "customer", token } }`

### `POST /auth/login`
Public. Logs in any role (customer/agent/admin).

Body: `{ "email": "...", "password": "..." }`
Response `200`: `{ data: { id, name, email, role, token } }`

### `GET /auth/me`
Private. Returns the current authenticated user.

---

## Zones (admin-configurable)

### `GET /zones`
Private (any role). Lists all zones.

### `GET /zones/:id`
Private. Get one zone.

### `POST /zones` — admin only
```json
{ "name": "Zone North", "description": "...", "pincodes": ["110001","110002"], "areas": ["Delhi"] }
```
Fails with `400` if any pincode is already mapped to another active zone.

### `PUT /zones/:id` — admin only
Partial update; same conflict check on `pincodes`.

### `DELETE /zones/:id` — admin only
Soft-delete (`isActive = false`).

---

## Rate Cards (admin-configurable, no hardcoding)

### `GET /rate-cards`
Private. Lists all rate cards (B2B, B2C).

### `POST /rate-cards` — admin only
Upserts (creates or replaces) the rate card for an `orderType`.
```json
{
  "orderType": "B2C",
  "baseFare": 40,
  "baseWeightKg": 0.5,
  "perKgIntraZone": 15,
  "perKgInterZone": 25,
  "codSurchargeType": "flat",
  "codSurchargeValue": 20
}
```

---

## Users / Agents (admin-managed)

### `GET /users?role=agent` — admin only
Lists users, optionally filtered by role (`customer`, `agent`, `admin`).

### `POST /users` — admin only
Creates an agent or admin account (customers self-register via `/auth/register`).
```json
{ "name": "Agent A", "email": "a@x.com", "password": "secret123", "phone": "+91...", "role": "agent", "zone": "<zoneId>" }
```

### `PUT /users/:id/agent-profile` — admin or the agent themself
Updates availability and/or current location.
```json
{ "isAvailable": true, "lat": 28.61, "lng": 77.20 }
```

### `PUT /users/:id/active` — admin only
Activates/deactivates any user account. Body: `{ "isActive": false }`

---

## Orders

### `POST /orders/preview` — customer or admin
Computes and returns the price **without** creating an order.
```json
{
  "pickupAddress": { "pincode": "110001", "city": "Delhi" },
  "dropAddress": { "pincode": "560001", "city": "Bengaluru" },
  "dimensions": { "lengthCm": 30, "breadthCm": 20, "heightCm": 10, "actualWeightKg": 2 },
  "orderType": "B2C",
  "paymentType": "COD"
}
```
Response `200`:
```json
{
  "data": {
    "pickupZone": { "id": "...", "name": "North" },
    "dropZone": { "id": "...", "name": "South" },
    "isIntraZone": false,
    "volumetricWeightKg": 1.2,
    "billableWeightKg": 2,
    "charge": { "baseFare": 40, "weightCharge": 37.5, "codSurcharge": 20, "totalCharge": 97.5, ... }
  }
}
```

### `POST /orders` — customer or admin
Creates the order. Same body as `/preview`, plus (for admin on behalf of a customer)
`"customerId": "<userId>"`, and (for COD) `"codAmount": 500`.
Recomputes price server-side (never trusts a client-supplied price).

### `GET /orders?status=&zone=&agent=&page=&limit=`
Role-scoped: customers see only their own orders, agents see only orders assigned to them,
admins see everything and can filter by `status`, `zone` (matches pickup or drop), and `agent`.

### `GET /orders/:id`
Returns the full order including `trackingHistory`. Accessible to the owning customer, the
assigned agent, or any admin.

### `PUT /orders/:id/assign` — admin only
Manually assigns a specific agent. Body: `{ "agentId": "..." }`

### `PUT /orders/:id/auto-assign` — admin only
Triggers the nearest-available-agent engine. No body required.

### `PUT /orders/:id/status` — agent (must be assigned) or admin
Advances the order through its lifecycle. Body: `{ "status": "Picked Up", "reason": "" }`
Valid statuses: `Picked Up`, `In Transit`, `Out for Delivery`, `Delivered`, `Failed`.
Invalid transitions (e.g. skipping states) return `400`.

### `PUT /orders/:id/reschedule` — customer (owner) or admin
Only valid when order status is `Failed`. Body: `{ "rescheduledDate": "2026-08-25" }`
Moves status to `Rescheduled` and auto-reassigns an agent for the new attempt.

### `PUT /orders/:id/override` — admin only
Forces the order to any valid status with an audit note. Body:
`{ "status": "Delivered", "note": "Confirmed via phone call" }`

---

## Order Status Lifecycle

```
Created → Assigned → Picked Up → In Transit → Out for Delivery → Delivered
                                        ↳ Failed → Rescheduled → Assigned → ...
Any state (via admin) → Cancelled
```

Every transition appends an entry to `trackingHistory`: `{ status, actor: {id, role, name}, note, timestamp }`.
This array is append-only and is the source of truth for both the customer tracking UI and audit review.
