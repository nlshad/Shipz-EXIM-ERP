import React, { useState } from 'react';
import { ShipmentItem, OperationalActivity, ContractProfitability, Currency } from '../types';
import { CONTRACT_PROFITABILITY_DATA, OPERATIONAL_ACTIVITIES } from '../mockData';

interface ExecutiveDashboardProps {
  shipments: ShipmentItem[];
  currentCurrency: Currency;
  onNavigateEngine: (engine: any) => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  shipments,
  currentCurrency,
  onNavigateEngine,
}) => {
  const [showPnlModal, setShowPnlModal] = useState(false);
  const [financialYear, setFinancialYear] = useState('2025-2026');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifs, setShowNotifs] = useState(false);
  const [copyToast, setCopyToast] = useState(false);

  const [recentActivities] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('shipz_recent_activities');
      if (saved) return JSON.parse(saved);
    } catch (e) { }
    return [
      {
        id: 'act-1',
        title: 'Proforma Invoice Confirmed',
        badge: 'PI/06/25-26',
        badgeColor: 'emerald',
        description: 'Confirmed for Global Trade Partners LLC ($34,500.00 USD) • Port of Discharge: Los Angeles',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        actionText: 'View PI →',
        targetEngine: 'proforma'
      },
      {
        id: 'act-2',
        title: 'Official Quotation Generated',
        badge: 'QT/2026/089',
        badgeColor: 'amber',
        description: 'Prepared for Alxis Ltd (Seychelles) • Total FOB Value: $18,400.00 USD',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        actionText: 'View QT →',
        targetEngine: 'quotations'
      },
      {
        id: 'act-3',
        title: 'eBRC Payment Realization Completed',
        badge: 'EXP/CI/2026/089',
        badgeColor: 'emerald',
        description: '₹2,64,027 credited via Authorized Dealer Bank (SWIFT: BARBINBBXXX)',
        timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        actionText: 'View CI →',
        targetEngine: 'invoices'
      }
    ];
  });

  const formatRelativeTime = (isoString: string) => {
    if (!isoString) return 'Just now';
    const time = new Date(isoString).getTime();
    if (isNaN(time)) return 'Just now';
    const diffMs = Date.now() - time;
    const diffSec = Math.max(0, Math.floor(diffMs / 1000));
    if (diffSec < 45) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const fxRate = currentCurrency === 'INR' ? 83.5 : currentCurrency === 'EUR' ? 0.92 : 1.0;
  const currSymbol = currentCurrency === 'INR' ? '₹' : currentCurrency === 'EUR' ? '€' : '$';

  const formatMoney = (usdVal: number) => {
    const val = usdVal * fxRate;
    if (currentCurrency === 'INR') {
      if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
      if (val >= 100000) return `₹${(val / 100000).toFixed(2)} Lakh`;
      return `₹${val.toLocaleString('en-IN')}`;
    }
    return `${currSymbol}${val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const metrics = [
    { title: 'Total Annual Sales', value: formatMoney(1840000), change: '+18.4%', isPos: true, spark: [20, 35, 40, 30, 55, 65, 80] },
    { title: 'Gross Export Profit', value: formatMoney(412000), change: '+22.1%', isPos: true, spark: [10, 20, 25, 40, 38, 52, 60] },
    { title: 'Logistics & Freight Expense', value: formatMoney(86000), change: '-4.2%', isPos: true, spark: [50, 45, 40, 35, 30, 28, 25] },
    { title: 'Active Container Tracking', value: `${shipments.length} Units`, change: '5 Loading Due', isPos: true, spark: [3, 4, 5, 4, 6, 5, 5] },
  ];

  const loadingDueShipments = shipments.filter(
    (s) => s.stage === 'Container Booked' || s.stage === 'CFS Reached'
  );

  return (
    <div className="space-y-6 relative pb-12">
      {/* TOP HEADER & CONTROL BAR */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <input
            type="text"
            placeholder="Search across invoices, products, settings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
          />
          <i className="fi fi-rr-search text-slate-400 absolute left-3.5 top-3 text-xs"></i>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 font-bold text-slate-700">
            <span>FY:</span>
            <select
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
              className="bg-transparent font-bold text-indigo-600 focus:outline-none cursor-pointer"
            >
              <option value="2025-2026">2025-2026</option>
              <option value="2024-2025">2024-2025</option>
              <option value="2026-2027">2026-2027</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setShowPnlModal(true)}
            title="Quick Documents & Reports"
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <i className="fi fi-rr-document text-sm"></i>
          </button>

          <button
            type="button"
            onClick={() => onNavigateEngine('settings')}
            title="Master Settings Portal"
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 font-bold transition-all flex items-center justify-center cursor-pointer"
          >
            <i className="fi fi-rr-settings text-sm"></i>
          </button>

          <button
            type="button"
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
                setCopyToast(true);
                setTimeout(() => setCopyToast(false), 2500);
              }
            }}
            title="Share / Copy Link"
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 flex items-center justify-center transition-colors cursor-pointer relative"
          >
            <i className="fi fi-rr-link text-sm"></i>
            {copyToast && (
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-900 text-white text-[10px] rounded shadow-lg whitespace-nowrap z-50">
                Copied!
              </span>
            )}
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifs(!showNotifs)}
              title="Notifications"
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 relative flex items-center justify-center transition-colors cursor-pointer"
            >
              <i className="fi fi-rr-bell text-sm"></i>
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl p-4 z-50 shadow-2xl border border-slate-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-800">System Notifications</h3>
                  <span className="text-[10px] bg-rose-50 text-rose-600 font-extrabold px-2 py-0.5 rounded-full border border-rose-200">3 New</span>
                </div>
                <div className="space-y-2 mt-3 text-left">
                  <div className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-100 transition-all cursor-pointer">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-slate-800">Container CFS Arrival</h4>
                      <span className="text-[10px] text-slate-400">12m ago</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">MSKU-882190-4 reached Mundra SEZ CFS.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-100 transition-all cursor-pointer">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-slate-800">eBRC Realization Completed</h4>
                      <span className="text-[10px] text-slate-400">1h ago</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">₹2,64,027 credited for EXP/CI/2026/089.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-100 transition-all cursor-pointer">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-slate-800">Loading Due Warning</h4>
                      <span className="text-[10px] text-slate-400">3h ago</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">MEDU-901244-1 factory loading due in 3 days.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Header Banner */}
      <div className="glass-panel p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            EXIM Executive Command Center
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Q3 FY2026 Active
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time trade metrics, contractual profit & loss reports, and container stuffing due alerts.
          </p>
              <button
          onClick={() => setShowPnlModal(true)}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 flex items-center gap-2"
        >
          <i className="fi fi-rr-chart-pie text-xs"></i>
          <span>View Contractual P&L Breakdown</span>
        </button>
      </div>

      {/* TOP ROW: Metric Cards with Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, idx) => (
          <div key={idx} className="glass-panel p-4 space-y-3 glass-card-hover">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{m.title}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${m.isPos ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                {m.change}
              </span>
            </div>
            <div className="text-2xl font-extrabold text-white font-mono">{m.value}</div>

            {/* SVG Sparkline Graph */}
            <div className="h-8 w-full">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30">
                <polyline
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={m.spark.map((val, i) => `${(i / (m.spark.length - 1)) * 100},${30 - (val / 100) * 30}`).join(' ')}
                />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* MIDDLE ROW: Recent Activity & Operational Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Activity Table & Audit Trail */}
        <div className="lg:col-span-8 glass-panel p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Recent Activity & Audit Log
              </h3>
              <p className="text-[11px] text-slate-400">Live feed of trade transactions, document issues, and customs updates</p>
            </div>

            <button
              onClick={() => onNavigateEngine('quotations')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              View All Transactions →
            </button>
          </div>

          <div className="divide-y divide-white/10 text-xs">
            {recentActivities && recentActivities.length > 0 ? (
              recentActivities.slice(0, 5).map((act) => (
                <div key={act.id} className="py-3 flex items-center justify-between hover:bg-white/5 px-2 rounded-lg transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-500/30">
                      <i className={`${act.iconClass || 'fi fi-rr-file-invoice'} text-sm`}></i>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white">{act.title}</span>
                        {act.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {act.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {act.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end space-y-1 shrink-0 ml-2">
                    <span className="text-[10px] font-bold text-slate-400 tabular-nums">
                      {formatRelativeTime(act.timestamp)}
                    </span>
                    {act.actionText && (
                      <button
                        onClick={() => onNavigateEngine(act.targetEngine || 'quotations')}
                        className="text-[11px] font-bold text-blue-400 hover:text-blue-300"
                      >
                        {act.actionText}
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-slate-400 text-xs">
                No recent activity logged yet.
              </div>
            )}
          </div>
        </div>

        {/* 1/3 Width Operational Activity Timeline */}
        <div className="lg:col-span-4 glass-panel p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <i className="fi fi-rr-time-fast text-emerald-400 text-xs"></i>
              Live Operational Activity
            </h3>
            <span className="text-[10px] text-emerald-400 font-mono">Real-Time</span>
          </div>

          <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10 pl-6">
            {OPERATIONAL_ACTIVITIES.map((act) => (
              <div key={act.id} className="relative space-y-1">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-slate-900"></div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-bold text-white">{act.title}</span>
                  <span className="text-slate-400">{act.timestamp}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">{act.description}</p>
                <div className="text-[9px] text-slate-400 font-mono">By: {act.user}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ROW 3: ZONE 4 CUSTOMS INCENTIVE & FOREX MATRIX + ZONE 5 QUICK COMMAND LAUNCHER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 2/3 Width Zone 4: Customs Incentive Realization & Forex Exposure Matrix */}
        <div className="lg:col-span-8 glass-panel p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                Customs Incentive Realization & Forex Exposure Matrix
              </h3>
              <p className="text-[11px] text-slate-400">RoDTEP / Duty Drawback refund claims & live currency exchange rates</p>
            </div>
            <span className="text-[10px] text-indigo-400 font-mono font-bold bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">
              Live Currency Sync
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* RoDTEP / DBK Incentive Realization Card */}
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/10 space-y-2">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9.5px]">RoDTEP & DBK Claims Status</span>
                <span className="text-emerald-400 font-mono font-bold">88.4% Realized</span>
              </div>
              <div className="flex justify-between items-baseline font-mono">
                <span className="text-xs text-slate-400">Claimed: <strong className="text-white">{formatMoney(48500)}</strong></span>
                <span className="text-sm font-extrabold text-emerald-400">{formatMoney(42874)}</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full w-[88.4%]"></div>
              </div>
              <div className="flex justify-between text-[9.5px] text-slate-400 font-mono pt-1">
                <span>Pending Refund: {formatMoney(5626)}</span>
                <span className="text-amber-400 font-bold">2 Shipping Bills Due</span>
              </div>
            </div>

            {/* Live Forex Exchange Rates Ticker */}
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/10 space-y-2">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9.5px]">Forex Exchange Ticker (Base: INR)</span>
                <span className="text-sky-400 font-mono text-[10px]">Auto-Synced</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="bg-slate-800/80 p-1.5 rounded border border-slate-700/60 flex justify-between items-center">
                  <span className="text-slate-400 font-bold">USD/INR</span>
                  <span className="text-white font-extrabold">₹85.00</span>
                </div>
                <div className="bg-slate-800/80 p-1.5 rounded border border-slate-700/60 flex justify-between items-center">
                  <span className="text-slate-400 font-bold">EUR/INR</span>
                  <span className="text-white font-extrabold">₹92.50</span>
                </div>
                <div className="bg-slate-800/80 p-1.5 rounded border border-slate-700/60 flex justify-between items-center">
                  <span className="text-slate-400 font-bold">GBP/INR</span>
                  <span className="text-white font-extrabold">₹108.20</span>
                </div>
                <div className="bg-slate-800/80 p-1.5 rounded border border-slate-700/60 flex justify-between items-center">
                  <span className="text-slate-400 font-bold">AED/INR</span>
                  <span className="text-white font-extrabold">₹23.14</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 1/3 Width Zone 5: Quick Command Launcher Grid */}
        <div className="lg:col-span-4 glass-panel p-4 space-y-3">
          <div className="pb-2 border-b border-white/10 flex justify-between items-center">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <i className="fi fi-rr-bolt text-amber-400 text-xs"></i>
              Quick Command Center
            </h3>
            <span className="text-[10px] text-slate-400">EXIM Shortcuts</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            <button
              onClick={() => onNavigateEngine('quotations')}
              className="p-3 rounded-xl bg-gradient-to-br from-indigo-600/80 to-blue-700/80 hover:from-indigo-600 hover:to-blue-600 text-white border border-indigo-400/30 flex flex-col justify-between items-start space-y-2 transition-all shadow-md group"
            >
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <i className="fi fi-rr-file-edit text-white text-xs"></i>
              </div>
              <span className="text-[11px] leading-tight">+ Create Quotation</span>
            </button>

            <button
              onClick={() => onNavigateEngine('documents')}
              className="p-3 rounded-xl bg-gradient-to-br from-emerald-600/80 to-teal-700/80 hover:from-emerald-600 hover:to-teal-600 text-white border border-emerald-400/30 flex flex-col justify-between items-start space-y-2 transition-all shadow-md group"
            >
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <i className="fi fi-rr-document text-white text-xs"></i>
              </div>
              <span className="text-[11px] leading-tight">+ Create PI Document</span>
            </button>

            <button
              onClick={() => onNavigateEngine('documents')}
              className="p-3 rounded-xl bg-gradient-to-br from-amber-600/80 to-orange-700/80 hover:from-amber-600 hover:to-orange-700 text-white border border-amber-400/30 flex flex-col justify-between items-start space-y-2 transition-all shadow-md group"
            >
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <i className="fi fi-rr-box-alt text-white text-xs"></i>
              </div>
              <span className="text-[11px] leading-tight">+ Packing List</span>
            </button>

            <button
              onClick={() => onNavigateEngine('settings')}
              className="p-3 rounded-xl bg-gradient-to-br from-slate-700/80 to-slate-800/80 hover:from-slate-700 hover:to-slate-800 text-white border border-slate-500/30 flex flex-col justify-between items-start space-y-2 transition-all shadow-md group"
            >
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <i className="fi fi-rr-settings text-white text-xs"></i>
              </div>
              <span className="text-[11px] leading-tight">Master Directory</span>
            </button>
          </div>
        </div>
      </div>

      {/* CONTRACTUAL PROFIT & LOSS REPORT MODAL */}
      {showPnlModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel p-6 max-w-3xl w-full space-y-4 border border-blue-500/30">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <i className="fi fi-rr-chart-histogram text-emerald-400 text-base"></i>
                Contractual Net Profitability & Incentive Realization Report
              </h3>
              <button onClick={() => setShowPnlModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-slate-900/80 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Contract / Invoice No</th>
                    <th className="py-2.5 px-3">Buyer Name</th>
                    <th className="py-2.5 px-3 text-right">FOB Rev</th>
                    <th className="py-2.5 px-3 text-right">Prod Cost</th>
                    <th className="py-2.5 px-3 text-right">Freight Cost</th>
                    <th className="py-2.5 px-3 text-right">Incentive Rec</th>
                    <th className="py-2.5 px-3 text-right">Net Profit</th>
                    <th className="py-2.5 px-3 text-right">Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200">
                  {CONTRACT_PROFITABILITY_DATA.map((pnl, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-mono font-bold text-white">{pnl.contractNo}</td>
                      <td className="py-3 px-3 font-medium text-slate-300">{pnl.buyerName}</td>
                      <td className="py-3 px-3 text-right font-mono">{formatMoney(pnl.fobRevenueUsd)}</td>
                      <td className="py-3 px-3 text-right font-mono text-red-300">{formatMoney(pnl.productionCostUsd)}</td>
                      <td className="py-3 px-3 text-right font-mono text-amber-300">{formatMoney(pnl.logisticsFreightUsd)}</td>
                      <td className="py-3 px-3 text-right font-mono text-emerald-400">+{formatMoney(pnl.incentivesRealisedUsd)}</td>
                      <td className="py-3 px-3 text-right font-mono font-extrabold text-white">{formatMoney(pnl.netProfitUsd)}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">{pnl.marginPercentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowPnlModal(false)}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold text-xs"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
