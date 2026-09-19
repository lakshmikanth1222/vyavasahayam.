import React, { useState } from 'react';
import { Bot, X, Send, Sparkles, Sprout, MessageSquare, ChevronRight, HelpCircle } from 'lucide-react';
import api from '../../services/api';

export const DhenuChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'dhenu',
      text: "Namaste! I am your **Dhenu AI Agricultural Assistant**. Ask me about market prices, crop advisory, post-harvest shelf-life, or government subsidies.",
      actions: ["Today's Tomato & Chilli rates", "How to extend tomato shelf life?", "Solar drying subsidies"]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (queryText) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg = { sender: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await api.post('/ai/dhenu/query', {
        query: textToSend,
        language: 'en'
      });

      const dhenuMsg = {
        sender: 'dhenu',
        text: res.data.answer,
        category: res.data.category,
        actions: res.data.recommended_actions
      };
      setMessages((prev) => [...prev, dhenuMsg]);
    } catch (err) {
      console.error("Dhenu error:", err);
      setMessages((prev) => [
        ...prev,
        { sender: 'dhenu', text: "Apologies, I encountered a network issue. Please try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-brand-700 to-emerald-600 text-white shadow-xl shadow-brand-600/30 hover:scale-105 transition-all group ring-4 ring-white"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
          </div>
          <div className="text-left">
            <div className="text-xs font-extrabold leading-tight flex items-center gap-1">
              Dhenu AI <span className="inline-block w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
            </div>
            <div className="text-[10px] text-emerald-100 font-medium">Agri Advisor</div>
          </div>
        </button>
      )}

      {/* Interactive Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[92vw] h-[520px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-fadeIn">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-800 via-brand-700 to-emerald-800 text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shadow-inner">
                <Sprout className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  Dhenu AI Assistant
                  <span className="px-1.5 py-0.5 rounded bg-white/20 text-[10px] font-mono">2026 Model</span>
                </h4>
                <p className="text-[11px] text-emerald-200">Domain-Trained Agricultural Intelligence</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-brand-600 text-white shadow-sm rounded-br-none'
                      : 'bg-white border border-slate-200 text-slate-800 shadow-sm rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>

                {/* Suggested actions if present */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {msg.actions.map((act, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(act)}
                        className="px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-medium flex items-center gap-1 transition-all"
                      >
                        <span>{act}</span>
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
                <span>Dhenu is analyzing farm data & mandi trends...</span>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask about crop prices, pests, subsidies..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50"
              />
              <button
                type="submit"
                disabled={loading || !inputText.trim()}
                className="p-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 transition-all shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      )}
    </>
  );
};
