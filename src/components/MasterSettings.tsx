import React, { useState } from 'react';
import { ProductMaster, IncentiveScheme } from '../types';

interface MasterSettingsProps {
  products: ProductMaster[];
  onAddProduct: (product: ProductMaster) => void;
  onUpdateProduct: (product: ProductMaster) => void;
}

export const MasterSettings: React.FC<MasterSettingsProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
}) => {
  const [activeTab, setActiveTab] = useState<'productMaster' | 'schemes' | 'packaging'>('productMaster');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductMaster | null>(null);

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
          className={`pb-2.5 px-4 font-semibold flex items-center ${
            activeTab === 'productMaster'
              ? 'border-b-2 border-emerald-500 text-emerald-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <i className="fi fi-rr-box text-xs mr-1.5"></i>
          <span>Product Master & HSN Rules ({products.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('schemes')}
          className={`pb-2.5 px-4 font-semibold flex items-center ${
            activeTab === 'schemes'
              ? 'border-b-2 border-blue-500 text-blue-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <i className="fi fi-rr-percentage text-xs mr-1.5"></i>
          <span>Incentive Schemes Config (RoDTEP / DBK / RoSCTL)</span>
        </button>
        <button
          onClick={() => setActiveTab('packaging')}
          className={`pb-2.5 px-4 font-semibold flex items-center ${
            activeTab === 'packaging'
              ? 'border-b-2 border-purple-500 text-purple-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <i className="fi fi-rr-boxes text-xs mr-1.5"></i>
          <span>Packaging Materials & Units</span>
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
    </div>
  );
};
