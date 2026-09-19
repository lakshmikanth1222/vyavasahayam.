# VyavaSahayam – AI & Decision-Support Services

## 1. Freshness Computer Vision Screening Layer
- **Input**: Harvest produce photograph, harvest timestamp, IoT temperature/humidity.
- **Preprocessing**: Image normalization, color space conversion (RGB to HSV/LAB), texture defect vector detection.
- **Output**:
  - Produce Identification
  - Quality Grade (`GRADE_A`, `GRADE_B`, `GRADE_C`, `REJECTED`)
  - Freshness Score (0 to 100)
  - Estimated Shelf-Life (Days)
  - Spoilage Risk (%)
  - Visible Defect Analysis
- **Execution**: Deterministic mock simulation for development with seamless hot-swap interface for PyTorch/OpenCV models.

---

## 2. B2B Multi-Factor Matching Algorithm
Transparent matching equation evaluating:
$$\text{Match Score} = (0.20 \times \text{Qty}) + (0.20 \times \text{Grade}) + (0.25 \times \text{Price}) + (0.20 \times \text{Proximity}) + (0.15 \times \text{Freshness})$$

All matching outcomes present an **Explainable Reason Breakdown** to the procurement officer.

---

## 3. Dhenu AI Agricultural Assistant
- Domain-tuned assistant providing contextual advice for:
  - Real-time Mandi market rates
  - Pest and fungal prevention
  - Government agricultural schemes (PM-KISAN, AIF, Rythu Bharosa)
  - Optimal harvest times and crop rotation

---

## 4. Multilingual Farmer Voice IVR Service
- Interactive telephone flow supporting **Telugu (`te`)**, **Hindi (`hi`)**, and **English (`en`)** for voice produce listing and order status check without requiring a smartphone.
