import React, { useState } from 'react';
import { Check, Copy, Edit2, Image as ImageIcon } from 'lucide-react';
import type { Cart, Excess } from '../types';
import { COLOR_OPTIONS } from '../constants';
import html2canvas from 'html2canvas';

interface StepResultsProps {
  onEdit: () => void;
  carts: Cart[];
  excess: Excess | null;
  cartNames: Record<number, string>;
  onNameChange: (id: number, val: string) => void;
}

export const StepResults: React.FC<StepResultsProps> = ({ onEdit, carts, excess, cartNames, onNameChange }) => {
  const [copyStatus, setCopyStatus] = useState(false);
  const [saveStatus, setSaveStatus] = useState(false);

  const handleCopy = async () => {
    let text = `GALLEY MANIFEST\n`;
    text += `================\n\n`;
    carts.forEach(cart => {
      const name = cartNames[cart.id] || `CART ${cart.id}`;
      text += `${name.toUpperCase()} (${cart.normalAssigned + cart.specialCount})\n`;
      if (cart.specialCount > 0) text += `[SPML: ${cart.specialCount}] `;

      const items = cart.content
        .filter(opt => opt.count > 0)
        .map(opt => `${opt.count} ${opt.name}`)
        .join(', ');

      text += items + `\n\n`;
    });

    if (excess && excess.total > 0) {
      text += `EXCESS (${excess.total})\n`;
      excess.details.forEach(e => text += `- ${e.count} ${e.name}\n`);
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(true);
      setTimeout(() => setCopyStatus(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleSaveImage = async () => {
    const element = document.getElementById('export-container'); // Target the dedicated export view
    if (!element) return;

    try {
      setSaveStatus(true);
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff', // Force white background
        scale: 2 // High res
      } as any);

      canvas.toBlob(async (blob) => {
        if (!blob) {
          setSaveStatus(false);
          return;
        }

        const filename = `galley-manifest-${new Date().toISOString().slice(0, 10)}.png`;
        const file = new File([blob], filename, { type: 'image/png' });

        // 1. Try Native Share (Best for iOS/Safari)
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'Galley Manifest',
              text: 'Here is the flight distribution plan.'
            });
            setSaveStatus(false); // Share sheet handles the rest
            return;
          } catch (shareErr) {
            console.warn('Share failed or cancelled, trying fallback', shareErr);
          }
        }

        // 2. Fallback: Clipboard + Download
        // Copy to Clipboard (for Notes)
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
        } catch (clipboardErr) {
          console.warn('Clipboard write failed:', clipboardErr);
        }

        // Download Link
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        link.click();

        setTimeout(() => setSaveStatus(false), 2000);
      });

    } catch (err) {
      console.error('Failed to save image', err);
      setSaveStatus(false);
    }
  };

  return (
    <div className="space-y-6 animate-[zoomIn_0.3s_ease-out] bg-white dark:bg-slate-800 p-2 rounded-3xl">

      {/* Hidden Export Container - Rendered off-screen for perfect screenshots */}
      <div
        id="export-container"
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '600px',
          padding: '40px',
          backgroundColor: 'white',
          color: 'black',
          fontFamily: 'sans-serif',
          zIndex: -1
        }}
      >
        <div style={{ borderBottom: '2px solid #000', paddingBottom: '20px', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, textTransform: 'uppercase' }}>Galley Manifest</h1>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>{new Date().toLocaleDateString()}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {carts.map(cart => (
            <div key={cart.id} style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '20px', breakInside: 'avoid' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  {cartNames[cart.id] || `Cart ${cart.id}`}
                </span>
                <span style={{ fontSize: '14px', fontWeight: 'bold', backgroundColor: '#f0f0f0', padding: '4px 8px', borderRadius: '4px' }}>
                  Total: {cart.normalAssigned + cart.specialCount}
                </span>
              </div>

              {cart.specialCount > 0 && (
                <div style={{ marginBottom: '10px', color: '#b91c1c', fontWeight: 'bold', fontSize: '14px' }}>
                  • {cart.specialCount} SPECIAL MEALS (SPML)
                </div>
              )}

              {cart.content.filter(i => i.count > 0).map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', padding: '4px 0' }}>
                  <span>{item.name}</span>
                  <span style={{ fontWeight: 'bold' }}>{item.count}</span>
                </div>
              ))}

              {cart.normalAssigned === 0 && cart.specialCount === 0 && (
                <div style={{ color: '#999', fontStyle: 'italic', fontSize: '14px' }}>Empty Cart</div>
              )}
            </div>
          ))}
        </div>

        {excess && excess.total > 0 && (
          <div style={{ marginTop: '40px', backgroundColor: '#fff7ed', padding: '20px', borderRadius: '12px', border: '1px solid #fed7aa' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', color: '#9a3412', marginBottom: '10px' }}>Inventory Excess</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {excess.details.map((e, i) => (
                <span key={i} style={{ backgroundColor: 'white', padding: '5px 10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', fontWeight: 'bold', color: '#9a3412' }}>
                  {e.count} {e.name.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between no-print mb-4">
        <button
          onClick={onEdit}
          className="flex items-center gap-2 text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase hover:text-slate-600 dark:hover:text-slate-300"
        >
          <Edit2 size={12} /> Edit Inputs
        </button>
        <div className="flex gap-2">
          <button
            onClick={handleSaveImage}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-[10px] uppercase shadow-sm transition-all duration-300 ${saveStatus
              ? 'bg-emerald-500 text-white'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
          >
            {saveStatus ? <Check size={14} /> : <ImageIcon size={14} />}
            {saveStatus ? 'Saved' : 'Save Img'}
          </button>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-[10px] uppercase shadow-sm transition-all duration-300 ${copyStatus
              ? 'bg-emerald-500 text-white'
              : 'bg-slate-800 text-white hover:bg-slate-900 dark:bg-slate-600 dark:hover:bg-slate-500'
              }`}
          >
            {copyStatus ? <Check size={14} /> : <Copy size={14} />}
            {copyStatus ? 'Copied' : 'Copy Results'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {carts.map(cart => (
          <div
            key={cart.id}
            className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="bg-slate-50/80 dark:bg-slate-900/50 px-4 py-3 flex justify-between items-center border-b border-slate-100 dark:border-slate-700">
              <div className="flex-1 min-w-0 mr-2 relative group">
                <span className="absolute -left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300">
                  <Edit2 size={10} />
                </span>
                <input
                  type="text"
                  value={cartNames[cart.id] || `Cart ${cart.id}`}
                  onChange={(e) => onNameChange(cart.id, e.target.value)}
                  className="w-full bg-transparent font-bold text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wide outline-none focus:text-slate-700 dark:focus:text-slate-200 border-b border-transparent focus:border-slate-200 transition-all truncate"
                  onFocus={(e) => e.target.select()}
                />
              </div>
              <div className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 shadow-sm shrink-0">
                Total: {cart.normalAssigned + cart.specialCount}
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