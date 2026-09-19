import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sprout, ShieldCheck, ArrowRight, Zap, SunMedium, ShoppingBag,
  Building2, Tractor, CheckCircle2, TrendingUp, Sparkles, Truck, RefreshCw, BarChart2
} from 'lucide-react';
import { FreshnessBadge } from '../../components/common/FreshnessBadge';
import { DigitalTwinModal } from '../../components/common/DigitalTwinModal';
import api from '../../services/api';

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [digitalTwinOpen, setDigitalTwinOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/consumers/products');
        setFeaturedProducts(res.data.slice(0, 4));
      } catch (err) {
        console.error("Failed to load featured products:", err);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="space-y-16 pb-20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-gradient-to-b from-brand-50/80 via-emerald-50/40 to-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold shadow-sm border border-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Next-Gen Agricultural Supply Chain Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Direct Farm Produce. <br />
                <span className="bg-gradient-to-r from-emerald-600 via-brand-600 to-teal-600 bg-clip-text text-transparent">
                  Zero Middlemen Spoilage.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                <strong>VyavaSahayam</strong> connects farmers and FPOs directly with B2B bulk buyers and households through local <strong>Rythu Bazar</strong> fulfillment, AI freshness screening, automated Escrow payments, and a zero-waste <strong>Solar Drying Rescue Engine</strong>.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  to="/shop"
                  className="px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-600/30 flex items-center gap-2 transition-all hover:scale-102"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Shop Fresh Produce</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>

                <Link
                  to="/farmer/dashboard"
                  className="px-6 py-3.5 rounded-xl text-sm font-bold text-slate-800 bg-white border border-slate-300 hover:border-brand-500 hover:bg-brand-50/50 shadow-sm flex items-center gap-2 transition-all"
                >
                  <Tractor className="w-4 h-4 text-brand-600" />
                  <span>Farmer Portal</span>
                </Link>

                <Link
                  to="/buyer/dashboard"
                  className="px-6 py-3.5 rounded-xl text-sm font-bold text-blue-700 bg-blue-50/80 border border-blue-200 hover:bg-blue-100/80 flex items-center gap-2 transition-all"
                >
                  <Building2 className="w-4 h-4" />
                  <span>B2B Procurement</span>
                </Link>
              </div>

              {/* Key Trust Metrics */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 text-left">
                <div>
                  <div className="text-2xl font-black text-slate-900 font-mono">100%</div>
                  <div className="text-xs text-slate-500 font-medium">Escrow Protected</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-600 font-mono">&lt;6 hrs</div>
                  <div className="text-xs text-slate-500 font-medium">Harvest to Hub</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-solar-600 font-mono">0% Loss</div>
                  <div className="text-xs text-slate-500 font-medium">Solar Rescue Backed</div>
                </div>
              </div>

            </div>

            {/* Visual Hero Interactive Card */}
            <div className="lg:col-span-5 relative">
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-extrabold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            System Architecture
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900">
            How VyavaSahayam Eliminates Intermediaries & Spoilage
          </h2>
          <p className="text-sm text-slate-600">
            Traditional agricultural chains take 3-5 days and incur 35-45% middleman markups. Our platform creates a transparent digital loop.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Tractor className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-900">1. Rythu Bazar Local Fulfillment</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Farmers bring fresh harvests to local Rythu Bazar collection centers where produce is electronically weighed, sorted, graded, and quality-sealed within 2 hours.
            </p>
            <ul className="text-xs space-y-1.5 text-slate-700 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Standardized Grade A/B/C Inspection
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Direct Village FPO Aggregation
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-900">2. AI Freshness & Digital Twins</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every batch receives an AI computer vision scan that predicts shelf-life, spoilage risk, and monitors temperature/humidity decay continuously.
            </p>
            <ul className="text-xs space-y-1.5 text-slate-700 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Computer Vision Screening Layer
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Dynamic Freshness Discount Rules
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-solar-100 text-solar-700 flex items-center justify-center font-bold">
              <SunMedium className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-900">3. Rescue Engine & Solar Drying</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              If an order is cancelled or shelf-life window drops, the Rescue Engine automatically converts surplus produce into high-value solar-dried flakes and powders.
            </p>
            <ul className="text-xs space-y-1.5 text-slate-700 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-solar-600" /> 10:1 Value-Addition Yield Recovery
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-solar-600" /> Strict Food Safety Biocontainment
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* Fresh Harvest Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">Today's Fresh Farm Harvests</h3>
            <p className="text-xs text-slate-500">Inspected at Rythu Bazar • Ready for direct delivery</p>
          </div>
          <Link
            to="/shop"
            className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1"
          >
            <span>View All Marketplace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all flex flex-col group"
            >
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img
                  src={prod.image_url}
                  alt={prod.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 left-2.5">
                  <FreshnessBadge score={prod.ai_freshness_score} category={prod.ai_freshness_category} size="sm" />
                </div>
                <div className="absolute bottom-2.5 right-2.5 bg-slate-900/80 backdrop-blur-md text-white px-2 py-0.5 rounded text-xs font-mono font-bold">
                  ₹{prod.asking_price} / {prod.unit}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                    {prod.category}
                  </span>
                  <h4 className="font-extrabold text-sm text-slate-900 line-clamp-1">
                    {prod.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Farmer: <strong>{prod.farmer_name}</strong> ({prod.village})
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Grade: <strong className="text-slate-800">{prod.quality_grade}</strong></span>
                  <Link
                    to="/shop"
                    className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold transition-colors"
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
