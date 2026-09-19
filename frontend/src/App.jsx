import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DemoSwitcher } from './components/common/DemoSwitcher';
import { Navbar } from './components/common/Navbar';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { DhenuChatWidget } from './components/common/DhenuChatWidget';
import { FloatingCartCapsule } from './components/common/FloatingCartCapsule';
import { useAuth } from './contexts/AuthContext';

// Public Pages
import { Home } from './pages/public/Home';
import { HowItWorks } from './pages/public/HowItWorks';
import { Traceability } from './pages/public/Traceability';
import { MarketPricesDashboard } from './pages/public/MarketPricesDashboard';
import { DemandForecasting } from './pages/public/DemandForecasting';
import { DemandForecastPage } from './pages/public/DemandForecastPage';
import { DemandRadarPage } from './pages/public/DemandRadarPage';
import { NotificationsPage } from './pages/public/NotificationsPage';
import { EmergencyRescuePage } from './pages/public/EmergencyRescuePage';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// Farmer Pages
import { FarmerDashboard } from './pages/farmer/FarmerDashboard';
import { DemandOpportunitiesPage } from './pages/farmer/DemandOpportunitiesPage';
import { NewListing } from './pages/farmer/NewListing';
import { FarmerListings } from './pages/farmer/FarmerListings';
import { FarmerOrders } from './pages/farmer/FarmerOrders';
import { FarmerEarnings } from './pages/farmer/FarmerEarnings';
import { CropAdvisor } from './pages/farmer/CropAdvisor';

// Buyer Pages
import { BuyerDashboard } from './pages/buyer/BuyerDashboard';
import { BuyerRequirements } from './pages/buyer/BuyerRequirements';

// Consumer Pages
import { Shop } from './pages/consumer/Shop';
import { Cart } from './pages/consumer/Cart';
import { MyOrders } from './pages/consumer/MyOrders';
import { PaymentCallback } from './pages/consumer/PaymentCallback';

// Operator & Delivery
import { RythuBazarDashboard } from './pages/operator/RythuBazarDashboard';
import { DeliveryDashboard } from './pages/delivery/DeliveryDashboard';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { RescueControl } from './pages/admin/RescueControl';
import { SolarDryingManager } from './pages/admin/SolarDryingManager';
import { EscrowLedger } from './pages/admin/EscrowLedger';
import { SystemSettings } from './pages/admin/SystemSettings';

export default function App() {
  const { isAuthenticated, role } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      
      {/* 1-Click Live Demo Role Switcher Bar */}
      <DemoSwitcher />

      {/* Main Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/market-prices" element={<MarketPricesDashboard />} />
          <Route path="/demand-forecast" element={<DemandForecastPage />} />
          <Route path="/demand-forecasting" element={<DemandForecasting />} />
          <Route path="/demand-radar" element={<DemandRadarPage />} />
          <Route path="/rescue" element={<EmergencyRescuePage />} />
          <Route path="/emergency-rescue" element={<EmergencyRescuePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/traceability" element={<Traceability />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/payment/callback" element={<PaymentCallback />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Farmer Routes */}
          <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
          <Route path="/demand-opportunities" element={<DemandOpportunitiesPage />} />
          <Route path="/farmer/opportunities" element={<DemandOpportunitiesPage />} />
          <Route path="/farmer/listings" element={<FarmerListings />} />
          <Route path="/farmer/listings/new" element={<NewListing />} />
          <Route path="/farmer/orders" element={<FarmerOrders />} />
          <Route path="/farmer/earnings" element={<FarmerEarnings />} />
          <Route path="/farmer/recommendations" element={<CropAdvisor />} />

          {/* Buyer Routes */}
          <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
          <Route path="/buyer/requirements" element={<BuyerRequirements />} />

          {/* Consumer Routes */}
          <Route path="/orders" element={<MyOrders />} />

          {/* Rythu Bazar Operator */}
          <Route path="/operator/dashboard" element={<RythuBazarDashboard />} />

          {/* Delivery Partner */}
          <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/rescue" element={<RescueControl />} />
          <Route path="/admin/solar-drying" element={<SolarDryingManager />} />
          <Route path="/admin/payments" element={<EscrowLedger />} />
          <Route path="/admin/settings" element={<SystemSettings />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Floating Instant Cart Capsule (Mobile & Quick View) */}
      <FloatingCartCapsule />

      {/* Floating Dhenu AI Agricultural Advisor */}
      <DhenuChatWidget />

      {/* Intuitive Mobile Bottom Navigation Bar (Visible on mobile < md) */}
      <MobileBottomNav />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-bold text-slate-800">
            VyavaSahayam – Fresh Farm-to-Customer Agricultural Marketplace & Rescue Network
          </p>
          <p className="text-[11px] text-slate-400">
            Powered by Rythu Bazar Local Fulfillment, Computer Vision Freshness Screening, Escrow Payouts & Zero-Waste Solar Drying.
          </p>
        </div>
      </footer>

    </div>
  );
}
