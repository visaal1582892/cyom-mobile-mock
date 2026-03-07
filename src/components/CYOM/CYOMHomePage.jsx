import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userData } from '../../data/store';
import CommonNavbar from './CommonNavbar';

const CYOMHomePage = () => {
    const navigate = useNavigate();
    const [savedPlans, setSavedPlans] = useState([]);
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0); // To force re-render on plan change

    useEffect(() => {
        const loadedPlans = JSON.parse(localStorage.getItem('cyom_saved_plans') || '[]');
        setSavedPlans(loadedPlans);

        // Auto-activate the first plan if none is active yet
        const activePlanId = localStorage.getItem('cyom_tracker_active_plan_id');
        if (!activePlanId && loadedPlans.length > 0) {
            localStorage.setItem('cyom_tracker_active_plan_id', String(loadedPlans[0].id));
            setRefreshTrigger(prev => prev + 1);
        }
    }, [isPlanModalOpen]); // Reload when modal opens to ensure fresh data

    const handleLogout = () => {
        navigate('/login');
    };

    const [progressInfo, setProgressInfo] = useState({ consumed: 0, total: 2000, percent: 0, hasPlan: false });

    // Calculate Quick Stats (Mini Progress)
    const getDailyProgress = () => {
        const activePlanId = localStorage.getItem('cyom_tracker_active_plan_id');
        if (!activePlanId) return { consumed: 0, total: 2000, percent: 0, hasPlan: false };

        const plans = JSON.parse(localStorage.getItem('cyom_saved_plans') || '[]');
        const plan = plans.find(p => String(p.id) === String(activePlanId));
        if (!plan) return { consumed: 0, total: 2000, percent: 0, hasPlan: false };

        return { hasPlan: true, planName: plan.name };
    };

    useEffect(() => {
        setProgressInfo(getDailyProgress());
    }, [refreshTrigger, isPlanModalOpen]);

    const handleSwitchPlan = (planId) => {
        console.log("Switching to plan:", planId);
        localStorage.setItem('cyom_tracker_active_plan_id', String(planId)); // Ensure string storage
        setRefreshTrigger(prev => prev + 1);
        setIsPlanModalOpen(false);
    };

    const options = [
        {
            title: "Dashboard",
            description: "View your health analytics",
            path: "/cyom-dashboard",
            iconEmoji: "📊",
            iconBg: "bg-purple-100 text-purple-600",
        },
        {
            title: "Track Meals",
            description: "Log your daily intake",
            path: "/meal-tracker",
            iconEmoji: "🥗",
            iconBg: "bg-teal-100 text-[#2E7D6B]",
        },
        {
            title: "Meal History",
            description: "View past logs",
            path: "/meal-history",
            iconEmoji: "📜",
            iconBg: "bg-orange-100 text-orange-600",
        },
        {
            title: "Saved Plans",
            description: "Manage your templates",
            path: "/saved-plans",
            iconEmoji: "📂",
            iconBg: "bg-blue-100 text-blue-600",
        }
    ];

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#43AA95] to-[#A8E6CF] font-sans relative overflow-hidden text-white">

            {/* Background Blobs for specific "Web Page Theme" feel - reduced opacity for cleaner look */}
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl mix-blend-overlay opacity-30 pointer-events-none"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl mix-blend-overlay opacity-30 pointer-events-none"></div>

            {/* Header / Status Bar Area */}
            <CommonNavbar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col pt-6 px-6 relative z-10 max-w-4xl mx-auto w-full">

                {/* HERO CARDS CONTAINER */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    {/* HERO CARD - Create Diet Plan Focused */}
                    <div
                        onClick={() => navigate('/meal-creation')}
                        className="flex-1 bg-white p-6 rounded-[32px] shadow-xl relative overflow-hidden group cursor-pointer transition-all hover:shadow-2xl hover:-translate-y-1 border border-white/60"
                    >
                        {/* Decorative Icons - Visible & Vibrant */}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-7xl drop-shadow-2xl rotate-12 group-hover:rotate-0 transition-transform duration-500">📝</div>
                        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-[#2E7D6B]/10 rounded-full blur-2xl group-hover:bg-[#2E7D6B]/20 transition-colors"></div>

                        <div className="relative z-10 flex flex-col items-start max-w-[80%]">
                            <div className="bg-[#2E7D6B]/10 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-[#2E7D6B] mb-2 uppercase tracking-wider">
                                Start Nutrition
                            </div>
                            <h1 className="text-xl sm:text-2xl font-black text-gray-800 mb-1 tracking-tight leading-none">
                                Create Diet Plan
                            </h1>
                            <p className="text-gray-500 font-medium mb-3 text-xs">
                                Design a tailored nutrition plan.
                            </p>
                        </div>
                    </div>

                    {/* HERO CARD - Create Workout Plan Focused */}
                    <div
                        onClick={() => navigate('/workout-creation')}
                        className="flex-1 bg-white p-6 rounded-[32px] shadow-xl relative overflow-hidden group cursor-pointer transition-all hover:shadow-2xl hover:-translate-y-1 border border-white/60"
                    >
                        {/* Decorative Icons - Visible & Vibrant */}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-7xl drop-shadow-2xl -rotate-12 group-hover:rotate-0 transition-transform duration-500">💪</div>
                        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors"></div>

                        <div className="relative z-10 flex flex-col items-start max-w-[80%]">
                            <div className="bg-purple-100 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-purple-700 mb-2 uppercase tracking-wider">
                                Start Fitness
                            </div>
                            <h1 className="text-xl sm:text-2xl font-black text-gray-800 mb-1 tracking-tight leading-none">
                                Create Workout Plan
                            </h1>
                            <p className="text-gray-500 font-medium mb-3 text-xs">
                                Design your perfect exercise routine.
                            </p>
                        </div>
                    </div>
                </div>

                {/* GRID OPTIONS - White cards with dark text */}
                <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
                    {options.map((opt, idx) => (
                        <button
                            key={idx}
                            onClick={() => navigate(opt.path)}
                            className="bg-white hover:bg-gray-50 backdrop-blur-sm border-2 border-transparent hover:border-[#2E7D6B]/20 p-5 rounded-[24px] shadow-lg hover:shadow-xl transition-all group text-left relative overflow-hidden hover:-translate-y-1"
                        >
                            <div className={`w-12 h-12 rounded-2xl mb-4 flex items-center justify-center text-2xl shadow-sm ${opt.iconBg}`}>
                                {opt.iconEmoji}
                            </div>
                            <h3 className="text-lg font-black text-gray-800 mb-1 group-hover:text-[#2E7D6B] transition-colors">{opt.title}</h3>
                            <p className="text-xs font-bold text-gray-400">{opt.description}</p>

                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </button>
                    ))}
                </div>

            </div>

            {/* Plan Selection Modal */}
            {isPlanModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsPlanModalOpen(false)}></div>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-scale-up">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-xl font-black text-gray-800">Select Active Plan</h3>
                            <button onClick={() => setIsPlanModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-3">
                            {savedPlans.length === 0 ? (
                                <div className="text-center py-8 text-gray-400">
                                    <div className="text-3xl mb-2">📂</div>
                                    <p>No saved plans found.</p>
                                    <button onClick={() => navigate('/meal-creation')} className="mt-4 text-[#2E7D6B] font-bold text-sm hover:underline">Create a Diet Plan</button>
                                </div>
                            ) : (
                                savedPlans.map(plan => (
                                    <button
                                        key={plan.id}
                                        onClick={() => handleSwitchPlan(plan.id)}
                                        className={`w-full text-left p-4 rounded-2xl border transition-all flex justify-between items-center group ${progressInfo.planName === plan.name
                                            ? 'border-[#2E7D6B] bg-[#2E7D6B]/5 ring-1 ring-[#2E7D6B]'
                                            : 'border-gray-100 hover:border-[#2E7D6B]/30 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div>
                                            <div className="font-bold text-gray-800 group-hover:text-[#2E7D6B] transition-colors">{plan.name}</div>
                                            <div className="text-xs text-gray-400 mt-1">{plan.duration} Days • {new Date(plan.createdAt).toLocaleDateString()}</div>
                                        </div>
                                        {progressInfo.planName === plan.name && (
                                            <div className="bg-[#2E7D6B] text-white text-xs font-bold px-3 py-1 rounded-lg">
                                                Active
                                            </div>
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CYOMHomePage;
