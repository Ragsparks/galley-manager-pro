import React from 'react';
import { Coffee } from 'lucide-react';

interface DonateButtonProps {
    variant?: 'full' | 'icon';
}

export const DonateButton: React.FC<DonateButtonProps> = ({ variant = 'full' }) => {
    if (variant === 'icon') {
        return (
            <a
                href="https://buy.stripe.com/9B64gA3pWfYC7m08yqg3602"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-[#FFDD00] text-black hover:bg-[#ffe54d] transition-all shadow-sm"
                aria-label="Buy me a coffee"
            >
                <Coffee size={18} />
            </a>
        );
    }

    return (
        <a
            href="https://buy.stripe.com/9B64gA3pWfYC7m08yqg3602"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFDD00] text-black font-bold text-xs shadow-md hover:shadow-lg hover:scale-105 transition-all mt-8 mx-auto w-max"
        >
            <Coffee size={16} />
            <span>Buy me a coffee</span>
        </a>
    );
};
