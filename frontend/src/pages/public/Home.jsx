import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sprout, ShieldCheck, ArrowRight, Zap, SunMedium, ShoppingBag,
  Building2, Tractor, CheckCircle2, TrendingUp, Sparkles, Truck, RefreshCw, BarChart2,
  Landmark, Flame, BellRing, Calendar, ChevronRight
} from 'lucide-react';
import { FreshnessBadge } from '../../components/common/FreshnessBadge';
import { DigitalTwinModal } from '../../components/common/DigitalTwinModal';
import api from '../../services/api';

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [govtTickers, setGovtTickers] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [digitalTwinOpen, setDigitalTwinOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, pricesRes] = await Promise.all([
          api.get('/consumers/products'),
          api.get('/market-prices/daily')
        ]);
        setFeaturedProducts(prodRes.data.slice(0, 4));
        setGovtTickers(pricesRes.data?.records?.slice(0, 8) || []);
      } catch (err) {
        console.error("Home data error:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-4 sm:space-y-8 pb-20 sm:pb-24">
      
      {/* 1. Interactive Live Government APMC Price Ticker */}
      <div className="bg-slate-950 text-white py-1.5 px-3 sm:px-4 border-b border-emerald-500/20 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 px-1.5 py-0.5 sm:px-2 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] sm:text-[10px] font-mono font-black uppercase border border-emerald-500/30 flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Mandi Ticker</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto no-scrollbar touch-scroll overscroll-contain text-[11px] sm:text-xs font-mono whitespace-nowrap py-0.5">
            {govtTickers.length > 0 ? (
              govtTickers.map((t, idx) => (
                <Link
                  key={idx}
                  to="/market-prices"
                  className="flex items-center gap-1.5 hover:text-emerald-300 transition-colors group"
                >
                  <span className="font-bold text-slate-200">{t.commodity}</span>
                  <span className="text-slate-400 text-[10px]">({t.market})</span>
                  <span className="text-emerald-400 font-extrabold">₹{t.modal_price_kg}/kg</span>
                  <span className="text-slate-700 text-[10px]">|</span>
                </Link>
              ))
            ) : (
              <span className="text-slate-400 text-xs">Loading live Agmarknet benchmark feeds...</span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Cultural Demand Alert Banner - Sleek Festive Card */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <Link
          to="/demand-forecasting"
          className="group block p-3 sm:p-4.5 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-950 via-orange-950 to-slate-950 text-white border border-amber-500/30 shadow-md hover:shadow-xl transition-all active:scale-[0.99]"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
            <div className="flex items-start gap-2.5 sm:gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner flex-shrink-0 mt-0.5">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 animate-bounce" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-wider text-amber-300">
                    Cultural Demand Surge
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[8px] font-black uppercase">
                    Upcoming
                  </span>
                </div>
                <h4 className="font-extrabold text-xs sm:text-base text-white mt-0.5 leading-snug">
                  Kartheeka Maasam (కార్తీక మాసం) – Vegetarian Spike +75%
                </h4>
                <p className="text-[10px] sm:text-xs text-amber-100/80 mt-0.5 line-clamp-1 sm:line-clamp-none">
                  Palak, Thotakura, Brinjal, and Raw Banana demand surges. View hedging &amp; sowing curves.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-[11px] sm:text-xs shadow-md group-hover:bg-amber-400 transition-colors flex-shrink-0 self-end sm:self-center">
              <span>View Forecast</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </Link>
      </div>

      {/* 3. Hero Section */}
      <section className="relative overflow-hidden pt-1 sm:pt-4 pb-6 sm:pb-14 bg-gradient-to-b from-brand-50/70 via-emerald-50/30 to-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-6 lg:gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-3 sm:space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] sm:text-xs font-bold border border-emerald-200 shadow-2xs">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>Next-Gen Direct Agricultural Supply Network</span>
              </div>

              <h1 className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.18] sm:leading-[1.15]">
                Direct Farm Harvests. <br />
                <span className="bg-gradient-to-r from-emerald-600 via-brand-600 to-teal-600 bg-clip-text text-transparent">
                  Zero Middlemen Spoilage.
                </span>
              </h1>

              <p className="text-xs sm:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                <strong>VyavaSahayam</strong> connects farmers and FPOs directly with B2B bulk buyers and households through local <strong>Rythu Bazar</strong> fulfillment, AI freshness screening, automated Escrow payments, and a zero-waste <strong>Solar Drying Rescue Engine</strong>.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-center lg:justify-start gap-2 sm:gap-3 pt-1 sm:pt-2">
                <Link
                  to="/shop"
                  className="w-full xs:w-auto px-5 sm:px-6 py-2.5 sm:py-3 min-h-[44px] rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black text-white bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-600/25 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Shop Fresh Produce</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/market-prices"
                  className="w-full xs:w-auto px-4 sm:px-5 py-2.5 sm:py-3 min-h-[44px] rounded-xl sm:rounded-2xl text-xs sm:text-sm font-extrabold text-emerald-900 bg-emerald-100/90 border border-emerald-300 hover:bg-emerald-200 shadow-2xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <Landmark className="w-4 h-4 text-emerald-700" />
                  <span>Live Mandi Rates</span>
                </Link>

                <Link
                  to="/demand-forecasting"
                  className="w-full xs:w-auto px-4 sm:px-5 py-2.5 sm:py-3 min-h-[44px] rounded-xl sm:rounded-2xl text-xs sm:text-sm font-extrabold text-teal-900 bg-teal-100/90 border border-teal-300 hover:bg-teal-200 shadow-2xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <BarChart2 className="w-4 h-4 text-teal-700" />
                  <span>AI Demand Matrix</span>
                </Link>
              </div>

              {/* Key Trust Metrics */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-3 sm:pt-5 border-t border-slate-200 text-center sm:text-left">
                <div className="bg-white/80 sm:bg-transparent p-2 sm:p-0 rounded-xl sm:rounded-none border sm:border-0 border-slate-200/80 shadow-2xs sm:shadow-none">
                  <div className="text-base sm:text-2xl font-black text-slate-900 font-mono">100%</div>
                  <div className="text-[9px] sm:text-xs text-slate-500 font-medium mt-0.5">Escrow Protected</div>
                </div>
                <div className="bg-white/80 sm:bg-transparent p-2 sm:p-0 rounded-xl sm:rounded-none border sm:border-0 border-slate-200/80 shadow-2xs sm:shadow-none">
                  <div className="text-base sm:text-2xl font-black text-emerald-600 font-mono">&lt;6 hrs</div>
                  <div className="text-[9px] sm:text-xs text-slate-500 font-medium mt-0.5">Harvest to Hub</div>
                </div>
                <div className="bg-white/80 sm:bg-transparent p-2 sm:p-0 rounded-xl sm:rounded-none border sm:border-0 border-slate-200/80 shadow-2xs sm:shadow-none">
                  <div className="text-base sm:text-2xl font-black text-solar-600 font-mono">0% Loss</div>
                  <div className="text-[9px] sm:text-xs text-slate-500 font-medium mt-0.5">Solar Rescue</div>
                </div>
              </div>

            </div>

            {/* Visual Hero Interactive Card — hidden on mobile, shown md+ */}
            <div className="hidden lg:block lg:col-span-5 relative">
              <div className="relative rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-5">
                
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                      Live Produce Stream
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                    Rythu Bazar Hub #01
                  </span>
                </div>

                {/* Sample Live Listing item */}
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 group">
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80"
                      alt="Tomatoes"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <FreshnessBadge score={94} category="FRESH" size="md" />
                    </div>
                    <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-xs font-mono font-bold">
                      ₹24 / kg
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">
                        Hybrid Vine Tomatoes (Grade A)
                      </h4>
                      <p className="text-xs text-slate-500">
                        Harvested by Apparao Naidu • Gannavaram Village (6 km)
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                      <span className="text-slate-500 font-medium">Est. Shelf Life: <strong>4.5 Days</strong></span>
                      <button
                        onClick={() => {
                          setSelectedListing({
                            title: "Hybrid Vine Tomatoes (Grade A)",
                            asking_price: 24,
                            remaining_shelf_life_days: 4.5,
                            expected_shelf_life_days: 5,
                            ai_freshness_score: 94,
                            ai_freshness_category: "FRESH",
                            iot_temp: 24.0,
                            iot_humidity: 68.0
                          });
                          setDigitalTwinOpen(true);
                        }}
                        className="text-brand-700 hover:text-brand-800 font-bold flex items-center gap-1"
                      >
                        <span>View Digital Twin</span>
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Micro supply chain diagram */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
                    Traceable Chain of Custody
                  </span>
                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <span className="font-semibold text-emerald-700">🌱 Farm Harvest</span>
                    <span>→</span>
                    <span className="font-semibold text-emerald-700">🏬 Rythu Bazar</span>
                    <span>→</span>
                    <span className="font-semibold text-brand-700">🚚 Cold Transit</span>
                    <span>→</span>
                    <span className="font-semibold text-slate-900">🍽️ Consumer</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3-Pillar Value Proposition */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-2.5 sm:space-y-3 mb-6 sm:mb-12">
          <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            System Architecture
          </span>
          <h2 className="text-xl xs:text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
            How VyavaSahayam Eliminates Intermediaries &amp; Spoilage
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Traditional agricultural chains take 3-5 days and incur 35-45% middleman markups. Our platform creates a transparent digital loop.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          
          <div className="p-4.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-3 sm:space-y-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Tractor className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900">1. Rythu Bazar Local Fulfillment</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Farmers bring fresh harvests to local Rythu Bazar collection centers where produce is electronically weighed, sorted, graded, and quality-sealed within 2 hours.
            </p>
            <ul className="text-xs space-y-1.5 text-slate-700 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> <span>Standardized Grade A/B/C Inspection</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> <span>Direct Village FPO Aggregation</span>
              </li>
            </ul>
          </div>

          <div className="p-4.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-3 sm:space-y-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900">2. AI Freshness &amp; Digital Twins</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every batch receives an AI computer vision scan that predicts shelf-life, spoilage risk, and monitors temperature/humidity decay continuously.
            </p>
            <ul className="text-xs space-y-1.5 text-slate-700 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" /> <span>Computer Vision Screening Layer</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" /> <span>Dynamic Freshness Discount Rules</span>
              </li>
            </ul>
          </div>

          <div className="p-4.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-3 sm:space-y-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-solar-100 text-solar-700 flex items-center justify-center font-bold">
              <SunMedium className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900">3. Rescue Engine &amp; Solar Drying</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              If an order is cancelled or shelf-life window drops, the Rescue Engine automatically converts surplus produce into high-value solar-dried flakes and powders.
            </p>
            <ul className="text-xs space-y-1.5 text-slate-700 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-solar-600 flex-shrink-0" /> <span>10:1 Value-Addition Yield Recovery</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-solar-600 flex-shrink-0" /> <span>Strict Food Safety Biocontainment</span>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* Fresh Harvest Showcase */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4 sm:mb-8">
          <div>
            <h3 className="text-lg xs:text-xl sm:text-2xl font-black text-slate-900">Today's Fresh Farm Harvests</h3>
            <p className="text-xs text-slate-500">Inspected at Rythu Bazar • Ready for direct delivery</p>
          </div>
          <Link
            to="/shop"
            className="text-xs font-black text-brand-700 hover:text-brand-800 flex items-center gap-1 min-h-[36px] items-center"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden hover:shadow-md transition-all flex flex-col group"
            >
              <div className="relative h-44 sm:h-48 overflow-hidden bg-slate-100">
                <img
                  src={prod.image_url}
                  alt={prod.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 left-2.5">
                  <FreshnessBadge score={prod.ai_freshness_score} category={prod.ai_freshness_category} size="sm" />
                </div>
                <div className="absolute bottom-2.5 right-2.5 bg-slate-900/85 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-xs font-mono font-bold shadow-xs">
                  ₹{prod.asking_price} / {prod.unit}
                </div>
              </div>

              <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                    {prod.category}
                  </span>
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 line-clamp-1">
                    {prod.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    Farmer: <strong>{prod.farmer_name}</strong> ({prod.village})
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Grade: <strong className="text-slate-800">{prod.quality_grade}</strong></span>
                  <Link
                    to="/shop"
                    className="px-3.5 py-2 min-h-[40px] rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-black transition-all flex items-center justify-center active:scale-95 shadow-2xs"
                  >
                    Buy Direct
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Digital Twin Modal */}
      <DigitalTwinModal
        listing={selectedListing}
        isOpen={digitalTwinOpen}
        onClose={() => setDigitalTwinOpen(false)}
      />

    </div>
  );
};
