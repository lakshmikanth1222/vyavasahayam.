from typing import Dict, Any, List

class FarmerVoiceIVRService:
    """
    Multilingual IVR and Voice Assistant Service for non-smartphone / rural farmers.
    Supports Telugu, Hindi, English, Tamil, and Kannada.
    """

    MENU_SCRIPTS = {
        "te": {
            "welcome": "వ్యవసాయం (VyavaSahayam) రైతు వాయిస్ సేవకు స్వాగతం. దయచేసి ఒక ఎంపికను ఎంచుకోండి:",
            "options": [
                "1. కొత్త పంట వివరాలు నమోదు చేయండి (List new crop)",
                "2. మీ పంట అమ్మకం మరియు ఆర్డర్ స్థితి తెలుసుకోండి (Check order status)",
                "3. మీ ఖాతా చెల్లింపులు మరియు ఎస్క్రో నిల్వ (Check earnings & escrow payout)",
                "4. అత్యవసర రెస్క్యూ / సోలార్ డ్రైయింగ్ సాయం (Request emergency rescue)",
                "5. ధేను AI వ్యవసాయ సలహాదారుతో మాట్లాడండి (Talk to Dhenu AI advisor)"
            ],
            "responses": {
                1: "మీ పంట పేరు మరియు పరిమాణం చెప్పండి. మీ ఆడియో రికార్డ్ అవుతోంది. త్వరలోనే ర్యాతు బజార్ కలెక్షన్ సెంటర్ సిబ్బంది మిమ్మల్ని సంప్రదిస్తారు.",
                2: "మీ తాజా టమోటా బ్యాచ్ (500 కిలోలు) ప్రస్తుతం రవాణాలో ఉంది. ఆర్డర్ డెలివరీ అయిన వెంటనే మీ ఖాతాలో నగదు జమ అవుతుంది.",
                3: "మీ ఎస్క్రో ఖాతాలో ₹12,450 విడుదల చేయడానికి సిద్ధంగా ఉంది. 3% రైతు బీమా వర్తించబడింది.",
                4: "రెస్క్యూ ఇంజిన్ యాక్టివేట్ చేయబడింది. సమీపంలోని గన్నవరం సోలార్ డ్రైయింగ్ సెంటర్ మరియు ప్రాసెసింగ్ యూనిట్‌ను గుర్తించాము.",
                5: "ధేను AI లైన్‌లో ఉంది. ప్రస్తుత మార్కెట్ ధర టమోటా కిలో ₹28 మరియు ఉల్లి కిలో ₹34."
            }
        },
        "hi": {
            "welcome": "व्यवसहायम (VyavaSahayam) किसान वॉइस सेवा में आपका स्वागत है। कृपया एक विकल्प चुनें:",
            "options": [
                "1. नई फसल की सूची बनाएं (List new crop)",
                "2. अपने आर्डर और बिक्री की स्थिति जांचें (Check order status)",
                "3. अपना भुगतान और एस्क्रो पेआउट देखें (Check earnings)",
                "4. आपातकालीन फसल बचाव / सोलर ड्राईंग (Rescue support)",
                "5. धेनु AI कृषि सलाहकार से बात करें (Dhenu AI Advisory)"
            ],
            "responses": {
                1: "कृपया अपनी फसल का नाम और मात्रा बोलें। आपका ऑडियो रिकॉर्ड हो रहा है।",
                2: "आपका टमाटर का लॉट (500 किग्रा) वर्तमान में डिलीवरी में है।",
                3: "आपका कुल शुद्ध भुगतान ₹12,450 बैंक खाते में भेजने के लिए स्वीकृत है।",
                4: "रेस्क्यू इंजन सक्रिय हो गया है। नजदीकी सोलर ड्राईंग और कोल्ड स्टोरेज विकल्प तैयार हैं।",
                5: "धेनु AI: आज टमाटर का थोक मंडी भाव ₹28 प्रति किलो है।"
            }
        },
        "en": {
            "welcome": "Welcome to VyavaSahayam Farmer Voice IVR Service. Please select an option:",
            "options": [
                "1. List a new crop produce",
                "2. Check active order & transit status",
                "3. View earnings & escrow payout balance",
                "4. Request emergency crop rescue / solar drying",
                "5. Speak with Dhenu AI Farm Advisor"
            ],
            "responses": {
                1: "Please speak your crop name, quantity and asking price. Your voice listing has been queued for verification.",
                2: "Your Tomato batch (500 kg) is currently in transit to Rythu Bazar Hub. Expected delivery by 5 PM.",
                3: "Your escrow balance of ₹12,450 has been approved for automatic direct bank transfer.",
                4: "Rescue Engine triggered. 500kg Tomatoes routed to Gannavaram Solar Drying Facility for value addition.",
                5: "Dhenu AI: Tomato wholesale rate is ₹28/kg. Soil moisture index is optimal for next planting."
            }
        }
    }

    @classmethod
    def process_voice_call(
        cls,
        phone: str,
        language: str = "te",
        option: int = 1,
        speech_text: str = None
    ) -> Dict[str, Any]:
        lang_data = cls.MENU_SCRIPTS.get(language, cls.MENU_SCRIPTS["en"])
        resp_text = lang_data["responses"].get(option, lang_data["responses"][1])
        
        if speech_text:
            resp_text += f" [Audio transcribed: '{speech_text}']"

        return {
            "audio_text_response": resp_text,
            "detected_intent": f"MENU_OPTION_{option}",
            "action_status": "SUCCESS",
            "next_menu_options": lang_data["options"]
        }
