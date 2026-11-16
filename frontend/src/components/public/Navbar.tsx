import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { to: '/', label: 'Trang chủ' },
  { to: '/recommend', label: 'Hôm nay ăn gì?' },
];

export const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-[#FFF9F0]/95 backdrop-blur-md border-b border-[#E8E2D8] shadow-xs">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 font-bold text-fm-text text-xl group">
          <div className="w-9 h-9 bg-[#BFE8D5] rounded-xl flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
            <span className="text-xl">🍜</span>
          </div>
          <span className="tracking-tight text-lg sm:text-xl font-black text-[#46564E]">
            FoodMate
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1.5 bg-white/70 px-2 py-1.5 rounded-full border border-[#E8E2D8]">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                [
                  'px-4 py-1.5 rounded-full text-xs font-semibold transition-all',
                  isActive
                    ? 'bg-[#BFE8D5] text-[#46564E] shadow-xs'
                    : 'text-[#46564E]/70 hover:bg-[#FFF9F0] hover:text-[#46564E]',
                ].join(' ')
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-btn text-fm-text hover:bg-white border border-[#E8E2D8]"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#E8E2D8] bg-[#FFF9F0] px-4 py-3 space-y-1.5 shadow-sm">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                [
                  'block px-4 py-2.5 rounded-btn text-xs font-semibold',
                  isActive ? 'bg-[#BFE8D5] text-[#46564E]' : 'text-[#46564E] hover:bg-white',
                ].join(' ')
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
};
