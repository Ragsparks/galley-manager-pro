import React, { useState, useRef } from 'react';
import { ArrowLeft, Copy, Edit2, Share2, X } from 'lucide-react';
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
        // Store both name and color index for the dots in summary
        const key = JSON.stringify({ name: item.name, colorIdx: item.colorIdx });
        grandTotals[key] = (grandTotals[key] || 0) + item.count;
      }
    });
  });
  if (excess && excess.total > 0) {
    excess.details.forEach(e => {
      const key = JSON.stringify({ name: e.name, colorIdx: e.colorIdx });
      grandTotals[key] = (grandTotals[key] || 0) + e.count;
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

  const handleDownloadFallback = () => {
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
        handleDownloadFallback();
      }
    } catch (err) {
      console.error('Share failed', err);
      handleDownloadFallback();
    }
  };

  const handleCopyImage = async () => {
    if (!previewImage) return;
    try {
      const blob = await (await fetch(previewImage)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      alert('Image copied to clipboard!');
    } catch (err) {
      console.error('Copy failed', err);
      alert('Could not copy image automatically. Please use long press on the image or the Share button.');
    }
  };

  const summaryItems = Object.entries(grandTotals).map(([key, count]) => {
    const { name, colorIdx } = JSON.parse(key);
    return { name, count, colorIdx };
  });

  return (
    <div className="space-y-6 animate-[zoomIn_0.3s_ease-out] bg-white dark:bg-slate-800 p-2 rounded-3xl pb-24 md:pb-8">

      {/* Modal for Screenshot Preview */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.1s]">
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] max-w-sm w-full p-6 shadow-2xl flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-white">Preview & Share</h3>
              <button onClick={() => setPreviewImage(null)} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-400">
                <X size={20} />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700">
              <img src={previewImage} alt="Preview" className="w-full h-auto object-contain max-h-[50vh]" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleCopyImage}
                className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 rounded-2xl font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                <Copy size={24} className="text-blue-500" />
                <span className="text-xs">Copy Image</span>
              </button>
              <button
                onClick={handleShare}
                className="flex flex-col items-center justify-center gap-2 p-4 bg-[#800020] text-white rounded-2xl font-bold shadow-lg shadow-[#800020]/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Share2 size={24} />
                <span className="text-xs">Share Image</span>
              </button>
            </div>
            <p className="text-[10px] text-center text-slate-400 font-medium px-4">
              Pro Tip: You can also long-press the image to copy or save.
            </p>
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
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#333' }}>{new Date().toLocaleDateString()}</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>Generated via Crew Suite</p>
          </div>
        </div>

        {/* Vertical Layout for Carts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {carts.map(cart => (
            <div key={cart.id} style={{ border: '2px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#fff' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '15px 20px', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                    <span style={{ fontSize: '20px', fontWeight: '800', textTransform: 'uppercase', color: '#0f172a' }}>
                      {cartNames[cart.id] || `Cart ${cart.id}`}
                    </span>
                    {cart.specialCount > 0 && (
                      <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#be123c', backgroundColor: '#fff1f2', padding: '2px 8px', borderRadius: '6px' }}>
                        SPMLs: {cart.specialCount}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#64748b' }}>
                    TOTAL: {cart.normalAssigned + cart.specialCount} ITEMS
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#475569', fontWeight: 'bold', marginTop: '6px', letterSpacing: '0.5px' }}>
                  {cartRows[cart.id] ? `ASSIGNED ROWS: ${cartRows[cart.id]}` : 'NO ROWS DEFINED'}
                </div>
              </div>

              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {cart.content.filter(i => i.count > 0).map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '1px solid #ddd', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {COLOR_OPTIONS[item.colorIdx].label}
                        </div>
                        <span style={{ color: '#0f172a', fontWeight: '500' }}>{item.name}</span>
                      </div>
                      <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '18px' }}>{item.count}</span>
                    </div>
                  ))}
                </div>
                {cart.normalAssigned === 0 && cart.specialCount === 0 && (
                  <div style={{ textAlign: 'center', color: '#cbd5e1', fontStyle: 'italic', padding: '10px', textTransform: 'uppercase', fontSize: '12px', fontWeight: 'bold' }}>Empty Cart</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Summary Section (Now at the bottom) */}
        <div style={{ marginTop: '40px', backgroundColor: '#fcf9f9', borderRadius: '20px', padding: '25px', border: '2px solid #edeff2' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', color: '#800020', marginBottom: '15px', letterSpacing: '1px' }}>Total Fleet Load Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {summaryItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px 12px' }}>
                <span style={{ fontSize: '14px' }}>{COLOR_OPTIONS[item.colorIdx].label}</span>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e293b', flex: 1 }}>{item.name}</span>
                <span style={{ fontSize: '16px', fontWeight: '900', color: '#800020' }}>{item.count}</span>
              </div>
            ))}
          </div>
          {excess && excess.total > 0 && (
            <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px dashed #cbd5e1' }}>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold', color: '#9a3412', textTransform: 'uppercase' }}>Excess Inventory: {excess.total} items remaining</p>
            </div>
          )}
        </div>
      </div>

      {/* Screen Controls */}
      <div className="flex items-center justify-between no-print mb-4 px-2">
        <button
          onClick={onEdit}
          className="flex items-center gap-2 text-slate-400 dark:text-slate-500 font-bold text-xs uppercase hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex gap-2">
          <button
            onClick={handleGeneratePreview}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-xs uppercase shadow-lg shadow-slate-200 dark:shadow-none transition-all duration-300 bg-slate-800 text-white hover:bg-slate-900 active:scale-95 disabled:opacity-50"
          >
            {isGenerating ? <span className="animate-spin text-lg">⏳</span> : <Share2 size={16} />}
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