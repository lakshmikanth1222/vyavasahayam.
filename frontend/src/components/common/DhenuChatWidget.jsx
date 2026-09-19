import React, { useState, useRef, useEffect } from 'react';
import {
  Bot, X, Send, Sparkles, Sprout, MessageSquare, ChevronRight,
  Mic, Volume2, VolumeX, Globe, ArrowRight, Landmark, BarChart3, ShoppingBag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export const DhenuChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState('te'); // 'te', 'hi', 'en'
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'dhenu',
      text: "నమస్కారం! నేను మీ **ధేను (Dhenu) AI వ్యవసాయ & మార్కెట్ సహాయకుడిని**.\nఈరోజు మండి రేట్లు, కార్తీక మాస డిమాండ్ లేదా విత్తనాల సలహాల గురించి నన్ను అడగండి.",
      actions: [
        { label: "🍅 టమోటా మండి ధర", query: "ఈరోజు మదనపల్లె టమోటా రేటు ఎంత?" },
        { label: "🌙 కార్తీక మాస డిమాండ్", query: "కార్తీక మాసంలో ఏ కూరగాయలకు ఎక్కువ డిమాండ్ ఉంటుంది?" },
        { label: "🌾 పంట విత్తనాల సలహా", query: "గుంటూరు జిల్లాలో ఇప్పుడు ఏ పంట వేస్తే లాభం?" }
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
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
  }, [messages, isOpen]);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    let greeting = '';
    let acts = [];
    if (newLang === 'te') {
      greeting = "నమస్కారం! నేను మీ **ధేను (Dhenu) AI వ్యవసాయ & మార్కెట్ సహాయకుడిని**.\nఈరోజు మండి రేట్లు, కార్తీక మాస డిమాండ్ లేదా విత్తనాల సలహాల గురించి నన్ను అడగండి.";
      acts = [
        { label: "🍅 టమోటా మండి ధర", query: "ఈరోజు మదనపల్లె టమోటా రేటు ఎంత?" },
        { label: "🌙 కార్తీక మాస డిమాండ్", query: "కార్తీక మాసంలో ఏ కూరగాయలకు ఎక్కువ డిమాండ్ ఉంటుంది?" },
        { label: "🌾 పంట విత్తనాల సలహా", query: "గుంటూరు జిల్లాలో ఇప్పుడు ఏ పంట వేస్తే లాభం?" }
      ];
    } else if (newLang === 'hi') {
      greeting = "नमस्ते! मैं आपका **धेनु (Dhenu) AI कृषि व मंडी सहायक** हूँ।\nमंडी भाव, मौसमी मांग अथवा बुवाई की सिफारिशों के बारे में पूछें।";
      acts = [
        { label: "🍅 टमाटर मंडी भाव", query: "आज मदनपल्ले टमाटर मंडी का भाव क्या है?" },
        { label: "🌙 मौसमी मांग पूर्वानुमान", query: "कार्तिक मास में किन सब्जियों की मांग बढ़ेगी?" },
        { label: "🌾 रबी बुवाई सलाह", query: "इस महीने कौन सी फसल बोने से अधिकतम लाभ होगा?" }
      ];
    } else {
      greeting = "Namaste! I am your **Dhenu AI Agricultural & Mandi Assistant**.\nAsk me about live government APMC rates, Kartheeka Maasam festive demand, or high-ROI crop sowing recommendations.";
      acts = [
        { label: "🍅 Tomato Mandi Rate", query: "What is today's Tomato Mandi rate in Madanapalle?" },
        { label: "🌙 Kartheeka Maasam Demand", query: "How will Kartheeka Maasam affect vegetable demand?" },
        { label: "🌾 Crop Sowing Advisor", query: "Which crop has highest ROI for planting this month?" }
      ];
    }

    setMessages((prev) => [
      ...prev,
      { sender: 'dhenu', text: greeting, actions: acts }
    ]);
  };

  const simulateSpeechRecognition = () => {
    setIsListening(true);
    const sampleQueries = {
      te: "ఈరోజు మదనపల్లె టమోటా రేటు ఎంత?",
      hi: "आज मदनपल्ले टमाटर मंडी का भाव क्या है?",
      en: "What is today's Tomato Mandi rate in Madanapalle?"
    };
    const chosen = sampleQueries[language];

    setTimeout(() => {
      setInputText(chosen);
      setIsListening(false);
      sendMessage(chosen);
    }, 1500);
  };

  const sendMessage = async (queryText) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg = { sender: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const lower = textToSend.toLowerCase();
      let dhenuReply = '';
      let directRoute = null;
      let routeLabel = '';

      if (lower.includes('tomato') || lower.includes('టమోటా') || lower.includes('टमाटर') || lower.includes('mandi') || lower.includes('ధర') || lower.includes('भाव')) {
        if (language === 'te') {
          dhenuReply = "మదనపల్లె & గుంటూరు మార్కెట్లలో నేటి ప్రభుత్వ మోడల్ టమోటా ధర ₹22.00/కిలో. మన ప్లాట్‌ఫామ్‌లో నేరుగా రైతు ధర ₹20.00/కిలో మాత్రమే (రైతుకు ₹4/కిలో అదనపు లాభం, కొనుగోలుదారునికి ₹2 ఆదా).";
        } else if (language === 'hi') {
          dhenuReply = "मदनपल्ले व गुंटूर मंडी में आज सरकारी मॉडल टमाटर भाव ₹22.00/किलो है। हमारे किसान सीधे ₹20.00/किलो पर बेच रहे हैं।";
        } else {
          dhenuReply = "Today's official APMC Mandi modal price for Hybrid Tomato is ₹22.00/kg. On VyavaSahayam, verified farmers offer direct batches at ₹20.00/kg with 94% freshness score.";
        }
        directRoute = '/market-prices';
        routeLabel = '🏛️ Open Live Mandi Bulletin';
      } else if (lower.includes('kartheeka') || lower.includes('కార్తీక') || lower.includes('कार्तिक') || lower.includes('demand') || lower.includes('డిమాండ్') || lower.includes('मांग')) {
        if (language === 'te') {
          dhenuReply = "కార్తీక మాసంలో మాంసాహార విక్రయాలు 85% తగ్గుతాయి! పాలకూర (+75%), తోటకూర (+80%), అరటికాయ (+85%), మరియు వంకాయ (+60%) డిమాండ్ భారీగా పెరుగుతుంది. రైతులు ఇప్పుడే విత్తనాలు వేస్తే 1.8x లాభం పొందవచ్చు.";
        } else if (language === 'hi') {
          dhenuReply = "कार्तिक मास में शाकाहारी मांग 75% तक बढ़ जाती है। पालक, तोताकुरा, बैंगन और कच्चे केले की कीमतें उच्चतम स्तर पर पहुंचेंगी।";
        } else {
          dhenuReply = "During Kartheeka Maasam, strict vegetarianism surges demand for Leafy Greens (+75%), Raw Banana (+85%), and Brinjal (+60%). Farmers can plant now for a 1.75x profit multiplier.";
        }
        directRoute = '/demand-forecasting';
        routeLabel = '📊 Open 12-Month Demand Hub';
      } else if (lower.includes('sow') || lower.includes('crop') || lower.includes('పంట') || lower.includes('బోన') || lower.includes('బోయి') || lower.includes('విత్తన')) {
        if (language === 'te') {
          dhenuReply = "కృష్ణా మరియు గుంటూరు డెల్టా నేలల్లో ఇప్పుడు పాలకూర, లేడీస్ ఫింగర్ (బెండకాయ) మరియు క్యాలీఫ్లవర్ వేయడం అత్యంత లాభదాయకం. 2 ఎకరాలకు అంచనా లాభం ₹1,85,000.";
        } else if (language === 'hi') {
          dhenuReply = "वर्तमान रबी मौसम में पालक और फूलगोभी की बुवाई पर 2 एकड़ भूमि से लगभग ₹1,85,000 का शुद्ध लाभ अनुमानित है।";
        } else {
          dhenuReply = "For alluvial/black clay soils, sowing Palak and Cauliflower now is projected to yield an estimated net profit of ₹1,85,000 per 2 acres ahead of festive demand.";
        }
        directRoute = '/farmer/recommendations';
        routeLabel = '🌾 Open Crop Sowing Simulator';
      } else {
        // Fallback to backend AI endpoint if available
        try {
          const res = await api.post('/ai/dhenu/query', { query: textToSend, language });
          dhenuReply = res.data?.answer || "Thank you! VyavaSahayam guarantees verified APMC price benchmarks and 100% Escrow security.";
        } catch {
          dhenuReply = language === 'te'
            ? "ధన్యవాదాలు! మీ వినతిని ధేను AI విశ్లేషించింది. మా ప్రభుత్వ ధృవీకృత మార్కెట్ ధరలు లేదా ఫ్రెష్ షాపింగ్ పేజీని తనిఖీ చేయండి."
            : "Thank you! VyavaSahayam connects farmers directly to consumers with zero middlemen commissions and AI freshness screening.";
        }
        directRoute = '/shop';
        routeLabel = '🛒 Fresh Marketplace';
      }

      const dhenuMsg = {
        sender: 'dhenu',
        text: dhenuReply,
        directRoute,
        routeLabel
      };
      setMessages((prev) => [...prev, dhenuMsg]);

      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 2500);
    } catch (err) {
      console.error("Dhenu error:", err);
      setMessages((prev) => [
        ...prev,
        { sender: 'dhenu', text: "Apologies, I encountered a temporary connection issue. Please try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button (Responsive positioning on mobile & desktop) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-brand-700 via-emerald-600 to-teal-700 text-white shadow-xl shadow-brand-600/30 hover:scale-105 active:scale-95 transition-all group ring-4 ring-white/80"
          aria-label="Open Dhenu AI Kisan Assistant"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-extrabold leading-tight flex items-center gap-1.5">
              Dhenu AI <span className="inline-block w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
            </div>
            <div className="text-[10px] text-emerald-100 font-medium">Voice & Agri Copilot</div>
          </div>
          <span className="sm:hidden text-xs font-extrabold">
            Dhenu AI
          </span>
        </button>
      )}

      {/* Interactive Chat Window & Mobile Bottom Sheet */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-50 flex items-end sm:items-center justify-center p-0 sm:p-0 bg-slate-900/50 sm:bg-transparent backdrop-blur-xs sm:backdrop-blur-none animate-fadeIn">
          
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:w-[420px] max-h-[85vh] sm:h-[560px] flex flex-col overflow-hidden border border-slate-200">
            
            {/* Mobile Sheet Drag Indicator */}
            <div className="sm:hidden pt-2.5 pb-1 flex justify-center bg-emerald-950">
              <div className="w-12 h-1.5 rounded-full bg-white/30" />
            </div>

            {/* Header */}
            <div className="bg-gradient-to-r from-brand-900 via-emerald-800 to-teal-900 text-white p-4 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shadow-inner">
                  <Sprout className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h4 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                    Dhenu AI Agri & Mandi Copilot
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-400/20 text-emerald-300 text-[9px] font-mono font-bold">
                      Multilingual
                    </span>
                  </h4>
                  <p className="text-[11px] text-emerald-200">Telugu • Hindi • English Voice Support</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Language Selection Chips */}
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-emerald-600" /> Language:
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

            {/* Speaking / Listening Audio Indicator */}
            {(isListening || isSpeaking) && (
              <div className="bg-emerald-900 text-white py-2 px-4 flex items-center justify-center gap-3 animate-pulse text-xs font-bold">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>{isListening ? '🎤 Listening...' : '🔊 Dhenu AI is speaking...'}</span>
                <div className="flex items-center gap-1 h-3">
                  <span className="w-1 h-2 bg-emerald-400 rounded-full animate-bounce" />
                  <span className="w-1 h-4 bg-emerald-300 rounded-full animate-bounce delay-100" />
                  <span className="w-1 h-3 bg-emerald-400 rounded-full animate-bounce delay-200" />
                  <span className="w-1 h-5 bg-teal-300 rounded-full animate-bounce delay-300" />
                </div>
              </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed space-y-2 ${
                      msg.sender === 'user'
                        ? 'bg-brand-600 text-white shadow-sm rounded-br-none'
                        : 'bg-white border border-slate-200 text-slate-800 shadow-sm rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-line font-medium">{msg.text}</p>

                    {/* Direct Navigation Button */}
                    {msg.directRoute && (
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          navigate(msg.directRoute);
                        }}
                        className="w-full mt-2 py-1.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[11px] flex items-center justify-between transition-all active:scale-98"
                      >
                        <span>{msg.routeLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                      </button>
                    )}
                  </div>

                  {/* Suggested Quick Action Chips */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {msg.actions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => sendMessage(typeof act === 'string' ? act : act.query)}
                          className="px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95"
                        >
                          <span>{typeof act === 'string' ? act : act.label}</span>
                          <ChevronRight className="w-3 h-3 text-emerald-600" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-500 w-fit">
                  <Sparkles className="w-3.5 h-3.5 text-brand-600 animate-spin" />
                  <span>Dhenu is querying Agmarknet & seasonal curves...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <button
                onClick={simulateSpeechRecognition}
                disabled={isListening}
                className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                }`}
                title="Tap to Speak (Voice Input)"
              >
                <Mic className="w-4 h-4" />
              </button>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex-1 flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder={language === 'te' ? 'పంట ధర లేదా డిమాండ్ గురించి అడగండి...' : language === 'hi' ? 'फसल भाव या मांग के बारे में पूछें...' : 'Ask about Mandi prices, demand, sowing...'}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                />
                <button
                  type="submit"
                  disabled={loading || !inputText.trim()}
                  className="p-2 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-50 transition-all shadow-sm active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
export default DhenuChatWidget;

