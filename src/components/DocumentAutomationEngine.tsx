import React, { useState, useEffect } from 'react';
import { EXIMDocument, Currency } from '../types';

interface DocumentAutomationEngineProps {
  documents: EXIMDocument[];
  currentCurrency: Currency;
  onSaveDocument: (doc: EXIMDocument) => void;
  documentType?: 'commercial' | 'proforma';
}

export const DocumentAutomationEngine: React.FC<DocumentAutomationEngineProps> = ({
  documents,
  currentCurrency,
  onSaveDocument,
  documentType = 'commercial',
}) => {
  const isProformaMode = documentType === 'proforma';

  const [selectedDocId, setSelectedDocId] = useState<string>(isProformaMode ? 'pi-01' : 'doc-89');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'DRAFT' | 'CLEARED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCbmOptimizerOpen, setIsCbmOptimizerOpen] = useState(true);
  const [isCreatePiModalOpen, setIsCreatePiModalOpen] = useState(false);

  // Form State for Create Proforma Invoice
  const [piFormData, setPiFormData] = useState({
    quotationNo: '',
    piNo: 'PI/6/25-26',
    date: '2025-06-18',
    companyAddress: 'Andhra Pradesh',
    buyerOrderNo: 'PO-99420',
    orderDate: '2025-06-18',
    consignee: 'Global Trade Partners LLC',
    consigneeAddress: '789 Logistics Way, Suite 400, Los Angeles, CA 90001',
    notifyParty: 'FastForward Logistics Inc.',
    otherNotifyParty: 'Apex Customs Brokerage',
    country: 'United States',
    finalDestinationPort: 'Port of Los Angeles',
    countryOfOrigin: 'India',
    preCarriageBy: 'Road Logistics Express',
    placeOfReceipt: 'Nhava Sheva CFS',
    vesselFlightNo: 'MSC OSCAR V.24B',
    countryOfLoading: 'India',
    placeOfLoading: 'Nhava Sheva (INNSA)',
    countryOfDischarge: 'United States',
    portOfDischarge: 'Port of Los Angeles (USLAX)',
    salesBroker: 'No',
    currency: 'USD',
    conversionRate: '83.50',
    bank: 'State Bank of India (AD: 0540012)',
    documents: 'Certificate of Origin, Packing List',
    shipmentPeriod: '15 to 20 Days from LC Opening',
  });

  // Proforma Invoices
  const [proformaCards, setProformaCards] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('shipz_proforma_invoices');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('shipz_proforma_invoices', JSON.stringify(proformaCards));
    } catch (e) {}
  }, [proformaCards]);

  // Commercial Invoices
  const commercialCards: any[] = [];

  const currentCards = isProformaMode ? proformaCards : commercialCards;
  const activeCard = currentCards.find((c) => c.id === selectedDocId) || currentCards[0];

  const filteredCards = currentCards.filter((card) => {
    const matchesFilter = activeFilter === 'ALL' || card.status === activeFilter;
    const matchesSearch =
      searchTerm === '' ||
      card.invNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.consignee.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCreatePiSave = (status: 'DRAFT' | 'SAVED') => {
    const newPi = {
      id: `pi-${Date.now()}`,
      invNumber: piFormData.piNo || 'PI/6/25-26',
      consignee: piFormData.consignee || 'Global Trade Partners LLC',
      date: piFormData.date || 'Jun 18, 2025',
      amount: '$142,500.00',
      status: status === 'DRAFT' ? 'DRAFT' : 'ISSUED',
      statusColor: status === 'DRAFT' ? 'bg-amber-100 text-amber-700 border border-amber-300' : 'bg-indigo-100 text-indigo-700',
      exporter: `ExportFlow Ltd. (${piFormData.companyAddress})`,
      exporterAddr: `${piFormData.companyAddress}, India`,
      consigneeAddr: piFormData.consigneeAddress || '789 Logistics Way, USA',
      cbm: '45.2 m³',
      fillPercent: 85,
    };

    setProformaCards([newPi, ...proformaCards]);
    setSelectedDocId(newPi.id);
    setIsCreatePiModalOpen(false);
    alert(`Proforma Invoice ${newPi.invNumber} successfully created as ${status}!`);
  };

  return (
    <div className="flex h-screen bg-[#EEF4FF] overflow-hidden -m-6 relative">
      {/* COLUMN 2: MIDDLE LIST COLUMN */}
      <div className="w-[420px] list-column-ice flex flex-col justify-between p-6 overflow-y-auto shrink-0 border-r border-[#E0E7FF]">
        <div className="space-y-5">
          {/* Header & Create Button */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {isProformaMode ? 'Proforma Invoices' : 'Commercial Invoices'}
            </h2>
            <button
              onClick={() => setIsCreatePiModalOpen(true)}
              className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1 shadow-md shadow-indigo-600/30 transition-all"
            >
              <span>+</span>
              <span>{isProformaMode ? 'Create Proforma Invoice' : 'Create Invoice'}</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder={isProformaMode ? 'Search Proforma Invoices...' : 'Search Invoices...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 shadow-xs"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-2">
            {[
              { id: 'ALL', label: 'ALL (124)' },
              { id: 'DRAFT', label: 'DRAFT (12)' },
              { id: 'CLEARED', label: 'CLEARED (89)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                  activeFilter === tab.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-white text-indigo-900 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Invoices List */}
          <div className="space-y-3.5 pt-1">
            {filteredCards.map((card) => {
              const isSelected = selectedDocId === card.id;
              return (
                <div
                  key={card.id}
                  onClick={() => setSelectedDocId(card.id)}
                  className={`p-4 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'card-invoice-active relative border-l-4 border-l-indigo-600'
                      : 'card-invoice hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold font-mono text-indigo-600">
                      {card.invNumber}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${card.statusColor}`}>
                      {card.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                    {card.consignee}
                  </h3>

                  <div className="flex justify-between items-end mt-3 pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">DATE</span>
                      <span className="text-xs font-medium text-slate-600">{card.date}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-slate-900 font-mono tracking-tight">
                        {card.amount}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* COLUMN 3: RIGHT PREVIEW CANVAS & FLOATING WIDGET */}
      <div className="flex-1 bg-white p-6 overflow-y-auto relative flex flex-col justify-between">
        <div className="max-w-4xl mx-auto w-full space-y-6">
          {/* Top Actions */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-2 text-xs">
              <span className="px-3 py-1 bg-slate-100 text-slate-700 font-mono font-bold rounded-md border border-slate-200">
                {activeCard.invNumber}
              </span>
              <span className="px-2.5 py-1 bg-slate-100 text-slate-600 font-extrabold text-[10px] rounded-md tracking-wider">
                {activeCard.status}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  if ((window as any).html2pdf) {
                    const el = document.getElementById('proforma-pdf-canvas') || document.querySelector('.document-canvas');
                    if (el) {
                      const opt = {
                        margin: [4, 4, 4, 4],
                        filename: `${activeCard.invNumber.replace(/[^a-zA-Z0-9]/g, '_')}_${activeCard.consignee}.pdf`,
                        image: { type: 'jpeg', quality: 0.98 },
                        html2canvas: { scale: 2, useCORS: true },
                        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                      };
                      (window as any).html2pdf().set(opt).from(el).save();
                      return;
                    }
                  }
                  window.print();
                }}
                className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-xs flex items-center space-x-1.5"
              >
                <span>📥</span>
                <span>Download PDF</span>
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs"
              >
                Print
              </button>
              <button
                onClick={() => alert(`${isProformaMode ? 'Proforma Invoice' : 'Invoice'} ${activeCard.invNumber} sent!`)}
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30"
              >
                Finalize & Send
              </button>
            </div>
          </div>

          {/* RENDERED PROFORMA / COMMERCIAL INVOICE DOCUMENT PAPER */}
          <div className="document-canvas p-10 space-y-8 bg-white border border-slate-200 rounded-2xl">
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">
                  {isProformaMode ? 'PROFORMA' : 'COMMERCIAL'}<br />INVOICE
                </h1>
              </div>

              <div className="text-right space-y-1 text-xs">
                <div className="text-xl font-black text-slate-900">{activeCard.exporter.split(' ')[0]} Ltd.</div>
                <p className="text-slate-500 max-w-xs text-[11px] leading-tight">
                  128 Global Trade Center<br />
                  Financial District<br />
                  Singapore 049315
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">{isProformaMode ? 'PROFORMA NO' : 'INVOICE NUMBER'}</span>
                <span className="font-mono font-bold text-slate-900">{activeCard.invNumber}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">DATE</span>
                <span className="font-semibold text-slate-800">{activeCard.date}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">TERMS OF SALE</span>
                <span className="font-semibold text-slate-800">FOB Shanghai</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">CURRENCY</span>
                <span className="font-semibold text-slate-800">USD ($)</span>
              </div>
            </div>

            {/* Exporter & Consignee Side-by-Side Cards */}
            <div className="grid grid-cols-2 gap-6 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                <div className="text-slate-500 font-bold uppercase text-[10px]">EXPORTER</div>
                <h4 className="font-bold text-slate-900 text-sm">{activeCard.exporter}</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">{activeCard.exporterAddr}</p>
              </div>

        </div>

        {/* Action Toolbar */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => alert('Batch Printing 12 documents...')}
            className="px-3.5 py-2 bg-white text-slate-700 font-semibold text-xs border border-slate-200 rounded-lg hover:bg-slate-50 transition-all shadow-xs flex items-center space-x-1.5"
          >
            <i className="fi fi-rr-print"></i>
            <span>Batch Export</span>
          </button>
          <button
            onClick={() => alert('Exporting directory to Excel...')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-all shadow-xs flex items-center space-x-1.5"
          >
            <i className="fi fi-rr-file-excel"></i>
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Document Master Directory Table */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Active Document Register</h3>
            <span className="text-xs text-slate-500 font-medium">Showing 1-10 of 124 records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Doc No / Date</th>
                  <th className="py-3 px-4">Consignee & Buyer</th>
                  <th className="py-3 px-4">Port of Discharge</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {isProformaMode ? (
                  [...proformaInvoices].sort((a, b) => b.id.localeCompare(a.id)).map((pi) => (
                    <tr key={pi.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                        {pi.invNumber}
                        <div className="text-[10px] text-slate-400 font-normal">{pi.date}</div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{pi.consignee}</td>
                      <td className="py-3 px-4">{pi.portOfDischarge}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">${pi.totalAmount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                          {pi.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => onSelectPiForPdf(pi)}
                            className="px-2.5 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold rounded text-[11px] transition-colors"
                          >
                            PDF Preview
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  [
                    { id: '1', number: 'INV/2026/0401', consignee: 'Global Trade Partners LLC', port: 'Los Angeles (USA)', amount: 48500, status: 'CONFIRMED' },
                    { id: '2', number: 'INV/2026/0402', consignee: 'Apex Import Corp', port: 'Hamburg Port (Germany)', amount: 32400, status: 'SHIPPED' },
                    { id: '3', number: 'INV/2026/0403', consignee: 'Sunburst Logistics DMCC', port: 'Jebel Ali (UAE)', amount: 64100, status: 'DRAFT' }
                  ].map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">{inv.number}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{inv.consignee}</td>
                      <td className="py-3 px-4">{inv.port}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">${inv.amount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => alert(`Opening Commercial Invoice ${inv.number}`)}
                          className="px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold rounded text-[11px] transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Document Generator Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">Quick Document Actions</h3>
            <div className="space-y-2.5 text-xs">
              <button onClick={() => alert('Initiating Pre-Shipment Document Bundle...')} className="w-full p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-between text-slate-800 font-semibold transition-colors">
                <span>📦 Pre-Shipment Bundle</span>
                <span className="text-slate-400">→</span>
              </button>
              <button onClick={() => alert('Initiating Post-Shipment Document Bundle...')} className="w-full p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-between text-slate-800 font-semibold transition-colors">
                <span>🚢 Post-Shipment Bundle</span>
                <span className="text-slate-400">→</span>
              </button>
              <button onClick={() => alert('Generating Customs Invoice & Certificate of Origin...')} className="w-full p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-between text-slate-800 font-semibold transition-colors">
                <span>📜 Certificate of Origin (COO)</span>
                <span className="text-slate-400">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating CBM Optimizer */}
      <div className="fixed bottom-6 right-8 w-[380px] z-40 smart-tools-widget p-4 shadow-2xl border border-indigo-200">
        <div className="flex items-center justify-between pb-3 border-b border-indigo-200/60">
          <div className="flex items-center space-x-2 text-indigo-950 font-extrabold text-xs">
            <i className="fi fi-rr-box-alt text-indigo-600 text-sm"></i>
            <span>Smart Tools: CBM Optimizer</span>
            </div>
            <button onClick={() => setIsCbmOptimizerOpen(!isCbmOptimizerOpen)} className="text-slate-500 font-bold">
              {isCbmOptimizerOpen ? '▲' : '▼'}
            </button>

          {isCbmOptimizerOpen && (
            <div className="space-y-3 pt-3 text-xs">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">ESTIMATED VOLUME</span>
                  <span className="text-2xl font-black text-slate-900 font-mono">{activeCard.cbm}</span>
                </div>
                <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 font-extrabold text-[10px] rounded-md uppercase">
                  40HC CONTAINER
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${activeCard.fillPercent}%` }}></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CREATE PROFORMA INVOICE MODAL (EXACT FORM FROM USER ATTACHMENT!) */}
      {isCreatePiModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] overflow-y-auto flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Create Proforma Invoice</h3>
              <button
                onClick={() => setIsCreatePiModalOpen(false)}
                className="text-slate-400 hover:text-slate-800 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Form Body (Matching Attachment Layout Exactly!) */}
            <div className="p-6 space-y-5 text-xs text-slate-700">
              {/* Row 1: Quotation No. */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Quotation No.</label>
                <select
                  value={piFormData.quotationNo}
                  onChange={(e) => setPiFormData({ ...piFormData, quotationNo: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">Select Quotation</option>
                  <option value="QT-2025-001">QT-2025-001 - Global Trade Partners</option>
                  <option value="QT-2025-002">QT-2025-002 - EuroCorp NV</option>
                </select>
              </div>

              {/* Row 2: PI No. *, Date *, Company Address * */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    PI No. <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={piFormData.piNo}
                    onChange={(e) => setPiFormData({ ...piFormData, piNo: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={piFormData.date}
                    onChange={(e) => setPiFormData({ ...piFormData, date: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Company Address <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={piFormData.companyAddress}
                    onChange={(e) => setPiFormData({ ...piFormData, companyAddress: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Andhra Pradesh">Andhra pradesh</option>
                    <option value="Gujarat SEZ">Gujarat SEZ</option>
                    <option value="Maharashtra Unit">Maharashtra Unit</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Buyer Order No., Order Date, Consignee *, Consignee Address */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Buyer Order No.</label>
                  <input
                    type="text"
                    value={piFormData.buyerOrderNo}
                    onChange={(e) => setPiFormData({ ...piFormData, buyerOrderNo: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Order Date</label>
                  <input
                    type="date"
                    value={piFormData.orderDate}
                    onChange={(e) => setPiFormData({ ...piFormData, orderDate: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Consignee <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-1">
                    <select
                      value={piFormData.consignee}
                      onChange={(e) => setPiFormData({ ...piFormData, consignee: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="Global Trade Partners LLC">Global Trade Partners LLC</option>
                      <option value="EuroCorp Logistics NV">EuroCorp Logistics NV</option>
                    </select>
                    <button className="px-2.5 py-2 bg-blue-600 text-white rounded-lg font-bold text-xs">+</button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Consignee Address</label>
                  <select
                    value={piFormData.consigneeAddress}
                    onChange={(e) => setPiFormData({ ...piFormData, consigneeAddress: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="789 Logistics Way, Suite 400, Los Angeles, CA 90001">789 Logistics Way, Suite 400, Los Angeles</option>
                    <option value="Hafenstrasse 12, Hamburg">Hafenstrasse 12, Hamburg</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Notify Party / Buyer, Other Notify Party, Country *, Final Destination/Port Name */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Notify Party / Buyer</label>
                  <select
                    value={piFormData.notifyParty}
                    onChange={(e) => setPiFormData({ ...piFormData, notifyParty: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">Select Notify Party/Buyer</option>
                    <option value="FastForward Logistics Inc.">FastForward Logistics Inc.</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Other Notify Party</label>
                  <select
                    value={piFormData.otherNotifyParty}
                    onChange={(e) => setPiFormData({ ...piFormData, otherNotifyParty: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">Select Other Notify Party</option>
                    <option value="Apex Customs Brokerage">Apex Customs Brokerage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={piFormData.country}
                    onChange={(e) => setPiFormData({ ...piFormData, country: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">Select Country</option>
                    <option value="United States">United States</option>
                    <option value="Germany">Germany</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Final Destination/Port Name</label>
                  <div className="flex space-x-1">
                    <select
                      value={piFormData.finalDestinationPort}
                      onChange={(e) => setPiFormData({ ...piFormData, finalDestinationPort: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="">Select Port</option>
                      <option value="Port of Los Angeles">Port of Los Angeles (USLAX)</option>
                    </select>
                    <button className="px-2.5 py-2 bg-blue-600 text-white rounded-lg font-bold text-xs">+</button>
                  </div>
                </div>
              </div>

              {/* Row 5: Country Of Origin Of Goods, Pre Carriage By, Place Of Receipt By Pre Carrier, Vessel/Flight No. */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Country Of Origin Of Goods</label>
                  <select
                    value={piFormData.countryOfOrigin}
                    onChange={(e) => setPiFormData({ ...piFormData, countryOfOrigin: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">Select Country</option>
                    <option value="India">India</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Pre Carriage By</label>
                  <select
                    value={piFormData.preCarriageBy}
                    onChange={(e) => setPiFormData({ ...piFormData, preCarriageBy: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">Select Pre Carriage By</option>
                    <option value="Road Logistics Express">Road Logistics Express</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Place Of Receipt By Pre Carrier</label>
                  <input
                    type="text"
                    value={piFormData.placeOfReceipt}
                    onChange={(e) => setPiFormData({ ...piFormData, placeOfReceipt: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Vessel/Flight No.</label>
                  <input
                    type="text"
                    value={piFormData.vesselFlightNo}
                    onChange={(e) => setPiFormData({ ...piFormData, vesselFlightNo: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 6: Country Of Loading, Place Of Loading, Country Of Discharge, Port Of Discharge */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Country Of Loading</label>
                  <select
                    value={piFormData.countryOfLoading}
                    onChange={(e) => setPiFormData({ ...piFormData, countryOfLoading: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">Select Country</option>
                    <option value="India">India</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Place Of Loading</label>
                  <select
                    value={piFormData.placeOfLoading}
                    onChange={(e) => setPiFormData({ ...piFormData, placeOfLoading: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">Select Port</option>
                    <option value="Nhava Sheva (INNSA)">Nhava Sheva (INNSA)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Country Of Discharge</label>
                  <select
                    value={piFormData.countryOfDischarge}
                    onChange={(e) => setPiFormData({ ...piFormData, countryOfDischarge: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">Select Country</option>
                    <option value="United States">United States</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Port Of Discharge</label>
                  <select
                    value={piFormData.portOfDischarge}
                    onChange={(e) => setPiFormData({ ...piFormData, portOfDischarge: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">Select Port</option>
                    <option value="Port of Los Angeles (USLAX)">Port of Los Angeles (USLAX)</option>
                  </select>
                </div>
              </div>

              {/* Row 7: Sales Broker, Currency *, Conversion Rate, Bank */}
              <div className="grid grid-cols-4 gap-4 items-center">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Sales Broker</label>
                  <div className="flex items-center space-x-4 pt-1">
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input
                        type="radio"
                        name="salesBroker"
                        value="Yes"
                        checked={piFormData.salesBroker === 'Yes'}
                        onChange={() => setPiFormData({ ...piFormData, salesBroker: 'Yes' })}
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input
                        type="radio"
                        name="salesBroker"
                        value="No"
                        checked={piFormData.salesBroker === 'No'}
                        onChange={() => setPiFormData({ ...piFormData, salesBroker: 'No' })}
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Currency <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={piFormData.currency}
                    onChange={(e) => setPiFormData({ ...piFormData, currency: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="USD">USD</option>
                    <option value="INR">INR</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Conversion Rate</label>
                  <input
                    type="text"
                    value={piFormData.conversionRate}
                    onChange={(e) => setPiFormData({ ...piFormData, conversionRate: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Bank</label>
                  <select
                    value={piFormData.bank}
                    onChange={(e) => setPiFormData({ ...piFormData, bank: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">Select Bank</option>
                    <option value="State Bank of India (AD: 0540012)">State Bank of India (AD: 0540012)</option>
                  </select>
                </div>
              </div>

              {/* Row 8: Documents, Shipment Period */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Documents</label>
                  <input
                    type="text"
                    value={piFormData.documents}
                    onChange={(e) => setPiFormData({ ...piFormData, documents: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Shipment Period</label>
                  <input
                    type="text"
                    value={piFormData.shipmentPeriod}
                    onChange={(e) => setPiFormData({ ...piFormData, shipmentPeriod: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions Footer (Matching Image Colors: Green "Save As Draft", Teal "Save", Red "Close") */}
            <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-slate-50 border-t border-slate-200 sticky bottom-0 z-10 rounded-b-2xl">
              <button
                onClick={() => handleCreatePiSave('DRAFT')}
                className="px-5 py-2 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition-all"
              >
                Save As Draft
              </button>
              <button
                onClick={() => handleCreatePiSave('SAVED')}
                className="px-5 py-2 rounded-md bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs shadow-xs transition-all"
              >
                Save
              </button>
              <button
                onClick={() => setIsCreatePiModalOpen(false)}
                className="px-5 py-2 rounded-md bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-xs transition-all"
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
