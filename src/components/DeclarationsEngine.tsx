import React, { useState } from 'react';
import { EXIMDocument } from '../types';

export type StageType = 'preShipment' | 'postShipment';

interface DeclarationsEngineProps {
  documents: EXIMDocument[];
  stage?: StageType;
}

export const PRE_SHIPMENT_DOCS = [
  { id: 'drawback', label: 'Drawback Declaration (APPENDIX-III)', category: 'Incentives' },
  { id: 'exportValue', label: 'Export Value Declaration', category: 'Customs' },
  { id: 'vgm', label: 'VGM Declaration (Verified Gross Mass)', category: 'SOLAS' },
  { id: 'shippingInst', label: 'Shipping Instructions (SI)', category: 'Carrier' },
  { id: 'productLabel', label: 'Product Label', category: 'Packaging' },
  { id: 'weighmentSlip', label: 'Weighment Slip / Weight & Quality Cert', category: 'Verification' },
  { id: 'fumigation', label: 'Fumigation Document', category: 'Phytosanitary' },
  { id: 'nonGmo', label: 'OGM / Non-GMO & Non-Radiation Cert', category: 'Agri & Food' },
  { id: 'adcSheet', label: 'Examination Report / ADC Sheet', category: 'Customs' },
  { id: 'nonDg', label: 'Non DG Declaration', category: 'Safety' },
  { id: 'scomet', label: 'SCOMET Declaration', category: 'Compliance' },
];

export const POST_SHIPMENT_DOCS = [
  { id: 'billOfExchange', label: 'Bill of Exchange', category: 'Banking' },
  { id: 'shipmentAdvice', label: 'Shipment Advice', category: 'Dispatch' },
  { id: 'coaHealth', label: 'Health Certificate / COA (Analysis)', category: 'Quality' },
  { id: 'nonEto', label: 'Non-ETO Statement', category: 'Food Safety' },
  { id: 'pesticide', label: 'Pesticide Residue Certificate', category: 'Chemical' },
  { id: 'producerAllergen', label: 'Producer / Allergen Declaration', category: 'Regulatory' },
];

