# System Design — Last-Mile Delivery Tracker

## 1. Overview

The system is a role-based (Customer / Delivery Agent / Admin) REST application built on
Express + MongoDB, with a React SPA frontend. The design goal was that **no pricing, zone, or
assignment rule is hardcoded** — all of it lives in the database and is editable by an admin at
runtime. Four subsystems carry most of the design weight: the rate calculation engine, zone
detection, agent auto-assignment, and the failed-delivery/reschedule flow. Each is implemented as
an isolated, pure(ish) module under `backend/utils/`, independent of the HTTP layer, so it can be
unit-tested and reused between the price-preview endpoint and the order-creation endpoint without
duplicating logic (and without risking the previewed price ever drifting from the charged price).

## 2. Rate Calculation Engine

Pricing is deliberately split into two collections: `Zone` (a pincode → zone name mapping) and
`RateCard` (one active document per `orderType`, holding `baseFare`, `baseWeightKg`,
`perKgIntraZone`, `perKgInterZone`, and a COD surcharge rule). This separation means an admin can
change a price by editing a document, never by editing code or redeploying.

The calculation itself is a strict pipeline in `rateCalculator.js`:

1. **Volumetric weight** = `(L × B × H in cm) / 5000`, the industry-standard courier divisor.
2. **Billable weight** = `max(actualWeightKg, volumetricWeightKg)` — this protects the platform
   from underpricing large, light packages (e.g. a bulky but empty box).
3. The **active rate card** for the order's `orderType` (B2B/B2C) is fetched. If none exists, the
   engine throws a 422 rather than silently defaulting to zero — an unconfigured rate card is
   treated as a data-integrity error, not a free shipment.
4. **Zone comparison**: pickup and drop zone IDs are compared for equality to decide intra- vs
   inter-zone. This is a simple ObjectId equality check, but it's what makes the whole B2B/B2C ×
   intra/inter matrix (4 effective rate tiers) fall out of two numbers per rate card instead of
   four hardcoded constants.
5. **Weight charge** = `max(0, billableWeight - baseWeightKg) × perKgRate`. The `baseWeightKg`
   threshold means small/light shipments are covered entirely by the flat `baseFare`, mirroring
   how most courier pricing actually works.
6. **COD surcharge**, applied only when `paymentType === 'COD'`, supports both a flat fee and a
   percentage of the freight subtotal, decided by `codSurchargeType` on the rate card.

Crucially, `Order.charge` stores a **frozen snapshot** of this breakdown (`baseFare`,
`weightCharge`, `codSurcharge`, `totalCharge`, and a reference to which `RateCard` document was
used) at creation time. If an admin changes rates next week, historical orders are unaffected —
only new orders read the new rate card. This is a standard defensive pattern for anything
resembling a billing record.

## 3. Zone Detection

Zone detection (`zoneDetector.js`) is a lookup, not a computation: given an address, it queries
`Zone.findOne({ pincodes: address.pincode })`, falling back to a case-insensitive match on
`areas` (city name) if no pincode is mapped. This keeps the detection logic trivial and pushes all
the actual geographic knowledge into admin-managed data, which is the only sustainable approach
given that pincode-to-zone mappings change over time and vary per deployment/region. The
`Zone` controller enforces that a pincode can only belong to one *active* zone at a time (checked
on create/update), preventing ambiguous zone assignment. If a pincode has no mapping at all, order
creation fails fast with a clear error telling the admin exactly which pincode needs mapping,
rather than guessing or defaulting to a zone (which would silently mis-price the order).

## 4. Auto-Assignment Logic

`autoAssign.js` implements nearest-available-agent selection in three tiers:

1. Filter to agents where `agentProfile.isAvailable = true` **and** `agentProfile.zone` matches
   the order's pickup zone — the natural first candidate pool, since agents typically operate
   locally.
2. If any candidates report a `currentLocation`, rank by Haversine (great-circle) distance to the
   pickup address; ties (or agents with no location) fall back to whichever has the lowest
   `activeOrderCount`, a simple load-balancing signal that prevents one agent from being
   repeatedly slammed while a peer sits idle.
3. If **zero** agents are available in the pickup zone, the pool widens to *all* available agents
   system-wide rather than leaving the order unassignable — availability is prioritized over
   strict zone adherence, and the response flags `widenedSearch: true` so the admin dashboard can
   surface that as a soft warning (e.g. "consider hiring more agents in this zone").

`activeOrderCount` is incremented on assignment and decremented on delivery/reassignment,
functioning as a lightweight real-time load counter without needing a separate aggregation query
per assignment decision.

## 5. Failed Delivery Handling

Order status is governed by an explicit state machine (`STATUS_TRANSITIONS` in
`orderController.js`) so an agent cannot, say, jump straight from `Assigned` to `Delivered`. On a
`Failed` transition, the order records `reason`, `failedAt`, and the `previousAgent`, and the
customer is notified. The customer (or admin) can then call the reschedule endpoint with a new
date; this both moves the order to `Rescheduled` **and** immediately re-invokes the same
auto-assignment engine used for fresh orders, so a failed attempt gets a real second agent
assignment rather than just a status flag. Every one of these transitions — including the
reschedule and reassignment — appends to `Order.trackingHistory`, an array that is only ever
pushed to, never mutated, giving a durable, timestamped, actor-attributed audit trail across the
whole order lifecycle, which is what both the customer-facing timeline UI and the admin override
tooling read from directly.
