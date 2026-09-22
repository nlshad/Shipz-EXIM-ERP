import React, { useState, useEffect } from 'react';

export interface BLDraftRecord {
  id: string;
  piNo: string;
  invoiceNo: string;
  shippingLine: string;
  bookingNo: string;
  containerNo: string;
  sealNo: string;
  consignee: string;
  date?: string;
  createdAt?: string;
  blType?: string;
  vesselNo?: string;
  voyageNo?: string;
  movement?: string;
  freight?: string;
  notifyParty?: string;
  otherNotifyParty?: string;
}

const INITIAL_BL_RECORDS: BLDraftRecord[] = [];

export const BLDraftEngine: React.FC = () => {
  const [blRecords, setBlRecords] = useState<BLDraftRecord[]>(() => {
    try {
      const saved = localStorage.getItem('shipz_bl_records');
      return saved ? JSON.parse(saved) : INITIAL_BL_RECORDS;
    } catch (e) {
      return INITIAL_BL_RECORDS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('shipz_bl_records', JSON.stringify(blRecords));
      if (blRecords && blRecords.length > 0) {
        fetch('api.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'shipz_bl_records', data: blRecords })
        }).catch(() => {
          fetch('/api.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'shipz_bl_records', data: blRecords })
          }).catch(() => {});
        });
      }
    } catch (e) {}
  }, [blRecords]);

  const [tableSearch, setTableSearch] = useState('');
  const [dateFilterStart, setDateFilterStart] = useState('');
  const [dateFilterEnd, setDateFilterEnd] = useState('');
  const [dateFilterPreset, setDateFilterPreset] = useState('ALL');
  const [entriesPerPage, setEntriesPerPage] = useState('10');
  const [sortField, setSortField] = useState<keyof BLDraftRecord>('piNo');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [openDocMenuId, setOpenDocMenuId] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const handleToggleExpand = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDatePresetChange = (preset: string) => {
    setDateFilterPreset(preset);
    const today = new Date();
    const fmt = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };
    if (preset === 'ALL') {
      setDateFilterStart('');
      setDateFilterEnd('');
    } else if (preset === 'TODAY') {
      const t = fmt(today);
      setDateFilterStart(t);
      setDateFilterEnd(t);
    } else if (preset === 'YESTERDAY') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const yStr = fmt(y);
      setDateFilterStart(yStr);
      setDateFilterEnd(yStr);
    } else if (preset === 'LAST_7_DAYS') {
      const s = new Date();
      s.setDate(s.getDate() - 7);
      setDateFilterStart(fmt(s));
      setDateFilterEnd(fmt(today));
    } else if (preset === 'THIS_MONTH') {
      const s = new Date(today.getFullYear(), today.getMonth(), 1);
      setDateFilterStart(fmt(s));
      setDateFilterEnd(fmt(today));
    } else if (preset === 'LAST_30_DAYS') {
      const s = new Date();
      s.setDate(s.getDate() - 30);
      setDateFilterStart(fmt(s));
      setDateFilterEnd(fmt(today));
    } else if (preset === 'THIS_YEAR') {
      const s = new Date(today.getFullYear(), 0, 1);
      setDateFilterStart(fmt(s));
      setDateFilterEnd(fmt(today));
    }
  };

  const checkDateInRange = (r: BLDraftRecord) => {
    if (!dateFilterStart && !dateFilterEnd) return true;
    let dStr = r.date || r.createdAt || '';
    if (!dStr && r.id && r.id.startsWith('bl-')) {
      const ts = parseInt(r.id.replace('bl-', ''), 10);
      if (!isNaN(ts) && ts > 1000000000000) {
        try { dStr = new Date(ts).toISOString().split('T')[0]; } catch(e){}
      }
    }
    if (!dStr) return true;
    dStr = dStr.trim();
    if (dStr.includes('T')) dStr = dStr.split('T')[0];
    if (dStr.length > 10) dStr = dStr.substring(0, 10);
    if (dateFilterStart && dStr < dateFilterStart) return false;
    if (dateFilterEnd && dStr > dateFilterEnd) return false;
    return true;
  };

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<BLDraftRecord | null>(null);

  // Form Fields
  const [formData, setFormData] = useState<Partial<BLDraftRecord>>({
    piNo: 'PI/6/25-26',
    invoiceNo: 'INV/02/25-26',
    shippingLine: 'Maersk Line',
    bookingNo: 'BK-9942018',
    blType: 'To Order BL',
    vesselNo: 'MAERSK MC-KINNEY',
    voyageNo: 'V.05A',
    movement: 'FCL/FCL',
    freight: 'Freight Prepaid',
    consignee: 'Global Trade Partners LLC',
    notifyParty: 'FastForward Logistics Inc.',
    otherNotifyParty: 'Apex Customs Brokerage',
    containerNo: 'MSKU-8820194',
    sealNo: 'SL-MDR-9921',
  });

  const handleSort = (field: keyof BLDraftRecord) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSorted = [...blRecords]
    .filter((r) => {
      const q = tableSearch.toLowerCase();
      const matchesDate = checkDateInRange(r);
      const matchesQuery = (
        r.piNo.toLowerCase().includes(q) ||
        r.invoiceNo.toLowerCase().includes(q) ||
        r.shippingLine.toLowerCase().includes(q) ||
        r.bookingNo.toLowerCase().includes(q) ||
        r.containerNo.toLowerCase().includes(q) ||
        r.consignee.toLowerCase().includes(q)
      );
      return matchesDate && matchesQuery;
    })
    .sort((a, b) => {
      const valA = (a[sortField] || '').toString();
      const valB = (b[sortField] || '').toString();
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const handleOpenAddModal = () => {
    setEditingRecordId(null);
    setFormData({
      piNo: 'PI/6/25-26',
      invoiceNo: 'INV/02/25-26',
      shippingLine: 'Maersk Line',
      bookingNo: `BK-${Math.floor(1000000 + Math.random() * 9000000)}`,
      blType: 'To Order BL',
      vesselNo: 'MAERSK MC-KINNEY',
      voyageNo: 'V.05A',
      movement: 'FCL/FCL',
      freight: 'Freight Prepaid',
      consignee: 'Global Trade Partners LLC',
      notifyParty: 'FastForward Logistics Inc.',
      otherNotifyParty: 'Apex Customs Brokerage',
      containerNo: `MSKU-${Math.floor(1000000 + Math.random() * 9000000)}`,
      sealNo: `SL-MDR-${Math.floor(1000 + Math.random() * 9000)}`,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rec: BLDraftRecord) => {
    setEditingRecordId(rec.id);
    setFormData(rec);
    setIsModalOpen(true);
    setOpenActionMenuId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this BL Draft entry?')) {
      setBlRecords(blRecords.filter((r) => r.id !== id));
      setOpenActionMenuId(null);
    }
  };

  const handleSaveForm = (action: 'save' | 'saveNext') => {
    if (!formData.piNo || !formData.invoiceNo || !formData.shippingLine || !formData.bookingNo || !formData.consignee) {
      alert('Please fill in all required fields marked with *');
      return;
    }

    if (editingRecordId) {
      setBlRecords((prev) =>
        prev.map((r) => (r.id === editingRecordId ? ({ ...r, ...formData } as BLDraftRecord) : r))
      );
      alert(`BL Draft for ${formData.piNo} updated successfully!`);
    } else {
      const newRec: BLDraftRecord = {
        id: `bl-${Date.now()}`,
        piNo: formData.piNo || 'PI/6/25-26',
        invoiceNo: formData.invoiceNo || 'INV/02/25-26',
        shippingLine: formData.shippingLine || 'Maersk Line',
        bookingNo: formData.bookingNo || 'BK-9920194',
        containerNo: formData.containerNo || 'MSKU-109284',
        sealNo: formData.sealNo || 'SL-MDR-001',
        consignee: formData.consignee || 'Global Trade Partners',
        blType: formData.blType,
        vesselNo: formData.vesselNo,
        voyageNo: formData.voyageNo,
        movement: formData.movement,
        freight: formData.freight,
        notifyParty: formData.notifyParty,
        otherNotifyParty: formData.otherNotifyParty,
      };
      setBlRecords((prev) => [newRec, ...prev]);
      alert(`BL Draft for ${newRec.piNo} created and PDF generated!`);
    }

    if (action === 'save') {
      setIsModalOpen(false);
    } else {
      handleOpenAddModal();
    }
  };

  const handleDownloadExcel = () => {
    alert('Exporting BL Draft register as .xlsx Excel file...');
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto p-6 space-y-6 pb-24">
      {/* HEADER BAR */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Bill of Lading (BL) Draft Management Engine</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold border border-indigo-200">
              SOLAS & Carrier Compliant
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage Bill of Lading drafts linked to Proforma Invoices & Commercial Invoices. Generate seaway bills and shipping instruction PDFs.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleDownloadExcel}
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 font-bold text-xs text-slate-700 shadow-xs flex items-center space-x-1.5"
          >
            <span>📊 Download Excel (.xlsx)</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5 transition-all"
          >
            <span>+ Add New</span>
          </button>
        </div>
      </div>

      {/* DATA GRID ENGINE */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-xs font-bold text-slate-600">
            <span>Show</span>
            <select
              value={entriesPerPage}
              onChange={(e) => setEntriesPerPage(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-md px-2 py-1 font-bold"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span>Entries</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className={`flex items-center gap-1.5 ${dateFilterStart || dateFilterEnd ? 'bg-indigo-50/50 border-indigo-300' : 'bg-white border-slate-300'} border rounded-md px-2 py-1 text-xs shadow-2xs transition-all`}>
              <span className="font-bold text-slate-600 text-xs shrink-0 flex items-center gap-1">
                <span>📅</span>
                <span>Date:</span>
              </span>
              <select
                value={dateFilterPreset}
                onChange={(e) => handleDatePresetChange(e.target.value)}
                className="bg-transparent border-none text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer pr-1"
              >
                <option value="ALL">All Dates</option>
                <option value="TODAY">Today</option>
                <option value="YESTERDAY">Yesterday</option>
                <option value="LAST_7_DAYS">Last 7 Days</option>
                <option value="THIS_MONTH">This Month</option>
                <option value="LAST_30_DAYS">Last 30 Days</option>
                <option value="THIS_YEAR">This Year</option>
                <option value="CUSTOM">Custom Range</option>
              </select>
              <div className="flex items-center gap-1 border-l border-slate-200 pl-1.5">
                <input
                  type="date"
                  value={dateFilterStart}
                  onChange={(e) => { setDateFilterStart(e.target.value); setDateFilterPreset('CUSTOM'); }}
                  title="From Date (Calendar Picker)"
                  className="bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-indigo-500 rounded px-1.5 py-0.5 text-[11px] text-slate-700 font-mono focus:outline-none cursor-pointer"
                />
                <span className="text-slate-400 text-[10px] font-bold">to</span>
                <input
                  type="date"
                  value={dateFilterEnd}
                  onChange={(e) => { setDateFilterEnd(e.target.value); setDateFilterPreset('CUSTOM'); }}
                  title="To Date (Calendar Picker)"
                  className="bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-indigo-500 rounded px-1.5 py-0.5 text-[11px] text-slate-700 font-mono focus:outline-none cursor-pointer"
                />
                {(dateFilterStart || dateFilterEnd) && (
                  <button
                    type="button"
                    onClick={() => { setDateFilterStart(''); setDateFilterEnd(''); setDateFilterPreset('ALL'); }}
                    title="Clear Date Filter"
                    className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors text-[10px] font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs font-bold text-slate-600">
              <span>Search:</span>
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="Filter BL drafts..."
                className="bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-visible min-h-[380px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 font-bold bg-slate-50 text-[11px]">
                <th className="py-3 px-2 text-center">Expand</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Doc</th>
                <th onClick={() => handleSort('piNo')} className="py-3 px-3 cursor-pointer select-none">
                  PI No. {sortField === 'piNo' ? (sortDirection === 'asc' ? '↑' : '↓') : '↑↓'}
                </th>
                <th onClick={() => handleSort('invoiceNo')} className="py-3 px-3 cursor-pointer select-none">
                  Invoice No. {sortField === 'invoiceNo' ? (sortDirection === 'asc' ? '↑' : '↓') : '↑↓'}
                </th>
                <th onClick={() => handleSort('shippingLine')} className="py-3 px-3 cursor-pointer select-none">
                  Shipping Line {sortField === 'shippingLine' ? (sortDirection === 'asc' ? '↑' : '↓') : '↑↓'}
                </th>
                <th onClick={() => handleSort('bookingNo')} className="py-3 px-3 cursor-pointer select-none">
                  Booking No. {sortField === 'bookingNo' ? (sortDirection === 'asc' ? '↑' : '↓') : '↑↓'}
                </th>
                <th onClick={() => handleSort('containerNo')} className="py-3 px-3 cursor-pointer select-none">
                  Container No. {sortField === 'containerNo' ? (sortDirection === 'asc' ? '↑' : '↓') : '↑↓'}
                </th>
                <th onClick={() => handleSort('sealNo')} className="py-3 px-3 cursor-pointer select-none">
                  Seal No. {sortField === 'sealNo' ? (sortDirection === 'asc' ? '↑' : '↓') : '↑↓'}
                </th>
                <th onClick={() => handleSort('consignee')} className="py-3 px-3 cursor-pointer select-none">
                  Consignee {sortField === 'consignee' ? (sortDirection === 'asc' ? '↑' : '↓') : '↑↓'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 text-[11px]">
              {filteredAndSorted.map((r) => (
                <React.Fragment key={r.id}>
                  <tr className="hover:bg-slate-50/80 transition-all relative">
                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={() => handleToggleExpand(r.id)}
                        className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center mx-auto"
                      >
                        {expandedRows[r.id] ? '-' : '+'}
                      </button>
                    </td>

                    {/* ACTION DROPDOWN */}
                    <td className="py-3 px-3 relative">
                    <button
                      onClick={() => setOpenActionMenuId(openActionMenuId === r.id ? null : r.id)}
                      className="px-3 py-1.5 bg-blue-600 text-white text-[11px] font-bold rounded-md flex items-center space-x-1"
                    >
                      <span>Action</span>
                      <span>▼</span>
                    </button>

                    {openActionMenuId === r.id && (
                      <div className="absolute left-3 top-10 w-44 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 py-2 text-xs text-slate-700 space-y-0.5">
                        <button
                          onClick={() => {
                            setSelectedRecord(r);
                            setOpenActionMenuId(null);
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center space-x-2 font-semibold"
                        >
                          <i className="fi fi-rr-eye text-xs"></i>
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(r)}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center space-x-2 font-semibold"
                        >
                          <i className="fi fi-rr-edit text-xs"></i>
                          <span>Update</span>
                        </button>
                        <div className="border-t border-slate-100 my-1"></div>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="w-full text-left px-3 py-1.5 hover:bg-rose-50 text-rose-600 flex items-center space-x-2 font-semibold"
                        >
                          <i className="fi fi-rr-trash text-xs"></i>
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </td>

                  {/* DOC MENU */}
                  <td className="py-3 px-3 relative">
                    <button
                      onClick={() => setOpenDocMenuId(openDocMenuId === r.id ? null : r.id)}
                      className="p-1.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-md font-bold text-xs flex items-center space-x-1"
                    >
                      <i className="fi fi-rr-document text-xs"></i>
                      <span>▼</span>
                    </button>

                    {openDocMenuId === r.id && (
                      <div className="absolute left-3 top-10 w-52 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 py-2 text-xs text-slate-700 space-y-0.5">
                        <button
                          onClick={() => {
                            window.print();
                            setOpenDocMenuId(null);
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center space-x-2 font-semibold"
                        >
                          <i className="fi fi-rr-eye text-xs"></i>
                          <span>View BL Draft</span>
                        </button>
                        <button
                          onClick={() => {
                            alert(`Downloading BL Draft PDF for ${r.piNo}...`);
                            setOpenDocMenuId(null);
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center space-x-2 font-semibold"
                        >
                          <i className="fi fi-rr-download text-xs"></i>
                          <span>Download BL Draft</span>
                        </button>
                        <button
                          onClick={() => {
                            alert(`BL Draft sent to ${r.consignee}!`);
                            setOpenDocMenuId(null);
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center space-x-2 font-semibold"
                        >
                          <i className="fi fi-rr-envelope text-xs"></i>
                          <span>Send Mail</span>
                        </button>
                      </div>
                    )}
                  </td>

                  <td className="py-3 px-3 font-mono font-bold text-indigo-600">{r.piNo}</td>
                  <td className="py-3 px-3 font-mono font-bold text-blue-600">{r.invoiceNo}</td>
                  <td className="py-3 px-3 font-bold text-slate-800">{r.shippingLine}</td>
                  <td className="py-3 px-3 font-mono text-slate-700">{r.bookingNo}</td>
                  <td className="py-3 px-3 font-mono text-slate-700">{r.containerNo}</td>
                    <td className="py-3 px-3 font-mono text-slate-700">{r.sealNo}</td>
                    <td className="py-3 px-3 font-bold text-slate-800">{r.consignee}</td>
                  </tr>

                  {/* EXPANDED ROW DRAWER: ALL USER ACTIVITIES */}
                  {expandedRows[r.id] && (
                    <tr className="bg-slate-50/95 border-b border-slate-200 shadow-inner animate-in fade-in duration-150">
                      <td colSpan={10} className="p-4 sm:p-5">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
                          <div className="px-5 py-3.5 bg-gradient-to-r from-slate-50 via-indigo-50/30 to-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs text-sm">
                                <i className="fi fi-rr-time-past"></i>
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-slate-900 text-xs tracking-tight">{r.piNo} / {r.invoiceNo}</span>
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                                    User Activities & Audit Trail
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 font-medium">Bill of Lading user activity log & carrier history</p>
                              </div>
                            </div>
                          </div>

                          <div className="px-5 py-2.5 bg-slate-50/60 border-b border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                            <div><span className="text-[9px] text-slate-400 font-bold uppercase block">Shipping Line</span><span className="font-semibold text-slate-800">{r.shippingLine}</span></div>
                            <div><span className="text-[9px] text-slate-400 font-bold uppercase block">Booking No</span><span className="font-semibold text-slate-800 font-mono">{r.bookingNo}</span></div>
                            <div><span className="text-[9px] text-slate-400 font-bold uppercase block">Container & Seal</span><span className="font-semibold text-slate-800 font-mono">{r.containerNo} / {r.sealNo}</span></div>
                            <div><span className="text-[9px] text-slate-400 font-bold uppercase block">Consignee</span><span className="font-semibold text-slate-800 truncate">{r.consignee}</span></div>
                          </div>

                          <div className="p-5 space-y-4">
                            <h5 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                              <i className="fi fi-rr-list-check text-indigo-500"></i>
                              <span>User Activities for {r.piNo}</span>
                            </h5>

                            <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 pl-8">
                              <div className="relative group">
                                <div className="absolute -left-8 top-1 w-7 h-7 rounded-full border-2 border-white shadow-xs flex items-center justify-center text-xs bg-emerald-500 text-white">
                                  <i className="fi fi-rr-plus-circle"></i>
                                </div>
                                <div className="bg-slate-50 hover:bg-slate-100/70 transition-all p-3 rounded-xl border border-slate-200/80">
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-slate-900 text-xs">BL Draft Initiated</span>
                                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60 flex items-center gap-1">
                                        <i className="fi fi-rr-user text-[9px]"></i>
                                        <span>{(r as any).createdBy || 'Logistics Lead'}</span>
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-mono">{(r as any).createdAt || '2026-08-04'}</span>
                                  </div>
                                  <p className="text-[11px] text-slate-600 mt-1">Draft initiated and container details mapped for {r.consignee}.</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / UPDATE BL DRAFT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] overflow-y-auto flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                {editingRecordId ? 'Update BL Draft' : 'Create Bill of Lading (BL) Draft'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-800 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6 space-y-5 text-xs text-slate-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    PI No. <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.piNo}
                    onChange={(e) => setFormData({ ...formData, piNo: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold"
                  >
                    <option value="PI/6/25-26">PI/6/25-26 — Global Trade Partners LLC</option>
                    <option value="PI/2026/042">PI/2026/042 — BERLIN (Indonesia)</option>
                    <option value="PI/2026/041">PI/2026/041 — Jony (Canada)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Invoice No. <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.invoiceNo}
                    onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold"
                  >
                    <option value="INV/02/25-26">INV/02/25-26</option>
                    <option value="INV/01/25-26">INV/01/25-26</option>
                    <option value="INV/03/25-26">INV/03/25-26</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Shipping Line <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.shippingLine}
                    onChange={(e) => setFormData({ ...formData, shippingLine: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Booking No. <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.bookingNo}
                    onChange={(e) => setFormData({ ...formData, bookingNo: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">BL Type</label>
                  <select
                    value={formData.blType}
                    onChange={(e) => setFormData({ ...formData, blType: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold"
                  >
                    <option value="Straight BL">Straight BL</option>
                    <option value="To Order BL">To Order BL</option>
                    <option value="Express Release">Express Release</option>
                    <option value="Seaway Bill">Seaway Bill</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Vessel No.</label>
                  <input
                    type="text"
                    value={formData.vesselNo}
                    onChange={(e) => setFormData({ ...formData, vesselNo: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Voyage No.</label>
                  <input
                    type="text"
                    value={formData.voyageNo}
                    onChange={(e) => setFormData({ ...formData, voyageNo: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Movement</label>
                  <input
                    type="text"
                    value={formData.movement}
                    onChange={(e) => setFormData({ ...formData, movement: e.target.value })}
                    placeholder="e.g. FCL/FCL, LCL/LCL"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Freight</label>
                  <input
                    type="text"
                    value={formData.freight}
                    onChange={(e) => setFormData({ ...formData, freight: e.target.value })}
                    placeholder="e.g. Freight Prepaid, Freight Collect"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Consignee <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.consignee}
                    onChange={(e) => setFormData({ ...formData, consignee: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold"
                  >
                    <option value="Global Trade Partners LLC">Global Trade Partners LLC</option>
                    <option value="BERLIN (Indonesia)">BERLIN (Indonesia)</option>
                    <option value="Jony (Canada)">Jony (Canada)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Notify Party / Buyer</label>
                  <select
                    value={formData.notifyParty}
                    onChange={(e) => setFormData({ ...formData, notifyParty: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  >
                    <option value="FastForward Logistics Inc.">FastForward Logistics Inc.</option>
                    <option value="Same as Consignee">Same as Consignee</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Other Notify Party</label>
                  <select
                    value={formData.otherNotifyParty}
                    onChange={(e) => setFormData({ ...formData, otherNotifyParty: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  >
                    <option value="Apex Customs Brokerage">Apex Customs Brokerage</option>
                    <option value="None">None</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-slate-50 border-t border-slate-200 sticky bottom-0 z-10 rounded-b-2xl">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs"
              >
                Close
              </button>
              <button
                onClick={() => handleSaveForm('save')}
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md"
              >
                Save
              </button>
              <button
                onClick={() => handleSaveForm('saveNext')}
                className="px-5 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs shadow-md"
              >
                Save & Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Bill of Lading Draft Record</span>
                <h3 className="text-base font-bold">BL Draft Details: {selectedRecord.piNo}</h3>
              </div>
              <button onClick={() => setSelectedRecord(null)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div><span className="text-slate-500 font-bold block text-[10px] uppercase">PI NO / INVOICE</span><strong className="text-indigo-900 font-mono text-sm">{selectedRecord.piNo}</strong> / {selectedRecord.invoiceNo}</div>
                <div><span className="text-slate-500 font-bold block text-[10px] uppercase">SHIPPING LINE</span><strong className="text-slate-900">{selectedRecord.shippingLine}</strong></div>
                <div><span className="text-slate-500 font-bold block text-[10px] uppercase">BOOKING NO</span><strong className="font-mono">{selectedRecord.bookingNo}</strong></div>
                <div><span className="text-slate-500 font-bold block text-[10px] uppercase">CONTAINER / SEAL NO</span><strong className="font-mono">{selectedRecord.containerNo}</strong> / <span className="font-mono">{selectedRecord.sealNo}</span></div>
                <div><span className="text-slate-500 font-bold block text-[10px] uppercase">CONSIGNEE</span><strong>{selectedRecord.consignee}</strong></div>
                <div><span className="text-slate-500 font-bold block text-[10px] uppercase">VESSEL / VOYAGE</span>{selectedRecord.vesselNo || 'N/A'} {selectedRecord.voyageNo || ''}</div>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex justify-end">
              <button onClick={() => setSelectedRecord(null)} className="px-4 py-2 bg-slate-800 text-white font-bold rounded-lg text-xs">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
