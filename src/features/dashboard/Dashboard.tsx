import { PlaneTakeoff, ShieldAlert, MapPin, ArrowRight } from 'lucide-react';

interface DashboardProps {
    onNavigate: (app: 'galley' | 'safety' | 'layover') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
    return (
        <div className="min-h-screen bg-[#fcf9f9] dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-sans p-6 md:p-8 transition-colors duration-300 flex flex-col items-center">

            <header className="w-full max-w-lg mb-12 flex flex-col items-center text-center">
                <div className="bg-[#800020] dark:bg-[#ff4d6d] p-4 rounded-3xl text-white shadow-xl shadow-[#800020]/20 mb-6">
                    <PlaneTakeoff size={32} />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white mb-2">
                    Crew Hub
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Your all-in-one flight attendant companion.
                </p>
            </header>

            <div className="w-full max-w-lg grid gap-4">
                {/* Galley Manager Card */}
                <button
                    onClick={() => onNavigate('galley')}
                    className="group relative overflow-hidden bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all border border-slate-100 dark:border-slate-700 text-left flex items-center justify-between"
                >
                    <div className="flex items-center gap-4 z-10">
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl text-[#800020] dark:text-[#ff4d6d]">
                            <PlaneTakeoff size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Galley Manager</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Calculator & Distribution</p>
                        </div>
                    </div>
                    <div className="text-slate-300 dark:text-slate-600 group-hover:text-[#800020] dark:group-hover:text-[#ff4d6d] transition-colors">
                        <ArrowRight size={20} />
                    </div>
                </button>

                {/* Safety Info Card */}
                <button
                    onClick={() => onNavigate('safety')}
                    className="group relative overflow-hidden bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all border border-slate-100 dark:border-slate-700 text-left flex items-center justify-between"
                >
                    <div className="flex items-center gap-4 z-10">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600 dark:text-blue-400">
                            <ShieldAlert size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Safety Info</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Aircraft Doors & Crew</p>
                        </div>
                    </div>
                    <div className="text-slate-300 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        <ArrowRight size={20} />
                    </div>
                </button>

                {/* Layover Guide Card */}
                <button
                    onClick={() => onNavigate('layover')}
                    className="group relative overflow-hidden bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all border border-slate-100 dark:border-slate-700 text-left flex items-center justify-between"
                >
                    <div className="flex items-center gap-4 z-10">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-emerald-600 dark:text-emerald-400">
                            <MapPin size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Layover Guide</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Hotels & Recommendations</p>
                        </div>
                    </div>
                    <div className="text-slate-300 dark:text-slate-600 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        <ArrowRight size={20} />
                    </div>
                </button>
            </div>

        </div>
    );
};
