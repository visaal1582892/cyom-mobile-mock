import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userData } from '../../data/store';
import SidebarMenu from './SidebarMenu';

const CYOMHomePage = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [savedPlans, setSavedPlans] = useState([]);
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0); // To force re-render on plan change

    useEffect(() => {
        const loadedPlans = JSON.parse(localStorage.getItem('cyom_saved_plans') || '[]');
        setSavedPlans(loadedPlans);
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
            title: "Create Plan",
            description: "Design a new meal plan",
            path: "/goal-selection",
            iconEmoji: "📝",
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
            <div className="pt-6 px-6 flex justify-between items-center relative z-20">
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsMenuOpen(true)} className="p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                    </button>
                    <div>
                        <div className="text-xs font-bold text-white/90 uppercase tracking-wider shadow-sm">Welcome Back</div>
                        <div className="text-xl font-black text-white drop-shadow-md">{userData.name}</div>
                    </div>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg hover:scale-105 transition-transform"
                    >
                        <img src={userData.image} alt="Profile" className="w-full h-full object-cover" />
                    </button>

                    {isProfileOpen && (
                        <>
                            <div className="fixed inset-0 z-10 cursor-default" onClick={() => setIsProfileOpen(false)}></div>
                            <div className="absolute right-0 top-14 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 py-2 z-20 animate-fade-in-up text-gray-800">
                                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                                    <div className="font-bold text-sm text-gray-800">{userData.name}</div>
                                    <div className="text-xs text-[#2E7D6B] font-bold">Premium Member</div>
                                </div>
                                <button onClick={() => navigate('/profile')} className="w-full text-left px-4 py-3 hover:bg-[#F0FDF9] hover:text-[#2E7D6B] text-sm font-medium transition-colors flex items-center gap-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    My Profile
                                </button>
                                <button onClick={() => navigate('/saved-plans')} className="w-full text-left px-4 py-3 hover:bg-[#F0FDF9] hover:text-[#2E7D6B] text-sm font-medium transition-colors flex items-center gap-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                    </svg>
                                    Saved Plans
                                </button>
                                <div className="h-px bg-gray-100 my-1"></div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-500 text-sm font-medium transition-colors flex items-center gap-3"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Logout
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <SidebarMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col p-6 relative z-10 max-w-4xl mx-auto w-full">

                {/* HERO CARD - White Background for Visibility */}
                <div className="bg-white/95 backdrop-blur-md border border-white/60 p-6 sm:p-8 rounded-[32px] shadow-xl mb-8 relative overflow-hidden group">
                    {/* Decorative BG */}
                    <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-[#2E7D6B]/5 to-transparent rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>

                    <div className="relative z-10">
                        <h1 className="text-3xl sm:text-4xl font-black text-gray-800 mb-2 tracking-tight">
                            Build Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2E7D6B] to-[#43AA95]">Body</span>
                        </h1>
                        <p className="text-gray-500 font-medium mb-6 max-w-md">
                            Your personalized nutrition journey starts here. Track meals, analyze insights, and reach your goals.
                        </p>

                        {progressInfo.hasPlan ? (
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="inline-flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl shadow-inner border border-gray-100">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2E7D6B] opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-[#2E7D6B]"></span>
                                    </span>
                                    <span className="text-sm font-bold text-gray-700">Active Plan: <span className="text-[#2E7D6B]">{progressInfo.planName}</span></span>
                                </div>
                                <button
                                    onClick={() => setIsPlanModalOpen(true)}
                                    className="text-xs font-bold text-[#2E7D6B] hover:text-[#256a5b] hover:underline px-2 py-1"
                                >
                                    Change
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => navigate('/goal-selection')} className="px-6 py-2.5 bg-[#2E7D6B] text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-[#256a5b] transition-all transform hover:-translate-y-0.5">
                                Start a New Plan
                            </button>
                        )}
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
                                    <button onClick={() => navigate('/goal-selection')} className="mt-4 text-[#2E7D6B] font-bold text-sm hover:underline">Create a Plan</button>
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
