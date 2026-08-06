import React, { useState, useEffect } from 'react';
import { ProductMaster, IncentiveScheme, SalespersonMaster } from '../types';

interface MasterSettingsProps {
  products: ProductMaster[];
  onAddProduct: (product: ProductMaster) => void;
  onUpdateProduct: (product: ProductMaster) => void;
}

const DEFAULT_SALESPERSONS: SalespersonMaster[] = [];

export const MasterSettings: React.FC<MasterSettingsProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
}) => {
  const [activeTab, setActiveTab] = useState<'productMaster' | 'schemes' | 'packaging' | 'salespersons'>('productMaster');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductMaster | null>(null);

  // Salespersons State & LocalStorage Synchronization
  const [salespersons, setSalespersons] = useState<SalespersonMaster[]>(() => {
    try {
      const saved = localStorage.getItem('shipz_master_salespersons_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) { }
    return DEFAULT_SALESPERSONS;
  });

  const [showSalespersonModal, setShowSalespersonModal] = useState(false);
  const [editingSalesperson, setEditingSalesperson] = useState<SalespersonMaster | null>(null);
  const [spForm, setSpForm] = useState({ name: '', phone: '', email: '', status: 'Active' as 'Active' | 'Inactive' });

  useEffect(() => {
    try {
      localStorage.setItem('shipz_master_salespersons_v2', JSON.stringify(salespersons));
      window.dispatchEvent(new Event('shipz_salespersons_updated'));
    } catch (e) { }
  }, [salespersons]);

  const handleOpenAddSalesperson = () => {
    setEditingSalesperson(null);
    setSpForm({ name: '', phone: '', email: '', status: 'Active' });
    setShowSalespersonModal(true);
  };

  const handleOpenEditSalesperson = (sp: SalespersonMaster) => {
    setEditingSalesperson(sp);
    setSpForm({ name: sp.name, phone: sp.phone, email: sp.email, status: sp.status });
    setShowSalespersonModal(true);
  };

  const handleSaveSalesperson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spForm.name.trim()) return;

    if (editingSalesperson) {
      setSalespersons(prev =>
        prev.map(sp =>
          sp.id === editingSalesperson.id
            ? { ...sp, name: spForm.name.trim(), phone: spForm.phone.trim(), email: spForm.email.trim(), status: spForm.status }
            : sp
        )
      );
    } else {
      const newSp: SalespersonMaster = {
        id: `sp-${Date.now()}`,
        name: spForm.name.trim(),
        phone: spForm.phone.trim(),
        email: spForm.email.trim(),
        status: spForm.status
      };
      setSalespersons(prev => [...prev, newSp]);
    }

    setShowSalespersonModal(false);
    setEditingSalesperson(null);
  };

  const handleDeleteSalesperson = (id: string) => {
    if (window.confirm('Are you sure you want to delete this salesperson from Master Data?')) {
      setSalespersons(prev => prev.filter(sp => sp.id !== id));
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const newProd: ProductMaster = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      productName: (formData.get('productName') as string) || 'Organic Export Item',
      hsnCode: (formData.get('hsnCode') as string) || '52051210',
      category: (formData.get('category') as string) || 'Textiles',
      defaultUnit: (formData.get('unit') as string) || 'KG',
      applicableScheme: (formData.get('scheme') as IncentiveScheme) || 'RoDTEP',
      incentiveRatePercent: parseFloat(formData.get('rate') as string) || 3.1,
      maxCapPerKgInr: parseFloat(formData.get('maxCap') as string) || 5.0,
      netWeightKg: parseFloat(formData.get('netWt') as string) || 1.0,
      grossWeightKg: parseFloat(formData.get('grossWt') as string) || 1.05,
      qualitySpecs: (formData.get('qualitySpecs') as string) || 'Standard Export Quality Grade A',
    };

    if (editingProduct) {
      onUpdateProduct(newProd);
    } else {
      onAddProduct(newProd);
    }

    setShowAddProductModal(false);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6 relative pb-12">
      {/* Header Banner */}
      <div className="glass-panel p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <i className="fi fi-rr-settings-sliders text-emerald-400"></i>
            <span>Master Settings & Product Incentive Rules</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Configure Once, Calculate Forever
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Define product HSNs, incentive scheme rules (RoDTEP, DBK, RoSCTL), per-kg max caps, and packaging specs.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingProduct(null);
            setShowAddProductModal(true);
          }}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
        >
          <i className="fi fi-rr-plus text-xs"></i>
          <span>Add Product Master</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 text-xs">
        <button
          onClick={() => setActiveTab('productMaster')}
          className={`pb-2.5 px-4 font-semibold flex items-center ${activeTab === 'productMaster'
              ? 'border-b-2 border-emerald-500 text-emerald-400'
              : 'text-slate-400 hover:text-slate-200'
            }`}
        >
          <i className="fi fi-rr-box text-xs mr-1.5"></i>
          <span>Product Master & HSN Rules ({products.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('schemes')}
          className={`pb-2.5 px-4 font-semibold flex items-center ${activeTab === 'schemes'
              ? 'border-b-2 border-blue-500 text-blue-400'
              : 'text-slate-400 hover:text-slate-200'
            }`}
        >
          <i className="fi fi-rr-percentage text-xs mr-1.5"></i>
          <span>Incentive Schemes Config (RoDTEP / DBK / RoSCTL)</span>
        </button>
        <button
          onClick={() => setActiveTab('packaging')}
          className={`pb-2.5 px-4 font-semibold flex items-center ${activeTab === 'packaging'
              ? 'border-b-2 border-purple-500 text-purple-400'
              : 'text-slate-400 hover:text-slate-200'
            }`}
        >
          <i className="fi fi-rr-boxes text-xs mr-1.5"></i>
          <span>Packaging Materials & Units</span>
        </button>
        <button
          onClick={() => setActiveTab('salespersons')}
          className={`pb-2.5 px-4 font-semibold flex items-center ${activeTab === 'salespersons'
              ? 'border-b-2 border-indigo-500 text-indigo-400'
              : 'text-slate-400 hover:text-slate-200'
            }`}
        >
          <i className="fi fi-rr-user text-xs mr-1.5"></i>
          <span>Salespersons ({salespersons.length})</span>
        </button>
      </div>

      {/* TAB 1: PRODUCT MASTER TABLE */}
      {activeTab === 'productMaster' && (
        <div className="glass-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-slate-900/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Product Image</th>
                  <th className="py-3 px-4">Product Name & Category</th>
                  <th className="py-3 px-4">HSN Code</th>
                  <th className="py-3 px-4 text-right">Net / Gross Wt</th>
                  <th className="py-3 px-4">Quality Specs</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-800/40 transition-all">
                    <td className="py-3.5 px-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-800 border border-white/10 overflow-hidden flex items-center justify-center">
                        {prod.imgUrl ? (
                          <img src={prod.imgUrl} alt={prod.productName} className="w-full h-full object-cover" />
                        ) : (
                          <i className="fi fi-rr-picture text-slate-500"></i>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{prod.productName}</div>
                      <div className="text-[10px] text-slate-400">{prod.category}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">{prod.hsnCode}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                      {prod.netWeightKg}KG / {prod.grossWeightKg}KG
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-400 max-w-xs truncate">
                      {prod.qualitySpecs}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => {
                          setEditingProduct(prod);
                          setShowAddProductModal(true);
                        }}
                        className="px-2.5 py-1 rounded bg-blue-600/30 hover:bg-blue-600 text-blue-300 text-[10px] font-semibold border border-blue-500/30"
                      >
                        Edit Record
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SCHEMES RULES INFO matching PDF Page 5-6 */}
      {activeTab === 'schemes' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-panel p-4 border border-emerald-500/30 space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-emerald-400">RoDTEP Scheme</h3>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">Active Rules</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Remission of Duties and Taxes on Exported Products. Auto-calculates rate based on HSN FOB value with maximum caps per KG.
            </p>
          </div>

          <div className="glass-panel p-4 border border-blue-500/30 space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-blue-400">Duty Drawback (DBK)</h3>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">Active Rules</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Customs & Central Excise Duty rebate on raw materials used in export manufacturing.
            </p>
          </div>

          <div className="glass-panel p-4 border border-purple-500/30 space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-purple-400">RoSCTL Scheme</h3>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">Active Rules</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Rebate of State and Central Taxes and Levies for Textile & Apparel exports up to 4.3%.
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: SALESPERSONS MASTER TABLE */}
      {activeTab === 'salespersons' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900/60 p-4 rounded-xl border border-white/10">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <i className="fi fi-rr-user text-indigo-400"></i>
                <span>Sales Persons & Executive Team Directory</span>
              </h3>
              <p className="text-xs text-slate-400">
                Manage sales executives, contact phone, and email addresses. Used across Quotations, PIs, and Invoices.
              </p>
            </div>
            <button
              onClick={handleOpenAddSalesperson}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-1.5"
            >
              <i className="fi fi-rr-plus text-xs"></i>
              <span>+ Add Salesperson</span>
            </button>
          </div>

          <div className="glass-panel overflow-hidden border border-white/10 rounded-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-slate-900/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3.5 px-4">Salesperson Name</th>
                    <th className="py-3.5 px-4">Phone Number</th>
                    <th className="py-3.5 px-4">Email Address</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200">
                  {salespersons.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                        No salespersons created yet. Click "+ Add Salesperson" above to add team members.
                      </td>
                    </tr>
                  ) : (
                    salespersons.map((sp) => (
                      <tr key={sp.id} className="hover:bg-slate-800/40 transition-all">
                        <td className="py-3.5 px-4 font-bold text-white flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-black text-xs flex items-center justify-center">
                            {sp.name.charAt(0).toUpperCase()}
                          </div>
                          <span>{sp.name}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-300">
                          {sp.phone || <span className="text-slate-500 text-[11px]">- Not Provided -</span>}
                        </td>
                        <td className="py-3.5 px-4 text-indigo-300">
                          {sp.email || <span className="text-slate-500 text-[11px]">- Not Provided -</span>}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${sp.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700 text-slate-400'}`}>
                            {sp.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center space-x-2">
                          <button
                            onClick={() => handleOpenEditSalesperson(sp)}
                            className="px-2.5 py-1 rounded bg-blue-600/30 hover:bg-blue-600 text-blue-300 text-[10px] font-semibold border border-blue-500/30"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteSalesperson(sp.id)}
                            className="px-2.5 py-1 rounded bg-rose-600/30 hover:bg-rose-600 text-rose-300 text-[10px] font-semibold border border-rose-500/30"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <form onSubmit={handleFormSubmit} className="glass-panel p-6 max-w-lg w-full space-y-4 border border-emerald-500/30">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">
                {editingProduct ? 'Edit Product & Incentive Rule' : 'Add New Product Master & HSN Config'}
              </h3>
              <button type="button" onClick={() => setShowAddProductModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Product Name</label>
                <input
                  type="text"
                  name="productName"
                  defaultValue={editingProduct?.productName || ''}
                  required
                  placeholder="e.g. Premium Sortex Cumin Seeds"
                  className="w-full glass-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">HSN Code</label>
                  <input
                    type="text"
                    name="hsnCode"
                    defaultValue={editingProduct?.hsnCode || ''}
                    required
                    placeholder="e.g. 09093110"
                    className="w-full glass-input text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Product Image URL / Cloudinary Asset</label>
                  <input
                    type="text"
                    name="imgUrl"
                    defaultValue={editingProduct?.imgUrl || ''}
                    placeholder="https://res.cloudinary.com/..."
                    className="w-full glass-input text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Net Weight (KG)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="netWt"
                    defaultValue={editingProduct?.netWeightKg || 1.0}
                    className="w-full glass-input text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Gross Weight (KG)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="grossWt"
                    defaultValue={editingProduct?.grossWeightKg || 1.05}
                    className="w-full glass-input text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Quality Specifications & Lot QC Requirements</label>
                <input
                  type="text"
                  name="qualitySpecs"
                  defaultValue={editingProduct?.qualitySpecs || 'Sortex Cleaned 99.5%, Moisture Max 8%'}
                  className="w-full glass-input text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddProductModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20"
              >
                Save Product Master
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add / Edit Salesperson Modal */}
      {showSalespersonModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSaveSalesperson} className="glass-panel p-6 max-w-md w-full space-y-4 border border-indigo-500/30">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <i className="fi fi-rr-user text-indigo-400"></i>
                <span>{editingSalesperson ? 'Edit Salesperson Details' : 'Add New Salesperson'}</span>
              </h3>
              <button type="button" onClick={() => setShowSalespersonModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Salesperson Name <span className="text-rose-400">*</span></label>
                <input
                  type="text"
                  value={spForm.name}
                  onChange={(e) => setSpForm({ ...spForm, name: e.target.value })}
                  required
                  placeholder="e.g. Rajesh Sharma"
                  className="w-full glass-input text-xs font-bold text-white"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={spForm.phone}
                  onChange={(e) => setSpForm({ ...spForm, phone: e.target.value })}
                  placeholder="e.g. +91 98200 12345"
                  className="w-full glass-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={spForm.email}
                  onChange={(e) => setSpForm({ ...spForm, email: e.target.value })}
                  placeholder="e.g. rajesh@mglobal.in"
                  className="w-full glass-input text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Status</label>
                <select
                  value={spForm.status}
                  onChange={(e) => setSpForm({ ...spForm, status: e.target.value as 'Active' | 'Inactive' })}
                  className="w-full glass-input text-xs font-semibold bg-slate-900 text-white border border-white/20 rounded-lg p-2"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowSalespersonModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20"
              >
                {editingSalesperson ? 'Update Salesperson' : 'Save Salesperson'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
