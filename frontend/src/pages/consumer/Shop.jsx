import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Check, Zap, MapPin, Sparkles, Filter } from 'lucide-react';
import { FreshnessBadge } from '../../components/common/FreshnessBadge';
import { DigitalTwinModal } from '../../components/common/DigitalTwinModal';
import { useCart } from '../../contexts/CartContext';
import api from '../../services/api';

export const Shop = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [selectedListing, setSelectedListing] = useState(null);
  const [digitalTwinOpen, setDigitalTwinOpen] = useState(false);
  const [addedMap, setAddedMap] = useState({});
  const { addItem } = useCart();

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await api.get('/consumers/products', {
          params: { search: search || undefined }
        });
        setProducts(res.data);
      } catch (err) {
        console.error("Shop error:", err);
      }
    };
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
  const filteredProducts = category && category !== 'All'
    ? products.filter(p => p.category === category)
    : products;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Fresh Farm Marketplace
          </h1>
          <p className="text-xs text-slate-500">Harvested directly from local FPOs • Graded & verified at Rythu Bazar</p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search farm fresh vegetables..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none shadow-sm bg-white"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
              (category === cat || (cat === 'All' && !category))
                ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map((prod) => {
          const isAdded = addedMap[prod.id];
          return (
            <div
              key={prod.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={prod.image_url}
                    alt={prod.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <FreshnessBadge score={prod.ai_freshness_score} category={prod.ai_freshness_category} size="sm" />
                  </div>
                  <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-xs font-mono font-bold">
                    ₹{prod.asking_price} / {prod.unit}
                  </div>
                </div>

                <div className="p-4 space-y-2.5 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                      {prod.category}
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-900 line-clamp-1">{prod.title}</h3>
                    <p className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{prod.farmer_name} • {prod.village}</span>
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Quality Grade: <strong className="text-slate-800">{prod.quality_grade}</strong></span>
                    <span className="text-slate-500">Shelf-Life: <strong className="text-slate-800">{prod.remaining_shelf_life_days}d</strong></span>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0 space-y-2">
                <button
                  onClick={() => {
                    setSelectedListing(prod);
                    setDigitalTwinOpen(true);
                  }}
                  className="w-full py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold text-[11px] border border-slate-200 transition-colors flex items-center justify-center gap-1"
                >
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span>Inspect Digital Twin</span>
                </button>

                <button
                  onClick={() => handleAddToCart(prod)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm ${
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

      {/* Digital Twin Modal */}
      <DigitalTwinModal
        listing={selectedListing}
        isOpen={digitalTwinOpen}
        onClose={() => setDigitalTwinOpen(false)}
      />

    </div>
  );
};
