import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import LoadingSkeleton from './components/LoadingSkeleton';
import Toast from './components/Toast';

// Lazy-load all dashboard pages for code splitting
const MasterDashboard       = lazy(() => import('./components/MasterDashboard'));
const ButterflyDashboard    = lazy(() => import('./components/ButterflyDashboard'));
const PraiseWindCity        = lazy(() => import('./components/PraiseWindCity'));
const SmartLabEL0V8         = lazy(() => import('./components/SmartLabEL0V8'));
const MEGAZIONVaultDashboard = lazy(() => import('./components/MEGAZIONVaultDashboard'));
const ENFTRegistry          = lazy(() => import('./components/ENFTRegistry'));
const GovernanceDashboard   = lazy(() => import('./components/GovernanceDashboard'));
const BLEUTokenDashboard    = lazy(() => import('./components/BLEUTokenDashboard'));
const EVOLTachometer       = lazy(() => import('./components/EVOLTachometer'));
const TreasuryOps          = lazy(() => import('./components/TreasuryOps'));

const PageLoader = () => (
  <div className="min-h-screen bg-slate-900 flex items-center justify-center">
    <LoadingSkeleton variant="page" />
  </div>
);

const App = () => (
  <ErrorBoundary>
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"           element={<MasterDashboard />} />
            <Route path="/butterfly"  element={<ButterflyDashboard />} />
            <Route path="/city"       element={<PraiseWindCity />} />
            <Route path="/lab"        element={<SmartLabEL0V8 />} />
            <Route path="/vault"      element={<MEGAZIONVaultDashboard />} />
            <Route path="/enft"       element={<ENFTRegistry />} />
            <Route path="/governance" element={<GovernanceDashboard />} />
            <Route path="/token"      element={<BLEUTokenDashboard />} />
            <Route path="/tachometer" element={<EVOLTachometer />} />
            <Route path="/treasury"   element={<TreasuryOps />} />
            <Route path="*"           element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Toast />
    </div>
  </ErrorBoundary>
);

export default App;
