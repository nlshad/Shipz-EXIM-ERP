import React, { useState } from 'react';
import { IncentiveRecord, IncentiveScheme, IncentiveStatus, Currency } from '../types';

interface ComplianceEngineProps {
  incentives: IncentiveRecord[];
  currentCurrency: Currency;
  onUpdateIncentives: (records: IncentiveRecord[]) => void;
}

export const ComplianceEngine: React.FC<ComplianceEngineProps> = ({
  incentives,
  currentCurrency,
  onUpdateIncentives,
}) => {
  const [selectedScheme, setSelectedScheme] = useState<IncentiveScheme | 'ALL'>('ALL');
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [showEbrcModal, setShowEbrcModal] = useState(false);
  const [activeTabRecord, setActiveTabRecord] = useState<IncentiveRecord | null>(null);

  const fxRate = currentCurrency === 'INR' ? 1.0 : currentCurrency === 'EUR' ? 0.011 : 0.012;
  const currSymbol = currentCurrency === 'INR' ? '₹' : currentCurrency === 'EUR' ? '€' : '$';

  const formatMoney = (inrVal: number) => {
    const val = inrVal * fxRate;
    if (currentCurrency === 'INR') {
      if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
      return `₹${val.toLocaleString('en-IN')}`;
    }
    return `${currSymbol}${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Calculations
  const filteredIncentives = selectedScheme === 'ALL'
    ? incentives
    : incentives.filter((i) => i.scheme === selectedScheme);

  const totalEligible = incentives.reduce((acc, curr) => acc + curr.calculatedIncentiveInr, 0);
  const totalRealised = incentives.filter((i) => i.status === 'Realised').reduce((acc, curr) => acc + curr.calculatedIncentiveInr, 0);
  const totalPending = incentives.filter((i) => i.status === 'Claimed' || i.status === 'To Be Claimed').reduce((acc, curr) => acc + curr.calculatedIncentiveInr, 0);
  const totalDisputed = incentives.filter((i) => i.status === 'Disputed').reduce((acc, curr) => acc + curr.calculatedIncentiveInr, 0);

  const toggleSelectRow = (id: string) => {
    if (selectedRowIds.includes(id)) {
      setSelectedRowIds(selectedRowIds.filter((rowId) => rowId !== id));
    } else {
      setSelectedRowIds([...selectedRowIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedRowIds.length === filteredIncentives.length) {
      setSelectedRowIds([]);
    } else {
      setSelectedRowIds(filteredIncentives.map((i) => i.id));
    }
  };

  const handleBulkDgftExport = () => {
    const selectedRecords = incentives.filter((i) => selectedRowIds.includes(i.id));
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Shipping Bill No,Shipping Bill Date,Invoice No,HSN Code,Scheme,FOB Value (INR),Incentive Rate (%),Calculated Incentive (INR),Status\n' +
      selectedRecords
        .map(
          (i) =>
            `${i.shippingBillNo},${i.shippingBillDate},${i.invoiceNo},${i.hsnCode},${i.scheme},${i.fobValueInr},${i.ratePercentage},${i.calculatedIncentiveInr},${i.status}`
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DGFT_Incentive_Claim_File_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMarkRealised = (record: IncentiveRecord) => {
    const updated = incentives.map((i) => {
      if (i.id === record.id) {
        return {
          ...i,
          status: 'Realised' as IncentiveStatus,
          realisedDate: new Date().toISOString().split('T')[0],
          ebrcNo: `eBRC-DGFT-2026-${Math.floor(100000 + Math.random() * 900000)}`,
        };
      }
      return i;
    });
    onUpdateIncentives(updated);
  };

  const getStatusBadge = (status: IncentiveStatus) => {
    switch (status) {
      case 'Realised':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Realised</span>;
      case 'Claimed':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">Claimed</span>;
      case 'To Be Claimed':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">To Be Claimed</span>;
      case 'Disputed':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/20 text-red-400 border border-red-500/30">Disputed</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 relative pb-20">
      {/* Engine Header */}
      <div className="glass-panel p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Compliance & Government Incentive Engine
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              RoDTEP • DBK • RoSCTL
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Automated eBRC closure, DGFT API export files, and HSN-based incentive rate calculations.
          </p>
        </div>

        <button
          onClick={() => {
            setActiveTabRecord(filteredIncentives[0] || null);
            setShowEbrcModal(true);
          }}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/20 flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>+ File eBRC Closure</span>
        </button>
      </div>

      {/* Incentive Overview KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 border border-white/10 space-y-1">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Total Eligible Incentives</span>
          <div className="text-xl font-extrabold text-white font-mono">{formatMoney(totalEligible)}</div>
          <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
            <span>↑ 14.2%</span> vs last quarter
          </p>
        </div>

        <div className="glass-panel p-4 border border-emerald-500/30 bg-emerald-950/10 space-y-1">
          <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block">Amount Realised (eBRC)</span>
          <div className="text-xl font-extrabold text-emerald-300 font-mono">{formatMoney(totalRealised)}</div>
          <p className="text-[10px] text-slate-400 font-medium">Credited to Bank Account</p>
        </div>

        <div className="glass-panel p-4 border border-amber-500/30 bg-amber-950/10 space-y-1">
          <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block">Pending Claims</span>
          <div className="text-xl font-extrabold text-amber-300 font-mono">{formatMoney(totalPending)}</div>
          <p className="text-[10px] text-slate-400 font-medium">Under Customs Verification</p>
        </div>

        <div className="glass-panel p-4 border border-red-500/30 bg-red-950/10 space-y-1">
          <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wider block">Disputed Entries</span>
          <div className="text-xl font-extrabold text-red-300 font-mono">{formatMoney(totalDisputed)}</div>
          <p className="text-[10px] text-slate-400 font-medium">Action Required</p>
        </div>
      </div>

      {/* Scheme Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center space-x-2">
          {(['ALL', 'RoDTEP', 'DutyDrawback', 'RoSCTL'] as const).map((scheme) => (
            <button
              key={scheme}
              onClick={() => setSelectedScheme(scheme as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                selectedScheme === scheme
                  ? 'bg-emerald-600/30 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-800/40 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {scheme === 'ALL'
                ? 'All Schemes'
                : scheme === 'DutyDrawback'
                ? 'Duty Drawback (DBK)'
                : scheme}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing <span className="text-white font-bold">{filteredIncentives.length}</span> Records
        </div>
      </div>

      {/* Compliance Data Grid */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-slate-900/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedRowIds.length === filteredIncentives.length && filteredIncentives.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded bg-slate-800 border-white/20 text-emerald-500 focus:ring-0"
                  />
                </th>
                <th className="py-3 px-4">Invoice / SB No.</th>
                <th className="py-3 px-4">HSN & Description</th>
                <th className="py-3 px-4">Scheme</th>
                <th className="py-3 px-4 text-right">FOB Value (INR)</th>
                <th className="py-3 px-4 text-right">Incentive Rate</th>
                <th className="py-3 px-4 text-right">Calculated Benefit</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {filteredIncentives.map((record) => {
                const isSelected = selectedRowIds.includes(record.id);
                return (
                  <tr
                    key={record.id}
                    className={`hover:bg-slate-800/40 transition-all ${
                      isSelected ? 'bg-blue-600/10' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(record.id)}
                        className="rounded bg-slate-800 border-white/20 text-emerald-500 focus:ring-0"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white font-mono">{record.invoiceNo}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{record.shippingBillNo} ({record.shippingBillDate})</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">{record.productDescription}</div>
                      <div className="text-[10px] text-slate-400 font-mono">HSN: {record.hsnCode}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-white/10">
                        {record.scheme}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">
                      ₹{record.fobValueInr.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                      {record.ratePercentage}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-extrabold text-white">
                      {formatMoney(record.calculatedIncentiveInr)}
                    </td>
                    <td className="py-3 px-4 text-center">{getStatusBadge(record.status)}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {record.status !== 'Realised' && (
                        <button
                          onClick={() => handleMarkRealised(record)}
                          className="px-2.5 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white text-[10px] font-semibold border border-emerald-500/30 transition-all"
                        >
                          Mark Realised
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setActiveTabRecord(record);
                          setShowEbrcModal(true);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold border border-white/10"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sticky Action Footer when Rows are Selected */}
      {selectedRowIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 floating-action-bar px-6 py-3 border border-emerald-500/40 shadow-2xl flex items-center space-x-6">
          <div className="text-xs text-slate-200">
            <span className="font-bold text-emerald-400">{selectedRowIds.length}</span> Records Selected
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleBulkDgftExport}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
            >
              <i className="fi fi-rr-file-excel text-xs"></i>
              <span>[ Bulk Generate DGFT Excel File ]</span>
            </button>

            <button
              onClick={() => setSelectedRowIds([])}
              className="text-xs text-slate-400 hover:text-white font-medium"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* eBRC Closure Modal */}
      {showEbrcModal && activeTabRecord && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel p-6 max-w-lg w-full space-y-4 border border-blue-500/30">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <i className="fi fi-rr-shield-check text-blue-400 text-base"></i>
                DGFT eBRC Certificate Closure & Inward Remittance
              </h3>
              <button onClick={() => setShowEbrcModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5 space-y-1">
                <div className="flex justify-between"><span className="text-slate-400">Invoice No:</span> <span className="font-bold text-white">{activeTabRecord.invoiceNo}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Shipping Bill:</span> <span className="font-mono text-emerald-400">{activeTabRecord.shippingBillNo}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">HSN & Scheme:</span> <span>{activeTabRecord.hsnCode} ({activeTabRecord.scheme})</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Eligible Benefit:</span> <span className="font-bold text-white font-mono">{formatMoney(activeTabRecord.calculatedIncentiveInr)}</span></div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Bank Inward Remittance Certificate (FIRC) No.</label>
                <input type="text" defaultValue="FIRC-SBI-2026-9041" className="w-full glass-input text-xs font-mono" />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Bank AD Code</label>
                <input type="text" defaultValue="0400012903" className="w-full glass-input text-xs font-mono" />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">eBRC Certificate Generation Status</label>
                <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-500/30 text-[11px] text-emerald-300">
                  {activeTabRecord.ebrcNo ? `Generated: ${activeTabRecord.ebrcNo}` : 'Ready for direct DGFT portal handshake.'}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowEbrcModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleMarkRealised(activeTabRecord);
                  setShowEbrcModal(false);
                }}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/20"
              >
                Submit DGFT eBRC Closure
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