export const DeclarationsEngine: React.FC<DeclarationsEngineProps> = ({ documents, stage = 'preShipment' }) => {
  const isPreShipment = stage === 'preShipment';
  const availableTemplates = isPreShipment ? PRE_SHIPMENT_DOCS : POST_SHIPMENT_DOCS;

  const [searchFilter, setSearchFilter] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState('10');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  // Active Create Modal State
  const [selectedTemplate, setSelectedTemplate] = useState<{ id: string; label: string; category: string } | null>(null);
  const [modalFormData, setModalFormData] = useState({
    invoiceNo: documents[0]?.documentNumber || 'INV/02/25-26',
    shippingBillNo: 'SB-8829104',
    shippingBillDate: '2025-06-20',
  });

  // Mock list of generated documents grouped under Commercial Invoices
  const [invoiceFolders, setInvoiceFolders] = useState([
    {
      id: 'inv-02',
      invoiceNo: 'INV/02/25-26',
      consignee: 'Jony (Canada)',
      date: '06/20/2025 3:56 pm',
      generatedDocs: [
        { name: 'Drawback_Declaration_APPENDIX_III.pdf', date: '06/20/2025 4:10 pm', size: '245 KB' },
        { name: 'VGM_Declaration_SOLAS.pdf', date: '06/20/2025 4:15 pm', size: '180 KB' },
        { name: 'Shipping_Instructions_SI.pdf', date: '06/20/2025 4:20 pm', size: '310 KB' },
      ],
    },
    {
      id: 'inv-01',
      invoiceNo: 'INV/01/25-26',
      consignee: 'BERLIN (Indonesia)',
      date: '06/18/2025 11:20 am',
      generatedDocs: [
        { name: 'Export_Value_Declaration_Rule7.pdf', date: '06/18/2025 11:45 am', size: '210 KB' },
        { name: 'Fumigation_Certificate.pdf', date: '06/18/2025 12:00 pm', size: '195 KB' },
      ],
    },
    {
      id: 'inv-03',
      invoiceNo: 'INV/03/25-26',
      consignee: 'Global Trade Partners LLC',
      date: '06/15/2025 09:30 am',
      generatedDocs: [
        { name: 'Non_DG_Declaration.pdf', date: '06/15/2025 10:00 am', size: '160 KB' },
        { name: 'SCOMET_Declaration.pdf', date: '06/15/2025 10:15 am', size: '175 KB' },
      ],
    },
  ]);

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateDocument = (template: typeof availableTemplates[0]) => {
    setSelectedTemplate(template);
    setIsDropdownOpen(false);
  };

  const handleSaveDocumentModal = (action: 'save' | 'saveNext') => {
    if (!selectedTemplate) return;
    const newDocName = `${selectedTemplate.label.replace(/[^a-[#A-Z0-9]/gi, '_')}.pdf`;
    
    setInvoiceFolders((prev) =>
      prev.map((f) => {
        if (f.invoiceNo === modalFormData.invoiceNo) {
          return {
            ...f,
            generatedDocs: [
              ...f.generatedDocs,
              { name: newDocName, date: new Date().toLocaleString(), size: '225 KB' },
            ],
          };
        }
        return f;
      })
    );

    alert(`Document "${selectedTemplate.label}" compiled & generated for ${modalFormData.invoiceNo}!`);
    if (action === 'save') {
      setSelectedTemplate(null);
    }
  };

  const filteredFolders = invoiceFolders.filter(
    (f) =>
      f.invoiceNo.toLowerCase().includes(searchFilter.toLowerCase()) ||
      f.consignee.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-24">
      {/* HEADER & OPERATIONAL SUMMARY */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <span>{isPreShipment ? 'Pre-Shipment Documents Engine' : 'Post-Shipment Documents Engine'}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold border border-blue-200">
              {availableTemplates.length} Dynamic Templates
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isPreShipment
              ? 'Generate compliance declarations, SOLAS VGM, Fumigation, and Customs documents before dispatch.'
              : 'Generate Bill of Exchange, Shipment Advice, COA, and Health statements after loading.'}
          </p>
        </div>

        {/* CREATE DOCUMENT DROPDOWN BUTTON (ELECTRIC BLUE #3B82F6) */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="px-5 py-2.5 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 flex items-center space-x-2 transition-all"
          >
            <span>Create Document</span>
            <span>▼</span>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-12 w-80 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 z-50 py-2 space-y-1 text-xs max-h-96 overflow-y-auto">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-800">
                Select {isPreShipment ? 'Pre-Shipment' : 'Post-Shipment'} Template:
              </div>
              {availableTemplates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleCreateDocument(t)}
                  className="w-full text-left px-4 py-2 hover:bg-blue-600/30 flex items-center justify-between transition-all"
                >
                  <span className="font-semibold text-slate-100">{t.label}</span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-slate-800 text-blue-400 font-mono font-bold">
                    {t.category}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TOP CONTROL BAR & SHOW ENTRIES */}
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

          <div className="flex items-center space-x-2 text-xs font-bold text-slate-600">
            <span>Search:</span>
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search invoice or buyer..."
              className="bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* DATA GRID TABLE (PRE/POST-SHIPMENT DRIVE LAYOUT) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 font-bold bg-slate-50 text-[11px]">
                <th className="py-3 px-4">Folder / Invoice</th>
                <th className="py-3 px-4">Consignee</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 text-[11px]">
              {filteredFolders.map((f) => {
                const isExpanded = expandedFolders[f.id];
                return (
                  <React.Fragment key={f.id}>
                    <tr className="hover:bg-slate-50/80 transition-all">
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">
                        <button
                          onClick={() => toggleFolder(f.id)}
                          className="flex items-center space-x-2 hover:underline focus:outline-none"
                        >
                          <span className="text-amber-500 font-bold">📁</span>
                          <span>{f.invoiceNo}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ({f.generatedDocs.length} docs)
                          </span>
                        </button>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">{f.consignee}</td>
                      <td className="py-3 px-4 text-slate-600">{f.date}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => alert(`Downloading all ZIP documents for ${f.invoiceNo}...`)}
                            title="Download All Documents ZIP"
                            className="p-1.5 rounded-md bg-teal-50 text-[#0D9488] border border-teal-200 hover:bg-teal-100 font-bold"
                          >
                            <span>📥 Download ZIP</span>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete folder ${f.invoiceNo}?`)) {
                                setInvoiceFolders(invoiceFolders.filter((item) => item.id !== f.id));
                              }
                            }}
                            title="Delete Folder"
                            className="p-1.5 rounded-md bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 font-bold"
                          >
                            <i className="fi fi-rr-trash text-xs"></i>
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* NESTED GENERATED DOCUMENTS LIST */}
                    {isExpanded && (
                      <tr className="bg-slate-50/90 border-b border-slate-200">
                        <td colSpan={4} className="p-4 pl-10 space-y-2">
                          <div className="text-[11px] font-bold text-indigo-900">
                            Generated Documents in {f.invoiceNo}:
                          </div>
                          <div className="space-y-1">
                            {f.generatedDocs.map((doc, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs"
                              >
                                <div className="flex items-center space-x-2">
                                  <span className="text-rose-500 font-bold"><i className="fi fi-rr-document text-xs"></i></span>
                                  <span className="font-mono font-semibold text-slate-800">{doc.name}</span>
                                  <span className="text-[10px] text-slate-400">({doc.size})</span>
                                </div>
                                <div className="flex items-center space-x-3 text-[11px]">
                                  <span className="text-slate-400">{doc.date}</span>
                                  <button
                                    onClick={() => window.print()}
                                    className="text-blue-600 font-bold hover:underline"
                                  >
                                    Print / PDF
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE DOCUMENT MODAL (WITH DYNAMIC VARIABLE INJECTION ENGINE) */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="text-base font-black text-slate-900">{selectedTemplate.label}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">
                  {selectedTemplate.category}
                </span>
              </div>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="text-slate-400 hover:text-slate-800 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs text-slate-700">
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Invoice No. <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={modalFormData.invoiceNo}
                    onChange={(e) => setModalFormData({ ...modalFormData, invoiceNo: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold"
                  >
                    {invoiceFolders.map((f) => (
                      <option key={f.id} value={f.invoiceNo}>
                        {f.invoiceNo} — {f.consignee}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Shipping Bill No.</label>
                    <input
                      type="text"
                      value={modalFormData.shippingBillNo}
                      onChange={(e) => setModalFormData({ ...modalFormData, shippingBillNo: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Shipping Bill Date</label>
                    <input
                      type="date"
                      value={modalFormData.shippingBillDate}
                      onChange={(e) => setModalFormData({ ...modalFormData, shippingBillDate: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                {/* TEMPLATE DYNAMIC VARIABLE INJECTION ENGINE PREVIEW */}
                <div className="p-4 bg-slate-900 text-slate-100 rounded-xl border border-slate-700 space-y-2 font-mono text-[11px]">
                  <div className="text-blue-400 font-bold text-[10px] uppercase">
                    ⚡ Live Variable Injection Tokens:
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <span className="text-slate-400">$invoice_no = </span>
                      <span className="text-emerald-400">{modalFormData.invoiceNo}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">$shipping_bill_no = </span>
                      <span className="text-emerald-400">{modalFormData.shippingBillNo}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">$shipping_bill_date = </span>
                      <span className="text-emerald-400">{modalFormData.shippingBillDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">$document_header = </span>
                      <span className="text-emerald-400">{selectedTemplate.label}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-slate-50 border-t border-slate-200">
              <button
                onClick={() => setSelectedTemplate(null)}
                className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs"
              >
                Close
              </button>
              <button
                onClick={() => handleSaveDocumentModal('save')}
                className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs"
              >
                Save
              </button>
              <button
                onClick={() => handleSaveDocumentModal('saveNext')}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md"
              >
                Save & Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
