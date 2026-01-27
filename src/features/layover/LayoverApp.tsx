import { ArrowLeft, MapPin } from 'lucide-react';

interface AppProps {
    onBack: () => void;
}

export const LayoverApp: React.FC<AppProps> = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 flex flex-col items-center justify-center text-center">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-full text-emerald-600 dark:text-emerald-400 mb-6">
                <MapPin size={48} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Layover Guide</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs">
                Hotel info, discounts, and local recommendations coming soon.
            </p>
            <button
                onClick={onBack}
                className="px-6 py-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium flex items-center gap-2"
            >
                <ArrowLeft size={18} />
                Back to Hub
            </button>
        </div>
    );
};
