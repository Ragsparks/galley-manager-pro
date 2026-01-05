import React from 'react';
import { ChevronLeft, AlertCircle } from 'lucide-react';
import type { InputMode, MealOption } from '../types';
import { COLOR_OPTIONS } from '../constants';

interface StepInputProps {
  onBack: () => void;
  inputMode: InputMode;
  setInputMode: (m: InputMode) => void;
  totalLoad: string;
  setTotalLoad: (val: string) => void;
  options: MealOption[];
  setOptions: (opts: MealOption[]) => void;
  cartSpecials: Record<number, number>;
  setCartSpecials: React.Dispatch<React.SetStateAction<Record<number, number>>>;
  numCarts: number;
  onCalculate: () => void;
}

export const StepInput: React.FC<StepInputProps> = ({
  onBack,
  inputMode,
  setInputMode,
  totalLoad,
  setTotalLoad,
  options,
  setOptions,
  cartSpecials,
  setCartSpecials,
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

  // Validation
  const totalPercentage = options.reduce((acc, opt) => acc + (parseFloat(opt.value) || 0), 0);
  const isPercentageMode = inputMode === 'percentage';
  const isOver100 = isPercentageMode && totalPercentage > 100;

  return (
    <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack} 
          className="flex items-center gap-1 text-slate-400 font-bold text-[10px] uppercase hover:text-slate-600 transition-colors"
        >
          <ChevronLeft size={16} /> Back
        </button>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setInputMode('quantities')}
            className={`px-4 py-2 rounded-lg text-[10px] font-bold transition-all ${
              inputMode === 'quantities'
                ? 'bg-white text-[#800020] shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            UNITS
          </button>
          <button
            onClick={() => setInputMode('percentage')}
            className={`px-4 py-2 rounded-lg text-[10px] font-bold transition-all ${
              inputMode === 'percentage'
                ? 'bg-white text-[#800020] shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            % RATIO
          </button>
        </div>
      </div>

      {isPercentageMode && (
        <div className="bg-slate-50 p-6 rounded-3xl text-center border border-slate-100 relative group focus-within:border-[#800020]/20 transition-colors">
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Total number of Casseroles (including special meals)</label>
          <input
            type="number"
            value={totalLoad}
            onChange={(e) => setTotalLoad(e.target.value)}
            className="w-full bg-transparent text-5xl font-bold text-center outline-none text-slate-700 placeholder:text-slate-200"
            placeholder="0"
          />
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
          Menu Items
        </h3>
        {options.map((opt, idx) => {
          const color = COLOR_OPTIONS[opt.colorIdx];
          return (
            <div
              key={opt.id}
              className={`flex items-center gap-3 p-3 rounded-2xl border transition-all duration-200 ${color.bg} ${color.border} focus-within:ring-1 ${color.ring}`}
            >
              <button
                onClick={() => cycleColor(idx)}
                className="p-2 rounded-xl bg-white/60 hover:bg-white text-lg shadow-sm transition-all active:scale-95"
                title="Change Color"
              >
                {color.label}
              </button>
              
              <div className="flex-1">
                <input
                  type="text"
                  value={opt.name}
                  onChange={(e) => handleOptionChange(idx, 'name', e.target.value)}
                  className={`w-full bg-transparent font-bold text-sm outline-none ${color.text} placeholder:text-slate-400/50`}
                  placeholder="Item Name"
                />
              </div>

              <div className="relative">
                <input
                  type="number"
                  value={opt.value}
                  placeholder="0"
                  onChange={(e) => handleOptionChange(idx, 'value', e.target.value)}
                  className={`w-16 bg-white p-2 rounded-xl font-bold text-center outline-none shadow-sm border focus:border-[#800020]/20 ${
                    isOver100 ? 'text-red-600 border-red-300 ring-2 ring-red-100' : 'text-slate-700 border-transparent'
                  }`}
                />
                <span className="absolute -top-2 -right-1 text-[9px] font-bold text-slate-400 pointer-events-none">
                  {inputMode === 'percentage' ? '%' : '#'}
                </span>
              </div>
            </div>
          );
        })}
        
        {isPercentageMode && (
          <div className={`text-center text-xs font-bold transition-colors ${isOver100 ? 'text-red-500' : 'text-slate-400'}`}>
            Total: {totalPercentage}%
          </div>
        )}

        {isOver100 && (
          <div className="flex items-center justify-center gap-2 text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-100 animate-in slide-in-from-top-2">
            <AlertCircle size={16} />
            <span>Total percentage cannot exceed 100%</span>
          </div>
        )}
      </div>

      <div className="space-y-4 pt-4 border-t border-dashed border-slate-200">
        <div className="flex items-center justify-center gap-2">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Special Meals (SPML)
            </h3>
            <div className="group relative flex justify-center">
                <div className="bg-slate-200 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold text-slate-500 cursor-help">?</div>
                <span className="absolute bottom-6 scale-0 transition-all rounded bg-slate-800 p-2 text-xs text-white group-hover:scale-100 w-32 text-center z-10">
                    Deducts from cart capacity
                </span>
            </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: numCarts }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-slate-100 p-3 rounded-2xl flex justify-between items-center shadow-sm"
            >
              <span className="font-bold text-[10px] text-slate-400 uppercase">
                Cart {i + 1}
              </span>
              <input
                type="number"
                value={cartSpecials[i + 1] || ''}
                onChange={(e) => handleSpecialChange(i + 1, e.target.value)}
                className="w-12 bg-slate-50 rounded-lg text-center font-bold text-md text-[#800020] outline-none focus:ring-1 focus:ring-[#800020]/20"
                placeholder="0"
              />
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onCalculate}
        disabled={isOver100}
        className={`w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-wider shadow-lg transition-all active:scale-[0.98] ${
            isOver100 
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
            : 'bg-[#800020] hover:bg-[#600018] text-white hover:shadow-xl'
        }`}
      >
        Calculate Distribution
      </button>
    </div>
  );
};