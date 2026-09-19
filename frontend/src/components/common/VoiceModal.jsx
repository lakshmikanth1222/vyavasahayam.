import React, { useState } from 'react';
import { Phone, PhoneOff, Mic, Volume2, Globe, CheckCircle2, RefreshCw } from 'lucide-react';
import api from '../../services/api';

export const VoiceModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [language, setLanguage] = useState('te');
  const [selectedOption, setSelectedOption] = useState(1);
  const [speechText, setSpeechText] = useState('');
  const [loading, setLoading] = useState(false);
  const [callState, setCallState] = useState('CONNECTED'); // CONNECTED, PROCESSING, COMPLETED
  const [ivrResponse, setIvrResponse] = useState(null);

  const handleCallOption = async (optNumber) => {
    setSelectedOption(optNumber);
    setLoading(true);
    try {
      const res = await api.post('/voice/ivr', {
        farmer_phone: '+91 98480 12345',
        language: language,
        selected_menu_option: optNumber,
        speech_transcription: speechText || null
      });
      setIvrResponse(res.data);
    } catch (err) {
      console.error("IVR call error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center ring-2 ring-emerald-400/50">
              <Phone className="w-5 h-5 text-emerald-300 animate-bounce" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Farmer Voice IVR Telephony</h3>
              <p className="text-xs text-emerald-200">Toll-Free Kisan Hotline (1800-VYAVA-FARM)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <PhoneOff className="w-4 h-4 text-rose-300" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          
          {/* Language Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> Select Spoken Language
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { code: 'te', name: 'తెలుగు (Telugu)' },
                { code: 'hi', name: 'हिन्दी (Hindi)' },
                { code: 'en', name: 'English' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIvrResponse(null);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                    language === lang.code
                      ? 'border-brand-600 bg-brand-50 text-brand-800 shadow-sm ring-1 ring-brand-600'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Dial-pad / Menu Options */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Interactive Voice Menu Options (Press Key)
            </label>
            <div className="space-y-2">
              {[
                { key: 1, label: language === 'te' ? '1. కొత్త పంట వివరాలు నమోదు చేయండి (List Crop)' : language === 'hi' ? '1. नई फसल की सूची बनाएं (List Crop)' : '1. List a new crop produce' },
                { key: 2, label: language === 'te' ? '2. పంట ఆర్డర్ స్థితి తెలుసుకోండి (Order Status)' : language === 'hi' ? '2. आर्डर स्थिति जांचें (Order Status)' : '2. Check active order status' },
                { key: 3, label: language === 'te' ? '3. ఖాతా చెల్లింపులు & ఎస్క్రో నిల్వ (Check Earnings)' : language === 'hi' ? '3. भुगतान व एस्क्रो देखें (Earnings)' : '3. View earnings & escrow balance' },
                { key: 4, label: language === 'te' ? '4. అత్యవసర రెస్క్యూ సాయం (Request Rescue)' : language === 'hi' ? '4. आपातकालीन फसल बचाव (Rescue)' : '4. Request emergency crop rescue' },
                { key: 5, label: language === 'te' ? '5. ధేను AI సలహాదారు (Dhenu AI Advisory)' : language === 'hi' ? '5. धेनु AI कृषि सलाहकार (Dhenu AI)' : '5. Speak with Dhenu AI Advisor' }
              ].map((menu) => (
                <button
                  key={menu.key}
                  onClick={() => handleCallOption(menu.key)}
                  disabled={loading}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between ${
                    selectedOption === menu.key && ivrResponse
                      ? 'border-brand-600 bg-brand-50/80 text-brand-900 ring-1 ring-brand-500/30'
                      : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <span>{menu.label}</span>
                  <span className="w-5 h-5 rounded-full bg-slate-100 font-mono text-[10px] text-slate-600 flex items-center justify-center font-bold">
                    {menu.key}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Voice Prompt Response Simulation */}
          {loading ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center gap-2 text-xs font-semibold text-slate-600">
              <RefreshCw className="w-4 h-4 animate-spin text-brand-600" />
              <span>Transcribing and routing voice audio...</span>
            </div>
          ) : ivrResponse ? (
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                <Volume2 className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span>IVR Spoken Response (Automated Voice Audio):</span>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed font-medium bg-white p-3 rounded-lg border border-emerald-100 shadow-sm">
                "{ivrResponse.audio_text_response}"
              </p>
              <div className="flex items-center justify-between text-[11px] text-emerald-700 pt-1">
                <span>Intent: <strong className="font-mono">{ivrResponse.detected_intent}</strong></span>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Action Completed
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center text-xs text-slate-500">
              Press any menu button above to simulate the automated telephony flow.
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5 font-medium">
            <Mic className="w-3.5 h-3.5 text-brand-600" /> Multi-Dialect IVR Telephony Gateway
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 font-bold text-slate-700 transition-colors"
          >
            End Call
          </button>
        </div>

      </div>
    </div>
  );
};
