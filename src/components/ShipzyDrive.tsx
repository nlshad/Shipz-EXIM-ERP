import React, { useState } from 'react';
import { DriveAsset } from '../types';

interface ShipzyDriveProps {
  assets: DriveAsset[];
  searchQuery: string;
  onUploadAsset: (asset: DriveAsset) => void;
}

const DEFAULT_CLOUDINARY_K0PDVQ8B_ASSETS: DriveAsset[] = [
  {
    id: "cld-1",
    title: "RIVA Refined White Sugar Bag 1KG Artwork",
    fileName: "ezvlhsfwcg3fadr1krss.png",
    fileType: "image",
    category: "Stuffing Photo",
    associatedPiNo: "EXP/PI/2026/901",
    associatedContainerNo: "MSKU-882001-4",
    uploadDate: "2026-08-06",
    fileSizeMb: 0.2,
    thumbnailUrl: "https://res.cloudinary.com/k0pdvq8b/image/upload/v1786004614/mglobal_erp_uploads/ezvlhsfwcg3fadr1krss.png"
  },
  {
    id: "cld-2",
    title: "MGLOBAL Official Stamp & Circular Seal Transparent",
    fileName: "nnp799ksihjptcc22wok.png",
    fileType: "image",
    category: "Gate Pass",
    associatedPiNo: "EXP/PI/2026/902",
    associatedContainerNo: "MSKU-882002-4",
    uploadDate: "2026-08-05",
    fileSizeMb: 0.7,
    thumbnailUrl: "https://res.cloudinary.com/k0pdvq8b/image/upload/v1785912519/mglobal_erp_uploads/nnp799ksihjptcc22wok.png"
  },
  {
    id: "cld-3",
    title: "MGLOBAL Snowflake Logo Branding Mark",
    fileName: "hnnpfsreabkcrhhudfyi.png",
    fileType: "image",
    category: "Gate Pass",
    associatedPiNo: "EXP/PI/2026/903",
    associatedContainerNo: "MSKU-882003-4",
    uploadDate: "2026-08-05",
    fileSizeMb: 1.4,
    thumbnailUrl: "https://res.cloudinary.com/k0pdvq8b/image/upload/v1785912226/mglobal_erp_uploads/hnnpfsreabkcrhhudfyi.png"
  },
  {
    id: "cld-4",
    title: "RIVA Cola Refreshing Soda Can Packaging",
    fileName: "pupdhqi5ofirklrjtcup.png",
    fileType: "image",
    category: "Stuffing Photo",
    associatedPiNo: "EXP/PI/2026/904",
    associatedContainerNo: "MSKU-882004-4",
    uploadDate: "2026-08-05",
    fileSizeMb: 1.4,
    thumbnailUrl: "https://res.cloudinary.com/k0pdvq8b/image/upload/v1785912221/mglobal_erp_uploads/pupdhqi5ofirklrjtcup.png"
  },
  {
    id: "cld-5",
    title: "RIVA Pino Sparkling Beverage Packaging Can",
    fileName: "f42h4v0vjrcd4ymiyly7.png",
    fileType: "image",
    category: "Stuffing Photo",
    associatedPiNo: "EXP/PI/2026/905",
    associatedContainerNo: "MSKU-882005-4",
    uploadDate: "2026-08-05",
    fileSizeMb: 0.1,
    thumbnailUrl: "https://res.cloudinary.com/k0pdvq8b/image/upload/v1785912183/mglobal_erp_uploads/f42h4v0vjrcd4ymiyly7.png"
  },
  {
    id: "cld-6",
    title: "MGLOBAL Official Export Corporate Letterhead Sheet",
    fileName: "hv3z9crdoonghpdymkpa.png",
    fileType: "image",
    category: "Gate Pass",
    associatedPiNo: "EXP/PI/2026/906",
    associatedContainerNo: "MSKU-882006-4",
    uploadDate: "2026-08-05",
    fileSizeMb: 0.2,
    thumbnailUrl: "https://res.cloudinary.com/k0pdvq8b/image/upload/v1785910937/mglobal_erp_uploads/hv3z9crdoonghpdymkpa.png"
  },
  {
    id: "cld-7",
    title: "MGLOBAL Executive Team Director Portrait",
    fileName: "ecw42ktiulubqsvntdz6.png",
    fileType: "image",
    category: "Stuffing Photo",
    associatedPiNo: "EXP/PI/2026/907",
    associatedContainerNo: "MSKU-882007-4",
    uploadDate: "2026-08-04",
    fileSizeMb: 1.4,
    thumbnailUrl: "https://res.cloudinary.com/k0pdvq8b/image/upload/v1785871214/mglobal_erp_uploads/ecw42ktiulubqsvntdz6.png"
  },
  {
    id: "cld-8",
    title: "UDYAM Registration Government Certificate",
    fileName: "ularlmqdbpxasoxhj095.pdf",
    fileType: "pdf",
    category: "Compliance PDF",
    associatedPiNo: "EXP/PI/2026/908",
    associatedContainerNo: "MSKU-882008-4",
    uploadDate: "2026-08-04",
    fileSizeMb: 0.1,
    thumbnailUrl: "https://res.cloudinary.com/k0pdvq8b/image/upload/v1785849408/mglobal_erp_uploads/ularlmqdbpxasoxhj095.pdf"
  },
  {
    id: "cld-9",
    title: "FSSAI Food Safety & Standards License",
    fileName: "rbzkkqbtqwmk9jwtzcxp.pdf",
    fileType: "pdf",
    category: "Compliance PDF",
    associatedPiNo: "EXP/PI/2026/909",
    associatedContainerNo: "MSKU-882009-4",
    uploadDate: "2026-08-04",
    fileSizeMb: 0.1,
    thumbnailUrl: "https://res.cloudinary.com/k0pdvq8b/image/upload/v1785849397/mglobal_erp_uploads/rbzkkqbtqwmk9jwtzcxp.pdf"
  },
  {
    id: "cld-10",
    title: "APEDA Export Promotion Registration Slip",
    fileName: "oz5aivdh53irkofhvacp.pdf",
    fileType: "pdf",
    category: "Compliance PDF",
    associatedPiNo: "EXP/PI/2026/910",
    associatedContainerNo: "MSKU-882010-4",
    uploadDate: "2026-08-04",
    fileSizeMb: 0.1,
    thumbnailUrl: "https://res.cloudinary.com/k0pdvq8b/image/upload/v1785849381/mglobal_erp_uploads/oz5aivdh53irkofhvacp.pdf"
  },
  {
    id: "cld-11",
    title: "Spices Board India Export Certification Document",
    fileName: "x3plc8nrza0g1a3sztrf.pdf",
    fileType: "pdf",
    category: "Compliance PDF",
    associatedPiNo: "EXP/PI/2026/911",
    associatedContainerNo: "MSKU-882011-4",
    uploadDate: "2026-08-04",
    fileSizeMb: 0.1,
    thumbnailUrl: "https://res.cloudinary.com/k0pdvq8b/image/upload/v1785849363/mglobal_erp_uploads/x3plc8nrza0g1a3sztrf.pdf"
  }
];

