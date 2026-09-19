# 🌱 VyavaSahayam – Fresh Farm-to-Customer Agricultural Marketplace

> Production-oriented agricultural web platform connecting Farmers & FPOs directly with B2B buyers and B2C consumers while reducing intermediaries, post-harvest losses, and spoilage through **Rythu Bazar local fulfillment**, **AI Freshness Computer Vision screening**, **Freshness Digital Twins**, **Escrow payouts**, and a **Multi-Tier Rescue Engine with Solar Drying Value-Addition**.

---

## 🌟 Key Features

1. **Role-Based Access Control (7 Roles)**:
   - Farmer, B2B Buyer, B2C Consumer, Admin, Rythu Bazar Operator, Delivery Fleet, Warehouse Staff.
   - Built-in **1-Click Live Demo Role Switcher** for instant testing across all roles.

2. **Rythu Bazar Local Fulfillment Model**:
   - Direct aggregation from local villages into regional Rythu Bazar hubs.
   - Standardized Grade A/B/C/Rejected electronic inspection, weighing, and cold-chain packing.

3. **AI Freshness Computer Vision & Freshness Digital Twins**:
   - Automated quality screening: Freshness Score (0–100), Grade assignment, spoilage risk %, defect analysis.
   - Continuous decay curve monitoring with dynamic discount triggers (10% / 25% OFF).

4. **Multi-Tier Rescue Engine & Solar Drying**:
   - Autonomous diversion when orders cancel or transit fails:
     1. *Buyer Switching*
     2. *Agro-Processing*
     3. *Solar Drying Value-Addition* (Converts fresh tomatoes & chillies to vacuum-sealed dried flakes with 10:1 yield recovery)
     4. *Cold Storage Buffer*
     5. *Safe Cattle Feed* (Strictly blocked if rotten or contaminated)
     6. *Waste-to-Value Biomethanation*

5. **Escrow Payment & Farmer Protection**:
   - Buyer payments held safely until delivery and quality verification.
   - Automatic net payout release to farmer bank ledger with configurable 3% insurance policy cover.

6. **Farmer Voice IVR & Dhenu AI Assistant**:
   - Multilingual phone simulator in Telugu (`te`), Hindi (`hi`), and English (`en`).
   - Interactive Dhenu AI assistant for market rates, pest advisory, and government schemes.

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Start the Backend API
```bash
cd backend
pip install -r requirements.txt email-validator
python main.py
```
- API is live at: `http://localhost:8000`
- Interactive Swagger Docs: `http://localhost:8000/docs`

### 2. Start the Frontend Application
```bash
cd frontend
npm install
npm run dev
```
- Web Application is live at: `http://localhost:5173`

---

## 🧪 Automated Testing
Run the backend pytest test suite (verifies Auth, RBAC, B2B Multi-factor Matching, Rescue Safety Biocontainment rules, and Escrow state transitions):
```bash
cd backend
pytest -v
```

---

## 🔑 Pre-Seeded Demo Credentials

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Farmer / FPO** | `farmer@vyavasahayam.org` | `password123` | Apparao Naidu (Gannavaram, 500kg Tomatoes) |
| **B2B Buyer** | `buyer@vyavasahayam.org` | `password123` | Mega Mart Supermarkets Procurement |
| **B2C Consumer** | `consumer@vyavasahayam.org` | `password123` | Sunitha Reddy (Vijayawada Household) |
| **Admin** | `admin@vyavasahayam.org` | `password123` | Master Operations & Loss Telemetry |
| **Rythu Bazar** | `rythubazar@vyavasahayam.org` | `password123` | Ramesh Varma (Gannavaram Local Hub) |
| **Delivery Fleet** | `delivery@vyavasahayam.org` | `password123` | Srinivas Express Logistics |

---

## 🐳 Docker Deployment
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
