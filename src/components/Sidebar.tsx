import React, { useState } from 'react';

export type ActiveEngine =
  | 'dashboard'
  | 'quotations'
  | 'proforma'
  | 'preShipment'
  | 'postShipment'
  | 'blDraft'
  | 'packingList'
  | 'coaSettings'
  | 'labelParameters'
  | 'invoices'
  | 'ewayBill'
  | 'eInvoice'
  | 'purchase'
  | 'production'
  | 'inventory'
  | 'payments'
  | 'shipmentTracking'
  | 'checklist'
  | 'expenses'
  | 'drive'
  | 'user'
  | 'reports'
  | 'master';

interface SidebarProps {
  activeEngine: ActiveEngine;
  onSelectEngine: (engine: ActiveEngine) => void;
}

interface NavItem {
  id: ActiveEngine;
  label: string;
  iconClass: string;
  color: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeEngine, onSelectEngine }) => {
  const [isExportDocsExpanded, setIsExportDocsExpanded] = useState(true);

  const exportDocsSubItems = [
    { id: 'proforma' as ActiveEngine, label: 'Proforma Invoice' },
    { id: 'preShipment' as ActiveEngine, label: 'Pre-Shipment Docs' },
    { id: 'postShipment' as ActiveEngine, label: 'Post-Shipment Docs' },
    { id: 'blDraft' as ActiveEngine, label: 'BL Draft' },
    { id: 'packingList' as ActiveEngine, label: 'Packing List' },
    { id: 'coaSettings' as ActiveEngine, label: 'COA Settings' },
    { id: 'labelParameters' as ActiveEngine, label: 'Label Parameters' },
  ];

  const isExportDocActive = exportDocsSubItems.some((item) => item.id === activeEngine);

  const mainNavItems: NavItem[] = [
    { id: 'invoices', label: 'Invoices', iconClass: 'fi fi-rr-document', color: 'text-indigo-400' },
    { id: 'ewayBill', label: 'E-way Bill', iconClass: 'fi fi-rr-truck-side', color: 'text-emerald-400' },
    { id: 'eInvoice', label: 'E-Invoice', iconClass: 'fi fi-rr-bolt', color: 'text-amber-400' },
    { id: 'purchase', label: 'Purchase', iconClass: 'fi fi-rr-box', color: 'text-blue-400' },
    { id: 'production', label: 'Production', iconClass: 'fi fi-rr-settings-sliders', color: 'text-purple-400' },
    { id: 'inventory', label: 'Inventory', iconClass: 'fi fi-rr-boxes', color: 'text-cyan-400' },
    { id: 'payments', label: 'Payments', iconClass: 'fi fi-rr-credit-card', color: 'text-emerald-400' },
    { id: 'shipmentTracking', label: 'Shipment tracking', iconClass: 'fi fi-rr-ship', color: 'text-sky-400' },
    { id: 'checklist', label: 'Checklist', iconClass: 'fi fi-rr-list-check', color: 'text-indigo-400' },
    { id: 'expenses', label: 'Expenses', iconClass: 'fi fi-rr-money-bill-wave', color: 'text-rose-400' },
    { id: 'drive', label: 'Drive', iconClass: 'fi fi-rr-folder', color: 'text-amber-400' },
    { id: 'user', label: 'User', iconClass: 'fi fi-rr-user', color: 'text-slate-300' },
    { id: 'reports', label: 'Reports', iconClass: 'fi fi-rr-chart-pie', color: 'text-emerald-400' },
  ];

  return (
    <aside className="w-64 sidebar-navy flex flex-col justify-between shrink-0 h-screen sticky top-0 px-4 py-5 z-30 select-none border-r border-white/10">
      {/* Brand Header */}
      <div className="space-y-4">
        <div className="px-3">
          <h1 className="text-2xl font-black text-white tracking-tight leading-none">
            ExportFlow
          </h1>
          <span className="text-xl font-bold text-white tracking-tight block">ERP</span>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Global Logistics</p>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1.5 text-xs font-semibold overflow-y-auto max-h-[calc(100vh-210px)] pr-1 scrollbar-thin">
          {/* 1. Dashboard */}
          <button
            onClick={() => onSelectEngine('dashboard')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all ${
              activeEngine === 'dashboard'
                ? 'sidebar-item-active font-bold text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <i className="fi fi-rr-dashboard text-sm text-slate-400 flex items-center"></i>
            <span>Dashboard</span>
          </button>

          {/* 2. QUOTATIONS */}
          <button
            onClick={() => onSelectEngine('quotations')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all ${
              activeEngine === 'quotations'
                ? 'sidebar-item-active font-bold text-white bg-indigo-600/30 border border-indigo-500/30 shadow-lg shadow-indigo-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <i className="fi fi-rr-file-edit text-sm text-emerald-400 flex items-center"></i>
            <span>Quotations</span>
          </button>

          {/* 3. EXPORT DOCUMENTS DROPDOWN */}
          <div className="space-y-1">
            <button
              onClick={() => setIsExportDocsExpanded(!isExportDocsExpanded)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                isExportDocActive ? 'bg-white/10 text-white font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center space-x-3">
                <i className="fi fi-rr-folder text-sm text-indigo-400 flex items-center"></i>
                <span>Export Documents</span>
              </div>
              <i
                className={`fi fi-rr-angle-small-down text-xs text-slate-400 transition-transform duration-200 flex items-center ${
                  isExportDocsExpanded ? 'rotate-180' : ''
                }`}
              ></i>
            </button>

            {/* EXPANDED SUB-ITEMS */}
            {isExportDocsExpanded && (
              <div className="pl-9 space-y-0.5">
                {exportDocsSubItems.map((sub) => {
                  const isActive = activeEngine === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => onSelectEngine(sub.id)}
                      className={`w-full text-left py-1.5 px-2 rounded text-xs transition-all ${
                        isActive
                          ? 'text-indigo-400 font-bold bg-indigo-500/10 border-l-2 border-indigo-400'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      {sub.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* MAIN TOP-LEVEL NAVIGATION ITEMS */}
          {mainNavItems.map((item) => {
            const isActive = activeEngine === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectEngine(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'sidebar-item-active font-bold text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <i className={`${item.iconClass} text-sm ${item.color} flex items-center`}></i>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile */}
      <div className="space-y-2 pt-3 border-t border-white/10 text-xs">
        <button
          onClick={() => onSelectEngine('master')}
          className="w-full flex items-center space-x-3 px-3 py-1.5 text-slate-400 hover:text-slate-200 font-semibold transition-colors"
        >
          <i className="fi fi-rr-settings text-sm text-slate-400 flex items-center"></i>
          <span>Settings</span>
        </button>

        <div className="flex items-center space-x-3 p-2 rounded-xl bg-white/5 border border-white/5 mt-1">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
            alt="Admin Avatar"
            className="w-8 h-8 rounded-full object-cover border border-indigo-400"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-white truncate">Admin User</h4>
            <p className="text-[10px] text-slate-400 truncate">admin@exportflow.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

