import { useState, useEffect } from 'react';
import { StepStrategy } from './components/StepStrategy';
import { StepInput } from './components/StepInput';
import { StepResults } from './components/StepResults';
import { calculateDistribution } from './utils/distribution';
import { INITIAL_OPTIONS } from './constants';
import type { Cart, DistributionResult, DistStrategy, Excess, InputMode, MealOption } from './types';

const App = () => {
  // Navigation State
  const [step, setStep] = useState<number>(1);
  
  // Data State
  const [inputMode, setInputMode] = useState<InputMode>('quantities');
  const [distStrategy, setDistStrategy] = useState<DistStrategy>('First Carts Full');
  const [numCarts, setNumCarts] = useState<number>(4);
  const [totalLoad, setTotalLoad] = useState<string>('');
  const [options, setOptions] = useState<MealOption[]>(INITIAL_OPTIONS);
  const [cartSpecials, setCartSpecials] = useState<Record<number, number>>({});
  
  // Result State
  const [carts, setCarts] = useState<Cart[]>([]);
  const [excess, setExcess] = useState<Excess | null>(null);

  // Initialize specials map when cart number changes
  useEffect(() => {
    setCartSpecials(prev => {
        const next = { ...prev };
        // Ensure keys exist for current cart count
        for(let i=1; i<=numCarts; i++) {
            if (next[i] === undefined) next[i] = 0;
        }
        return next;
    });
  }, [numCarts]);

  const handleCalculate = () => {
    const result: DistributionResult = calculateDistribution(
      options,
      cartSpecials,
      numCarts,
      distStrategy,
      inputMode,
      totalLoad
    );
    setCarts(result.carts);
    setExcess(result.excess);
    setStep(3);
  };

  const getStepIndicator = () => {
    return (
        <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3].map(i => (
                <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${step === i ? 'w-8 bg-[#800020]' : 'w-2 bg-slate-200'}`}
                />
            ))}
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fcf9f9] text-slate-700 font-sans flex items-start justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl bg-white p-6 md:p-8 rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] border border-slate-100">
        
        <header className="text-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-[#800020] italic">
            Galley Manager Pro
          </h1>
          <div className="h-0.5 w-10 bg-[#800020] mx-auto mt-2 rounded-full opacity-20"></div>
        </header>

        {getStepIndicator()}

        {step === 1 && (
          <StepStrategy
            strategy={distStrategy}
            setStrategy={setDistStrategy}
            numCarts={numCarts}
            setNumCarts={setNumCarts}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <StepInput
            onBack={() => setStep(1)}
            inputMode={inputMode}
            setInputMode={setInputMode}
            totalLoad={totalLoad}
            setTotalLoad={setTotalLoad}
            options={options}
            setOptions={setOptions}
            cartSpecials={cartSpecials}
            setCartSpecials={setCartSpecials}
            numCarts={numCarts}
            onCalculate={handleCalculate}
          />
        )}

        {step === 3 && (
          <StepResults
            onEdit={() => setStep(2)}
            carts={carts}
            excess={excess}
          />
        )}
      </div>
    </div>
  );
};

export default App;