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

      {/* MIDDLE ROW: 2/3 Loading Due Table + 1/3 Operational Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 2/3 Width Loading Due Table */}
        <div className="lg:col-span-8 glass-panel p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                Urgent Container Loading & Stuffing Due
              </h3>
              <p className="text-[11px] text-slate-400">Shipments with factory stuffing due within next 7 days</p>
            </div>

            <button
              onClick={() => onNavigateEngine('shipments')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              Open Kanban Tracker →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-slate-900/60 text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Container No</th>
                  <th className="py-2.5 px-3">Buyer & Destination</th>
                  <th className="py-2.5 px-3">Vessel</th>
                  <th className="py-2.5 px-3">Loading Due</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {loadingDueShipments.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-mono font-bold text-white">{s.containerNumber}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-200">{s.buyerName}</div>
                      <div className="text-[10px] text-slate-400">{s.destinationPort} ({s.destinationCountry})</div>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{s.vesselName}</td>
                    <td className="py-3 px-3 font-mono text-amber-400 font-bold">{s.loadingDueDate}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {s.stage}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onNavigateEngine('documents')}
                        className="px-2.5 py-1 rounded bg-blue-600/30 hover:bg-blue-600 text-blue-300 text-[10px] font-semibold border border-blue-500/30"
                      >
                        Generate Docs
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
