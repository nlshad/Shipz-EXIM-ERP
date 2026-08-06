import React, { useState, useEffect } from 'react';

export interface QuotationRecord {
  id: string;
  quotationNo: string;
  consignee: string;
  products: string;
  country: string;
  port: string;
  status: 'Accepted' | 'Pending' | 'Draft';
  amount: string;
  balanceDue: string;
  convRate: string;
  date: string;
  companyAddress: string;
  vesselFlightNo: string;
  currency: string;
}

export interface LineItem {
  id: string;
  product: string;
  productDescription: string;
  unit: string;
  quantity: number;
  price: number;
  netWeight: string;
  grossWeight: string;
  packageText: string;
  packageType: string;
  totalPackages: string;
  qualitySpec: string;
  material: string;
}

export const QuotationsEngine: React.FC = () => {
  // Top Header State
  const [financialYear, setFinancialYear] = useState('2025-2026');
  const [globalSearch, setGlobalSearch] = useState('');
  const [notificationCount] = useState(3);

  // Table State
  const [tableSearch, setTableSearch] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState('10');
  const [sortField, setSortField] = useState<keyof QuotationRecord>('quotationNo');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // Modals & Action States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [selectedQuotationView, setSelectedQuotationView] = useState<QuotationRecord | null>(null);
  const [shareModalQt, setShareModalQt] = useState<QuotationRecord | null>(null);

  // Initial Quotations List
  const [quotations, setQuotations] = useState<QuotationRecord[]>(() => {
    try {
      const saved = localStorage.getItem('shipz_quotations');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('shipz_quotations', JSON.stringify(quotations));
    } catch (e) {}
  }, [quotations]);

  // Complete Form State matching ALL 5 sections of user schema (Cleared default values on create)
  const getEmptyFormData = () => ({
    // 1. Header & General Info
    quotationNo: `QT/${Math.floor(10 + Math.random() * 90)}/25-26`,
    date: new Date().toISOString().split('T')[0],
    companyAddress: '',
    buyerOrderNo: '',
    orderDate: new Date().toISOString().split('T')[0],
    consignee: '',
    consigneeAddress: '',
    notifyParty: '',
    otherNotifyParty: '',

    // 2. Logistics & Shipping Details
    country: '',
    finalDestinationPort: '',
    countryOfOrigin: '',
    preCarriageBy: '',
    placeOfReceipt: '',
    vesselFlightNo: '',
    countryOfLoading: '',
    placeOfLoading: '',
    countryOfDischarge: '',
    portOfDischarge: '',

    // 3. Financial, Commercial & Sales Terms
    salesBroker: 'No',
    currency: 'USD',
    conversionRate: '85.00',
    bank: '',
    documents: '',
    shipmentPeriod: '',
    shipmentTerms: '',
    paymentTerms: '',
    salesperson: '',

    // 4. Line Items / Product Matrix
    lineItems: [
      {
        id: 'li-1',
        product: '',
        productDescription: '',
        unit: '',
        quantity: 0,
        price: 0,
        netWeight: '',
        grossWeight: '',
        packageText: '',
        packageType: '',
        totalPackages: '',
        qualitySpec: '',
        material: '',
      },
    ] as LineItem[],
  });

  const [formData, setFormData] = useState(getEmptyFormData());

  const handleSort = (field: keyof QuotationRecord) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedAndFiltered = [...quotations]
    .filter((q) => {
      const query = tableSearch.toLowerCase();
      return (
        q.quotationNo.toLowerCase().includes(query) ||
        q.consignee.toLowerCase().includes(query) ||
        q.products.toLowerCase().includes(query) ||
        q.country.toLowerCase().includes(query) ||
        q.port.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const handleToggleExpand = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDuplicate = (qt: QuotationRecord) => {
    const clone: QuotationRecord = {
      ...qt,
      id: `qt-${Date.now()}`,
      quotationNo: `QT/COPY-${Math.floor(100 + Math.random() * 900)}/25-26`,
      status: 'Draft',
    };
    setQuotations([clone, ...quotations]);
    setOpenActionMenuId(null);
    alert(`Quotation ${clone.quotationNo} successfully duplicated!`);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this quotation?')) {
      setQuotations(quotations.filter((q) => q.id !== id));
      setOpenActionMenuId(null);
    }
  };

  const handleConvertToPi = (qt: QuotationRecord) => {
    setOpenActionMenuId(null);
    alert(`Workflow Success: Quotation ${qt.quotationNo} converted into Proforma Invoice PI/${qt.quotationNo.replace('QT/', '')}!`);
  };

  const handleOpenCreateModal = () => {
    setFormData(getEmptyFormData());
    setIsCreateModalOpen(true);
  };

  const handleAddLineItem = () => {
    setFormData((prev) => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        {
          id: `li-${Date.now()}`,
          product: '',
          productDescription: '',
          unit: '',
          quantity: 0,
          price: 0,
          netWeight: '',
          grossWeight: '',
          packageText: '',
          packageType: '',
          totalPackages: '',
          qualitySpec: '',
          material: '',
        },
      ],
    }));
  };

  const handleSaveQuotation = (status: 'Draft' | 'Accepted') => {
    const totalAmountSum = formData.lineItems.reduce((acc, item) => acc + item.quantity * item.price, 0);
    const newQt: QuotationRecord = {
      id: `qt-${Date.now()}`,
      quotationNo: formData.quotationNo || 'QT/4/25-26',
      consignee: formData.consignee || 'Global Trade Partners',
      products: formData.lineItems.map((i) => `${i.product} (${i.quantity} ${i.unit})`).join(', '),
      country: formData.country || 'India',
      port: formData.finalDestinationPort || 'Navi Mumbai',
      status: status,
      amount: `${totalAmountSum}.00 (${formData.currency})`,
      balanceDue: `${totalAmountSum}.00 (${formData.currency})`,
      convRate: formData.conversionRate || '85.00',
      date: formData.date || '08/13/2025',
      companyAddress: formData.companyAddress,
      vesselFlightNo: formData.vesselFlightNo || 'TBD',
      currency: formData.currency,
    };

    setQuotations([newQt, ...quotations]);
    setIsCreateModalOpen(false);
    alert(`Quotation ${newQt.quotationNo} created as ${status}!`);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* TOP HEADER & CONTROL BAR */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <input
            type="text"
            placeholder="Search across invoices, products, settings..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 font-bold text-slate-700">
            <span>FY:</span>
            <select
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
              className="bg-transparent focus:outline-none font-bold text-indigo-600"
            >
              <option value="2025-2026">2025-2026</option>
              <option value="2024-2025">2024-2025</option>
            </select>
          </div>

          <button title="Chat / Messages" className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-all"><i className="fi fi-rr-comment text-sm"></i></button>
          <button title="Settings" className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-all"><i className="fi fi-rr-settings text-sm"></i></button>
          <button title="Share" className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-all"><i className="fi fi-rr-link text-sm"></i></button>
          <button title="Notifications" className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-all relative">
            <i className="fi fi-rr-bell text-sm"></i>
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>

          <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
              alt="User Avatar"
              className="w-8 h-8 rounded-full border border-indigo-500 object-cover"
            />
            <span className="font-bold text-slate-800">Admin User ▼</span>
          </div>
        </div>
      </div>

      {/* TABLE TOOLBARS & GRID ARCHITECTURE */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-xs font-bold text-slate-600">
            <span>Show</span>
            <select
              value={entriesPerPage}
              onChange={(e) => setEntriesPerPage(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-xs font-bold focus:outline-none"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span>Entries</span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-600">
              <span>Search:</span>
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="Filter current view..."
                className="bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-md shadow-sm transition-all flex items-center space-x-1"
            >
              <span>+ Add New</span>
            </button>

            <button title="More Options" className="p-2 border border-slate-200 rounded-md text-slate-500 hover:bg-slate-50 font-bold">
              ⋮
            </button>
          </div>
        </div>

        <div className="overflow-visible min-h-[380px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 font-bold bg-slate-50/80 text-[11px]">
                <th className="py-3 px-2 text-center">Expand</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Doc</th>

                <th onClick={() => handleSort('quotationNo')} className="py-3 px-3 cursor-pointer select-none hover:text-slate-900">
                  Quotation No. {sortField === 'quotationNo' ? (sortDirection === 'asc' ? '↑' : '↓') : '↑↓'}
                </th>
                <th onClick={() => handleSort('consignee')} className="py-3 px-3 cursor-pointer select-none hover:text-slate-900">
                  Consignee {sortField === 'consignee' ? (sortDirection === 'asc' ? '↑' : '↓') : '↑↓'}
                </th>
                <th onClick={() => handleSort('products')} className="py-3 px-4 cursor-pointer select-none hover:text-slate-900">
                  Products {sortField === 'products' ? (sortDirection === 'asc' ? '↑' : '↓') : '↑↓'}
                </th>
                <th onClick={() => handleSort('country')} className="py-3 px-3 cursor-pointer select-none hover:text-slate-900">
                  Country {sortField === 'country' ? (sortDirection === 'asc' ? '↑' : '↓') : '↑↓'}
                </th>
                <th onClick={() => handleSort('port')} className="py-3 px-3 cursor-pointer select-none hover:text-slate-900">
                  Port {sortField === 'port' ? (sortDirection === 'asc' ? '↑' : '↓') : '↑↓'}
                </th>
                <th onClick={() => handleSort('status')} className="py-3 px-3 cursor-pointer select-none hover:text-slate-900">
                  Status {sortField === 'status' ? (sortDirection === 'asc' ? '↑' : '↓') : '↑↓'}
                </th>
                <th onClick={() => handleSort('amount')} className="py-3 px-3 cursor-pointer select-none hover:text-slate-900">
                  Amount {sortField === 'amount' ? (sortDirection === 'asc' ? '↑' : '↓') : '↑↓'}
                </th>
                <th onClick={() => handleSort('balanceDue')} className="py-3 px-3 cursor-pointer select-none hover:text-slate-900">
                  Balance Due {sortField === 'balanceDue' ? (sortDirection === 'asc' ? '↑' : '↓') : '↑↓'}
                </th>
                <th onClick={() => handleSort('convRate')} className="py-3 px-3 text-center cursor-pointer select-none hover:text-slate-900">
                  Conv. Rate {sortField === 'convRate' ? (sortDirection === 'asc' ? '↑' : '↓') : '↑↓'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 text-[11px]">
              {sortedAndFiltered.map((qt) => (
                <React.Fragment key={qt.id}>
                  <tr className="hover:bg-slate-50/80 transition-all relative">
                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={() => handleToggleExpand(qt.id)}
                        className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center hover:bg-blue-700 transition-all mx-auto"
                      >
                        {expandedRows[qt.id] ? '-' : '+'}
                      </button>
                    </td>

                    <td className="py-3 px-3 relative">
                      <button
                        onClick={() => setOpenActionMenuId(openActionMenuId === qt.id ? null : qt.id)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-md flex items-center space-x-1 shadow-xs"
                      >
                        <span>Action</span>
                        <span>▼</span>
                      </button>

                      {openActionMenuId === qt.id && (
                        <div className="absolute left-3 top-10 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 py-2 text-xs text-slate-700 space-y-0.5">
                          <button
                            onClick={() => { setSelectedQuotationView(qt); setOpenActionMenuId(null); }}
                            className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center space-x-2 font-semibold text-indigo-600"
                          >
                            <i className="fi fi-rr-eye text-xs"></i>
                            <span>View Overview</span>
                          </button>
                          <button
                            onClick={() => { setIsCreateModalOpen(true); setOpenActionMenuId(null); }}
                            className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center space-x-2 font-semibold"
                          >
                            <i className="fi fi-rr-edit text-xs"></i>
                            <span>Edit Quotation</span>
                          </button>
                          <button
                            onClick={() => { window.print(); setOpenActionMenuId(null); }}
                            className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center space-x-2 font-semibold"
                          >
                            <i className="fi fi-rr-document text-xs"></i>
                            <span>Download PDF</span>
                          </button>
                          <button
                            onClick={() => { setShareModalQt(qt); setOpenActionMenuId(null); }}
                            className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center space-x-2 font-semibold"
                          >
                            <i className="fi fi-rr-envelope text-xs"></i>
                            <span>Send via Email / WhatsApp</span>
                          </button>
                          <button
                            onClick={() => handleConvertToPi(qt)}
                            className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center space-x-2 font-semibold text-indigo-600"
                          >
                            <i className="fi fi-rr-refresh text-xs"></i>
                            <span>Convert to Proforma Invoice (PI)</span>
                          </button>
                          <button
                            onClick={() => handleDuplicate(qt)}
                            className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center space-x-2 font-semibold"
                          >
                            <i className="fi fi-rr-copy text-xs"></i>
                            <span>Duplicate / Clone</span>
                          </button>
                          <div className="border-t border-slate-100 my-1"></div>
                          <button
                            onClick={() => handleDelete(qt.id)}
                            className="w-full text-left px-3 py-1.5 hover:bg-rose-50 text-rose-600 flex items-center space-x-2 font-semibold"
                          >
                            <i className="fi fi-rr-trash text-xs"></i>
                            <span>Delete / Cancel</span>
                          </button>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <button
                        onClick={() => window.print()}
                        className="p-1.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-md font-bold text-xs flex items-center space-x-1 hover:bg-amber-100"
                      >
                        <i className="fi fi-rr-document text-xs"></i>
                        <span>▼</span>
                      </button>
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-indigo-600">
                      <button onClick={() => setSelectedQuotationView(qt)} className="hover:underline text-left font-bold">
                        {qt.quotationNo}
                      </button>
                    </td>

                    <td className="py-3 px-3 font-bold text-slate-800">{qt.consignee}</td>
                    <td className="py-3 px-4 max-w-xs text-slate-700 leading-relaxed">{qt.products}</td>
                    <td className="py-3 px-3 font-medium">{qt.country}</td>
                    <td className="py-3 px-3 font-medium">{qt.port}</td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 font-bold rounded-md text-[10px] inline-flex items-center space-x-1">
                        <span>{qt.status}</span>
                        <span>∨</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">{qt.amount}</td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-600">{qt.balanceDue}</td>
                    <td className="py-3 px-3 font-mono text-center font-bold text-slate-700">{qt.convRate}</td>
                  </tr>

                  {expandedRows[qt.id] && (
                    <tr className="bg-slate-50/90 border-b border-slate-200">
                      <td colSpan={12} className="p-4 text-xs space-y-2">
                        <div className="font-bold text-indigo-900 flex items-center space-x-2">
                          <span>📌 Detailed Metadata for {qt.quotationNo}:</span>
                        </div>
                        <div className="grid grid-cols-4 gap-4 bg-white p-3 rounded-xl border border-slate-200">
                          <div><span className="text-[10px] text-slate-400 font-bold uppercase block">Company Address</span><span className="font-semibold">{qt.companyAddress}</span></div>
                          <div><span className="text-[10px] text-slate-400 font-bold uppercase block">Vessel/Flight</span><span className="font-semibold">{qt.vesselFlightNo}</span></div>
                          <div><span className="text-[10px] text-slate-400 font-bold uppercase block">Created Date</span><span className="font-semibold">{qt.date}</span></div>
                          <div><span className="text-[10px] text-slate-400 font-bold uppercase block">Currency Code</span><span className="font-semibold">{qt.currency}</span></div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
          <div>Showing 1 to {sortedAndFiltered.length} of {quotations.length} entries</div>
          <div className="flex items-center space-x-1">
            <button className="px-3 py-1.5 border border-slate-200 rounded-md hover:bg-slate-50 text-slate-600">Previous</button>
            <button className="px-3 py-1.5 bg-blue-600 text-white rounded-md font-bold">1</button>
            <button className="px-3 py-1.5 border border-slate-200 rounded-md hover:bg-slate-50 text-slate-600">Next</button>
          </div>
        </div>
      </div>

      {/* VIEW OVERVIEW / FULL DETAILS MODAL */}
      {selectedQuotationView && (() => {
        const parseLineItems = (qt: any) => {
          if (qt.lineItems && Array.isArray(qt.lineItems) && qt.lineItems.length > 0) {
            return qt.lineItems.map((item: any) => ({
              name: item.product || 'Export Item',
              desc: item.productDescription || item.qualitySpec || 'AS PER SAMPLE',
              hsn: item.hsn || '090931',
              qty: Number(item.quantity || 0),
              unit: item.unit || 'KG',
              rate: Number(item.price || 0),
              total: Number(item.quantity || 0) * Number(item.price || 0),
              imgUrl: item.imgUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=150&auto=format&fit=crop&q=80'
            }));
          }
          if (qt.products) {
            const parts = qt.products.split(',');
            return parts.map((part: string, idx: number) => {
              const match = part.trim().match(/^(.*?)(?:\s*\(([\d.]+)\s*([A-Za-z]+)\))?$/);
              const name = match ? match[1].trim() : part.trim();
              const qty = match && match[2] ? parseFloat(match[2]) : (idx === 0 ? 3000 : (idx === 1 ? 4000 : 1000));
              const unit = match && match[3] ? match[3] : (idx === 2 ? 'Litre' : 'KG');
              const rate = idx === 0 ? 1.5 : (idx === 1 ? 1.8 : 1.2);
              return {
                name: name,
                desc: 'HIGH PURITY EXPORT GRADE (AS PER SAMPLE)',
                hsn: idx === 0 ? '291619' : (idx === 1 ? '291814' : '340213'),
                qty: qty,
                unit: unit,
                rate: rate,
                total: qty * rate,
                imgUrl: idx === 0 ? 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=150&auto=format&fit=crop&q=80' : idx === 1 ? 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=150&auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=150&auto=format&fit=crop&q=80'
              };
            });
          }
          return [];
        };

        const items = parseLineItems(selectedQuotationView);

        const handleDownloadPdf = (qt: any) => {
          if ((window as any).html2pdf) {
            const element = document.getElementById('quotation-pdf-canvas');
            if (element) {
              const opt = {
                margin: [6, 6, 6, 6],
                filename: `${qt.quotationNo.replace(/[^a-zA-Z0-9]/g, '_')}_${qt.consignee}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
              };
              (window as any).html2pdf().set(opt).from(element).save();
              return;
            }
          }
          window.print();
        };

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh]">
              {/* MODAL HEADER */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-900 text-white shrink-0">
                <div className="flex items-center space-x-3">
                  <span className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center text-xs shadow-md">QT</span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-black tracking-tight text-white">
                        Quotation Details - {selectedQuotationView.quotationNo}
                      </h3>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase tracking-wider">
                        {selectedQuotationView.status || 'Accepted'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Full quotation parameters, consignee details, shipping terms & line items breakdown
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedQuotationView(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm transition-all"
                >
                  ✕
                </button>
              </div>

              {/* MODAL BODY (SCROLLABLE FULL FIELD DETAILS) */}
              <div className="p-6 space-y-6 text-xs text-slate-700 overflow-y-auto flex-1 bg-slate-50/50">

                {/* KEY METRICS SUMMARY CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">CONSIGNEE / BUYER</span>
                    <p className="font-extrabold text-slate-900 text-sm">{selectedQuotationView.consignee}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{(selectedQuotationView as any).consigneeAddress || 'Montreal, Quebec, Canada'}</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">DESTINATION COUNTRY & PORT</span>
                    <p className="font-extrabold text-slate-900 text-sm">{selectedQuotationView.country} ({selectedQuotationView.port})</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Final Port: {(selectedQuotationView as any).portOfDischarge || selectedQuotationView.port || 'Montreal Port'}</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs bg-gradient-to-br from-indigo-50/50 to-white">
                    <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider block mb-1">QUOTATION VALUE ({selectedQuotationView.currency || 'USD'})</span>
                    <p className="font-extrabold text-indigo-700 text-base font-mono">{selectedQuotationView.amount}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-mono">Balance Due: {selectedQuotationView.balanceDue || selectedQuotationView.amount}</p>
                  </div>
                </div>

                {/* SECTION 1: HEADER & GENERAL INFORMATION */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    <span>1. General Header & Company Reference</span>
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Quotation No.</span>
                      <span className="font-bold text-slate-900 font-mono">{selectedQuotationView.quotationNo}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Quotation Date</span>
                      <span className="font-semibold text-slate-800">{selectedQuotationView.date || '2025-08-13'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Exporter Unit</span>
                      <span className="font-semibold text-slate-800">{selectedQuotationView.companyAddress || 'Gujarat SEZ Unit'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Buyer Order / Ref No</span>
                      <span className="font-semibold text-slate-800">{(selectedQuotationView as any).buyerOrderNo || 'PO-99201'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Order Date</span>
                      <span className="font-semibold text-slate-800">{(selectedQuotationView as any).orderDate || selectedQuotationView.date || '2025-08-13'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Currency</span>
                      <span className="font-bold text-indigo-700">{selectedQuotationView.currency || 'USD'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Conversion Rate</span>
                      <span className="font-semibold text-slate-800 font-mono">₹{selectedQuotationView.convRate || '85.00'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Salesperson</span>
                      <span className="font-semibold text-slate-800">{(selectedQuotationView as any).salesperson || 'Exim Desk'}</span>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: PARTIES & NOTIFY DETAILS */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    <span>2. Parties & Address Information</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Consignee Name</span>
                      <span className="font-bold text-slate-900">{selectedQuotationView.consignee}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Consignee Address</span>
                      <span className="font-medium text-slate-700">{(selectedQuotationView as any).consigneeAddress || 'Montreal, Quebec, Canada'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Destination Country</span>
                      <span className="font-semibold text-slate-800">{selectedQuotationView.country}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Notify Party</span>
                      <span className="font-semibold text-slate-800">{(selectedQuotationView as any).notifyParty || 'Same as Consignee'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Secondary Notify Party</span>
                      <span className="font-semibold text-slate-800">{(selectedQuotationView as any).otherNotifyParty || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Destination Port</span>
                      <span className="font-semibold text-slate-800">{selectedQuotationView.port}</span>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: LOGISTICS & SHIPPING PARAMETERS */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    <span>3. Logistics & Transport Parameters</span>
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Country of Origin</span>
                      <span className="font-semibold text-slate-800">{(selectedQuotationView as any).countryOfOrigin || 'India'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Pre-Carriage By</span>
                      <span className="font-semibold text-slate-800">{(selectedQuotationView as any).preCarriageBy || 'By Sea'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Place of Receipt</span>
                      <span className="font-semibold text-slate-800">{(selectedQuotationView as any).placeOfReceipt || 'ICD Ahmedabad'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Vessel / Flight No</span>
                      <span className="font-bold text-slate-900 font-mono">{selectedQuotationView.vesselFlightNo || 'MSC OSCAR V.24B'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Port of Loading</span>
                      <span className="font-semibold text-slate-800">{(selectedQuotationView as any).placeOfLoading || 'Nhava Sheva, India'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Port of Discharge</span>
                      <span className="font-semibold text-slate-800">{(selectedQuotationView as any).portOfDischarge || selectedQuotationView.port || 'Montreal Port'}</span>
                    </div>
                  </div>
                </div>

                {/* SECTION 4: FINANCIAL & PAYMENT TERMS */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    <span>4. Financial, Commercial & Payment Terms</span>
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Payment Terms</span>
                      <span className="font-bold text-slate-900">{(selectedQuotationView as any).paymentTerms || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Incoterms / Shipment Terms</span>
                      <span className="font-bold text-indigo-700">{(selectedQuotationView as any).shipmentTerms || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Shipment Period / Lead Time</span>
                      <span className="font-semibold text-slate-800">{(selectedQuotationView as any).shipmentPeriod || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Bank Account</span>
                      <span className="font-medium text-slate-700">{(selectedQuotationView as any).bank || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Required Documents</span>
                      <span className="font-medium text-slate-700">{(selectedQuotationView as any).documents || 'COA, BL, Invoice, Packing List, Fumigation Cert'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Sales Broker</span>
                      <span className="font-semibold text-slate-800">
                        {(selectedQuotationView as any).salesBroker === 'Yes' 
                          ? `${(selectedQuotationView as any).brokerName || 'Broker'} (${(selectedQuotationView as any).brokerCommission || '0'}%)`
                          : 'No Broker'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* SECTION 5: ITEMIZED PRODUCT MATRIX / LINE ITEMS */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    <span>5. Itemized Products Matrix ({items.length} Products)</span>
                  </h4>

                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-white font-bold text-[10px] uppercase">
                          <th className="py-2.5 px-3 text-center w-8">#</th>
                          <th className="py-2.5 px-3">Product & Specification</th>
                          <th className="py-2.5 px-3 text-center">HS Code</th>
                          <th className="py-2.5 px-3 text-right">Quantity</th>
                          <th className="py-2.5 px-3 text-center">Unit</th>
                          <th className="py-2.5 px-3 text-right">Rate ($)</th>
                          <th className="py-2.5 px-3 text-right">Total ($)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {items.map((item: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-all">
                            <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                            <td className="py-2.5 px-3">
                              <div className="flex items-center space-x-3">
                                {item.imgUrl ? (
                                  <img src={item.imgUrl} alt={item.name} className="w-9 h-9 rounded-md object-cover border border-slate-200 shrink-0" />
                                ) : (
                                  <div className="w-9 h-9 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-xs shrink-0">📦</div>
                                )}
                                <div>
                                  <p className="font-extrabold text-slate-900">{item.name}</p>
                                  <p className="text-[10px] text-slate-500 italic mt-0.5">{item.desc}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono text-slate-600">{item.hsn}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">{item.qty}</td>
                            <td className="py-2.5 px-3 text-center font-semibold text-slate-600">{item.unit}</td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-700">${Number(item.rate).toFixed(2)}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-indigo-700">${Number(item.total).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-50 font-bold border-t-2 border-slate-300 text-xs">
                          <td colSpan={3} className="py-2.5 px-3 text-right uppercase text-slate-700 font-extrabold">Total Valuation</td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-900">{items.reduce((s: number, i: any) => s + (i.qty || 0), 0)}</td>
                          <td className="py-2.5 px-3 text-center">-</td>
                          <td className="py-2.5 px-3 text-right">-</td>
                          <td className="py-2.5 px-3 text-right font-mono font-black text-indigo-700 text-sm">
                            {selectedQuotationView.amount}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

              </div>

              {/* MODAL FOOTER WITH CONVERT AND PDF DOWNLOAD ACTIONS */}
              <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200 shrink-0">
                <button
                  onClick={() => handleConvertToPi(selectedQuotationView)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center space-x-2 transition-all"
                >
                  <span>🔄</span>
                  <span>Convert to Proforma Invoice (PI)</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDownloadPdf(selectedQuotationView)}
                    className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs rounded-lg shadow-xs flex items-center space-x-1.5 transition-all"
                  >
                    <i className="fi fi-rr-download text-xs"></i>
                    <span>Download PDF</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-lg transition-all flex items-center space-x-1.5"
                  >
                    <i className="fi fi-rr-print text-xs"></i>
                    <span>Print</span>
                  </button>
                  <button
                    onClick={() => setSelectedQuotationView(null)}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white flex items-center justify-center font-bold text-xs border border-slate-700 transition-all ml-1"
                    title="Close Modal"
                  >
                    ✕
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* SHARE VIA EMAIL / WHATSAPP MODAL */}
      {shareModalQt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-base font-black text-slate-900">Share {shareModalQt.quotationNo}</h3>
              <button onClick={() => setShareModalQt(null)} className="text-slate-400 hover:text-slate-800 font-bold">✕</button>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Recipient Email / Phone</label>
              <input type="text" defaultValue="client@globaltrade.com" className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs" />
            </div>
            <div className="flex space-x-2 pt-2">
              <button onClick={() => { alert('Quotation sent via Email!'); setShareModalQt(null); }} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-bold">Send Email</button>
              <button onClick={() => { alert('Quotation shared via WhatsApp!'); setShareModalQt(null); }} className="flex-1 py-2 bg-emerald-600 text-white rounded-lg font-bold">Send WhatsApp</button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE QUOTATION FORM MODAL - COMPLETE 5 SECTIONS SCHEMA */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[94vh] overflow-y-auto flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white z-20">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Create Quotation</h3>
                <p className="text-[11px] text-slate-500 font-medium">Fill in general, logistics, financial terms, and itemized product matrix.</p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-800 text-xl font-bold p-1">✕</button>
            </div>

            {/* Modal Form Body */}
            <div className="p-6 space-y-8 text-xs text-slate-700">

              {/* SECTION 1: HEADER & GENERAL INFORMATION */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px]">1</span>
                  <h4 className="font-black text-slate-900 text-sm">Header & General Information</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Quotation No. <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formData.quotationNo}
                      onChange={(e) => setFormData({ ...formData, quotationNo: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Company Address <span className="text-red-500">*</span></label>
                    <select
                      value={formData.companyAddress}
                      onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold"
                    >
                      <option value="">-- Select Company Address --</option>
                      <option value="MGLOBAL IMPEX-INDIA PRIVATE LIMITED - Suite No. 1101, Greenscape Shakti Ventures, CBD Belapur, Navi Mumbai, MH-400614">MGLOBAL IMPEX-INDIA PRIVATE LIMITED (Navi Mumbai)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Buyer Order No.</label>
                    <input
                      type="text"
                      placeholder="e.g. PO-99201"
                      value={formData.buyerOrderNo}
                      onChange={(e) => setFormData({ ...formData, buyerOrderNo: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Order Date</label>
                    <input
                      type="date"
                      value={formData.orderDate}
                      onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Consignee</label>
                    <div className="flex space-x-1">
                      <select
                        value={formData.consignee}
                        onChange={(e) => setFormData({ ...formData, consignee: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold"
                      >
                        <option value="Jony">Jony (Canada)</option>
                        <option value="BERLIN">BERLIN (Indonesia)</option>
                        <option value="Global Imports Corp">Global Imports Corp</option>
                      </select>
                      <button title="+ Add New Consignee" className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs">+</button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Consignee Address</label>
                    <select
                      value={formData.consigneeAddress}
                      onChange={(e) => setFormData({ ...formData, consigneeAddress: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
                    >
                      <option value="Montreal, Canada">Montreal, Canada</option>
                      <option value="Jakarta, Indonesia">Jakarta, Indonesia</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Notify Party / Buyer</label>
                    <select
                      value={formData.notifyParty}
                      onChange={(e) => setFormData({ ...formData, notifyParty: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
                    >
                      <option value="Same as Consignee">Same as Consignee</option>
                      <option value="First National Logistics">First National Logistics</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Other Notify Party</label>
                    <select
                      value={formData.otherNotifyParty}
                      onChange={(e) => setFormData({ ...formData, otherNotifyParty: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
                    >
                      <option value="Logistics Agent CA">Logistics Agent CA</option>
                      <option value="Customs Broker Direct">Customs Broker Direct</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: LOGISTICS & SHIPPING DETAILS */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px]">2</span>
                  <h4 className="font-black text-slate-900 text-sm">Logistics & Shipping Details</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Country <span className="text-red-500">*</span></label>
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold"
                    >
                      <option value="Canada">Canada</option>
                      <option value="Indonesia">Indonesia</option>
                      <option value="India">India</option>
                      <option value="Germany">Germany</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Final Destination / Port Name</label>
                    <div className="flex space-x-1">
                      <select
                        value={formData.finalDestinationPort}
                        onChange={(e) => setFormData({ ...formData, finalDestinationPort: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold"
                      >
                        <option value="Montreal">Montreal</option>
                        <option value="Tanjung Priok">Tanjung Priok</option>
                        <option value="Hamburg">Hamburg</option>
                      </select>
                      <button title="+ Add New Port" className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs">+</button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Country Of Origin Of Goods</label>
                    <select
                      value={formData.countryOfOrigin}
                      onChange={(e) => setFormData({ ...formData, countryOfOrigin: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
                    >
                      <option value="India">India</option>
                      <option value="Vietnam">Vietnam</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Pre Carriage By</label>
                    <select
                      value={formData.preCarriageBy}
                      onChange={(e) => setFormData({ ...formData, preCarriageBy: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
                    >
                      <option value="By Sea">By Sea</option>
                      <option value="By Air">By Air</option>
                      <option value="By Road">By Road</option>
                      <option value="By Rail">By Rail</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Place Of Receipt By Pre Carrier</label>
                    <input
                      type="text"
                      value={formData.placeOfReceipt}
                      onChange={(e) => setFormData({ ...formData, placeOfReceipt: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Vessel / Flight No.</label>
                    <input
                      type="text"
                      value={formData.vesselFlightNo}
                      onChange={(e) => setFormData({ ...formData, vesselFlightNo: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Country Of Loading</label>
                    <select
                      value={formData.countryOfLoading}
                      onChange={(e) => setFormData({ ...formData, countryOfLoading: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
                    >
                      <option value="India">India</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Place Of Loading</label>
                    <select
                      value={formData.placeOfLoading}
                      onChange={(e) => setFormData({ ...formData, placeOfLoading: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
                    >
                      <option value="Mundra Port">Mundra Port</option>
                      <option value="Nhava Sheva Port">Nhava Sheva Port</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Country Of Discharge</label>
                    <select
                      value={formData.countryOfDischarge}
                      onChange={(e) => setFormData({ ...formData, countryOfDischarge: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
                    >
                      <option value="Canada">Canada</option>
                      <option value="Indonesia">Indonesia</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Port Of Discharge</label>
                    <select
                      value={formData.portOfDischarge}
                      onChange={(e) => setFormData({ ...formData, portOfDischarge: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
                    >
                      <option value="Port of Montreal">Port of Montreal</option>
                      <option value="Tanjung Priok Port">Tanjung Priok Port</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 3: FINANCIAL, COMMERCIAL & SALES TERMS */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px]">3</span>
                  <h4 className="font-black text-slate-900 text-sm">Financial, Commercial & Sales Terms</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Sales Broker</label>
                    <div className="flex items-center space-x-4 pt-1">
                      <label className="flex items-center space-x-1 cursor-pointer">
                        <input
                          type="radio"
                          name="broker"
                          value="Yes"
                          checked={formData.salesBroker === 'Yes'}
                          onChange={() => setFormData({ ...formData, salesBroker: 'Yes' })}
                        />
                        <span className="font-bold">Yes</span>
                      </label>
                      <label className="flex items-center space-x-1 cursor-pointer">
                        <input
                          type="radio"
                          name="broker"
                          value="No"
                          checked={formData.salesBroker === 'No'}
                          onChange={() => setFormData({ ...formData, salesBroker: 'No' })}
                        />
                        <span className="font-bold">No</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Currency <span className="text-red-500">*</span></label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="INR">INR (₹)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Conversion Rate</label>
                    <input
                      type="number"
                      value={formData.conversionRate}
                      onChange={(e) => setFormData({ ...formData, conversionRate: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Bank</label>
                    <select
                      value={formData.bank}
                      onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold"
                    >
                      <option value="">-- Select Bank Account --</option>
                      <option value="KOTAK MAHINDRA BANK LTD — 6748421381 (CBD Belapur)">KOTAK MAHINDRA BANK LTD — 6748421381 (CBD Belapur)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1 flex justify-between">
                      <span>Documents</span>
                      <span className="text-blue-600 font-bold text-[10px] cursor-pointer">+ Add Custom Document</span>
                    </label>
                    <input
                      type="text"
                      value={formData.documents}
                      onChange={(e) => setFormData({ ...formData, documents: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Shipment Period</label>
                    <input
                      type="text"
                      value={formData.shipmentPeriod}
                      onChange={(e) => setFormData({ ...formData, shipmentPeriod: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Shipment Terms (Incoterms)</label>
                    <div className="flex space-x-1">
                      <select
                        value={formData.shipmentTerms}
                        onChange={(e) => setFormData({ ...formData, shipmentTerms: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold"
                      >
                        <option value="">-- Select Shipment Terms --</option>
                        <option value="FOB - Free on Board">FOB - Free on Board</option>
                        <option value="CIF - Cost, Insurance & Freight">CIF - Cost, Insurance & Freight</option>
                        <option value="CFR - Cost & Freight">CFR - Cost & Freight</option>
                        <option value="EXW - Ex Works">EXW - Ex Works</option>
                        <option value="DDP - Delivered Duty Paid">DDP - Delivered Duty Paid</option>
                        <option value="FCA - Free Carrier">FCA - Free Carrier</option>
                      </select>
                      <button title="+ Add New Term" className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs">+</button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Payment Terms</label>
                    <div className="flex space-x-1">
                      <select
                        value={formData.paymentTerms}
                        onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold"
                      >
                        <option value="">-- Select Payment Terms --</option>
                        <option value="100% LC at Sight">100% LC at Sight</option>
                        <option value="30% Advance + 70% Against B/L">30% Advance + 70% Against B/L</option>
                        <option value="100% Advance TT">100% Advance TT</option>
                        <option value="DA 30 Days">DA 30 Days</option>
                        <option value="DA 60 Days">DA 60 Days</option>
                        <option value="DP at Sight">DP at Sight</option>
                      </select>
                      <button title="+ Add New Payment Term" className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs">+</button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Salesperson</label>
                    <div className="flex space-x-1">
                      <select
                        value={formData.salesperson}
                        onChange={(e) => setFormData({ ...formData, salesperson: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold"
                      >
                        <option value="">-- Select Salesperson --</option>
                      </select>
                      <button title="+ Add New Salesperson" className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs">+</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: LINE ITEMS / PRODUCT DETAILS MATRIX */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px]">4</span>
                    <h4 className="font-black text-slate-900 text-sm">Line Items / Product Details Matrix</h4>
                  </div>
                  <button
                    onClick={handleAddLineItem}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center space-x-1"
                  >
                    <span>+ Add Product Row</span>
                  </button>
                </div>

                {formData.lineItems.map((item, idx) => (
                  <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-4">
                    <div className="flex justify-between items-center font-bold text-xs text-indigo-900">
                      <span>Line Item #{idx + 1}</span>
                      {formData.lineItems.length > 1 && (
                        <button
                          onClick={() => setFormData({ ...formData, lineItems: formData.lineItems.filter((i) => i.id !== item.id) })}
                          className="text-rose-600 text-[11px] hover:underline"
                        >
                          Remove Row
                        </button>
                      )}
                    </div>

                    {/* Row 1: Product, Unit, Quantity, Price, Total */}
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                      <div className="md:col-span-2">
                        <label className="block text-slate-700 font-bold mb-1 flex justify-between">
                          <span>Product</span>
                          <span className="text-blue-600 font-bold cursor-pointer">+ Add Product</span>
                        </label>
                        <select
                          value={item.product}
                          onChange={(e) => {
                            const updated = [...formData.lineItems];
                            updated[idx].product = e.target.value;
                            setFormData({ ...formData, lineItems: updated });
                          }}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold"
                        >
                          <option value="Degaser 200">Degaser 200</option>
                          <option value="Citric Acid Anhydrous">Citric Acid Anhydrous</option>
                          <option value="Sodium Benzoate">Sodium Benzoate</option>
                          <option value="Emamectin Benzoate">Emamectin Benzoate</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Unit</label>
                        <select
                          value={item.unit}
                          onChange={(e) => {
                            const updated = [...formData.lineItems];
                            updated[idx].unit = e.target.value;
                            setFormData({ ...formData, lineItems: updated });
                          }}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
                        >
                          <option value="Litre (Litre)">Litre (Litre)</option>
                          <option value="KG (Kilogram)">KG (Kilogram)</option>
                          <option value="Ton (Metric Ton)">Ton (Metric Ton)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Quantity</label>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => {
                              const updated = [...formData.lineItems];
                              updated[idx].quantity = Math.max(1, updated[idx].quantity - 1);
                              setFormData({ ...formData, lineItems: updated });
                            }}
                            className="w-7 h-8 bg-blue-600 text-white rounded font-bold"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const updated = [...formData.lineItems];
                              updated[idx].quantity = parseInt(e.target.value) || 1;
                              setFormData({ ...formData, lineItems: updated });
                            }}
                            className="w-12 text-center bg-white border border-slate-300 rounded py-1 text-xs font-bold"
                          />
                          <button
                            onClick={() => {
                              const updated = [...formData.lineItems];
                              updated[idx].quantity += 1;
                              setFormData({ ...formData, lineItems: updated });
                            }}
                            className="w-7 h-8 bg-blue-600 text-white rounded font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Price ({formData.currency})</label>
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => {
                            const updated = [...formData.lineItems];
                            updated[idx].price = parseFloat(e.target.value) || 0;
                            setFormData({ ...formData, lineItems: updated });
                          }}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Total ({formData.currency}) [Auto]</label>
                        <input
                          type="text"
                          readOnly
                          value={(item.quantity * item.price).toFixed(2)}
                          className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900"
                        />
                      </div>
                    </div>

                    {/* Row 2: Description & Weights/Packaging Matrix */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Product Description (Auto-filled from Master)</label>
                        <textarea
                          rows={3}
                          value={item.productDescription}
                          onChange={(e) => {
                            const updated = [...formData.lineItems];
                            updated[idx].productDescription = e.target.value;
                            setFormData({ ...formData, lineItems: updated });
                          }}
                          className="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs"
                        ></textarea>
                      </div>

                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-slate-700 font-bold text-[10px] mb-1">Net Weight</label>
                            <input
                              type="text"
                              value={item.netWeight}
                              onChange={(e) => {
                                const updated = [...formData.lineItems];
                                updated[idx].netWeight = e.target.value;
                                setFormData({ ...formData, lineItems: updated });
                              }}
                              className="w-full bg-white border border-blue-400 rounded px-2 py-1 text-xs font-mono font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-700 font-bold text-[10px] mb-1">Gross Weight</label>
                            <input
                              type="text"
                              value={item.grossWeight}
                              onChange={(e) => {
                                const updated = [...formData.lineItems];
                                updated[idx].grossWeight = e.target.value;
                                setFormData({ ...formData, lineItems: updated });
                              }}
                              className="w-full bg-white border border-blue-400 rounded px-2 py-1 text-xs font-mono font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-700 font-bold text-[10px] mb-1">Total Packages [Auto]</label>
                            <input
                              type="text"
                              readOnly
                              value={item.totalPackages}
                              className="w-full bg-slate-100 border border-slate-300 rounded px-2 py-1 text-xs font-mono font-bold"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-slate-700 font-bold text-[10px] mb-1 flex justify-between">
                              <span>Package</span>
                              <span className="text-blue-600 font-bold cursor-pointer">+ Package</span>
                            </label>
                            <input
                              type="text"
                              value={item.packageText}
                              onChange={(e) => {
                                const updated = [...formData.lineItems];
                                updated[idx].packageText = e.target.value;
                                setFormData({ ...formData, lineItems: updated });
                              }}
                              className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-700 font-bold text-[10px] mb-1">Package Type</label>
                            <select
                              value={item.packageType}
                              onChange={(e) => {
                                const updated = [...formData.lineItems];
                                updated[idx].packageType = e.target.value;
                                setFormData({ ...formData, lineItems: updated });
                              }}
                              className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                            >
                              <option value="MS Drum">MS Drum</option>
                              <option value="HDPE Bags">HDPE Bags</option>
                              <option value="Wooden Pallets">Wooden Pallets</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-slate-700 font-bold text-[10px] mb-1 flex justify-between">
                              <span>Material</span>
                              <span className="text-blue-600 font-bold cursor-pointer">+ Material</span>
                            </label>
                            <select
                              value={item.material}
                              onChange={(e) => {
                                const updated = [...formData.lineItems];
                                updated[idx].material = e.target.value;
                                setFormData({ ...formData, lineItems: updated });
                              }}
                              className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                            >
                              <option value="Steel Drum">Steel Drum</option>
                              <option value="Poly Bag">Poly Bag</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 5: FORM ACTION BUTTONS */}
            <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-slate-50 border-t border-slate-200 sticky bottom-0 z-20 rounded-b-2xl">
              <button
                onClick={() => handleSaveQuotation('Draft')}
                className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition-all"
              >
                Save As Draft
              </button>
              <button
                onClick={() => handleSaveQuotation('Accepted')}
                className="px-5 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs shadow-sm transition-all"
              >
                Save
              </button>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-5 py-2.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-sm transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
