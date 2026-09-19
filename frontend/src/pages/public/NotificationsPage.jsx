import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bell, CheckCircle2, Clock, ArrowRight, CheckCheck, Filter,
  Sparkles, Package, AlertCircle, RefreshCw, Layers
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export const NotificationsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('ALL');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unread_count || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notifId) => {
    try {
      await api.put(`/notifications/${notifId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const filtered = notifications.filter((n) => {
    if (typeFilter === 'ALL') return true;
    if (typeFilter === 'NEW_DEMAND') return n.notification_type === 'NEW_DEMAND';
    if (typeFilter === 'OFFERS') return ['OFFER_RECEIVED', 'OFFER_ACCEPTED'].includes(n.notification_type);
    if (typeFilter === 'ORDERS') return ['ORDER', 'ORDER_CREATED', 'DELIVERY'].includes(n.notification_type);
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Notification Center
            </h1>
            <p className="text-xs text-slate-500">
              Real-time marketplace alerts for demands, supply offers, matching, and orders
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mark All as Read</span>
            </button>
          )}
          <button
            onClick={fetchNotifications}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm text-xs">
        <span className="font-bold text-slate-700 px-2 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          Filter:
        </span>
        {[
          { label: 'All Alerts', val: 'ALL' },
          { label: '🔔 New Demands', val: 'NEW_DEMAND' },
          { label: '📦 Supply Offers', val: 'OFFERS' },
          { label: '🛒 Orders & Escrow', val: 'ORDERS' },
        ].map((tab) => (
          <button
            key={tab.val}
            onClick={() => setTypeFilter(tab.val)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              typeFilter === tab.val
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 space-y-3 bg-white rounded-3xl border border-slate-200">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
          <p className="font-bold text-xs">Syncing notifications from PostgreSQL...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3 shadow-sm">
          <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-sm">No Notifications Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You're all caught up! New demand matches and order updates will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((notif) => {
            const isUnread = !notif.is_read;
            return (
              <div
                key={notif.id}
                onClick={() => {
                  if (isUnread) handleMarkAsRead(notif.id);
                }}
                className={`p-5 rounded-3xl border transition-all text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isUnread
                    ? 'bg-emerald-50/50 border-emerald-300 shadow-sm ring-1 ring-emerald-400/30'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse flex-shrink-0" />
                    )}
                    <span className="font-extrabold text-sm text-slate-900">{notif.title}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {notif.notification_type}
                    </span>
                  </div>

                  <p className="text-slate-600 leading-relaxed">{notif.message}</p>

                  <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-1">
                    <Clock className="w-3 h-3" />
                    <span>{notif.created_at ? new Date(notif.created_at).toLocaleString('en-IN') : 'Just now'}</span>
                  </div>
                </div>

                {notif.action_url && (
                  <Link
                    to={notif.action_url}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 self-start sm:self-center transition-all whitespace-nowrap"
                  >
                    <span>View</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
export default NotificationsPage;
