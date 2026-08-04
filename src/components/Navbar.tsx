import React, { useState } from 'react';
import { Currency } from '../types';

interface NavbarProps {
  currentCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  onOpenQuickDoc: () => void;
  onSearchQuery: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentCurrency,
  onCurrencyChange,
  onOpenQuickDoc,
  onSearchQuery,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const notifications = [
    { id: '1', title: 'Container CFS Arrival', text: 'MSKU-882190-4 reached Mundra SEZ CFS.', time: '12m ago', unread: true },
    { id: '2', title: 'eBRC Realization Completed', text: '₹2,64,027 credited for EXP/CI/2026/089.', time: '1h ago', unread: true },
    { id: '3', title: 'Loading Due Warning', text: 'MEDU-901244-1 loading due in 3 days.', time: '3h ago', unread: false },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    onSearchQuery(e.target.value);
  };

  return (
    <header className="h-16 border-b border-white/10 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* Left Branding & Live Ticker */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-blue-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-white font-bold text-lg tracking-wider">S</span>
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              SHIPZY <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">EXIM SaaS 2.0</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">Export-Import Management System</p>
          </div>
        </div>

        {/* Live Active Shipment Ticker */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/60 border border-white/5 text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-slate-400 font-semibold uppercase text-[10px]">Active Tracker:</span>
          <span className="font-mono text-emerald-400 font-medium">MSKU-882190-4</span>
          <span className="text-slate-500">•</span>
          <span>Vessel Maersk Sealand</span>
          <span className="text-slate-500">•</span>
          <span className="text-amber-400">CFS Reached</span>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="flex-1 max-w-md mx-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search Invoice, Container, PI, HSN or Buyer..."
            value={searchValue}
            onChange={handleSearchChange}
            className="w-full glass-input text-xs pl-9 pr-4 py-2 text-slate-200 placeholder-slate-400 focus:outline-none"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Right Controls: Currency, Notifications & CTA */}
      <div className="flex items-center space-x-4">
        {/* Currency Switcher */}
        <div className="flex items-center bg-slate-800/80 p-1 rounded-lg border border-white/10 text-xs">
          {(['USD', 'INR', 'EUR'] as Currency[]).map((curr) => (
            <button
              key={curr}
              onClick={() => onCurrencyChange(curr)}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                currentCurrency === curr
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {curr === 'USD' ? '$ USD' : curr === 'INR' ? '₹ INR' : '€ EUR'}
            </button>
          ))}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg bg-slate-800/60 border border-white/10 text-slate-300 hover:text-white hover:border-white/20 transition-all relative"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-slate-900"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 glass-panel p-4 z-50 shadow-2xl border border-white/15">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-xs font-semibold text-white">System Notifications</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">3 New</span>
              </div>
              <div className="space-y-3 mt-3">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2.5 rounded-lg bg-slate-800/40 border border-white/5 hover:border-blue-500/30 transition-all">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-medium text-slate-200">{n.title}</h4>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Primary CTA */}
        <button
          onClick={onOpenQuickDoc}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>+ New Document</span>
        </button>
      </div>
    </header>
  );
};
