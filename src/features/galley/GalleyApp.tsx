import { useState, useEffect } from 'react';
import { StepStrategy } from '../../components/StepStrategy';
import { StepInput } from '../../components/StepInput';
import { StepResults } from '../../components/StepResults';
import { DonateButton } from '../../components/DonateButton';
import { Onboarding } from '../../components/Onboarding';
import { calculateDistribution } from '../../utils/distribution';
import { INITIAL_OPTIONS } from '../../constants';
import type { Cart, DistributionResult, DistStrategy, Excess, MealOption } from '../../types';
import { Moon, Sun, PlaneTakeoff, HelpCircle, ArrowLeft } from 'lucide-react';

interface GalleyAppProps {
    onBack: () => void;
}

export const GalleyApp: React.FC<GalleyAppProps> = ({ onBack }) => {
    // Navigation State
    const [step, setStep] = useState<number>(1);
    const [darkMode, setDarkMode] = useState<boolean>(false);
    const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

    // Data State
    const [distStrategy, setDistStrategy] = useState<DistStrategy>('First Carts Full');
    const [numCarts, setNumCarts] = useState<number>(4);
    const [options, setOptions] = useState<MealOption[]>(INITIAL_OPTIONS);
    const [cartSpecials, setCartSpecials] = useState<Record<number, number>>({});
    const [cartNames, setCartNames] = useState<Record<number, string>>({});
    const [cartRows, setCartRows] = useState<Record<number, string>>({});

    // Result State
    const [carts, setCarts] = useState<Cart[]>([]);
    const [excess, setExcess] = useState<Excess | null>(null);

    // Initialize specials map when cart number changes
    useEffect(() => {
        setCartSpecials(prev => {
            const next = { ...prev };
            // Ensure keys exist for current cart count
            for (let i = 1; i <= numCarts; i++) {
                if (next[i] === undefined) next[i] = 0;
            }
            return next;
        });
    }, [numCarts]);

    // Toggle Dark Mode
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const handleCalculate = () => {
        const result: DistributionResult = calculateDistribution(
            options,
            cartSpecials,
            numCarts,
            distStrategy
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
                        className={`h-1.5 rounded-full transition-all duration-300 ${step === i
                            ? 'w-8 bg-[#800020] dark:bg-[#ff4d6d]'
                            : 'w-2 bg-slate-200 dark:bg-slate-700'
                            }`}
                    />
                ))}
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#fcf9f9] dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-sans flex items-start justify-center p-4 md:p-8 transition-colors duration-300">

            {showOnboarding && <Onboarding onClose={() => setShowOnboarding(false)} />}

            <div className="w-full max-w-lg bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] dark:shadow-none border border-slate-100 dark:border-slate-700 transition-colors duration-300">

                <header className="flex items-center justify-between mb-8">
                    <button
                        onClick={onBack}
                        className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="bg-[#800020] dark:bg-[#ff4d6d] p-2.5 rounded-2xl text-white shadow-lg shadow-[#800020]/20 dark:shadow-[#ff4d6d]/20">
                            <PlaneTakeoff size={20} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white leading-none">
                                Galley Manager
                            </h1>
                            <span className="text-[10px] font-bold text-[#800020] dark:text-[#ff4d6d] tracking-widest uppercase">
                                Pro v2.1
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowOnboarding(true)}
                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-400 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-all"
                        >
                            <HelpCircle size={18} />
                        </button>
                        {step !== 3 && <DonateButton variant="icon" />}
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-400 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-all"
                        >
                            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                    </div>
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
                        options={options}
                        setOptions={setOptions}
                        cartSpecials={cartSpecials}
                        setCartSpecials={setCartSpecials}
                        cartNames={cartNames}
                        setCartNames={setCartNames}
                        numCarts={numCarts}
                        onCalculate={handleCalculate}
                    />
                )}

                {step === 3 && (
                    <StepResults
                        onEdit={() => setStep(2)}
                        carts={carts}
                        excess={excess}
                        cartNames={cartNames}
                        onNameChange={(id, val) => setCartNames(prev => ({ ...prev, [id]: val }))}
                        cartRows={cartRows}
                        onRowChange={(id, val) => setCartRows(prev => {
                            const next = { ...prev, [id]: val };
                            // Sync siblings (1-2, 3-4, 5-6, etc.)
                            const isOdd = id % 2 !== 0;
                            const partnerId = isOdd ? id + 1 : id - 1;

                            // If updating odd cart, always try to sync even partner if it's "clean"
                            if (isOdd && (prev[partnerId] === undefined || prev[partnerId] === prev[id] || prev[partnerId] === '')) {
                                next[partnerId] = val;
                            }
                            return next;
                        })}
                    />
                )}

                {step === 3 && (
                    <footer className="mt-8 flex justify-center">
                        <DonateButton variant="full" />
                    </footer>
                )}
            </div>
        </div>
    );
};
