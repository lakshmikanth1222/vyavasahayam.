# VyavaSahayam – System Architecture & Technical Design

## 1. Overview
**VyavaSahayam** is a full-stack agricultural marketplace platform built to connect farmers/FPOs directly with B2B wholesale buyers and B2C consumers while eliminating unnecessary intermediaries, preventing post-harvest losses, and converting near-expiry surplus harvests into shelf-stable value-added products.

```
                               ┌────────────────────────────────────────┐
                               │  VyavaSahayam Frontend (React + Vite)  │
                               │  Tailwind CSS, Lucide, Digital Twins   │
                               └──────────────────┬─────────────────────┘
                                                  │ REST API / JWT / RBAC
                                                  ▼
                               ┌────────────────────────────────────────┐
                               │     FastAPI Core Application Service   │
                               ├────────────────────────────────────────┤
                               │ • Auth & RBAC (7 Roles)                │
                               │ • Farmer Listings & Digital Twin       │
                               │ • B2B Matcher & Demand Forecasting     │
                               │ • B2C Marketplace & Controlled COD     │
                               │ • Rythu Bazar Local Fulfillment        │
                               │ • Quality Inspection & Traceability    │
                               │ • Multi-Tier Rescue Engine             │
                               │ • Solar Drying Value-Addition Module   │
                               │ • Escrow Payment & Payout Machine      │
                               │ • Dhenu AI & Multilingual Voice IVR    │
                               │ • Admin Analytics & System Config      │
                               └──────────────────┬─────────────────────┘
                                                  │
                 ┌────────────────────────────────┼────────────────────────────────┐
                 ▼                                ▼                                ▼
    ┌────────────────────────┐      ┌───────────────────────────┐     ┌────────────────────────┐
    │ Database (PostgreSQL / │      │ AI Services (Freshness    │     │ Mock Integrations Hub  │
    │ SQLite ORM)            │      │ CV, OpenCV, PyTorch mock) │     │ (Razorpay, Maps, SMS,  │
    │ SQLAlchemy 2.0 Models  │      │ Digital Twin Life Cycle   │     │ Voice, Dhenu, Notifs)  │
    └────────────────────────┘      └───────────────────────────┘     └────────────────────────┘
```

---

## 2. Core Architectural Pillars

### A. Role-Based Access Control (RBAC)
Enforced at both backend API dependency layers and frontend routing:
1. **FARMER**: Produce onboarding, AI freshness screening, harvest listings, orders, bank payout ledger, crop recommendations, voice telephony.
2. **BUYER_B2B**: Bulk requirements posting, transparent AI multi-factor matching, wholesale orders, escrow deposit.
3. **CONSUMER_B2C**: Fresh retail catalog, cart with free-delivery threshold calculator, checkout with trust-controlled COD, delivery confirmation, freshness rating.
4. **COLLECTION_CENTER / RYTHU_BAZAR**: Incoming produce receiving, electronic weighing, sorting, standardized grading (A/B/C/Rejected), cold packing.
5. **DELIVERY_PARTNER**: Route dispatch, in-transit cold telematics, proof of delivery.
6. **ADMIN**: Full executive telemetry, post-harvest loss prevention KPIs, Rescue Engine dispatch, solar drying facility management, escrow dispute arbitration, policy configuration.

### B. Freshness Digital Twin Lifecycle
Continuous algorithmic representation of every produce batch:
- **FRESH** (Score 85–100): Full market price.
- **MEDIUM_FRESH** (Score 70–84): Full market price, standard retail distribution.
- **USE_SOON** (Score 50–69): Automated Tier 1 Dynamic Discount (10% OFF).
- **AT_RISK** (Score 35–49): Automated Tier 2 Rescue Clearance (25% OFF) or Solar Drying Route.
- **NOT_FOR_SALE** (Score < 35): Discarded from food/feed; routed to Waste-to-Value Biomethanation.
