import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Crown, Wind, FlaskConical, Vault, Image, Scale, Coins,
  Menu, X, Zap, Wifi, Gauge, Landmark,
} from 'lucide-react';
import WalletConnect from './WalletConnect';

const NAV_ITEMS = [
  { to: '/',           label: 'Master Control',   icon: Crown,       color: 'text-yellow-400' },
  { to: '/butterfly',  label: 'Butterfly',         icon: Zap,         color: 'text-purple-400' },
  { to: '/city',       label: 'Praise City',       icon: Wind,        color: 'text-sky-400' },
  { to: '/lab',        label: 'Smart Lab',         icon: FlaskConical,color: 'text-pink-400' },
  { to: '/vault',      label: 'Vaults',            icon: Vault,       color: 'text-green-400' },
  { to: '/enft',       label: 'ENFT Registry',     icon: Image,       color: 'text-indigo-400' },
  { to: '/governance', label: 'Governance',        icon: Scale,       color: 'text-orange-400' },
  { to: '/token',      label: 'BLEU Tokens',       icon: Coins,       color: 'text-blue-400' },
  { to: '/tachometer', label: 'Tachometer',        icon: Gauge,       color: 'text-cyan-400' },
  { to: '/treasury',   label: 'Treasury',          icon: Landmark,    color: 'text-emerald-400' },
];

const NavItem = ({ item, mobile, onClose }) => {
  const Icon = item.icon;
  const baseClasses = mobile
    ? 'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all'
    : 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap';

  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      onClick={mobile ? onClose : undefined}
      className={({ isActive }) =>
        `${baseClasses} ${isActive
          ? 'bg-white/10 text-white'
          : 'text-gray-400 hover:text-white hover:bg-white/5'}`
      }
    >
      <Icon size={mobile ? 18 : 14} className={item.color} />
      {item.label}
    </NavLink>
  );
};

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Scroll shadow
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <>
      <nav className={`sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/60 transition-shadow ${scrolled ? 'shadow-lg shadow-black/30' : ''}`}>
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className="flex items-center h-14 gap-4">

            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-2 shrink-0 mr-2">
              <span className="text-xl">🦋</span>
              <span className="font-bold text-white text-sm hidden sm:block">EV0LVERSE</span>
            </NavLink>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-1 flex-1 overflow-x-auto">
              {NAV_ITEMS.map((item) => (
                <NavItem key={item.to} item={item} mobile={false} />
              ))}
            </div>

            {/* Right side */}
            <div className="ml-auto flex items-center gap-3 shrink-0">
              {/* Live indicator */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-green-400">
                <Wifi size={12} className="animate-pulse" />
                <span>LIVE</span>
              </div>

              <WalletConnect compact />

              {/* Mobile menu toggle */}
              <button
                className="lg:hidden p-2 text-gray-400 hover:text-white transition"
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="Toggle menu"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        {menuOpen && (
          <div className="lg:hidden border-t border-slate-700/60 bg-slate-900 px-4 py-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavItem key={item.to} item={item} mobile={true} onClose={() => setMenuOpen(false)} />
            ))}
            <div className="pt-2 border-t border-slate-700/40 mt-2">
              <WalletConnect />
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
