import React, { useState } from 'react';
import { Sidebar, ActiveEngine } from './components/Sidebar';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { DocumentAutomationEngine } from './components/DocumentAutomationEngine';
import { QuotationsEngine } from './components/QuotationsEngine';
import { ComplianceEngine } from './components/ComplianceEngine';
import { ShipmentExecutionEngine } from './components/ShipmentExecutionEngine';
import { ShipzyDrive } from './components/ShipzyDrive';
import { ExpensesRegister } from './components/ExpensesRegister';
import { DeclarationsEngine } from './components/DeclarationsEngine';
import { MasterSettings } from './components/MasterSettings';

import { Currency, EXIMDocument, IncentiveRecord, ShipmentItem, DriveAsset, ExpenseRecord, ProductMaster } from './types';
import {
  INITIAL_DOCUMENTS,
  INITIAL_INCENTIVES,
  INITIAL_SHIPMENTS,
  INITIAL_DRIVE_ASSETS,
  INITIAL_EXPENSES,
  INITIAL_PRODUCT_MASTER,
} from './mockData';

export const App: React.FC = () => {
  const [activeEngine, setActiveEngine] = useState<ActiveEngine>('quotations');
  const [currentCurrency, setCurrentCurrency] = useState<Currency>('USD');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [documents, setDocuments] = useState<EXIMDocument[]>(INITIAL_DOCUMENTS);
  const [incentives, setIncentives] = useState<IncentiveRecord[]>(INITIAL_INCENTIVES);
  const [shipments, setShipments] = useState<ShipmentItem[]>(INITIAL_SHIPMENTS);
  const [driveAssets, setDriveAssets] = useState<DriveAsset[]>(INITIAL_DRIVE_ASSETS);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(INITIAL_EXPENSES);
  const [products, setProducts] = useState<ProductMaster[]>(INITIAL_PRODUCT_MASTER);

  const handleSaveDocument = (updatedDoc: EXIMDocument) => {
    setDocuments((prev) => {
      const exists = prev.some((d) => d.id === updatedDoc.id);
      if (exists) {
        return prev.map((d) => (d.id === updatedDoc.id ? updatedDoc : d));
      }
      return [updatedDoc, ...prev];
    });
  };

  const handleUpdateIncentives = (updatedList: IncentiveRecord[]) => {
    setIncentives(updatedList);
  };

  const handleUpdateShipment = (updatedShipment: ShipmentItem) => {
    setShipments((prev) => prev.map((s) => (s.id === updatedShipment.id ? updatedShipment : s)));
  };

  const handleUploadAsset = (newAsset: DriveAsset) => {
    setDriveAssets((prev) => [newAsset, ...prev]);
  };

  const handleAddExpense = (newExpense: ExpenseRecord) => {
    setExpenses((prev) => [newExpense, ...prev]);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const handleAddProduct = (newProduct: ProductMaster) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleUpdateProduct = (updatedProd: ProductMaster) => {
    setProducts((prev) => prev.map((p) => (p.id === updatedProd.id ? updatedProd : p)));
  };

  return (
    <div className="flex h-screen bg-[#EEF4FF] overflow-hidden">
      {/* COLUMN 1: Dark Navy Sidebar */}
      <Sidebar activeEngine={activeEngine} onSelectEngine={setActiveEngine} />

      {/* COLUMNS 2 & 3 CONTAINER */}
      <div className="flex-1 h-screen overflow-hidden">
        {activeEngine === 'quotations' && (
          <div className="p-6 h-screen overflow-y-auto">
            <QuotationsEngine />
          </div>
        )}

        {(activeEngine === 'invoices' ||
          activeEngine === 'proforma' ||
          activeEngine === 'blDraft' ||
          activeEngine === 'packingList' ||
          activeEngine === 'purchase') && (
          <DocumentAutomationEngine
            documents={documents}
            currentCurrency={currentCurrency}
            onSaveDocument={handleSaveDocument}
            documentType={activeEngine === 'proforma' ? 'proforma' : 'commercial'}
          />
        )}

        {(activeEngine === 'preShipment' ||
          activeEngine === 'postShipment' ||
          activeEngine === 'coaSettings' ||
          activeEngine === 'labelParameters' ||
          activeEngine === 'checklist') && (
          <div className="p-6 h-screen overflow-y-auto">
            <DeclarationsEngine documents={documents} />
          </div>
        )}

        {activeEngine === 'dashboard' && (
          <div className="p-6 h-screen overflow-y-auto">
            <ExecutiveDashboard
              shipments={shipments}
              currentCurrency={currentCurrency}
              onNavigateEngine={setActiveEngine}
            />
          </div>
        )}

        {(activeEngine === 'ewayBill' || activeEngine === 'eInvoice' || activeEngine === 'payments') && (
          <div className="p-6 h-screen overflow-y-auto">
            <ComplianceEngine
              incentives={incentives}
              currentCurrency={currentCurrency}
              onUpdateIncentives={handleUpdateIncentives}
            />
          </div>
        )}

        {(activeEngine === 'shipmentTracking' || activeEngine === 'production' || activeEngine === 'inventory') && (
          <div className="p-6 h-screen overflow-y-auto">
            <ShipmentExecutionEngine
              shipments={shipments}
              currentCurrency={currentCurrency}
              onUpdateShipment={handleUpdateShipment}
            />
          </div>
        )}

        {activeEngine === 'expenses' && (
          <div className="p-6 h-screen overflow-y-auto">
            <ExpensesRegister
              expenses={expenses}
              currentCurrency={currentCurrency}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
            />
          </div>
        )}

        {activeEngine === 'drive' && (
          <div className="p-6 h-screen overflow-y-auto">
            <ShipzyDrive
              assets={driveAssets}
              searchQuery={searchQuery}
              onUploadAsset={handleUploadAsset}
            />
          </div>
        )}

        {(activeEngine === 'user' || activeEngine === 'reports' || activeEngine === 'master') && (
          <div className="p-6 h-screen overflow-y-auto">
            <MasterSettings
              products={products}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
            />
          </div>
        )}
      </div>
    </div>
  );
};
