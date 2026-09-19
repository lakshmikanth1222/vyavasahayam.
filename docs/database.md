# VyavaSahayam – Database Schema Design

Normalized PostgreSQL / SQLite Schema with SQLAlchemy 2.0 ORM.

## Key Tables
1. `users`: Authentication, credentials, assigned role (`FARMER`, `BUYER_B2B`, `CONSUMER_B2C`, `ADMIN`, `COLLECTION_CENTER`, `DELIVERY_PARTNER`), language preferences.
2. `farmer_profiles`: Village, district, land size, crops grown, bank details, FPO affiliation.
3. `buyer_profiles`: Organization name, contact, type, max budget, delivery coordinates.
4. `consumer_profiles`: Default delivery address, COD trust score, COD eligibility status.
5. `products`: Master product definitions, drying suitability flags, default shelf-lives.
6. `product_listings`: Farm listings, asking prices, AI freshness screening results, IoT telematics.
7. `produce_batches`: Immutable batch codes (`BATCH-2026-TOM-001`), current stages, freshness category.
8. `freshness_digital_twins`: Real-time decay tracking, remaining shelf-life, dynamic discount suggestions.
9. `quality_checks`: Multi-point audit log (`FARMER_PICKUP`, `COLLECTION_CENTRE`, `WAREHOUSE_RECEIVING`, `FINAL_PACKING`).
10. `collection_centres`: Physical Rythu Bazar fulfillment hubs, capacity, operator assignments.
11. `orders` & `order_items`: B2C and B2B orders with delivery slots, status progression, payment method.
12. `escrow_transactions`: Held funds, platform commissions, 3% insurance deductions, net farmer payouts.
13. `rescue_events` & `rescue_options`: Multi-channel recovery triggers, rankings, and selected routes.
14. `solar_drying_centres`, `solar_drying_batches`, `dried_products`: Solar drying tunnel processes, yields, and shelf-stable inventory.
15. `demand_requests` & `match_results`: B2B procurement demands and algorithmic match scores.
16. `customer_feedbacks`: Quality, freshness, and delivery ratings (1-5 stars).
