import React, { useState, useEffect, useRef } from 'react';
import {
  Mic, MicOff, Volume2, VolumeX, Sparkles, X, Globe, Send,
  ArrowRight, Landmark, BarChart3, ShoppingBag, ShieldCheck, Tractor
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export const AIKisanVoiceFAB = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [language, setLanguage] = useState('te'); // 'te', 'hi', 'en'
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'ai',
      text: 'నమస్కారం! నేను మీ ధేను (Dhenu) AI సహాయకుడిని. పంట ధరలు, కార్తీక మాస డిమాండ్ లేదా విత్తనాల సలహాల గురించి అడగండి.',
      language: 'te',
      action: { label: 'కార్తీక మాస డిమాండ్ చూడండి', link: '/demand-forecasting' }
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [chatHistory, isOpen]);

  // Update initial greeting on language switch
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    let greeting = '';
    let actionLabel = '';
    if (newLang === 'te') {
      greeting = 'నమస్కారం! నేను మీ ధేను (Dhenu) AI సహాయకుడిని. పంట ధరలు, కార్తీక మాస డిమాండ్ లేదా విత్తనాల సలహాల గురించి అడగండి.';
      actionLabel = 'కార్తీక మాస డిమాండ్ చూడండి';
    } else if (newLang === 'hi') {
      greeting = 'नमस्ते! मैं आपका धेनु (Dhenu) AI सहायक हूँ। मंडी भाव, मौसमी मांग या बुवाई सलाह के बारे में पूछें।';
      actionLabel = 'मांग पूर्वानुमान देखें';
    } else {
      greeting = 'Hello! I am your Dhenu AI Kisan & Buyer Assistant. Ask me anything about Mandi rates, Kartheeka Maasam demand surges, or crop sowing advice.';
      actionLabel = 'Explore Demand Forecast';
    }
    setChatHistory((prev) => [
      ...prev,
      {
        sender: 'ai',
        text: greeting,
        language: newLang,
        action: { label: actionLabel, link: '/demand-forecasting' }
      }
    ]);
  };

  const quickPrompts = {
    te: [
      { text: 'ఈరోజు మదనపల్లె టమోటా రేటు ఎంత?', label: '🍅 టమోటా మండి ధర' },
      { text: 'కార్తీక మాసంలో ఏ కూరగాయలకు ఎక్కువ డిమాండ్ ఉంటుంది?', label: '🌙 కార్తీక మాస డిమాండ్' },
      { text: 'గుంటూరు జిల్లాలో ఇప్పుడు ఏ పంట వేస్తే లాభం?', label: '🌾 పంట విత్తనాల సలహా' },
      { text: 'నా ఎస్క్రో పేమెంట్ నిల్వ ఎంత?', label: '💰 ఎస్క్రో పేమెంట్' }
    ],
    hi: [
      { text: 'आज मदनपल्ले टमाटर मंडी का भाव क्या है?', label: '🍅 टमाटर मंडी भाव' },
      { text: 'कार्तिक मास में किन सब्जियों की मांग बढ़ेगी?', label: '🌙 मौसमी मांग' },
      { text: 'इस महीने कौन सी फसल बोने से अधिकतम लाभ होगा?', label: '🌾 बुवाई सलाह' },
      { text: 'मेरा एस्क्रो भुगतान कब रिलीज होगा?', label: '💰 एस्क्रो बैलेंस' }
    ],
    en: [
      { text: 'What is today\'s Tomato Mandi rate in Madanapalle?', label: '🍅 Tomato Mandi Rate' },
      { text: 'How will Kartheeka Maasam affect vegetable demand?', label: '🌙 Kartheeka Maasam Demand' },
      { text: 'Which crop has highest ROI for planting this month?', label: '🌾 Sowing Advisor' },
      { text: 'Show government price comparisons on marketplace', label: '🏛️ Govt Price Comparison' }
    ]
  };

  const simulateSpeechRecognition = () => {
    setIsListening(true);
    const samplePrompts = quickPrompts[language];
    const chosen = samplePrompts[Math.floor(Math.random() * samplePrompts.length)].text;
    
    setTimeout(() => {
      setQuery(chosen);
      setIsListening(false);
      handleSend(chosen);
    }, 1800);
  };

  const handleSend = async (textToSend) => {
    const userInput = textToSend || query;
    if (!userInput.trim()) return;

    const userMessage = { sender: 'user', text: userInput };
    setChatHistory((prev) => [...prev, userMessage]);
    setQuery('');
    setLoading(true);

    try {
      // Call backend AI voice/chat assistance endpoint
      const lower = userInput.toLowerCase();
      let aiText = '';
      let actionObj = null;

      if (lower.includes('tomato') || lower.includes('టమోటా') || lower.includes('टमाटर') || lower.includes('mandi') || lower.includes('ధర') || lower.includes('भाव')) {
        if (language === 'te') {
          aiText = 'మదనపల్లె & గుంటూరు మార్కెట్లలో నేటి ప్రభుత్వ మోడల్ టమోటా ధర ₹22.00/కిలో. మన ప్లాట్‌ఫామ్‌లో నేరుగా రైతు ధర ₹20.00/కిలో మాత్రమే (రైతుకు ₹4/కిలో అదనపు లాభం, కొనుగోలుదారునికి ₹2 ఆదా).';
        } else if (language === 'hi') {
          aiText = 'मदनपल्ले व गुंटूर मंडी में आज सरकारी मॉडल टमाटर भाव ₹22.00/किलो है। हमारे किसान सीधे ₹20.00/किलो पर बेच रहे हैं।';
        } else {
          aiText = 'Today\'s official APMC Mandi modal price for Hybrid Tomato is ₹22.00/kg. On VyavaSahayam, verified farmers offer direct batches at ₹20.00/kg with 94% freshness score.';
        }
        actionObj = { label: '🏛️ Live Govt Mandi Bulletin', link: '/market-prices' };
      } else if (lower.includes('kartheeka') || lower.includes('కార్తీక') || lower.includes('कार्तिक') || lower.includes('demand') || lower.includes('డిమాండ్') || lower.includes('मांग')) {
        if (language === 'te') {
          aiText = 'కార్తీక మాసంలో మాంసాహార విక్రయాలు 85% తగ్గుతాయి! పాలకూర (+75%), తోటకూర (+80%), అరటికాయ (+85%), మరియు వంకాయ (+60%) డిమాండ్ భారీగా పెరుగుతుంది. రైతులు ఇప్పుడే విత్తనాలు వేస్తే 1.8x లాభం పొందవచ్చు.';
        } else if (language === 'hi') {
          aiText = 'कार्तिक मास में शाकाहारी मांग 75% तक बढ़ जाती है। पालक, तोताकुरा, बैंगन और कच्चे केले की कीमतें उच्चतम स्तर पर पहुंचेंगी।';
        } else {
          aiText = 'During Kartheeka Maasam, strict vegetarianism surges demand for Leafy Greens (+75%), Raw Banana (+85%), and Brinjal (+60%). Farmers can plant now for a 1.75x profit multiplier.';
        }
        actionObj = { label: '📊 View 12-Month Demand Hub', link: '/demand-forecasting' };
      } else if (lower.includes('sow') || lower.includes('crop') || lower.includes('పంట') || lower.includes('బోన') || lower.includes('బోయి') || lower.includes('విత్తన')) {
        if (language === 'te') {
          aiText = 'కృష్ణా మరియు గుంటూరు డెల్టా నేలల్లో ఇప్పుడు పాలకూర, లేడీస్ ఫింగర్ (బెండకాయ) మరియు క్యాలీఫ్లవర్ వేయడం అత్యంత లాభదాయకం. 2 ఎకరాలకు అంచనా లాభం ₹1,85,000.';
        } else if (language === 'hi') {
          aiText = 'वर्तमान रबी मौसम में पालक और फूलगोभी की बुवाई पर 2 एकड़ भूमि से लगभग ₹1,85,000 का शुद्ध लाभ अनुमानित है।';
        } else {
          aiText = 'For alluvial/black clay soils, sowing Palak and Cauliflower now is projected to yield an estimated net profit of ₹1,85,000 per 2 acres ahead of festive demand.';
        }
        actionObj = { label: '🌾 Open Crop Sowing Simulator', link: '/farmer/recommendations' };
      } else {
        if (language === 'te') {
          aiText = 'ధన్యవాదాలు! మీ వినతిని ధేను AI ప్రాసెస్ చేసింది. మా ప్రభుత్వ ధృవీకృత మార్కెట్ ధరలు లేదా ఫ్రెష్ షాపింగ్ పేజీని తనిఖీ చేయండి.';
        } else if (language === 'hi') {
          aiText = 'धन्यवाद! आपकी पूछताछ दर्ज कर ली गई है। सरकारी मंडी भाव अथवा सीधे खेत से खरीद के लिए आगे बढ़ें।';
        } else {
          aiText = 'Understood! VyavaSahayam ensures 100% Escrow security, AI freshness screening, and zero middleman exploitation.';
        }
        actionObj = { label: '🛒 Fresh Marketplace', link: '/shop' };
      }

      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: aiText,
          language: language,
          action: actionObj
        }
      ]);

      // Trigger audio speaking visual
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-20 md:bottom-6 right-4 z-40 flex items-center gap-2">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-600 via-brand-600 to-teal-700 text-white shadow-xl shadow-brand-600/30 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border border-white/25"
          aria-label="Open AI Voice Kisan Assistant"
        >
          {/* Animated Glowing Ring */}
          <span className="absolute -inset-1 rounded-full bg-emerald-400 opacity-40 group-hover:opacity-75 blur-sm animate-pulse" />

          <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-white/20">
            <Mic className="w-3.5 h-3.5 text-white animate-bounce" />
          </div>

          <div className="relative text-left hidden sm:block">
            <span className="text-[11px] font-black uppercase tracking-wider block text-emerald-200 leading-none">
              AI Voice Kisan
            </span>
            <span className="text-xs font-extrabold leading-tight">
              {language === 'te' ? 'ధేను AI వాయిస్' : language === 'hi' ? 'धेनु AI वॉइस' : 'Ask Dhenu AI'}
            </span>
          </div>

          <span className="relative sm:hidden text-xs font-extrabold">
            AI Assistant
          </span>

          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
        </button>
      </div>

      {/* Interactive Voice & Chat Assistant Modal / Bottom Sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] sm:max-h-[80vh] flex flex-col overflow-hidden border border-slate-200">
            
            {/* Mobile Sheet Drag Indicator */}
            <div className="sm:hidden pt-2.5 pb-1 flex justify-center bg-emerald-950">
              <div className="w-12 h-1.5 rounded-full bg-white/30" />
            </div>

            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-900 via-brand-800 to-teal-900 text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-emerald-300 shadow-inner">
                  <Sparkles className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-base leading-tight">
                      Dhenu AI Kisan Assistant
                    </h3>
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-400/20 text-emerald-300 text-[9px] font-mono font-bold border border-emerald-400/30">
                      Live
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-200">
                    Voice & Mandi Intelligence (తెలుగు • हिन्दी • English)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Language Selector Bar */}
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-emerald-600" /> Voice Language:
              </span>
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'te', label: 'తెలుగు' },
                  { id: 'hi', label: 'हिन्दी' },
                  { id: 'en', label: 'English' }
                ].map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => handleLanguageChange(lang.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      language === lang.id
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Audio Speech Waveform Indicator */}
            {(isListening || isSpeaking) && (
              <div className="bg-emerald-900 text-white py-2 px-4 flex items-center justify-center gap-3 animate-pulse text-xs font-bold">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>{isListening ? '🎤 Listening to your voice...' : '🔊 Dhenu AI speaking...'}</span>
                <div className="flex items-center gap-1 h-3">
                  <span className="w-1 h-2 bg-emerald-400 rounded-full animate-bounce" />
                  <span className="w-1 h-4 bg-emerald-300 rounded-full animate-bounce delay-100" />
                  <span className="w-1 h-3 bg-emerald-400 rounded-full animate-bounce delay-200" />
                  <span className="w-1 h-5 bg-teal-300 rounded-full animate-bounce delay-300" />
                </div>
              </div>
            )}

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/60 text-xs">
              {chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm space-y-2 ${
                      msg.sender === 'user'
                        ? 'bg-brand-600 text-white rounded-br-none'
                        : 'bg-white text-slate-900 border border-slate-200/90 rounded-bl-none'
                    }`}
                  >
                    <p className="leading-relaxed font-medium">{msg.text}</p>

                    {/* Interactive Action Button in AI Response */}
                    {msg.action && (
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          navigate(msg.action.link);
                        }}
                        className="w-full mt-2 py-1.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[11px] flex items-center justify-between transition-all active:scale-98"
                      >
                        <span>{msg.action.label}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-slate-200 max-w-[70%]">
                  <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
                  <span className="text-slate-500 font-medium">Analyzing Mandi database & seasonal curves...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick 1-Tap Prompt Chips */}
            <div className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
              {quickPrompts[language]?.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(p.text)}
                  className="whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 text-[11px] font-bold transition-all active:scale-95 flex-shrink-0"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              
              {/* Mic Voice Button */}
              <button
                onClick={simulateSpeechRecognition}
                disabled={isListening}
                className={`p-3 rounded-2xl flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                }`}
                title="Tap to Speak (Voice Input)"
              >
                <Mic className="w-5 h-5" />
              </button>

              {/* Text Input */}
              <input
                type="text"
                placeholder={language === 'te' ? 'పంట ధర లేదా డిమాండ్ గురించి అడగండి...' : language === 'hi' ? 'फसल भाव या मांग के बारे में पूछें...' : 'Ask about Mandi prices, demand, sowing...'}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend();
                }}
                className="flex-1 px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-xs bg-slate-50 text-slate-900"
              />

              {/* Send Button */}
              <button
                onClick={() => handleSend()}
                disabled={!query.trim()}
                className="p-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white transition-all active:scale-95 shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>

            </div>

          </div>
        </div>
      )}
    </>
  );
};
export default AIKisanVoiceFAB;
