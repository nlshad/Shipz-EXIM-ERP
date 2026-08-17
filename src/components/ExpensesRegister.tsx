import React, { useState } from 'react';
import { ExpenseRecord, Currency } from '../types';

interface ExpensesRegisterProps {
  expenses: ExpenseRecord[];
  currentCurrency: Currency;
  onAddExpense: (expense: ExpenseRecord) => void;
  onDeleteExpense: (id: string) => void;
}

export const ExpensesRegister: React.FC<ExpensesRegisterProps> = ({
  expenses,
  currentCurrency,
  onAddExpense,
  onDeleteExpense,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fxRate = currentCurrency === 'INR' ? 1.0 : currentCurrency === 'EUR' ? 0.011 : 0.012;
  const currSymbol = currentCurrency === 'INR' ? '₹' : currentCurrency === 'EUR' ? '€' : '$';

  const formatMoney = (inrVal: number) => {
    const val = inrVal * fxRate;
    if (currentCurrency === 'INR') {
      return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${currSymbol}${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const filteredExpenses = expenses.filter(
    (e) =>
      e.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.piNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.consignee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.vendorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalExpenseInr = filteredExpenses.reduce((acc, curr) => acc + curr.expenseAmountInr, 0);

  const handleDownloadExcel = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Invoice No,PI No,Consignee,Category,Vendor,Amount (INR),Date\n' +
      filteredExpenses
        .map((e) => `"${e.invoiceNo}","${e.piNo}","${e.consignee}","${e.expenseCategory}","${e.vendorName}",${e.expenseAmountInr},"${e.date}"`)
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Expenses_Register_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const newExpense: ExpenseRecord = {
      id: `exp-${Date.now()}`,
      invoiceNo: (formData.get('invoiceNo') as string) || 'INV/10/26-27',
      piNo: (formData.get('piNo') as string) || 'PI/10/26-27',
      consignee: (formData.get('consignee') as string) || 'Edoko Importers',
      expenseCategory: (formData.get('category') as any) || 'Freight',
      expenseAmountInr: parseFloat(formData.get('amount') as string) || 5000,
      vendorName: (formData.get('vendor') as string) || 'RKS Global Export Logistics',
      date: new Date().toISOString().split('T')[0],
    };

    onAddExpense(newExpense);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 relative pb-12">
      {/* Header Banner */}
      <div className="glass-panel p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Expenses Register
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Contract Costing & Freight
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Track CHA clearance, freight fees, fumigation costs, and CFS handling expenses per export sales contract.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleDownloadExcel}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/10 flex items-center gap-1.5"
          >
            <i className="fi fi-rr-file-excel text-emerald-400 text-xs"></i>
            <span>Download Excel</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
          >
            <i className="fi fi-rr-plus text-xs"></i>
            <span>Add New Expense</span>
          </button>
        </div>
      </div>

      {/* Summary KPI & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass-panel p-4">
        <div className="flex items-center space-x-6 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Expenses Recorded</span>
            <span className="text-xl font-extrabold text-white font-mono">{formatMoney(totalExpenseInr)}</span>
          </div>
          <div className="border-l border-white/10 pl-6">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Entries</span>
            <span className="text-xl font-extrabold text-emerald-400 font-mono">{filteredExpenses.length} Records</span>
          </div>
        </div>

        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="Search by Invoice, PI, or Consignee..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full glass-input text-xs"
          />
        </div>
      </div>

      {/* Expenses Table matching official screenshot */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-slate-900/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Invoice No.</th>
                <th className="py-3 px-4">PI No.</th>
                <th className="py-3 px-4">Consignee</th>
                <th className="py-3 px-4">Category & Vendor</th>
                <th className="py-3 px-4 text-right">Expense Amount ({currSymbol})</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-800/40 transition-all">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-400 hover:underline cursor-pointer">
                    {exp.invoiceNo}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">{exp.piNo}</td>
                  <td className="py-3.5 px-4 font-medium text-white">{exp.consignee}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-white/10 mr-2">
                      {exp.expenseCategory}
                    </span>
                    <span className="text-[11px] text-slate-400">{exp.vendorName}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-extrabold text-xs border border-emerald-500/30">
                      {formatMoney(exp.expenseAmountInr)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center space-x-2">
                    <button
                      onClick={() => alert(`Edit expense ${exp.invoiceNo}`)}
                      className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-blue-400"
                    >
                      <i className="fi fi-rr-edit text-xs"></i>
                    </button>
                    <button
                      onClick={() => onDeleteExpense(exp.id)}
                      className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-red-400"
                    >
                      <i className="fi fi-rr-trash text-xs"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <form onSubmit={handleFormSubmit} className="glass-panel p-6 max-w-md w-full space-y-4 border border-emerald-500/30">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">Record New Operational Expense</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Invoice No.</label>
                  <input type="text" name="invoiceNo" defaultValue="INV/10/26-27" className="w-full glass-input text-xs font-mono" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">PI No.</label>
                  <input type="text" name="piNo" defaultValue="PI/10/26-27" className="w-full glass-input text-xs font-mono" />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Consignee Name</label>
                <input type="text" name="consignee" defaultValue="Edoko Importers" className="w-full glass-input text-xs" />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Expense Category</label>
                <select name="category" className="w-full glass-input text-xs bg-slate-900">
                  <option value="Freight">Ocean / Air Freight</option>
                  <option value="CHA Clearance">CHA Customs Clearance</option>
                  <option value="Fumigation">Fumigation & Pest Treatment</option>
                  <option value="CFS Handling">CFS Terminal Handling</option>
                  <option value="Insurance">Marine Insurance</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Vendor Name</label>
                  <input type="text" name="vendor" defaultValue="RKS Global Export Logistics" className="w-full glass-input text-xs" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Amount (INR)</label>
                  <input type="number" name="amount" defaultValue="12500" className="w-full glass-input text-xs font-mono" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20"
              >
                Save Expense
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
