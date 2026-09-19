import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2, Search, Filter, PlusCircle, ArrowRight, ShieldCheck,
  Truck, CheckCircle2, TrendingUp, Sparkles, MapPin
} from 'lucide-react';
import { FreshnessBadge } from '../../components/common/FreshnessBadge';
import { DigitalTwinModal } from '../../components/common/DigitalTwinModal';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export const BuyerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [marketplace, setMarketplace] = useState([]);
  const [demands, setDemands] = useState([]);
  const [searchProduct, setSearchProduct] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedListing, setSelectedListing] = useState(null);
  const [digitalTwinOpen, setDigitalTwinOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBuyerData = async () => {
      try {
        const [mktRes, demRes] = await Promise.all([
          api.get('/buyers/marketplace', {
            params: {
              product: searchProduct || undefined,
              grade: selectedGrade || undefined,
              max_price: maxPrice ? parseFloat(maxPrice) : undefined
            }
          }),
          api.get('/buyers/demand-requests')
        ]);
        setMarketplace(mktRes.data);
        setDemands(demRes.data);
      } catch (err) {
        console.error("Buyer data error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadBuyerData();
  }, [searchProduct, selectedGrade, maxPrice]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-300 text-xs font-semibold border border-white/15">
            <Building2 className="w-3.5 h-3.5" />
            <span>B2B Commercial Procurement</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            {user?.buyer_profile?.organization_name || user?.full_name || 'Commercial Procurement Hub'}
          </h1>
          <p className="text-xs sm:text-sm text-blue-200 max-w-xl">
            Direct bulk produce procurement directly from village FPOs with transparent AI matching, guaranteed shelf-life & Escrow settlement.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/buyer/requirements"
            className="px-5 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Demand / View Matches</span>
          </Link>
        </div>
      </div>

      {/* Active Demands & Match Status */}
      {demands.length > 0 && (
        <div className="p-5 rounded-3xl bg-blue-50/70 border border-blue-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-700" />
              <h3 className="font-extrabold text-sm text-blue-950">Active Procurement Demand Requests</h3>
            </div>
            <Link to="/buyer/requirements" className="text-xs font-bold text-blue-700 hover:underline">
              View Match Rankings →
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {demands.map((d) => (
              <div key={d.id} className="p-3.5 rounded-2xl bg-white border border-blue-100 shadow-sm space-y-1.5">
                <div className="flex justify-between items-center">
                  <strong className="text-slate-900 font-bold text-sm">{d.product_name}</strong>
                  <span className="px-2 py-0.5 rounded font-bold bg-blue-100 text-blue-800 text-[10px]">
                    {d.status}
                  </span>
                </div>
                <div className="text-slate-500">
                  Req: <strong>{d.required_quantity_kg} kg</strong> | Max Budget: <strong>₹{d.max_budget_per_kg}/kg</strong>
                </div>
                <div className="text-slate-500 text-[11px]">
                  Required Grade: <strong className="text-emerald-700">{d.required_grade}</strong> • Urgency: {d.urgency}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search crop name (Tomato, Onion, Chilli)..."
            value={searchProduct}
            onChange={(e) => setSearchProduct(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Quality Grades</option>
            <option value="GRADE_A">Grade A (Premium Retail)</option>
            <option value="GRADE_B">Grade B (Commercial / Hospitality)</option>
            <option value="GRADE_C">Grade C (Processing / Solar Drying)</option>
          </select>
        </div>

        <div>
          <input
            type="number"
            placeholder="Max Price (₹/kg)..."
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Available Wholesale Listings Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900">
          Available Farm Harvest Batches ({marketplace.length})
        </h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {marketplace.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  <img
                    src={item.image_url || "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80"}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <FreshnessBadge score={item.ai_freshness_score} category={item.ai_freshness_category} size="sm" />
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-xs font-mono font-bold">
                    ₹{item.asking_price} / {item.unit}
                  </div>
                </div>

                <div className="p-5 space-y-3 text-xs">
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900">{item.title}</h4>
                    <p className="text-slate-500 text-[11px] mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.farmer_name} • {item.village}, {item.district}</span>
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Available Batch:</span>
                      <strong className="text-slate-900 font-bold">{item.available_quantity} {item.unit}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Quality Grade:</span>
                      <strong className="text-emerald-700 font-bold">{item.quality_grade}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Remaining Shelf-Life:</span>
                      <strong className="text-slate-900 font-bold">{item.remaining_shelf_life_days} Days</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 flex gap-2">
                <button
                  onClick={() => {
                    setSelectedListing(item);
                    setDigitalTwinOpen(true);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                >
                  Digital Twin
                </button>
                <Link
                  to="/buyer/requirements"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs text-center transition-colors shadow-sm"
                >
                  Match & Order
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Digital Twin Modal */}
      <DigitalTwinModal
        listing={selectedListing}
        isOpen={digitalTwinOpen}
        onClose={() => setDigitalTwinOpen(false)}
      />

    </div>
  );
};
