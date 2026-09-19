# VyavaSahayam – REST API Documentation

Base URL: `/api/v1`

## 1. Authentication (`/auth`)
- `POST /auth/register/farmer`: Register farmer with land/crops/FPO data.
- `POST /auth/register/buyer`: Register B2B buyer with procurement specs.
- `POST /auth/register/consumer`: Register B2C consumer with delivery address.
- `POST /auth/login`: Issue JWT access and refresh tokens.
- `GET /auth/me`: Current user session and profile details.
- `GET /auth/demo-accounts`: Pre-seeded demo account credentials for 1-click testing.

## 2. Farmer Endpoints (`/farmers`)
- `GET /farmers/listings`: List farmer's produce listings.
- `POST /farmers/listings`: Create new harvest listing, trigger AI screening, activate Digital Twin.
- `POST /farmers/screen-image`: Run AI computer vision screening on produce photo.
- `GET /farmers/orders`: View purchase orders assigned to farmer.
- `GET /farmers/earnings`: Financial ledger with gross sales, deductions, and net payouts.
- `GET /farmers/recommendations`: Seasonal crop and demand recommendations.

## 3. B2B Buyer Endpoints (`/buyers`)
- `GET /buyers/marketplace`: Filterable bulk produce listings.
- `POST /buyers/demand-requests`: Post procurement requirement.
- `GET /buyers/demand-requests`: List buyer's active requirements.
- `GET /buyers/demand-requests/:id/matches`: Algorithmic supplier matches with transparent breakdown.
- `POST /buyers/orders`: Place B2B procurement order with Escrow hold.

## 4. B2C Consumer Endpoints (`/consumers`)
- `GET /consumers/products`: Fresh retail catalog.
- `POST /consumers/cart/calculate`: Calculate subtotal and delivery threshold.
- `POST /consumers/orders`: Place order with trust-controlled COD or Escrow.
- `GET /consumers/orders`: List consumer orders.
- `POST /consumers/orders/:id/confirm-delivery`: Confirm delivery to release farmer payout.
- `POST /consumers/orders/:id/feedback`: Rate freshness and quality.

## 5. Quality & Traceability (`/quality`)
- `GET /quality/batches`: List all produce batches and current stages.
- `GET /quality/batches/:id/traceability`: Complete milestone audit trail.
- `POST /quality/inspect`: Record quality grading (A/B/C/Rejected) and weighing.

## 6. Rescue Engine (`/rescue`)
- `GET /rescue/events`: List active and historical rescue incidents.
- `POST /rescue/trigger`: Trigger Rescue Engine evaluation.
- `POST /rescue/execute`: Execute chosen route (Buyer Switching, Solar Drying, Processing, Composting).

## 7. Solar Drying (`/solar-drying`)
- `GET /solar-drying/centres`: Solar drying facilities.
- `GET /solar-drying/batches`: Active drying batches.
- `POST /solar-drying/batches`: Initiate new drying batch.
- `PATCH /solar-drying/batches/:id/status`: Update drying stage and moisture.
- `GET /solar-drying/inventory`: Value-added dried product SKUs.

## 8. Escrow Payments (`/escrow`)
- `GET /escrow/transactions`: Full Escrow ledger.
- `POST /escrow/dispute`: Raise buyer dispute.
- `POST /escrow/resolve`: Admin dispute arbitration (Release / Partial / Full Refund).

## 9. AI & Voice (`/ai`, `/voice`)
- `POST /ai/dhenu/query`: Dhenu Agricultural AI queries.
- `POST /voice/ivr`: Multilingual farmer voice IVR simulation.
