# VyavaSahayam – Deployment Guide

## 1. Local Development (Zero-Cost MOCK Mode)

### Backend:
```bash
cd backend
pip install -r requirements.txt
python main.py
```
Backend API will start at `http://localhost:8000` with interactive docs at `http://localhost:8000/docs`.

### Frontend:
```bash
cd frontend
npm install
npm run dev
```
Frontend application will start at `http://localhost:5173`.

---

## 2. Docker & Containerized Deployment

To start all services (PostgreSQL database, Redis, FastAPI backend, and Nginx React frontend):
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- PostgreSQL: `localhost:5432`

---

## 3. Environment Flags
Configure in `.env` or Docker environment variables:
- `MOCK_AI=true`: Zero-cost deterministic Computer Vision screening.
- `MOCK_PAYMENT=true`: Simulated Escrow state machine.
- `MOCK_VOICE=true`: Multilingual Voice IVR telephony simulation.
- `MOCK_DHENU=true`: Domain-tuned agricultural AI advisory.
- `DATABASE_URL`: `sqlite:///./vyavasahayam.db` or `postgresql://user:pass@host:5432/dbname`.
