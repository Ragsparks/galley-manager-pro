import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Check } from 'lucide-react';

interface OnboardingProps {
    onClose: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onClose }) => {
    const [step, setStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const steps = [
        {
            title: "Welcome to Galley Manager",
            desc: "Your smart assistant for distributing meals quickly and accurately. Let's take a quick tour!",
            icon: "👋"
        },
        {
            title: "1. Choose Strategy",
            desc: "Select how you want to fill the carts. 'Fill Front First' is best for standard service, while 'Spread Evenly' balances the load.",
            icon: "⚖️"
        },
        {
            title: "2. Load Inventory",
            desc: "Enter your total meal counts. You can also rename carts and mark 'Special Meals' (SPML) to reserve space.",
            icon: "📝"
        },
        {
            title: "3. View Results",
            desc: "Get your exact cart packing list. You can copy it or save it as an image for your records.",
            icon: "✅"
        }
    ];

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            handleClose();
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Allow fade out
    };

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`bg-white dark:bg-slate-800 w-full max-w-sm rounded-[2rem] p-8 shadow-2xl transform transition-all duration-300 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>

                <div className="flex justify-between items-start mb-6">
                    <div className="text-4xl">{steps[step].icon}</div>
                    <button onClick={handleClose} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <X size={16} />
                    </button>
                </div>

                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-3">
                    {steps[step].title}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8 h-20">
                    {steps[step].desc}
                </p>

                <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-[#800020] dark:bg-[#ff4d6d]' : 'w-1.5 bg-slate-200 dark:bg-slate-700'}`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={handleNext}
                        className="flex items-center gap-2 px-6 py-3 bg-[#800020] dark:bg-[#ff4d6d] hover:bg-[#600018] dark:hover:bg-[#ff3355] text-white rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-[#800020]/20 dark:shadow-[#ff4d6d]/20"
                    >
                        {step === steps.length - 1 ? 'Get Started' : 'Next'}
                        {step === steps.length - 1 ? <Check size={16} /> : <ArrowRight size={16} />}
                    </button>
                </div>

            </div>
        </div>
    );
};
