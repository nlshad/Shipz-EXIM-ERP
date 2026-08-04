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
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('shipz_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleLogin = (e: React.FormEvent | null, provider = 'email', customUser: any = null) => {
    if (e) e.preventDefault();
    setIsAuthLoading(true);
    setAuthError('');

    setTimeout(() => {
      let userToSave = customUser;

      if (!userToSave) {
        if (provider === 'google') {
          userToSave = {
            name: 'Rajesh Sharma',
            email: 'rajesh.sharma@mglobalindia.com',
            role: 'Export Director & Admin',
            company: 'MGLOBAL IMPEX-INDIA PVT LTD',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            provider: 'google'
          };
        } else {
          const targetEmail = loginEmail.trim() || 'demo.exim@mglobalindia.com';
          userToSave = {
            name: targetEmail.split('@')[0].replace(/[._]/g, ' ').toUpperCase(),
            email: targetEmail,
            role: 'EXIM Operations Lead',
            company: 'MGLOBAL IMPEX-INDIA PVT LTD',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            provider: 'email'
          };
        }
      }

      localStorage.setItem('shipz_auth_user', JSON.stringify(userToSave));
      setCurrentUser(userToSave);
      setIsAuthLoading(false);
    }, 500);
  };

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

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="w-full max-w-4xl bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-2 overflow-hidden z-10">
          <div className="p-8 md:p-10 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg">⚡</div>
                <div>
                  <h1 className="text-xl font-black text-white tracking-tight leading-none">ExportFlow <span className="text-indigo-400">ERP</span></h1>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Enterprise EXIM Platform</p>
                </div>
              </div>
              <div className="space-y-3 pt-4">
                <h2 className="text-2xl font-black tracking-tight text-white leading-tight">Secure Access Gate for Global Trade & Logistics</h2>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">Multi-tenant compliance engine for Export Quotations, Proforma Invoices, Duty Drawback & Customs Automation.</p>
              </div>
              <div className="space-y-2 pt-2">
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300"><span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">✓</span><span>256-Bit SSL Encrypted Enterprise Portal</span></div>
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300"><span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">✓</span><span>Automated DGFT & Customs Audit Logging</span></div>
              </div>
            </div>
            <div className="pt-8 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <div>STATUS: <span className="text-emerald-400 font-bold">● SYSTEM ONLINE</span></div>
              <div>VER: <span className="text-slate-200 font-bold">v2.4.0 PRO</span></div>
            </div>
          </div>
          <div className="p-8 md:p-10 flex flex-col justify-between bg-slate-900 text-white space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-6 border-b border-slate-800 pb-4">Sign In to Workspace</h3>
              <div className="space-y-4">
                <button type="button" onClick={(e) => handleLogin(e, 'google')} disabled={isAuthLoading} className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-3 px-4 rounded-xl shadow-md flex items-center justify-center space-x-3 text-xs">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Sign in with Google Account</span>
                </button>
                <div className="relative flex py-2 items-center"><div className="flex-grow border-t border-slate-800"></div><span className="flex-shrink mx-3 text-[10px] font-bold text-slate-500 uppercase">or email auth</span><div className="flex-grow border-t border-slate-800"></div></div>
                <form onSubmit={(e) => handleLogin(e, 'email')} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Email</label>
                    <input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="name@mglobalindia.com" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Password</label>
                    <input type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••••••••" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white" />
                  </div>
                  <button type="submit" disabled={isAuthLoading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-xs">
                    {isAuthLoading ? 'Verifying...' : 'Authorize & Enter Portal ➔'}
                  </button>
                </form>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-400">
              <span className="font-bold">Quick Demo: </span>
              <button type="button" onClick={() => handleLogin(null, 'google')} className="text-indigo-400 underline font-bold">Sign in as Rajesh Sharma (Director)</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
