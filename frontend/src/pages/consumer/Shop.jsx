import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Check, Zap, MapPin, Sparkles, Filter, Landmark, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FreshnessBadge } from '../../components/common/FreshnessBadge';
import { DigitalTwinModal } from '../../components/common/DigitalTwinModal';
import { GovtPriceBadge } from '../../components/common/GovtPriceBadge';
import { GovtPriceComparisonModal } from '../../components/common/GovtPriceComparisonModal';
import { useCart } from '../../contexts/CartContext';
import api from '../../services/api';

export const Shop = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [onlySavings, setOnlySavings] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [digitalTwinOpen, setDigitalTwinOpen] = useState(false);
  const [selectedGovtProduct, setSelectedGovtProduct] = useState(null);
  const [govtModalOpen, setGovtModalOpen] = useState(false);
  const [addedMap, setAddedMap] = useState({});
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const res = await api.get('/consumers/products', {
        params: { search: search || undefined }
      });
      setProducts(res.data);
    } catch (err) {
      console.error("Shop error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [search]);

  const handleAddToCart = (prod) => {
    addItem(prod, 1);
    setAddedMap((prev) => ({ ...prev, [prod.id]: true }));
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [prod.id]: false }));
    }, 1500);
  };

  const categories = ['All', 'Fresh Vegetables', 'Leafy Greens', 'Tubers'];
  let filteredProducts = category && category !== 'All'
    ? products.filter(p => p.category === category)
    : products;

  if (onlySavings) {
    filteredProducts = filteredProducts.filter(p => (p.govt_comparison?.savings_per_kg || 0) > 0);
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-5 sm:space-y-8">
      
      {/* Visual Impact Hero Section - Mobile-First Responsive */}
      <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white p-4.5 sm:p-8 lg:p-10 shadow-2xl border border-emerald-500/20 overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-60 sm:w-80 h-60 sm:h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-3.5 sm:space-y-4">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] sm:text-xs font-bold border border-emerald-400/30 backdrop-blur-md">
              <Landmark className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="truncate">Official Government APMC & Rythu Bazar Daily Rates Active</span>
            </div>

            <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.18] sm:leading-tight">
              Fresh Farm Marketplace. <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                Direct Harvest. Mandi Parity.
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl leading-relaxed">
              Buy verified, AI-graded harvests directly from local FPOs with 100% transparent comparison against daily Government APMC &amp; Rythu Bazar benchmarks.
            </p>

            {/* Quick Hero Search Input - 100% width, touch-friendly 48-52px height */}
            <div className="relative w-full max-w-md pt-1">
              <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 sm:left-4 top-4 sm:top-4.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search tomato, chilli, palak, or onion..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 sm:pl-11 pr-4 py-3 sm:py-3.5 min-h-[48px] sm:min-h-[52px] text-xs sm:text-sm rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-emerald-200/60 focus:bg-white/15 focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none shadow-inner transition-all"
              />
            </div>

            {/* Micro Stats Row - 3 equal width columns */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-3 border-t border-white/10 max-w-md text-left">
              <div className="bg-white/5 sm:bg-transparent p-2 sm:p-0 rounded-xl sm:rounded-none text-center sm:text-left">
                <span className="text-base sm:text-xl font-black font-mono text-emerald-400 block">{products.length || 18}+</span>
                <span className="text-[10px] sm:text-[11px] text-emerald-200/80 block font-medium leading-tight mt-0.5">Farm Batches</span>
              </div>
              <div className="bg-white/5 sm:bg-transparent p-2 sm:p-0 rounded-xl sm:rounded-none text-center sm:text-left">
                <span className="text-base sm:text-xl font-black font-mono text-amber-300 block">100%</span>
                <span className="text-[10px] sm:text-[11px] text-emerald-200/80 block font-medium leading-tight mt-0.5">Escrow Protected</span>
              </div>
              <div className="bg-white/5 sm:bg-transparent p-2 sm:p-0 rounded-xl sm:rounded-none text-center sm:text-left">
                <span className="text-base sm:text-xl font-black font-mono text-teal-300 block">&lt;6 hrs</span>
                <span className="text-[10px] sm:text-[11px] text-emerald-200/80 block font-medium leading-tight mt-0.5">Harvest to Hub</span>
              </div>
            </div>
          </div>

          {/* Right Hero Widget: Live Price Arbitrage Card */}
          <div className="lg:col-span-5">
            <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl space-y-3.5 sm:space-y-4">
              <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-emerald-300">
                    LIVE APMC VS FARM GATE
                  </span>
                </div>
                <span className="text-[9px] sm:text-[10px] font-mono text-emerald-200 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  Agmarknet DMI
                </span>
              </div>

              {/* Sample Live Benchmark Cards Stacked Vertically */}
              <div className="space-y-2 sm:space-y-2.5 text-xs">
                <div className="p-3 rounded-xl sm:rounded-2xl bg-black/30 border border-white/10 flex items-center justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-white text-xs sm:text-sm">Hybrid Vine Tomato</h4>
                    <span className="text-[10px] sm:text-[11px] text-emerald-200/70 block mt-0.5">Govt APMC: ₹22.00/kg</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-mono font-black text-emerald-400 text-sm sm:text-base">₹20.00/kg</span>
                    <span className="text-[9px] sm:text-[10px] text-emerald-300 font-extrabold block">Save ₹2.00/kg (9%)</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl sm:rounded-2xl bg-black/30 border border-white/10 flex items-center justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-white text-xs sm:text-sm">Guntur Green Chilli</h4>
                    <span className="text-[10px] sm:text-[11px] text-emerald-200/70 block mt-0.5">Govt APMC: ₹65.00/kg</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-mono font-black text-emerald-400 text-sm sm:text-base">₹58.00/kg</span>
                    <span className="text-[9px] sm:text-[10px] text-emerald-300 font-extrabold block">Save ₹7.00/kg (11%)</span>
                  </div>
                </div>
              </div>

              <Link
                to="/market-prices"
                className="w-full py-3 min-h-[44px] rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all active:scale-98"
              >
                <Landmark className="w-4 h-4 text-slate-950 flex-shrink-0" />
                <span className="truncate">Explore Full 93+ Govt Crop Bulletin</span>
                <ArrowUpRight className="w-4 h-4 flex-shrink-0" />
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Filter & Category Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar touch-scroll">
          {categories.map((cat) => {
            const count = cat === 'All'
              ? products.length
              : products.filter(p => p.category === cat).length;
            const isSelected = (category === cat || (cat === 'All' && !category));

            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 sm:px-4 py-2 min-h-[40px] rounded-xl sm:rounded-2xl text-xs font-extrabold transition-all active:scale-95 whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                    : 'bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <span>{cat}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}

          {/* Savings Filter Toggle */}
          <button
            onClick={() => setOnlySavings(!onlySavings)}
            className={`px-3 sm:px-4 py-2 min-h-[40px] rounded-xl sm:rounded-2xl text-xs font-extrabold transition-all flex items-center gap-1.5 active:scale-95 whitespace-nowrap ${
              onlySavings
                ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20 ring-2 ring-emerald-500/40'
                : 'bg-emerald-50 border border-emerald-200 text-emerald-900 hover:bg-emerald-100'
            }`}
          >
            <span>🎉 Below Govt Mandi Only</span>
          </button>
        </div>

        {/* Right Search / Count summary */}
        <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
          Showing <strong className="text-slate-900">{filteredProducts.length}</strong> farm batches
        </span>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="py-16 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Loading fresh farm harvests &amp; Government Mandi rates...</p>
        </div>
      )}

      {/* Empty State Fallback */}
      {!loading && filteredProducts.length === 0 && (
        <div className="py-16 px-6 text-center bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-base text-slate-900">No Produce Found</h3>
            <p className="text-xs text-slate-500">
              No active farm listings match your search or filter criteria.
            </p>
          </div>
          <button
            onClick={() => {
              setCategory('All');
              setSearch('');
              setOnlySavings(false);
            }}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm active:scale-95 min-h-[44px]"
          >
            Reset Filters &amp; View All Harvests
          </button>
        </div>
      )}

      {/* Products Grid - Single Column on Mobile */}
      {!loading && filteredProducts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {filteredProducts.map((prod) => {
          const isAdded = addedMap[prod.id];
          return (
            <div
              key={prod.id}
              className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-44 sm:h-48 overflow-hidden bg-slate-100">
                  <img
                    src={prod.image_url}
                    alt={prod.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <FreshnessBadge score={prod.ai_freshness_score} category={prod.ai_freshness_category} size="sm" />
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 bg-slate-900/85 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-xs font-mono font-bold shadow-sm">
                    ₹{prod.discount_price || prod.asking_price} / {prod.unit}
                  </div>
                </div>

                <div className="p-3.5 sm:p-4 space-y-2.5 sm:space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                      {prod.category}
                    </span>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 line-clamp-1">{prod.title}</h3>
                    <p className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{prod.farmer_name} • {prod.village}</span>
                    </p>
                  </div>

                  {/* Government Mandi Benchmark Comparison Badge */}
                  <GovtPriceBadge
                    comparison={prod.govt_comparison}
                    askingPrice={prod.discount_price || prod.asking_price}
                    onOpenModal={() => {
                      setSelectedGovtProduct(prod);
                      setGovtModalOpen(true);
                    }}
                  />

                  <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Quality: <strong className="text-slate-800">{prod.quality_grade}</strong></span>
                    <span className="text-slate-500">Shelf-Life: <strong className="text-slate-800">{prod.remaining_shelf_life_days}d</strong></span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 pt-0 space-y-2">
                <button
                  onClick={() => {
                    setSelectedListing(prod);
                    setDigitalTwinOpen(true);
                  }}
                  className="w-full py-2 min-h-[40px] rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold text-[11px] border border-slate-200 transition-colors flex items-center justify-center gap-1 active:scale-98"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Inspect Digital Twin</span>
                </button>

                <button
                  onClick={() => handleAddToCart(prod)}
                  className={`w-full py-2.5 sm:py-3 min-h-[44px] rounded-xl sm:rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-98 ${
                    isAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-600/20'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* Digital Twin Modal */}
      <DigitalTwinModal
        listing={selectedListing}
        isOpen={digitalTwinOpen}
        onClose={() => setDigitalTwinOpen(false)}
      />

      {/* Government Price Comparison Dossier Modal */}
      <GovtPriceComparisonModal
        isOpen={govtModalOpen}
        onClose={() => setGovtModalOpen(false)}
        product={selectedGovtProduct}
      />

    </div>
  );
};
export default Shop;
