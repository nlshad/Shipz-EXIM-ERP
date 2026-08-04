import React, { useState } from 'react';
import { ShipmentItem, ShipmentStage, PackagingSpec, Currency } from '../types';

interface ShipmentExecutionEngineProps {
  shipments: ShipmentItem[];
  currentCurrency: Currency;
  onUpdateShipment: (shipment: ShipmentItem) => void;
}

export const ShipmentExecutionEngine: React.FC<ShipmentExecutionEngineProps> = ({
  shipments,
  currentCurrency,
  onUpdateShipment,
}) => {
  const [selectedShipment, setSelectedShipment] = useState<ShipmentItem | null>(null);
  const [activeDrawer, setActiveDrawer] = useState<'details' | 'packaging' | null>(null);
  const [editingPackaging, setEditingPackaging] = useState<PackagingSpec | null>(null);

  const stages: ShipmentStage[] = [
    'Container Booked',
    'CFS Reached',
    'Container Stuffed',
    'In Transit',
    'Delivered',
  ];

  const handleStageChange = (shipment: ShipmentItem, newStage: ShipmentStage) => {
    const updated = { ...shipment, stage: newStage };
    onUpdateShipment(updated);
    if (selectedShipment?.id === shipment.id) {
      setSelectedShipment(updated);
    }
  };

  const handleOpenDrawer = (shipment: ShipmentItem, type: 'details' | 'packaging') => {
    setSelectedShipment(shipment);
    setEditingPackaging({ ...shipment.packagingSpec });
    setActiveDrawer(type);
  };

  const handleSavePackaging = () => {
    if (!selectedShipment || !editingPackaging) return;
    const updated = {
      ...selectedShipment,
      packagingSpec: editingPackaging,
    };
    onUpdateShipment(updated);
    setSelectedShipment(updated);
    setActiveDrawer(null);
  };

  return (
    <div className="space-y-6 relative pb-12">
      {/* Header */}
      <div className="glass-panel p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Shipment Execution & Kanban Tracker
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              5 Milestone Lanes
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time container milestone tracking, container stuffing proof, and slide-over packaging specifications.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Auto-sync with Port Gate Pass & GRN Quality Control</span>
        </div>
      </div>

      {/* Kanban Lanes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto min-h-[550px]">
        {stages.map((stage) => {
          const laneShipments = shipments.filter((s) => s.stage === stage);
          return (
            <div key={stage} className="glass-panel p-3 flex flex-col justify-between border border-white/10 bg-slate-900/40">
              <div>
                {/* Lane Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                    <h3 className="text-xs font-bold text-white tracking-wide">{stage}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                    {laneShipments.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="space-y-3">
                  {laneShipments.map((shipment) => (
                    <div
                      key={shipment.id}
                      className="p-3 rounded-xl bg-slate-800/80 border border-white/10 hover:border-blue-500/40 transition-all shadow-lg space-y-2 group"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold font-mono text-white group-hover:text-blue-400">
                          {shipment.containerNumber}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold">
                          {shipment.buyerName.split(' ')[0]}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-300 space-y-0.5">
                        <div className="flex justify-between text-slate-400 text-[10px]">
                          <span>PI No:</span>
                          <span className="font-mono text-slate-200">{shipment.piNumber}</span>
                        </div>
                        <div className="flex justify-between text-slate-400 text-[10px]">
                          <span>Vessel:</span>
                          <span className="text-slate-200 truncate max-w-[110px]">{shipment.vesselName}</span>
                        </div>
                        <div className="flex justify-between text-slate-400 text-[10px]">
                          <span>Loading Due:</span>
                          <span className="text-amber-400 font-semibold">{shipment.loadingDueDate}</span>
                        </div>
                      </div>

                      {/* Packaging Micro summary */}
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">
                          {shipment.packagingSpec.totalPackages} {shipment.packagingSpec.packageType}
                        </span>
                        <span className="font-mono text-emerald-400 font-bold">
                          {(shipment.packagingSpec.netWeightKg / 1000).toFixed(1)}T
                        </span>
                      </div>

                      {/* Stage Override Selector */}
                      <div className="pt-2 flex items-center justify-between gap-1">
                        <select
                          value={shipment.stage}
                          onChange={(e) => handleStageChange(shipment, e.target.value as ShipmentStage)}
                          className="glass-input text-[10px] py-0.5 px-1 bg-slate-900 text-slate-300 border-white/10"
                        >
                          {stages.map((st) => (
                            <option key={st} value={st}>Move to: {st}</option>
                          ))}
                        </select>

                        <button
                          onClick={() => handleOpenDrawer(shipment, 'details')}
                          className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-[10px]"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                  {laneShipments.length === 0 && (
                    <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-white/10 rounded-xl">
                      No active containers in this stage
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* RIGHT-DOCKED SLIDE-OVER DRAWER FOR SHIPMENT & PACKAGING SPECS */}
      {activeDrawer && selectedShipment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex justify-end">
          <div className="w-full max-w-lg bg-slate-900 border-l border-white/15 h-full flex flex-col justify-between shadow-2xl p-6 overflow-y-auto slide-over-drawer">
            <div className="space-y-6">
              {/* Drawer Title Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    Container #{selectedShipment.containerNumber}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {activeDrawer === 'details' ? 'Milestone Tracking & Port Logs' : 'Packaging Specifications & Weight QC'}
                  </p>
                </div>
                <button
                  onClick={() => setActiveDrawer(null)}
                  className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Drawer Tab Switcher */}
              <div className="flex border-b border-white/10 text-xs">
                <button
                  onClick={() => setActiveDrawer('details')}
                  className={`pb-2 px-4 font-semibold ${
                    activeDrawer === 'details'
                      ? 'border-b-2 border-blue-500 text-blue-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Milestones & Details
                </button>
                <button
                  onClick={() => setActiveDrawer('packaging')}
                  className={`pb-2 px-4 font-semibold ${
                    activeDrawer === 'packaging'
                      ? 'border-b-2 border-emerald-500 text-emerald-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Packaging & GRN Specs
                </button>
              </div>

              {/* TAB 1: MILESTONES & DETAILS */}
              {activeDrawer === 'details' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3 glass-panel p-3">
                    <div><span className="text-slate-400 block">PI Number:</span> <span className="font-bold text-white font-mono">{selectedShipment.piNumber}</span></div>
                    <div><span className="text-slate-400 block">Invoice Number:</span> <span className="font-bold text-white font-mono">{selectedShipment.invoiceNumber}</span></div>
                    <div><span className="text-slate-400 block">Vessel / Voyage:</span> <span className="text-slate-200">{selectedShipment.vesselName} ({selectedShipment.voyageNo})</span></div>
                    <div><span className="text-slate-400 block">Shipping Line:</span> <span className="text-slate-200">{selectedShipment.shippingLine}</span></div>
                    <div><span className="text-slate-400 block">Loading Port:</span> <span className="text-slate-200">{selectedShipment.loadingPort}</span></div>
                    <div><span className="text-slate-400 block">Destination Port:</span> <span className="text-slate-200">{selectedShipment.destinationPort} ({selectedShipment.destinationCountry})</span></div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white mb-2 uppercase tracking-wider">Container Stuffing Proof Photos</h4>
                    {selectedShipment.stuffingPhotos.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {selectedShipment.stuffingPhotos.map((photo, i) => (
                          <img key={i} src={photo} alt="Stuffing proof" className="w-full h-32 object-cover rounded-lg border border-white/10" />
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-slate-400 bg-slate-800/40 rounded-lg border border-dashed border-white/10">
                        No stuffing photo uploaded yet.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: PACKAGING SPECS & GRN */}
              {activeDrawer === 'packaging' && editingPackaging && (
                <div className="space-y-4 text-xs">
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Packaging Material Type</label>
                      <select
                        value={editingPackaging.packageType}
                        onChange={(e) => setEditingPackaging({ ...editingPackaging, packageType: e.target.value as any })}
                        className="w-full glass-input text-xs bg-slate-900"
                      >
                        <option value="PP Bags">PP Bags (25 KG)</option>
                        <option value="Jute Bags">Jute Bags (50 KG)</option>
                        <option value="Corrugated Boxes">Corrugated Boxes</option>
                        <option value="Wooden Crates">Wooden Crates</option>
                        <option value="Drums">Steel Drums</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Total Packages Count</label>
                        <input
                          type="number"
                          value={editingPackaging.totalPackages}
                          onChange={(e) => setEditingPackaging({ ...editingPackaging, totalPackages: parseInt(e.target.value) || 0 })}
                          className="w-full glass-input text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Gross Weight (KG)</label>
                        <input
                          type="number"
                          value={editingPackaging.grossWeightKg}
                          onChange={(e) => setEditingPackaging({ ...editingPackaging, grossWeightKg: parseFloat(e.target.value) || 0 })}
                          className="w-full glass-input text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Net Weight (KG)</label>
                        <input
                          type="number"
                          value={editingPackaging.netWeightKg}
                          onChange={(e) => setEditingPackaging({ ...editingPackaging, netWeightKg: parseFloat(e.target.value) || 0 })}
                          className="w-full glass-input text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Tare Weight (KG)</label>
                        <input
                          type="number"
                          value={editingPackaging.tareWeightKg}
                          onChange={(e) => setEditingPackaging({ ...editingPackaging, tareWeightKg: parseFloat(e.target.value) || 0 })}
                          className="w-full glass-input text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">GRN Reference Number</label>
                        <input
                          type="text"
                          value={editingPackaging.grnNumber}
                          onChange={(e) => setEditingPackaging({ ...editingPackaging, grnNumber: e.target.value })}
                          className="w-full glass-input text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">QC Passed</label>
                        <div className="flex items-center space-x-2 pt-2">
                          <input
                            type="checkbox"
                            checked={editingPackaging.qcPassed}
                            onChange={(e) => setEditingPackaging({ ...editingPackaging, qcPassed: e.target.checked })}
                            className="rounded bg-slate-800 text-emerald-500"
                          />
                          <span className="text-slate-200">Verified Quality Control</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Drawer Footer Actions */}
            <div className="pt-4 border-t border-white/10 flex justify-end space-x-2">
              <button
                onClick={() => setActiveDrawer(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              {activeDrawer === 'packaging' && (
                <button
                  onClick={handleSavePackaging}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20"
                >
                  Save Specification
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
