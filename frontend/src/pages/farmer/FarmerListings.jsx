import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Filter, Zap, ArrowRight } from 'lucide-react';
import { FreshnessBadge } from '../../components/common/FreshnessBadge';
import { DigitalTwinModal } from '../../components/common/DigitalTwinModal';
import api from '../../services/api';

export const FarmerListings = () => {
  const [listings, setListings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedListing, setSelectedListing] = useState(null);
  const [digitalTwinOpen, setDigitalTwinOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const res = await api.get('/farmers/listings', {
          params: statusFilter ? { status_filter: statusFilter } : {}
        });
        setListings(res.data);
      } catch (err) {
        console.error("Failed to load listings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [statusFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Produce Listings</h1>
          <p className="text-xs text-slate-500">Manage active harvests, track batches & trigger Digital Twins</p>
        </div>

        <Link
          to="/farmer/listings/new"
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-brand-600/20 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Harvest Listing</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-2">
        {['', 'ACTIVE', 'SOLD', 'PARTIALLY_SOLD', 'RESCUED', 'REJECTED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              statusFilter === st
                ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {st === '' ? 'All Listings' : st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Listings Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
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
                <div className="absolute bottom-2.5 right-2.5 bg-slate-900/80 backdrop-blur-md text-white px-2 py-0.5 rounded text-xs font-mono font-bold">
                  ₹{item.asking_price}/{item.unit}
                </div>
              </div>

              <div className="p-4 space-y-3 text-xs">
                <div>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mb-1 ${
                    item.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {item.status}
                  </span>
                  <h4 className="font-extrabold text-sm text-slate-900 line-clamp-1">{item.title}</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">{item.location_address}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Available Stock:</span>
                    <strong className="text-slate-900 font-bold">{item.available_quantity} / {item.quantity} {item.unit}</strong>
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

            <div className="p-4 pt-0">
              <button
                onClick={() => {
                  setSelectedListing(item);
                  setDigitalTwinOpen(true);
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Open Digital Twin Telemetry</span>
              </button>
            </div>
          </div>
        ))}
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
