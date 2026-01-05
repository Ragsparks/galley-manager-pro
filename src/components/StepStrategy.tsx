import React from 'react';
import { LayoutGrid, Scale } from 'lucide-react';
import type { DistStrategy } from '../types';

interface StepStrategyProps {
  strategy: DistStrategy;
  setStrategy: (s: DistStrategy) => void;
  numCarts: number;
  setNumCarts: (n: number) => void;
  onNext: () => void;
}

export const StepStrategy: React.FC<StepStrategyProps> = ({
  strategy,
  setStrategy,
  numCarts,
  setNumCarts,
  onNext
}) => {
  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <section>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 text-center">
          Distribution Strategy
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setStrategy('Equally')}
            className={`group relative flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all duration-300 ${
              strategy === 'Equally'
                ? 'border-[#800020] bg-[#800020]/5 text-[#800020] shadow-md'
                : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-300'
            }`}
          >
            <div className={`p-3 rounded-full transition-colors ${strategy === 'Equally' ? 'bg-[#800020] text-white' : 'bg-white'}`}>
              <Scale size={24} />
            </div>
            <div className="font-bold text-xs uppercase">Spread Evenly</div>
          </button>
          
          <button
            onClick={() => setStrategy('First Carts Full')}
            className={`group relative flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all duration-300 ${
              strategy === 'First Carts Full'
                ? 'border-[#800020] bg-[#800020]/5 text-[#800020] shadow-md'
                : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-300'
            }`}
          >
             <div className={`p-3 rounded-full transition-colors ${strategy === 'First Carts Full' ? 'bg-[#800020] text-white' : 'bg-white'}`}>
              <LayoutGrid size={24} />
            </div>
            <div className="font-bold text-xs uppercase">Fill Front First</div>
          </button>
        </div>
      </section>

      <section>
        <div className="text-center mb-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Carts</h3>
        </div>
        
        <div className="flex flex-col gap-3 max-w-lg mx-auto">
          {/* Even numbers row */}
          <div className="grid grid-cols-5 gap-2">
            {[2, 4, 6, 8, 10].map(n => (
              <button
                key={n}
                onClick={() => setNumCarts(n)}
                className={`h-12 rounded-xl font-bold text-sm transition-all duration-200 border ${
                  numCarts === n
                    ? 'bg-[#800020] border-[#800020] text-white shadow-lg scale-105'
                    : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          
          {/* Odd numbers row */}
          <div className="grid grid-cols-4 gap-2 px-6">
            {[3, 5, 7, 9].map(n => (
              <button
                key={n}
                onClick={() => setNumCarts(n)}
                className={`h-12 rounded-xl font-bold text-sm transition-all duration-200 border ${
                  numCarts === n
                    ? 'bg-[#800020] border-[#800020] text-white shadow-lg scale-105'
                    : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </section>

      <button
        onClick={onNext}
        className="w-full bg-slate-800 hover:bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
      >
        Continue to Inventory
      </button>
    </div>
  );
};