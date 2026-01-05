import React, { useState } from 'react';
import { Check, Copy, Edit2 } from 'lucide-react';
import type { Cart, Excess } from '../types';
import { COLOR_OPTIONS } from '../constants';

interface StepResultsProps {
  onEdit: () => void;
  carts: Cart[];
  excess: Excess | null;
}

export const StepResults: React.FC<StepResultsProps> = ({ onEdit, carts, excess }) => {
  const [copyStatus, setCopyStatus] = useState(false);

  const handleCopy = async () => {
    let text = `GALLEY MANIFEST\n`;
    text += `-----------------\n`;
    carts.forEach(cart => {
      text += `CART ${cart.id} (${cart.normalAssigned + cart.specialCount})\n`;
      if (cart.specialCount > 0) text += `- Specials: ${cart.specialCount}\n`;
      cart.content.forEach(opt => {
        if (opt.count > 0) text += `- ${opt.name}: ${opt.count}\n`;
      });
      text += `\n`;
    });

    if (excess && excess.total > 0) {
      text += `EXCESS (${excess.total})\n`;
      excess.details.forEach(e => text += `- ${e.name}: ${e.count}\n`);
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(true);
      setTimeout(() => setCopyStatus(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="space-y-6 animate-[zoomIn_0.3s_ease-out]">
      <div className="flex items-center justify-between">
        <button
          onClick={onEdit}
          className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase hover:text-slate-600"
        >
          <Edit2 size={12} /> Edit Inputs
        </button>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase shadow-sm transition-all duration-300 ${
            copyStatus
              ? 'bg-emerald-500 text-white'
              : 'bg-slate-800 text-white hover:bg-slate-900'
          }`}
        >
          {copyStatus ? <Check size={14} /> : <Copy size={14} />}
          {copyStatus ? 'Copied' : 'Copy Manifest'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {carts.map(cart => (
          <div
            key={cart.id}
            className="bg-white rounded-3xl border border-slate-100 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="bg-slate-50/80 px-4 py-3 flex justify-between items-center border-b border-slate-100">
              <span className="font-bold text-[11px] text-slate-500 uppercase tracking-wide">
                Cart {cart.id}
              </span>
              <div className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white border border-slate-100 text-slate-500 shadow-sm">
                Total: {cart.normalAssigned + cart.specialCount}
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col gap-2">
              {cart.specialCount > 0 && (
                <div className="flex justify-between items-center px-2 py-1 bg-rose-50 rounded-lg border border-rose-100 mb-1">
                  <span className="text-[10px] font-bold text-rose-700 uppercase">SPML / Specials</span>
                  <span className="font-bold text-xs text-rose-700">{cart.specialCount}</span>
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
                      <span className="text-[11px] font-bold text-slate-600 uppercase truncate">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-bold text-sm text-slate-800 ml-2">
                      {item.count}
                    </span>
                  </div>
                ) : null
              )}
              {cart.normalAssigned === 0 && cart.specialCount === 0 && (
                 <div className="text-center py-4 text-[10px] text-slate-300 uppercase font-bold">Empty Cart</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {excess && excess.total > 0 && (
        <div className="bg-amber-50/50 rounded-3xl p-5 border border-amber-100 text-center animate-[fadeIn_0.5s_ease-out_0.2s_both]">
          <div className="text-amber-700 font-bold text-[10px] uppercase mb-4 tracking-wider">
            Inventory Excess
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {excess.details.map((e, i) => (
              <span
                key={i}
                className="bg-white px-3 py-1.5 rounded-xl border border-amber-200 font-bold text-[10px] text-amber-800 shadow-sm flex items-center gap-2"
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

      <div className="pt-6 mt-4 border-t border-slate-100 text-center">
        <p className="text-[10px] text-slate-400 font-medium italic">
          If this was helpful, let me know by sending a ThanQ to <span className="font-bold text-slate-500">132634</span>
        </p>
      </div>
    </div>
  );
};