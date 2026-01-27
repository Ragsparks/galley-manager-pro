import React from 'react';
import { Coffee } from 'lucide-react';

export const DonateButton: React.FC = () => {
    return (
        <a
            href="https://buymeacoffee.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFDD00] text-black font-bold text-xs shadow-md hover:shadow-lg hover:scale-105 transition-all mt-8 mx-auto w-max"
        >
            <Coffee size={16} />
            <span>Buy me a coffee</span>
        </a>
    );
};
