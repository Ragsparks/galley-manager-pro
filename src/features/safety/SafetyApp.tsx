import { ArrowLeft, ShieldAlert } from 'lucide-react';

interface AppProps {
    onBack: () => void;
}

export const SafetyApp: React.FC<AppProps> = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 flex flex-col items-center justify-center text-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full text-blue-600 dark:text-blue-400 mb-6">
                <ShieldAlert size={48} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Safety Info</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs">
                Aircraft specific safety data (doors, minimum crew) coming soon.
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