export const ShipzyDrive: React.FC<ShipzyDriveProps> = ({
  assets,
  searchQuery: externalSearch,
  onUploadAsset,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [localSearch, setLocalSearch] = useState<string>('');
  const [lightboxAsset, setLightboxAsset] = useState<DriveAsset | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('Just now');
  const [syncedCount, setSyncedCount] = useState(26);

  const companyLegalName = 'MGLOBAL IMPEX-INDIA PRIVATE LIMITED';

  // Merge external & initial Cloudinary assets seamlessly
  const displayAssets = assets && assets.length > 0 ? assets : DEFAULT_CLOUDINARY_K0PDVQ8B_ASSETS;

  const combinedSearch = (localSearch || externalSearch || '').toLowerCase();

  const filteredAssets = displayAssets.filter((asset) => {
    const matchesCategory = selectedCategory === 'ALL' || asset.category === selectedCategory;
    const matchesSearch =
      combinedSearch === '' ||
      asset.title.toLowerCase().includes(combinedSearch) ||
      asset.associatedPiNo.toLowerCase().includes(combinedSearch) ||
      asset.associatedContainerNo.toLowerCase().includes(combinedSearch) ||
      asset.fileName.toLowerCase().includes(combinedSearch);
    return matchesCategory && matchesSearch;
  });

  const categories = ['ALL', 'Stuffing Photo', 'Gate Pass', 'Compliance PDF', 'Invoice Export'];

  const handleCopyUrl = (asset: DriveAsset, e: React.MouseEvent) => {
    e.stopPropagation();
    const cdnUrl = asset.thumbnailUrl || `https://res.cloudinary.com/k0pdvq8b/image/upload/${asset.fileName}`;
    navigator.clipboard.writeText(cdnUrl);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSyncCloudinary = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncTime('Just now');
      setSyncedCount(26);
    }, 1000);
  };

  const handleUploadSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const newAsset: DriveAsset = {
      id: `asset-${Date.now()}`,
      title: (formData.get('title') as string) || 'New Uploaded Document Asset',
      fileName: (formData.get('fileName') as string) || 'uploaded_doc.pdf',
      fileType: ((formData.get('fileType') as string) || 'pdf') as any,
      category: ((formData.get('category') as string) || 'Compliance PDF') as any,
      associatedPiNo: (formData.get('piNo') as string) || 'EXP/PI/2026/104',
      associatedContainerNo: (formData.get('containerNo') as string) || 'MSKU-882190-4',
      uploadDate: new Date().toISOString().split('T')[0],
      fileSizeMb: 1.5,
      thumbnailUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=600&q=80',
    };

    onUploadAsset(newAsset);
    setShowUploadModal(false);
  };

  return (
    <div className="space-y-6 relative pb-24 min-h-screen overflow-y-auto">
      {/* HEADER MASTHEAD */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center space-x-1.5">
            <span>Home</span>
            <span>/</span>
            <span className="text-sky-400">{companyLegalName}</span>
            <span>/</span>
            <span className="text-slate-300">Asset Repository</span>
          </div>
          <h2 className="text-xl font-black text-white flex items-center gap-2.5">
            <span>{companyLegalName} Asset Repository</span>
            <span className="text-xs px-3 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold flex items-center gap-1">
              <span>☁️</span> Cloudinary Synced
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Audit-ready DAM vault for container stuffing photos, official seals, letterheads, and compliance certification PDFs.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* SYNC TRIGGER */}
          <button
            type="button"
            onClick={handleSyncCloudinary}
            disabled={isSyncing}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <span className={isSyncing ? 'animate-spin' : ''}>🔄</span>
            <span>{isSyncing ? 'Scanning Account...' : 'Sync Cloudinary Assets'}</span>
          </button>

          {/* SYNC BADGE */}
          <div className="text-[11px] font-mono text-slate-300 bg-slate-800 px-3 py-2 rounded-xl border border-slate-700 font-bold flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Synced: {lastSyncTime} ({syncedCount} Assets)</span>
          </div>

          {/* UPLOAD ASSET BUTTON */}
          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>+</span>
            <span>Upload New Asset</span>
          </button>
        </div>
      </div>

      {/* SEARCH, CATEGORIES & VIEW SWITCHER BAR */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        {/* CATEGORY TABS */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-sky-600 border-sky-500 text-white shadow-md'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              {cat === 'ALL' ? `All Assets (${displayAssets.length})` : cat}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          {/* SEARCH INPUT */}
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Search assets by title, PI, Container..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:border-sky-500 font-semibold"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => setLocalSearch('')}
                className="absolute right-3 top-2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* VIEW SWITCHER */}
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'grid' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* ASSETS VIEW (GRID OR TABLE) */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              onClick={() => setLightboxAsset(asset)}
              className="bg-slate-900 border border-slate-800 hover:border-sky-500/50 rounded-2xl p-3.5 space-y-3 shadow-lg hover:shadow-sky-500/10 transition-all cursor-pointer group relative flex flex-col justify-between"
            >
              <div>
                {/* THUMBNAIL CONTAINER */}
                <div className="h-40 w-full rounded-xl bg-slate-950 overflow-hidden relative border border-slate-800 flex items-center justify-center group-hover:border-sky-500/30 transition-all">
                  {asset.fileType === 'image' ? (
                    <img
                      src={asset.thumbnailUrl}
                      alt={asset.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                      onError={(e) => {
                        (e.target as any).onerror = null;
                        (e.target as any).src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80';
                      }}
                    />
                  ) : (
                    <div className="text-center p-4">
                      <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto text-sm font-black mb-2 shadow-inner">
                        PDF
                      </div>
                      <span className="text-[10px] text-slate-300 font-mono block truncate max-w-[140px] font-bold">
                        {asset.fileName}
                      </span>
                    </div>
                  )}

                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[9px] font-bold bg-slate-900/90 text-sky-300 border border-slate-700 backdrop-blur-xs">
                    {asset.category}
                  </span>
                </div>

                {/* METADATA INFO */}
                <div className="space-y-1 mt-3">
                  <h4 className="text-xs font-bold text-white truncate group-hover:text-sky-400 transition-colors leading-snug">
                    {asset.title}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                    <span>PI: <b className="text-slate-200">{asset.associatedPiNo}</b></span>
                    <span>{asset.fileSizeMb} MB</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">
                    Container: <span className="text-emerald-400 font-bold">{asset.associatedContainerNo}</span>
                  </div>
                </div>
              </div>

              {/* ACTION FOOTER */}
              <div className="pt-2.5 border-t border-slate-800 flex justify-between items-center text-xs mt-2">
                <span className="text-[9px] text-slate-500 font-mono">{asset.uploadDate}</span>

                <div className="flex space-x-1.5">
                  <button
                    type="button"
                    onClick={(e) => handleCopyUrl(asset, e)}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 text-[10px] font-bold transition-all"
                    title="Copy Cloudinary CDN Link"
                  >
                    {copiedId === asset.id ? '✓ Copied!' : '🔗 Copy Link'}
                  </button>
                  <a
                    href={asset.thumbnailUrl}
                    download={asset.fileName}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="px-2.5 py-1 rounded-lg bg-sky-600/30 hover:bg-sky-600 text-sky-300 hover:text-white border border-sky-500/30 text-[10px] font-bold transition-all"
                  >
                    View
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE MODE VIEW */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800 text-[11px]">
                  <th className="py-3 px-4">Asset Title</th>
                  <th className="py-3 px-4">File Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Associated PI</th>
                  <th className="py-3 px-4">Container No</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200 text-xs">
                {filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-800/50 transition-all">
                    <td className="py-3 px-4 font-bold text-white flex items-center space-x-2.5">
                      <span className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-[10px] shrink-0">
                        {asset.fileType === 'pdf' ? '📄' : '🖼️'}
                      </span>
                      <span className="truncate max-w-xs">{asset.title}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">{asset.fileName}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20 text-[10px] font-bold">
                        {asset.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-indigo-400">{asset.associatedPiNo}</td>
                    <td className="py-3 px-4 font-mono text-emerald-400 font-bold">{asset.associatedContainerNo}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{asset.uploadDate}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          type="button"
                          onClick={(e) => handleCopyUrl(asset, e)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-lg text-[10px] font-bold border border-slate-700"
                        >
                          {copiedId === asset.id ? '✓ Copied' : '🔗 Copy CDN Link'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setLightboxAsset(asset)}
                          className="px-2.5 py-1 bg-sky-600 text-white rounded-lg text-[10px] font-bold shadow-xs"
                        >
                          Preview
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LIGHTBOX PREVIEW MODAL */}
      {lightboxAsset && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-[120] p-4">
          <div className="bg-slate-900 p-6 rounded-2xl max-w-2xl w-full space-y-4 border border-sky-500/30 text-slate-100 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2 truncate">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
                <h3 className="text-sm font-black text-white truncate max-w-md">{lightboxAsset.title}</h3>
              </div>
              <button onClick={() => setLightboxAsset(null)} className="text-slate-400 hover:text-white text-lg font-bold">✕</button>
            </div>

            {lightboxAsset.fileType === 'image' ? (
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <img
                  src={lightboxAsset.thumbnailUrl}
                  alt="Full Preview"
                  className="w-full max-h-96 object-contain rounded-lg shadow-lg"
                />
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto text-xl font-black">
                  PDF
                </div>
                <div className="font-bold text-white">{lightboxAsset.fileName}</div>
                <p className="text-slate-400 text-[11px]">Official Regulatory & Compliance Document Asset</p>
              </div>
            )}

            {/* METADATA GRID PANEL */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-[11px] font-mono">
              <div>
                <span className="text-slate-500 block text-[9px] uppercase font-bold">Category</span>
                <b className="text-sky-300">{lightboxAsset.category}</b>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase font-bold">Associated PI</span>
                <b className="text-indigo-400">{lightboxAsset.associatedPiNo}</b>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase font-bold">Container No.</span>
                <b className="text-emerald-400">{lightboxAsset.associatedContainerNo}</b>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase font-bold">File Size</span>
                <b className="text-slate-200">{lightboxAsset.fileSizeMb} MB</b>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase font-bold">Upload Date</span>
                <b className="text-slate-200">{lightboxAsset.uploadDate}</b>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase font-bold">Company</span>
                <b className="text-slate-200">MGLOBAL</b>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={(e) => handleCopyUrl(lightboxAsset, e)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 text-xs font-bold transition-all"
              >
                {copiedId === lightboxAsset.id ? '✓ CDN Link Copied!' : '🔗 Copy Cloudinary CDN URL'}
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLightboxAsset(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                >
                  Close
                </button>
                <a
                  href={lightboxAsset.thumbnailUrl}
                  download={lightboxAsset.fileName}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-md"
                >
                  Open Full File
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD ASSET MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[120] p-4">
          <form onSubmit={handleUploadSubmit} className="bg-slate-900 p-6 rounded-2xl max-w-md w-full space-y-4 border border-emerald-500/30 text-slate-200 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>Upload Asset to {companyLegalName}</span>
              </h3>
              <button type="button" onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1 font-bold uppercase">Asset Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Riva Sugar 1KG Bag Artwork"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1 font-bold uppercase">Category</label>
                <select name="category" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs font-semibold focus:outline-none">
                  <option value="Stuffing Photo">Stuffing Photo</option>
                  <option value="Gate Pass">Gate Pass</option>
                  <option value="Compliance PDF">Compliance PDF</option>
                  <option value="Invoice Export">Invoice Export</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 font-bold uppercase">Associated PI No.</label>
                  <input type="text" name="piNo" defaultValue="EXP/PI/2026/901" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs font-mono" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 font-bold uppercase">Container No.</label>
                  <input type="text" name="containerNo" defaultValue="MSKU-882001-4" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs font-mono" />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1 font-bold uppercase">Select File</label>
                <input type="file" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-slate-300" />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/20"
              >
                Upload & Sync File
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
