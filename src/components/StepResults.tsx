import React, { useState, useRef } from 'react';
import { Edit2, Share2, X, Download } from 'lucide-react';
import type { Cart, Excess } from '../types';
import { COLOR_OPTIONS } from '../constants';
import html2canvas from 'html2canvas';

interface StepResultsProps {
  onEdit: () => void;
  carts: Cart[];
  excess: Excess | null;
  cartNames: Record<number, string>;
  onNameChange: (id: number, val: string) => void;
  cartRows: Record<number, string>;
  onRowChange: (id: number, val: string) => void;
}

export const StepResults: React.FC<StepResultsProps> = ({
  onEdit, carts, excess, cartNames, onNameChange, cartRows, onRowChange
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Calculate Grand Totals for Summary (Carts + Excess)
  const grandTotals: Record<string, number> = {};
  carts.forEach(c => {
    c.content.forEach(item => {
      if (item.count > 0) {
        grandTotals[item.name] = (grandTotals[item.name] || 0) + item.count;
      }
    });
  });
  if (excess && excess.total > 0) {
    excess.details.forEach(e => {
      grandTotals[e.name] = (grandTotals[e.name] || 0) + e.count;
    });
  }

  const handleGeneratePreview = async () => {
    if (!exportRef.current || isGenerating) return;

    try {
      setIsGenerating(true);
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(exportRef.current, {
        // @ts-ignore
        backgroundColor: '#ffffff',
        scale: 2,
      });

      const imgData = canvas.toDataURL('image/png');
      setPreviewImage(imgData);
    } catch (err) {
      console.error('Screenshot failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!previewImage) return;
    const filename = `GalleyPro-${new Date().toISOString().slice(0, 10)}.png`;
    const link = document.createElement('a');
    link.download = filename;
    link.href = previewImage;
    link.click();
  };

  const handleShare = async () => {
    if (!previewImage) return;

    try {
      const blob = await (await fetch(previewImage)).blob();
      const file = new File([blob], 'galley-distribution.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Galley Manager Pro',
          text: 'Flight Meal Distribution Plan'
        });
      } else {
        alert('Share not supported on this device. Please use Save or Copy.');
      }
    } catch (err) {
      console.error('Share failed', err);
    }
  };

  const summaryItems = Object.entries(grandTotals).map(([name, count]) => ({ name, count }));

  return (
    <div className="space-y-6 animate-[zoomIn_0.3s_ease-out] bg-white dark:bg-slate-800 p-2 rounded-3xl pb-24 md:pb-8">

      {/* Modal for Screenshot Preview */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s]">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-sm w-full p-4 shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-white">Export Preview</h3>
              <button onClick={() => setPreviewImage(null)} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
              <img src={previewImage} alt="Preview" className="w-full h-auto object-contain" />
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-3 p-4 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Share2 size={24} />
                <span>Share or Save Image</span>
              </button>

              <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 font-medium px-4">
                Use the share sheet to Copy, Save to Gallery, or send via WhatsApp/Telegram.
              </p>

              {!navigator.share && (
                <button
                  onClick={handleDownload}
                  className="w-full mt-2 flex items-center justify-center gap-2 p-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs"
                >
                  <Download size={16} />
                  Download Manually
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hidden Export Container */}
      <div
        ref={exportRef}
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 0,
          width: '600px',
          padding: '40px',
          backgroundColor: 'white',
          color: '#333',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '3px solid #800020', paddingBottom: '20px', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '800', margin: 0, textTransform: 'uppercase', color: '#800020', lineHeight: 1 }}>Galley Manager Pro</h1>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#666', letterSpacing: '2px', textTransform: 'uppercase' }}>Professional Manifest</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#333' }}>{new Date().toLocaleDateString()}</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>Generated via GalleyPro</p>
          </div>
        </div>

        {/* Summary Section */}
        <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '15px 20px', marginBottom: '30px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#475569', marginBottom: '10px' }}>Total Load Summary (Inc. Excess)</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {summaryItems.map((item, i) => (
              <span key={i} style={{ backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '4px 10px', fontSize: '13px', fontWeight: 'bold', color: '#334155' }}>
                {item.count} {item.name}
              </span>
            ))}
          </div>
        </div>

        {/* Vertical Layout for Carts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {carts.map(cart => (
            <div key={cart.id} style={{ border: '2px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#fff' }}>
              <div style={{ backgroundColor: '#f1f5f9', padding: '12px 15px', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '18px', fontWeight: '800', textTransform: 'uppercase', color: '#0f172a' }}>
                      {cartNames[cart.id] || `Cart ${cart.id}`}
                    </span>
                    {cart.specialCount > 0 && (
                      <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#be123c' }}>
                        (SPMLs: {cart.specialCount})
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', backgroundColor: '#fff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                    Total Items: {cart.normalAssigned + cart.specialCount}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', marginTop: '4px' }}>
                  {cartRows[cart.id] ? `ROWS: ${cartRows[cart.id]}` : 'NO ROW ASSIGNED'}
                </div>
              </div>

              <div style={{ padding: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {cart.content.filter(i => i.count > 0).map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '15px', borderBottom: '1px dotted #e2e8f0', paddingBottom: '4px' }}>
                      <span style={{ color: '#334155' }}>{item.name}</span>
                      <span style={{ fontWeight: '800', color: '#0f172a' }}>{item.count}</span>
                    </div>
                  ))}
                </div>
                {cart.normalAssigned === 0 && cart.specialCount === 0 && (
                  <div style={{ textAlign: 'center', color: '#cbd5e1', fontStyle: 'italic', padding: '10px' }}>Empty</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Screen Controls */}
      <div className="flex items-center justify-between no-print mb-4">
        <button
          onClick={onEdit}
          className="flex items-center gap-2 text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase hover:text-slate-600 dark:hover:text-slate-300"
        >
          <Edit2 size={12} /> Edit Inputs
        </button>
        <div className="flex gap-2">
          <button
            onClick={handleGeneratePreview}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-[10px] uppercase shadow-sm transition-all duration-300 bg-slate-800 text-white hover:bg-slate-900 dark:bg-slate-600 dark:hover:bg-slate-500"
          >
            {isGenerating ? <span className="animate-spin">⏳</span> : <Share2 size={14} />}
            Screenshot / Share
          </button>
        </div>
      </div>

      {/* On-Screen Result Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {carts.map(cart => (
          <div
            key={cart.id}
            className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow relative"
          >
            <div className="bg-slate-50/80 dark:bg-slate-900/50 px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex justify-between items-center mb-2">
                <div className="flex-1 min-w-0 mr-2 relative group">
                  <span className="absolute -left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300">
                    <Edit2 size={10} />
                  </span>
                  <input
                    type="text"
                    placeholder={`CART ${cart.id}`}
                    value={cartNames[cart.id] || ''}
                    onChange={(e) => onNameChange(cart.id, e.target.value)}
                    className="w-full bg-transparent font-bold text-xs text-slate-700 dark:text-slate-200 uppercase tracking-wide outline-none border-b border-transparent focus:border-slate-300 dark:focus:border-slate-600 placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all"
                  />
                </div>
                <div className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 shadow-sm shrink-0">
                  Total: {cart.normalAssigned + cart.specialCount}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Rows:</span>
                <input
                  type="text"
                  placeholder="e.g. 1-10"
                  value={cartRows[cart.id] || ''}
                  onChange={(e) => onRowChange(cart.id, e.target.value)}
                  className="flex-1 bg-white dark:bg-slate-800/50 rounded-md border border-slate-100 dark:border-slate-700/50 px-2 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 outline-none focus:border-slate-300 dark:focus:border-slate-500 transition-all"
                />
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col gap-2">
              {cart.specialCount > 0 && (
                <div className="flex justify-between items-center px-2 py-1 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-100 dark:border-rose-900/30 mb-1">
                  <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase">SPML / Specials</span>
                  <span className="font-bold text-xs text-rose-700 dark:text-rose-400">{cart.specialCount}</span>
                </div>
              )}
              {cart.content.map((item, i) =>
                item.count > 0 ? (
                  <div
                    key={i}
                    className="flex justify-between items-center px-2 py-1"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="text-sm shrink-0 drop-shadow-sm grayscale-[0.3]">
                        {COLOR_OPTIONS[item.colorIdx].label}
                      </span>
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase truncate">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200 ml-2">
                      {item.count}
                    </span>
                  </div>
                ) : null
              )}
              {cart.normalAssigned === 0 && cart.specialCount === 0 && (
                <div className="text-center py-4 text-[10px] text-slate-300 dark:text-slate-600 uppercase font-bold">Empty Cart</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {excess && excess.total > 0 && (
        <div className="bg-amber-50/50 dark:bg-amber-900/10 rounded-3xl p-5 border border-amber-100 dark:border-amber-900/30 text-center">
          <div className="text-amber-700 dark:text-amber-500 font-bold text-[10px] uppercase mb-4 tracking-wider">
            Inventory Excess
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {excess.details.map((e, i) => (
              <span
                key={i}
                className="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-900/50 font-bold text-[10px] text-amber-800 dark:text-amber-500 shadow-sm flex items-center gap-2"
              >
                <span>{COLOR_OPTIONS[e.colorIdx].label}</span>
                <span>
                  {e.count} {e.name.toUpperCase()}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};