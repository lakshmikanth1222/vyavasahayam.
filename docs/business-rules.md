# VyavaSahayam – Business Rules & Domain Policies

This document formalizes the centralized backend business logic enforced by VyavaSahayam.

---

## 1. Food Safety & Biocontainment Safety Gate
> **CRITICAL RULE**: Unsafe, rotten, mouldy, or chemically contaminated produce is **STRICTLY FORBIDDEN** from entering:
> 1. Human food markets (B2C or B2B)
> 2. Value-added food processing & Solar Drying
> 3. Animal/Cattle feed channels
>
> Contaminated or spoiled batches are automatically restricted to **Waste-to-Value Biomethanation and Aerobic Composting**.

---

## 2. Escrow Payment State Machine
To guarantee trust between urban buyers and rural farmers:
1. **Order Placed**: Buyer payment is collected and stored in the **VyavaSahayam Escrow Account** (`HELD` state).
2. **Local Hub Sorting & Dispatch**: Rythu Bazar grades, packs, and dispatches the produce batch.
3. **Delivery & Customer Verification**: Buyer receives produce and verifies physical freshness.
4. **Payout Settlement**: Buyer confirmation releases the held escrow (`RELEASED` state).
5. **Deductions Ledger**:
   $$\text{Net Farmer Payout} = \text{Gross Sale} - \text{Transport} - \text{Platform Fee (2\%)} - \text{Insurance (3\% if enabled)}$$
6. **Disputes**: If quality is defective upon arrival, Admin resolves via **Full Refund**, **Partial Refund**, or **Full Farmer Release**.

---

## 3. Dynamic Freshness Discounting & Shelf-Life Timer
For short-shelf-life vegetables (Tomatoes, leafy greens):
- **>50% Shelf-Life Remaining**: Standard asking price.
- **25%–50% Shelf-Life Remaining**: Tier 1 Dynamic Discount (10% OFF).
- **<25% Shelf-Life Remaining**: Tier 2 Rescue Clearance (25% OFF) or automated diversion to Solar Drying.

---

## 4. Controlled Cash on Delivery (COD) Trust Rules
- Available for verified consumers with a **Trust Score $\ge 50$**.
- Repeated cancellations or failed deliveries decrease the trust score and temporarily restrict COD payment mode, prompting Online Escrow checkout.

---

## 5. Free Delivery Threshold
- Configurable minimum order value (Default: ₹500.00).
- Subtotal $\ge$ ₹500.00: ₹0 Delivery Fee.
- Subtotal $<$ ₹500.00: ₹40.00 Standard Delivery Fee.
