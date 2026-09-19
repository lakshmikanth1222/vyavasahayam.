import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.models import (
    User, FarmerProfile, BuyerProfile, ConsumerProfile,
    Product, ProductListing, ProduceBatch, QualityCheck, FreshnessDigitalTwin,
    CollectionCentre, Order, OrderItem, EscrowTransaction,
    RescueEvent, RescueOption, SolarDryingCentre, SolarDryingBatch, DriedProduct,
    DemandRequest, MatchResult, CustomerFeedback, Notification
)

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    # Check if already seeded
    if db.query(User).first():
        print("Database already seeded.")
        db.close()
        return

    print("Seeding database with realistic farm-to-customer agricultural data...")

    # 1. Create Users & Profiles
    # Admin
    admin_user = User(
        email="admin@vyavasahayam.org",
        phone="+91 98480 44556",
        full_name="Dr. Lakshmi Prasad (System Administrator)",
        hashed_password=get_password_hash("password123"),
        role="ADMIN",
        is_active=True
    )
    db.add(admin_user)

    # Collection Center Operator
    cc_operator = User(
        email="rythubazar@vyavasahayam.org",
        phone="+91 98480 55667",
        full_name="Ramesh Varma (Rythu Bazar In-Charge)",
        hashed_password=get_password_hash("password123"),
        role="COLLECTION_CENTER",
        is_active=True
    )
    db.add(cc_operator)

    # Delivery Partner
    delivery_user = User(
        email="delivery@vyavasahayam.org",
        phone="+91 98480 66778",
        full_name="Srinivas Express (Delivery Fleet Lead)",
        hashed_password=get_password_hash("password123"),
        role="DELIVERY_PARTNER",
        is_active=True
    )
    db.add(delivery_user)

    # 5 Farmers
    farmers_data = [
        ("Apparao Naidu", "farmer@vyavasahayam.org", "+91 98480 12345", "Gannavaram", "Krishna", 3.5, "Tomato, Chilli, Brinjal", "Kisan Seva FPO"),
        ("Venkateswara Rao", "venkat.farmer@vyavasahayam.org", "+91 98480 12346", "Kankipadu", "Krishna", 4.0, "Tomato, Leafy Greens", "Delta Harvesters FPO"),
        ("Somaiah Choudhary", "somaiah.farmer@vyavasahayam.org", "+91 98480 12347", "Nuzvid", "Eluru", 5.2, "Mango, Chilli, Tomato", "Nuzvid Agro Producer Co"),
        ("Rami Reddy", "rami.farmer@vyavasahayam.org", "+91 98480 12348", "Tenali", "Guntur", 2.8, "Red Chilli, Brinjal, Onion", "Guntur Spices Collective"),
        ("Govindaiah", "govind.farmer@vyavasahayam.org", "+91 98480 12349", "Mylavaram", "NTR", 3.0, "Tomato, Potato, Ginger", "Mylavaram Organic Farmers")
    ]
    farmer_users = []
    for name, email, phone, village, district, farm_size, crops, fpo in farmers_data:
        u = User(
            email=email,
            phone=phone,
            full_name=f"{name} (Farmer)",
            hashed_password=get_password_hash("password123"),
            role="FARMER",
            preferred_language="te" if "Apparao" in name else "en"
        )
        db.add(u)
        db.flush()
        fp = FarmerProfile(
            user_id=u.id,
            village=village,
            district=district,
            state="Andhra Pradesh",
            farm_size_acres=farm_size,
            crops_grown=crops,
            expected_harvest=f"Fresh {crops.split(',')[0]} (2500 kg)",
            fpo_name=fpo,
            insurance_opt_in=True
        )
        db.add(fp)
        farmer_users.append(u)

    # 5 B2B Buyers
    buyers_data = [
        ("Kiran Varma", "buyer@vyavasahayam.org", "+91 98480 22334", "Mega Mart Supermarkets Ltd.", "Retail Supermarket Chain", "Benz Circle, Vijayawada", "Tomato, Onion", 28.0),
        ("Anand Singhania", "anand.buyer@vyavasahayam.org", "+91 98480 22335", "Swarna Pure Foods & Purees", "Agro Food Processor", "Autonagar Industrial Area, Vijayawada", "Tomato, Chilli", 24.0),
        ("Rajesh Kothari", "rajesh.buyer@vyavasahayam.org", "+91 98480 22336", "Annapurna Restaurant Chain", "Hospitality / Restaurant Group", "MG Road, Vijayawada", "Tomato, Onion, Leafy Greens", 30.0),
        ("Preethi Nambiar", "preethi.buyer@vyavasahayam.org", "+91 98480 22337", "Southern Spices & Condiments", "Spice Processing & Export", "Tenali Road, Guntur", "Chilli, Garlic", 180.0),
        ("Mahesh Babu", "mahesh.buyer@vyavasahayam.org", "+91 98480 22338", "Krishna Wholesale Mandi Hub", "Wholesale Distributor", "Gollapudi Market Yard, Vijayawada", "Potato, Tomato", 25.0)
    ]
    buyer_users = []
    for contact, email, phone, org, org_type, address, req_prod, max_budget in buyers_data:
        u = User(
            email=email,
            phone=phone,
            full_name=f"{contact} ({org})",
            hashed_password=get_password_hash("password123"),
            role="BUYER_B2B"
        )
        db.add(u)
        db.flush()
        bp = BuyerProfile(
            user_id=u.id,
            organization_name=org,
            contact_person=contact,
            organization_type=org_type,
            delivery_address=address,
            required_products=req_prod,
            max_budget_price=max_budget
        )
        db.add(bp)
        buyer_users.append(u)

    # 5 Consumers
    consumers_data = [
        ("Sunitha Reddy", "consumer@vyavasahayam.org", "+91 98480 33445", "Flat 402, Green Meadows, Benz Circle, Vijayawada", 90, True),
        ("Kavitha Sharma", "kavitha.consumer@vyavasahayam.org", "+91 98480 33446", "House 12-4B, Gunadala, Vijayawada", 85, True),
        ("Pradeep Kumar", "pradeep.consumer@vyavasahayam.org", "+91 98480 33447", "Plot 55, Ashok Nagar, Vijayawada", 78, True),
        ("Deepika Rao", "deepika.consumer@vyavasahayam.org", "+91 98480 33448", "Villa 8, Sunrise Enclave, Poranki, Vijayawada", 95, True),
        ("Harish Naidu", "harish.consumer@vyavasahayam.org", "+91 98480 33449", "Flat 201, Bhavani Puram, Vijayawada", 40, False) # Restricted COD due to repeated cancellations
    ]
    consumer_users = []
    for name, email, phone, address, trust_score, cod_ok in consumers_data:
        u = User(
            email=email,
            phone=phone,
            full_name=name,
            hashed_password=get_password_hash("password123"),
            role="CONSUMER_B2C"
        )
        db.add(u)
        db.flush()
        cp = ConsumerProfile(
            user_id=u.id,
            default_address=address,
            cod_trust_score=trust_score,
            cod_eligible=cod_ok,
            cod_restriction_reason="Repeated delivery cancellation on COD orders" if not cod_ok else None
        )
        db.add(cp)
        consumer_users.append(u)

    # 2. Products
    products_data = [
        ("Hybrid Vine Tomato", "Fresh Vegetables", "kg", "Plump, red, farm-fresh tomatoes with high lycopene.", True, 6, "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80", 25.0),
        ("Guntur Green Chilli", "Fresh Vegetables", "kg", "Pungent and crisp deep green chillies directly from Guntur farms.", True, 10, "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80", 60.0),
        ("Kurnool Rose Onion", "Fresh Vegetables", "kg", "Firm, dry papery skins with rich savory pungency.", True, 20, "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=600&q=80", 35.0),
        ("Fresh Native Brinjal", "Fresh Vegetables", "kg", "Glossy purple tender brinjals free from chemical polish.", False, 5, "https://images.unsplash.com/photo-1628773822503-930a84d9f653?auto=format&fit=crop&w=600&q=80", 28.0),
        ("Organic Farm Spinach (Palak)", "Leafy Greens", "bunch", "Tender organic leaves harvested fresh this dawn.", False, 3, "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80", 20.0),
        ("Farm Fresh Potato", "Tubers", "kg", "Clean, unsprouted farm potatoes ideal for cooking.", True, 25, "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80", 30.0)
    ]
    created_products = []
    for name, cat, unit, desc, dry_ok, shelf, img, base_p in products_data:
        p = Product(
            name=name,
            category=cat,
            standard_unit=unit,
            description=desc,
            drying_suitable=dry_ok,
            default_shelf_life_days=shelf,
            image_url=img,
            base_market_price_per_kg=base_p
        )
        db.add(p)
        created_products.append(p)
    db.flush()

    # 3. Collection Centre & Rythu Bazar Hub
    cc = CollectionCentre(
        name="Rythu Bazar Gannavaram Local Hub",
        code="RB-GV-01",
        centre_type="RYTHU_BAZAR",
        address="NH16 Near Airport Junction, Gannavaram, Krishna Dist",
        district="Krishna",
        capacity_kg=15000.0,
        operator_name="Ramesh Varma (Rythu Bazar In-Charge)",
        operator_phone="+91 98480 55667"
    )
    db.add(cc)

    # 4. Solar Drying Centre
    sdc = SolarDryingCentre(
        name="Gannavaram Agro Solar-Drying Facility",
        location="Gannavaram Green Hub, Krishna District",
        district="Krishna",
        capacity_per_day_kg=2000.0,
        current_utilization_kg=450.0,
        supported_products="Tomato, Chilli, Mango, Onion, Garlic",
        operating_status="ACTIVE"
    )
    db.add(sdc)
    db.flush()

    # 5. Active Product Listings & Produce Batches
    listings_data = [
        (farmer_users[0], created_products[0], "Grade A Farm Tomatoes (500 kg Batch)", 500.0, 24.0, "GRADE_A", 94.0, 5.0, "Gannavaram"),
        (farmer_users[1], created_products[0], "Fresh Vine-Ripe Tomatoes (350 kg Batch)", 350.0, 22.0, "GRADE_A", 91.0, 4.5, "Kankipadu"),
        (farmer_users[2], created_products[1], "Guntur Spicy Green Chillies (200 kg)", 200.0, 58.0, "GRADE_A", 96.0, 8.0, "Nuzvid"),
        (farmer_users[3], created_products[2], "Kurnool Sweet Rose Onions (800 kg)", 800.0, 32.0, "GRADE_A", 95.0, 18.0, "Tenali"),
        (farmer_users[0], created_products[3], "Tender Purple Brinjals (150 kg)", 150.0, 24.0, "GRADE_B", 88.0, 4.0, "Gannavaram"),
        (farmer_users[1], created_products[4], "Crisp Morning Palak / Spinach (100 Bunches)", 100.0, 18.0, "GRADE_A", 92.0, 2.5, "Kankipadu")
    ]
    created_listings = []
    for farmer, prod, title, qty, price, grade, fresh_score, shelf_days, village in listings_data:
        pl = ProductListing(
            farmer_id=farmer.id,
            product_id=prod.id,
            title=title,
            quantity=qty,
            available_quantity=qty - 50.0, # some sold
            unit=prod.standard_unit,
            asking_price=price,
            quality_grade=grade,
            harvest_date=datetime.now(timezone.utc) - timedelta(hours=6),
            expected_shelf_life_days=int(shelf_days),
            remaining_shelf_life_days=shelf_days,
            location_address=f"Plot 14, {village} Farm Road",
            village=village,
            district="Krishna",
            image_url=prod.image_url,
            ai_analyzed=True,
            ai_freshness_score=fresh_score,
            ai_freshness_category="FRESH",
            ai_spoilage_risk_pct=round((100.0 - fresh_score) * 0.5, 1),
            ai_visible_defects="Zero visible defects; firm cellular structure and intact calyx.",
            status="ACTIVE"
        )
        db.add(pl)
        db.flush()
        created_listings.append(pl)

        # Batch
        batch = ProduceBatch(
            batch_code=f"BATCH-2026-{prod.name[:3].upper()}-{pl.id[:6].upper()}",
            listing_id=pl.id,
            product_id=prod.id,
            farmer_id=farmer.id,
            collection_centre_id=cc.id,
            quantity_kg=qty,
            current_stage="RECEIVED_CC",
            current_grade=grade,
            freshness_score=fresh_score,
            freshness_category="FRESH",
            remaining_shelf_life_days=shelf_days,
            spoilage_risk_pct=round((100.0 - fresh_score) * 0.5, 1),
            current_location=f"Rythu Bazar Hub, Gannavaram"
        )
        db.add(batch)
        db.flush()

        # Digital Twin
        twin = FreshnessDigitalTwin(
            batch_id=batch.id,
            initial_shelf_life_days=shelf_days,
            current_shelf_life_days=shelf_days,
            freshness_score=fresh_score,
            current_state="FRESH"
        )
        db.add(twin)

        # Quality Check at Rythu Bazar
        qc = QualityCheck(
            batch_id=batch.id,
            stage="COLLECTION_CENTRE",
            grade=grade,
            inspector_name="Ramesh Varma (Rythu Bazar)",
            weight_kg=qty,
            freshness_score=fresh_score,
            notes="Received at collection hub. Sorted and verified against AI vision screening."
        )
        db.add(qc)

    # 6. Orders & Escrow
    # B2C Consumer Order
    b2c_order = Order(
        order_number="ORD-B2C-2026-10492",
        order_type="B2C",
        buyer_id=consumer_users[0].id,
        collection_centre_id=cc.id,
        status="DELIVERED",
        subtotal=520.0,
        delivery_fee=0.0, # Met > ₹500 threshold
        total_amount=520.0,
        payment_method="ONLINE_ESCROW",
        payment_status="RELEASED",
        delivery_address="Flat 402, Green Meadows, Benz Circle, Vijayawada",
        delivery_slot="Today Morning 7:00 AM - 9:00 AM"
    )
    db.add(b2c_order)
    db.flush()

    oi1 = OrderItem(
        order_id=b2c_order.id,
        listing_id=created_listings[0].id,
        farmer_id=farmer_users[0].id,
        product_name="Hybrid Vine Tomato",
        quantity=10.0,
        unit="kg",
        unit_price=24.0,
        total_price=240.0,
        grade="GRADE_A"
    )
    oi2 = OrderItem(
        order_id=b2c_order.id,
        listing_id=created_listings[3].id,
        farmer_id=farmer_users[3].id,
        product_name="Kurnool Rose Onion",
        quantity=5.0,
        unit="kg",
        unit_price=32.0,
        total_price=160.0,
        grade="GRADE_A"
    )
    db.add_all([oi1, oi2])

    escrow1 = EscrowTransaction(
        order_id=b2c_order.id,
        amount=520.0,
        farmer_id=farmer_users[0].id,
        farmer_gross_amount=520.0,
        transport_charge=0.0,
        platform_fee=10.40, # 2%
        insurance_deduction=15.60, # 3%
        farmer_net_payout=494.0,
        status="RELEASED",
        release_date=datetime.now(timezone.utc) - timedelta(hours=2)
    )
    db.add(escrow1)

    # 7. Demo Rescue Event & Solar Drying Batch
    # Simulate a scenario where a buyer cancelled 400kg tomatoes due to kitchen breakdown
    rescue_ev = RescueEvent(
        product_name="Hybrid Vine Tomato (Cancelled B2B Lot)",
        quantity_kg=400.0,
        trigger_reason="BUYER_CANCELLATION",
        original_route="Rythu Bazar Hub -> Hotel Annapurna Central Kitchen",
        remaining_shelf_life_hours=20.0,
        freshness_score=76.0,
        quality_grade="GRADE_B",
        is_safe_for_consumption=True,
        contamination_flag=False,
        selected_route="SOLAR_DRYING",
        status="RESOLVED",
        resolution_notes="Buyer cancelled due to boiler failure. 400kg Tomatoes routed to Gannavaram Agro Solar-Drying Facility for sun-dried tomato flake production."
    )
    db.add(rescue_ev)
    db.flush()

    # Rescue options evaluated
    ro1 = RescueOption(
        rescue_event_id=rescue_ev.id,
        channel_type="SOLAR_DRYING",
        target_entity_name="Gannavaram Agro Solar-Drying Facility",
        target_location="Gannavaram Green Hub (6.0 km)",
        distance_km=6.0,
        estimated_recovery_value=12000.0, # 40kg dried yield at ₹300/kg
        viability_score=94.0,
        is_safe=True,
        safety_verification_notes="High value-addition: 10:1 ratio yields 40kg premium sun-dried tomato pouches.",
        is_selected=True
    )
    ro2 = RescueOption(
        rescue_event_id=rescue_ev.id,
        channel_type="ALTERNATIVE_PROCESSING",
        target_entity_name="Swarna Pure Foods Puree Unit",
        target_location="Autonagar, Vijayawada (12.0 km)",
        distance_km=12.0,
        estimated_recovery_value=6400.0,
        viability_score=82.0,
        is_safe=True,
        safety_verification_notes="Pulp line available for bulk canning.",
        is_selected=False
    )
    db.add_all([ro1, ro2])

    # Corresponding Solar Drying Batch
    sdb = SolarDryingBatch(
        batch_code="SDB-2026-TOM-001",
        rescue_event_id=rescue_ev.id,
        product_name="Hybrid Vine Tomato",
        input_quantity_kg=400.0,
        input_quality_grade="GRADE_B",
        input_freshness_score=76.0,
        drying_centre_id=sdc.id,
        start_time=datetime.now(timezone.utc) - timedelta(hours=14),
        expected_completion_time=datetime.now(timezone.utc) + timedelta(hours=10),
        estimated_yield_kg=40.0,
        status="DRYING",
        moisture_level_pct=22.0,
        notes="Pre-washed, sliced with stainless cutter, arranged on solar tunnel racks under 55°C filtered airflow."
    )
    db.add(sdb)
    db.flush()

    # Dried Product in inventory
    dp = DriedProduct(
        solar_batch_id=sdb.id,
        product_name="Gourmet Sun-Dried Tomato Halves (Vacuum Pack)",
        packaging_type="250g Nitrogen Flush Sealed Pouch",
        quantity_kg=40.0,
        unit_cost=150.0,
        sale_price=320.0,
        shelf_life_months=12,
        status="IN_INVENTORY"
    )
    db.add(dp)

    # 8. Demand Request by B2B Buyer
    demand = DemandRequest(
        buyer_id=buyer_users[0].id,
        product_name="Hybrid Vine Tomato",
        required_quantity_kg=400.0,
        max_budget_per_kg=26.0,
        required_grade="GRADE_A",
        delivery_district="Krishna",
        urgency="WITHIN_24H",
        status="OPEN"
    )
    db.add(demand)

    db.commit()
    print("Database seeding completed successfully! Pre-populated with 5+ farmers, 5+ buyers, 5+ consumers, listings, batches, rescue events, and solar drying operations.")
    db.close()

if __name__ == "__main__":
    seed_database()
