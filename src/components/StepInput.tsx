import React from 'react';
import { ChevronLeft, Edit2 } from 'lucide-react';
import type { MealOption } from '../types';
import { COLOR_OPTIONS } from '../constants';

interface StepInputProps {
  onBack: () => void;
  options: MealOption[];
  setOptions: (opts: MealOption[]) => void;
  cartSpecials: Record<number, number>;
  setCartSpecials: React.Dispatch<React.SetStateAction<Record<number, number>>>;
  cartNames: Record<number, string>;
  setCartNames: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  numCarts: number;
  onCalculate: () => void;
}

export const StepInput: React.FC<StepInputProps> = ({
  onBack,
  options,
  setOptions,
  cartSpecials,
  setCartSpecials,
  cartNames,
  setCartNames,
  numCarts,
  onCalculate
}) => {


  const handleOptionChange = (idx: number, field: keyof MealOption, value: string) => {
    const newOptions = [...options];
    (newOptions[idx] as any)[field] = value;
    setOptions(newOptions);
  };

  const cycleColor = (idx: number) => {
    const newOptions = [...options];
    newOptions[idx].colorIdx = (newOptions[idx].colorIdx + 1) % COLOR_OPTIONS.length;
    setOptions(newOptions);
  };

  const handleSpecialChange = (cartId: number, value: string) => {
    setCartSpecials(prev => ({
      ...prev,
      [cartId]: Math.max(0, parseInt(value) || 0)
    }));
  };

  const handleNameChange = (cartId: number, value: string) => {
    setCartNames(prev => ({
      ...prev,
      [cartId]: value
    }));
  }

  return (
    <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-slate-400 dark:text-slate-500 font-bold text-xs uppercase hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          <ChevronLeft size={18} /> Back
        </button>
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">
          Load Inventory
        </h2>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
          Menu Items
        </h3>
        {options.map((opt, idx) => {
          const color = COLOR_OPTIONS[opt.colorIdx];
          return (
            <div
              key={opt.id}
              className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all duration-200 ${color.bg} ${color.border} shadow-sm`}
            >
              <button
                onClick={() => cycleColor(idx)}
                className="p-3 rounded-xl bg-white/60 hover:bg-white text-xl shadow-sm transition-all active:scale-95"
                title="Change Color"
              >
                {color.label}
              </button>

              <div className="flex-1">
                <input
                  type="text"
                  value={opt.name}
                  onChange={(e) => handleOptionChange(idx, 'name', e.target.value)}
                  className={`w-full bg-transparent font-bold text-base outline-none ${color.text} placeholder:text-slate-400/50`}
                  placeholder="Item Name"
                />
              </div>

              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  value={opt.value}
                  placeholder="0"
                  onChange={(e) => handleOptionChange(idx, 'value', e.target.value)}
                  className="w-20 bg-white/90 p-3 rounded-xl font-bold text-xl text-center outline-none shadow-inner text-slate-800"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-4 pt-6 mt-6 border-t border-dashed border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-center gap-2">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Special Meals (SPML)
          </h3>
          <div className="group relative flex justify-center">
            <div className="bg-slate-200 dark:bg-slate-700 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold text-slate-500 cursor-help">?</div>
            <span className="absolute bottom-6 scale-0 transition-all rounded bg-slate-800 p-2 text-xs text-white group-hover:scale-100 w-40 text-center z-10 pointer-events-none">
              Pre-occupied slots in each cart (e.g. KSML, VGML)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: numCarts }).map((_, i) => {
            const id = i + 1;
            return (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 p-3 rounded-2xl flex justify-between items-center shadow-sm"
              >
                <div className="flex-1 min-w-0 mr-2 relative group">
                  <span className="absolute -left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300">
                    <Edit2 size={10} />
                  </span>
                  <input
                    type="text"
                    value={cartNames[id] || `Cart ${id}`}
                    onChange={(e) => handleNameChange(id, e.target.value)}
                    className="w-full bg-transparent font-bold text-[10px] text-slate-400 uppercase outline-none focus:text-slate-600 dark:focus:text-slate-300 border-b border-transparent focus:border-slate-200 transition-all"
                    onFocus={(e) => e.target.select()}
                  />
                </div>
                <input
                  type="number"
                  inputMode="numeric"
                  value={cartSpecials[id] || ''}
                  onChange={(e) => handleSpecialChange(id, e.target.value)}
                  className="w-14 bg-slate-50 dark:bg-slate-900 rounded-xl text-center font-bold text-lg text-[#800020] dark:text-[#ff4d6d] outline-none py-1"
                  placeholder="0"
                />
              </div>
            )
          })}
        </div>
      </div>

      <button
        onClick={onCalculate}
        className="w-full py-5 mt-4 rounded-2xl font-bold text-base uppercase tracking-wider shadow-lg bg-[#800020] hover:bg-[#600018] text-white hover:shadow-xl hover:shadow-[#800020]/20 transition-all active:scale-[0.98]"
      >
        Calculate Distribution
      </button>
    </div>
  );
};