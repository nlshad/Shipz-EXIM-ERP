import React, { useState } from 'react';
import { DriveAsset } from '../types';

interface ShipzyDriveProps {
  assets: DriveAsset[];
  searchQuery: string;
  onUploadAsset: (asset: DriveAsset) => void;
}

export const ShipzyDrive: React.FC<ShipzyDriveProps> = ({
  assets,
  searchQuery,
  onUploadAsset,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [lightboxAsset, setLightboxAsset] = useState<DriveAsset | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const filteredAssets = assets.filter((asset) => {
    const matchesCategory = selectedCategory === 'ALL' || asset.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.associatedPiNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.associatedContainerNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['ALL', 'Stuffing Photo', 'Gate Pass', 'Compliance PDF', 'Invoice Export'];

  const handleUploadSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const newAsset: DriveAsset = {
      id: `asset-${Date.now()}`,
      title: (formData.get('title') as string) || 'New Uploaded Document Asset',
      fileName: (formData.get('fileName') as string) || 'uploaded_doc.pdf',
      fileType: (formData.get('fileType') as any) || 'pdf',
      category: (formData.get('category') as any) || 'Compliance PDF',
      associatedPiNo: (formData.get('piNo') as string) || 'EXP/PI/2026/104',
      associatedContainerNo: (formData.get('containerNo') as string) || 'MSKU-882190-4',
      uploadDate: new Date().toISOString().split('T')[0],
      fileSizeMb: 2.1,
      thumbnailUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=600&q=80',
    };

    onUploadAsset(newAsset);
    setShowUploadModal(false);
  };

  const companyLegalName = 'MGLOBAL IMPEX-INDIA PRIVATE LIMITED';
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('2 mins ago');

  const handleSyncCloudinary = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncTime('Just now');
    }, 1000);
  };

  return (
    <div className="space-y-6 relative pb-12">
      {/* Header */}
      <div className="glass-panel p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider mb-0.5">
            Home / {companyLegalName} / All Assets
          </div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            {companyLegalName} Asset Repository
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              ☁️ Cloudinary Synced
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Audit-ready vault for container stuffing photos, gate passes, and compliance documentation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncCloudinary}
            disabled={isSyncing}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-1.5"
          >
            <span className={isSyncing ? 'animate-spin' : ''}>🔄</span>
            <span>{isSyncing ? 'Scanning Bucket...' : 'Sync Cloudinary Assets'}</span>
          </button>

          <span className="text-[11px] font-mono text-slate-400 bg-slate-900/60 px-3 py-2 rounded-lg border border-white/10">
            Synced: {lastSyncTime} ({filteredAssets.length} Assets)
          </span>

          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>+ Upload Asset</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedCategory === cat
                ? 'bg-blue-600/30 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                : 'bg-slate-800/40 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            {cat === 'ALL' ? 'All Assets' : cat}
          </button>
        ))}
      </div>

      {/* Asset Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className="glass-panel p-3 space-y-3 glass-card-hover border border-white/10 group relative"
          >
            {/* Thumbnail Preview Area */}
            <div className="h-36 w-full rounded-lg bg-slate-900 overflow-hidden relative border border-white/5 flex items-center justify-center">
              {asset.fileType === 'image' ? (
                <img
                  src={asset.thumbnailUrl}
                  alt={asset.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all"
                />
              ) : (
                <div className="text-center p-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto text-lg font-bold mb-2">
                    {asset.fileType === 'pdf' ? 'PDF' : 'XLS'}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block truncate max-w-[140px]">{asset.fileName}</span>
                </div>
              )}

              <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[9px] font-bold bg-black/60 text-white backdrop-blur-xs">
                {asset.category}
              </span>
            </div>

            {/* Title & Metadata */}
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                {asset.title}
              </h4>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>PI: {asset.associatedPiNo}</span>
                <span>{asset.fileSizeMb} MB</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono truncate">
                Container: <span className="text-emerald-400 font-semibold">{asset.associatedContainerNo}</span>
              </div>
            </div>

            {/* Quick Action Overlay Buttons */}
            <div className="pt-2 border-t border-white/5 flex justify-between items-center text-xs">
              <span className="text-[9px] text-slate-400">{asset.uploadDate}</span>

              <div className="flex space-x-1">
                <button
                  onClick={() => setLightboxAsset(asset)}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold"
                >
                  Preview
                </button>
                <a
                  href={asset.thumbnailUrl}
                  download={asset.fileName}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2 py-1 rounded bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white text-[10px] font-semibold"
                >
                  Download
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Preview Modal */}
      {lightboxAsset && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glass-panel p-6 max-w-xl w-full space-y-4 border border-blue-500/30 text-center">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white truncate max-w-md">{lightboxAsset.title}</h3>
              <button onClick={() => setLightboxAsset(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {lightboxAsset.fileType === 'image' ? (
              <img src={lightboxAsset.thumbnailUrl} alt="Preview" className="w-full max-h-80 object-contain rounded-lg border border-white/10" />
            ) : (
              <div className="p-12 text-slate-300 font-mono text-xs bg-slate-900 rounded-lg border border-white/10 space-y-2">
                <div className="text-3xl"><i className="fi fi-rr-document text-indigo-400"></i></div>
                <div>Document File: {lightboxAsset.fileName}</div>
                <div className="text-slate-400">Associated Container: {lightboxAsset.associatedContainerNo}</div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setLightboxAsset(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
              >
                Close
              </button>
              <a
                href={lightboxAsset.thumbnailUrl}
                download={lightboxAsset.fileName}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold text-xs"
              >
                Download Full File
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Upload Asset Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <form onSubmit={handleUploadSubmit} className="glass-panel p-6 max-w-md w-full space-y-4 border border-emerald-500/30">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">Upload New Asset to Shipzy Drive</h3>
              <button type="button" onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Asset Title</label>
                <input type="text" name="title" required placeholder="e.g. CFS Gate Pass Photo" className="w-full glass-input text-xs" />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Category</label>
                <select name="category" className="w-full glass-input text-xs bg-slate-900">
                  <option value="Stuffing Photo">Stuffing Photo</option>
                  <option value="Gate Pass">Gate Pass</option>
                  <option value="Compliance PDF">Compliance PDF</option>
                  <option value="Invoice Export">Invoice Export</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Associated PI No.</label>
                  <input type="text" name="piNo" defaultValue="EXP/PI/2026/104" className="w-full glass-input text-xs font-mono" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Container No.</label>
                  <input type="text" name="containerNo" defaultValue="MSKU-882190-4" className="w-full glass-input text-xs font-mono" />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Select File</label>
                <input type="file" className="w-full glass-input text-xs" />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20"
              >
                Upload File
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
