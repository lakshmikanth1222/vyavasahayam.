from fastapi import APIRouter
from app.schemas.schemas import VoiceIVRInput, VoiceIVRResponse
from app.services.voice_service import FarmerVoiceIVRService

router = APIRouter(prefix="/voice", tags=["Farmer Voice IVR Telephony"])

@router.post("/ivr", response_model=VoiceIVRResponse)
def handle_ivr_call(data: VoiceIVRInput):
    """
    Simulates IVR interactive voice telephony response for farmers calling without a smartphone.
    """
    res = FarmerVoiceIVRService.process_voice_call(
        phone=data.farmer_phone,
        language=data.language,
        option=data.selected_menu_option,
        speech_text=data.speech_transcription
    )
    return res
