from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.models import (
    ProduceBatch, Order, RescueEvent, RescueOption,
    SolarDryingCentre, SolarDryingBatch, DriedProduct, User
)

class RescueEngineService:
    """
    Multi-Tier Rescue Engine for post-harvest loss prevention & disruption mitigation.
    Handles order cancellation, vehicle breakdowns, transit delays, and freshness decay.
    """

    @classmethod
    def evaluate_rescue_routes(
        cls,
        db: Session,
        product_name: str,
        quantity_kg: float,
        quality_grade: str,
        freshness_score: float,
        remaining_shelf_life_hours: float,
        is_safe_for_consumption: bool = True,
        contamination_flag: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Evaluates and ranks all viable rescue alternatives based on safety, economic recovery, and urgency.
        """
        options = []
        p_name = product_name.strip().title()

        # CRITICAL SAFETY GATE: If produce is chemically contaminated or mouldy/rotten, block from human & cattle chains
        if contamination_flag or not is_safe_for_consumption or freshness_score < 30.0:
            options.append({
                "channel_type": "WASTE_TO_VALUE_DISPOSAL",
                "target_entity_name": "Agro-Waste Anaerobic Composting & Biomethanation Facility (Gannavaram)",
                "target_location": "Gannavaram Waste Management Plant (8.5 km)",
                "distance_km": 8.5,
                "estimated_recovery_value": round(quantity_kg * 1.5, 2), # Minimal organic compost value
                "viability_score": 98.0,
                "is_safe": True,
                "safety_verification_notes": "Biocontainment compliant: produce converted to rich microbial bio-fertilizer and biogas.",
                "is_selected": True
            })
            return options

        # 1. Option 1: Buyer Switching (Alternative local B2B buyer / bulk canteen)
        if freshness_score >= 65.0 and remaining_shelf_life_hours >= 18.0 and quality_grade in ["GRADE_A", "GRADE_B"]:
            recovery_rate = 22.0 # Near full market price
            options.append({
                "channel_type": "BUYER_SWITCHING",
                "target_entity_name": "Mega Mart Supermarket Chain & Swarna Fresh Wholesale Hub",
                "target_location": "Benz Circle, Vijayawada (11.2 km)",
                "distance_km": 11.2,
                "estimated_recovery_value": round(quantity_kg * recovery_rate, 2),
                "viability_score": 92.0,
                "is_safe": True,
                "safety_verification_notes": "Meets Class A/B retail freshness standards for immediate same-day shelf distribution.",
                "is_selected": True # Top priority when available
            })

        # 2. Option 2: Alternative Commercial Processing (Puree/Pulp/Sauce)
        if freshness_score >= 50.0 and remaining_shelf_life_hours >= 12.0:
            recovery_rate = 16.0
            options.append({
                "channel_type": "ALTERNATIVE_PROCESSING",
                "target_entity_name": "Kisan Kanya Agro-Processing Unit (Sauce & Puree Line)",
                "target_location": "Kankipadu Industrial Estate (14.0 km)",
                "distance_km": 14.0,
                "estimated_recovery_value": round(quantity_kg * recovery_rate, 2),
                "viability_score": 86.0,
                "is_safe": True,
                "safety_verification_notes": "Food processing safety verified: produce passes microbial screening for pasteurized canning.",
                "is_selected": len(options) == 0
            })

        # 3. Option 3: Solar Drying Value-Addition Module
        # Eligible crops: Tomato, Chilli, Mango, Onion, Garlic, Herbs
        drying_suitable_crops = ["Tomato", "Chilli", "Pepper", "Onion", "Garlic", "Mango", "Ginger"]
        is_drying_crop = any(c in p_name for c in drying_suitable_crops)
        
        # Check solar drying facility
        drying_centre = db.query(SolarDryingCentre).filter(SolarDryingCentre.operating_status == "ACTIVE").first()
        available_capacity = (drying_centre.capacity_per_day_kg - drying_centre.current_utilization_kg) if drying_centre else 1000.0

        if is_drying_crop and quality_grade in ["GRADE_A", "GRADE_B", "GRADE_C"] and freshness_score >= 45.0 and available_capacity >= quantity_kg:
            # Yield: 10kg fresh -> ~1kg sun-dried dried product. Dried tomato sells for ₹300+/kg!
            yield_ratio = 0.10 if "Tomato" in p_name else 0.15
            dried_kg = quantity_kg * yield_ratio
            value_added_recovery = dried_kg * 300.0 # High value recovery!
            options.append({
                "channel_type": "SOLAR_DRYING",
                "target_entity_name": drying_centre.name if drying_centre else "Gannavaram Agro Solar-Drying Facility",
                "target_location": drying_centre.location if drying_centre else "Gannavaram Green Hub (6.0 km)",
                "distance_km": 6.0,
                "estimated_recovery_value": round(value_added_recovery, 2),
                "viability_score": 94.0,
                "is_safe": True,
                "safety_verification_notes": f"High value-add yield ({round(dried_kg, 1)}kg dried yield at ₹300/kg). Solar racks available.",
                "is_selected": len(options) == 0
            })

        # 4. Option 4: Temporary Controlled Cold Storage
        if remaining_shelf_life_hours >= 6.0:
            options.append({
                "channel_type": "COLD_STORAGE",
                "target_entity_name": "Rythu Mitra Cooperative Cold Storage (0-4°C Multi-Chamber)",
                "target_location": "Enikepadu Cold Link (8.0 km)",
                "distance_km": 8.0,
                "estimated_recovery_value": round(quantity_kg * 18.0, 2),
                "viability_score": 80.0,
                "is_safe": True,
                "safety_verification_notes": "Extends shelf-life window by 5-7 days under 85% RH controlled atmosphere.",
                "is_selected": len(options) == 0
            })

        # 5. Option 5: Approved Farm/Cattle Channel (Only if safe, clean, NOT contaminated or mouldy)
        if is_safe_for_consumption and not contamination_flag and freshness_score >= 35.0:
            options.append({
                "channel_type": "SAFE_CATTLE_FEED",
                "target_entity_name": "Goshala Dairy Cooperative & Organic Farm Feed Channel",
                "target_location": "Nunna Rural Dairy Cluster (9.5 km)",
                "distance_km": 9.5,
                "estimated_recovery_value": round(quantity_kg * 6.0, 2), # Feed rate
                "viability_score": 75.0,
                "is_safe": True,
                "safety_verification_notes": "Strictly verified: Clean produce, zero chemical pesticides residue, safe for cattle consumption.",
                "is_selected": len(options) == 0
            })

        # 6. Option 6: Organic Composting / Waste to Value
        options.append({
            "channel_type": "WASTE_TO_VALUE_DISPOSAL",
            "target_entity_name": "Krishna District Organic Composting & Biomethanation Facility",
            "target_location": "Gannavaram Biomass Center (7.5 km)",
            "distance_km": 7.5,
            "estimated_recovery_value": round(quantity_kg * 2.0, 2),
            "viability_score": 60.0,
            "is_safe": True,
            "safety_verification_notes": "Aerobic composting for organic vermicompost production.",
            "is_selected": len(options) == 0
        })

        return options

    @classmethod
    def trigger_rescue_event(
        cls,
        db: Session,
        trigger_reason: str,
        product_name: str,
        quantity_kg: float,
        quality_grade: str = "GRADE_B",
        freshness_score: float = 72.0,
        remaining_shelf_life_hours: float = 24.0,
        batch_id: Optional[str] = None,
        order_id: Optional[str] = None,
        is_safe_for_consumption: bool = True,
        contamination_flag: bool = False
    ) -> RescueEvent:
        rescue_event = RescueEvent(
            batch_id=batch_id,
            order_id=order_id,
            product_name=product_name,
            quantity_kg=quantity_kg,
            trigger_reason=trigger_reason,
            original_route="Rythu Bazar Hub -> Customer Route",
            remaining_shelf_life_hours=remaining_shelf_life_hours,
            freshness_score=freshness_score,
            quality_grade=quality_grade,
            is_safe_for_consumption=is_safe_for_consumption,
            contamination_flag=contamination_flag,
            status="INITIATED"
        )
        db.add(rescue_event)
        db.flush()

        # Evaluate options
        evaluated_options = cls.evaluate_rescue_routes(
            db=db,
            product_name=product_name,
            quantity_kg=quantity_kg,
            quality_grade=quality_grade,
            freshness_score=freshness_score,
            remaining_shelf_life_hours=remaining_shelf_life_hours,
            is_safe_for_consumption=is_safe_for_consumption,
            contamination_flag=contamination_flag
        )

        for opt in evaluated_options:
            ro = RescueOption(
                rescue_event_id=rescue_event.id,
                channel_type=opt["channel_type"],
                target_entity_name=opt["target_entity_name"],
                target_location=opt["target_location"],
                distance_km=opt["distance_km"],
                estimated_recovery_value=opt["estimated_recovery_value"],
                viability_score=opt["viability_score"],
                is_safe=opt["is_safe"],
                safety_verification_notes=opt["safety_verification_notes"],
                is_selected=opt["is_selected"]
            )
            db.add(ro)

        # Update batch status if linked
        if batch_id:
            batch = db.query(ProduceBatch).filter(ProduceBatch.id == batch_id).first()
            if batch:
                batch.rescue_status = "RESCUE_PENDING"

        # Update order status if linked
        if order_id:
            order = db.query(Order).filter(Order.id == order_id).first()
            if order and trigger_reason == "BUYER_CANCELLATION":
                order.status = "CANCELLED"

        db.commit()
        db.refresh(rescue_event)
        return rescue_event

    @classmethod
    def execute_rescue_action(
        cls,
        db: Session,
        rescue_event_id: str,
        selected_option_id: str,
        operator_user_id: Optional[str] = None,
        notes: Optional[str] = None
    ) -> RescueEvent:
        event = db.query(RescueEvent).filter(RescueEvent.id == rescue_event_id).first()
        if not event:
            raise ValueError("Rescue event not found")

        # Unselect other options and mark chosen option
        chosen_opt = None
        for opt in event.options:
            if opt.id == selected_option_id:
                opt.is_selected = True
                chosen_opt = opt
            else:
                opt.is_selected = False

        if not chosen_opt:
            raise ValueError("Selected rescue option not found")

        event.selected_route = chosen_opt.channel_type
        event.status = "RESOLVED"
        event.resolution_notes = notes or f"Successfully routed via {chosen_opt.channel_type} to {chosen_opt.target_entity_name}."
        event.resolved_by_user_id = operator_user_id
        event.updated_at = datetime.now(timezone.utc)

        # If solar drying was chosen, automatically provision a SolarDryingBatch!
        if chosen_opt.channel_type == "SOLAR_DRYING":
            drying_centre = db.query(SolarDryingCentre).filter(SolarDryingCentre.operating_status == "ACTIVE").first()
            yield_ratio = 0.10 if "Tomato" in event.product_name else 0.15
            est_yield = round(event.quantity_kg * yield_ratio, 2)
            
            sdb = SolarDryingBatch(
                batch_code=f"SDB-RESCUE-{event.id[:8].upper()}",
                source_batch_id=event.batch_id,
                rescue_event_id=event.id,
                product_name=event.product_name,
                input_quantity_kg=event.quantity_kg,
                input_quality_grade=event.quality_grade,
                input_freshness_score=event.freshness_score,
                drying_centre_id=drying_centre.id if drying_centre else "centre-01",
                estimated_yield_kg=est_yield,
                status="PREPARING",
                notes=f"Auto-generated from Rescue Event #{event.id[:8]} ({event.trigger_reason})"
            )
            db.add(sdb)
            db.flush()

            # Create dried product inventory record
            dp = DriedProduct(
                solar_batch_id=sdb.id,
                product_name=f"Premium Solar-Dried {event.product_name} (Rescued Batch)",
                packaging_type="250g Nitrogen Flush Sealed Pouch",
                quantity_kg=est_yield,
                unit_cost=150.0,
                sale_price=320.0,
                status="IN_INVENTORY"
            )
            db.add(dp)

        # Update produce batch
        if event.batch_id:
            batch = db.query(ProduceBatch).filter(ProduceBatch.id == event.batch_id).first()
            if batch:
                batch.rescue_status = "RESCUED"
                batch.current_stage = "RESCUED"

        db.commit()
        db.refresh(event)
        return event
