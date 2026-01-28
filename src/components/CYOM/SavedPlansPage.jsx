import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userData } from '../../data/store';

const SavedPlansPage = () => {
    const navigate = useNavigate();
    const [savedPlans, setSavedPlans] = useState([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleLogout = () => {
        navigate('/login');
    };

    useEffect(() => {
        // Load plans from local storage
        const loadedPlans = JSON.parse(localStorage.getItem('cyom_saved_plans') || '[]');
        setSavedPlans(loadedPlans);
    }, []);

    const handleDelete = (id) => {
        const updated = savedPlans.filter(p => p.id !== id);
        setSavedPlans(updated);
        localStorage.setItem('cyom_saved_plans', JSON.stringify(updated));
    };

    const handleOpen = (plan) => {
        // Navigate to Meal Planner with saved data
        navigate('/meal-planner', {
            state: {
                savedPlanData: plan
            }
        });
    };

    // Helper: Format Date
    const formatDate = (isoString) => {
        if (!isoString) return 'Unknown Date';
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Helper: Calculate Stats
    const getPlanStats = (planData) => {
        let totalCals = 0, totalP = 0, totalC = 0, totalF = 0;
        let dayCount = 0;

        if (planData.plan) {
            Object.values(planData.plan).forEach(day => {
                dayCount++;
                ['breakfast', 'lunch', 'snacks', 'dinner'].forEach(slot => {
                    day[slot]?.forEach(item => {
                        totalCals += item.calculatedCalories || 0;
                        totalP += item.macros?.protein || 0;
                        totalC += item.macros?.carbs || 0;
                        totalF += item.macros?.fats || 0;
                    });
                });
            });
        }

        const count = dayCount || 1;
        return {
            cals: Math.round(totalCals / count),
            p: Math.round(totalP / count),
            c: Math.round(totalC / count),
            f: Math.round(totalF / count)
        };
    };

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#43AA95] to-[#A8E6CF] font-sans relative overflow-hidden text-white">
            {/* Background Overlay */}
            <div className="absolute top-0 right-0 w-full h-[50vh] bg-gradient-to-b from-black/10 to-transparent pointer-events-none"></div>

            {/* Header / Status Bar Area */}
            <div className="pt-6 px-6 flex justify-between items-center relative z-20">
                <div className="flex items-center gap-4">
                    {/* Hamburger Menu */}
                    <button onClick={() => setIsMenuOpen(true)} className="p-2 rounded-full hover:bg-white/20 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                    </button>

                    <div>
                        <div className="text-xs opacity-80 font-medium text-green-100">Saved Plans</div>
                        <div className="text-lg font-bold">{userData.name}'s Collection</div>
                    </div>
                </div>

                {/* Profile Image & Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/50 shadow-md hover:border-white transition-all"
                    >
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                            IMG
                        </div>
                    </button>

                    {/* Profile Dropdown */}
                    {isProfileOpen && (
                        <>
                            <div className="fixed inset-0 z-10 cursor-default" onClick={() => setIsProfileOpen(false)}></div>
                            <div className="absolute right-0 top-14 w-48 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 py-2 z-20 animate-fade-in-up text-gray-800">
                                <div className="px-4 py-2 border-b border-gray-100 mb-1">
                                    <div className="font-bold text-sm truncate">{userData.name}</div>
                                    <div className="text-xs text-gray-500">Premium Member</div>
                                </div>
                                <button onClick={() => navigate('/profile')} className="w-full text-left px-4 py-2 hover:bg-[#2E7D6B]/10 hover:text-[#2E7D6B] text-sm font-medium transition-colors flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    My Profile
                                </button>
                                <button onClick={() => navigate('/saved-plans')} className="w-full text-left px-4 py-2 hover:bg-[#2E7D6B]/10 hover:text-[#2E7D6B] text-sm font-medium transition-colors flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                    </svg>
                                    Saved Plans
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 hover:bg-red-50 hover:text-red-500 text-sm font-medium transition-colors flex items-center gap-2 text-red-500"
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

            {/* Sidebar Menu (Drawer) */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-50 flex">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
                    <div className="relative w-3/4 max-w-xs bg-white h-full shadow-2xl p-6 flex flex-col justify-between animate-slide-in-left">
                        <div>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-[#1F2933]">Menu</h2>
                                <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="space-y-2">
                                <button onClick={() => { navigate('/goal-selection'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-600 font-medium flex items-center gap-3">
                                    <span className="text-lg">🎯</span> Goal Selection
                                </button>
                                <button onClick={() => { navigate('/saved-plans'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl bg-[#F0FDF9] text-[#2E7D6B] font-bold flex items-center gap-3">
                                    <span className="text-lg">📂</span> Saved Plans
                                </button>
                                <button onClick={() => { navigate('/'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-600 font-medium flex items-center gap-3">
                                    <span className="text-lg">🏠</span> Back to Home
                                </button>
                                <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-600 font-medium flex items-center gap-3 opacity-50 cursor-not-allowed">
                                    <span className="text-lg">⚙️</span> Settings (Soon)
                                </button>
                            </div>
                        </div>
                        <div className="text-center text-xs text-gray-400">
                            v1.0.0 CYOM Beta
                        </div>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto px-6 pb-10 space-y-4 custom-scrollbar">
                {savedPlans.length === 0 ? (
                    <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 text-center mt-10">
                        <div className="text-4xl mb-3 opacity-50">📂</div>
                        <h3 className="font-bold text-white/90">No Saved Plans</h3>
                        <p className="text-xs text-white/60 mt-2">Your saved meal plans will appear here.</p>
                    </div>
                ) : (
                    savedPlans.map(plan => {
                        const stats = getPlanStats(plan);
                        return (
                            <div key={plan.id} className="bg-white/95 backdrop-blur-lg p-5 rounded-3xl shadow-xl border border-white/40 text-[#1F2933] animate-fade-in-up transition-transform hover:scale-[1.01]">
                                {/* Card Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-[#1F2933] leading-tight">{plan.name}</h3>
                                        <div className="text-xs text-gray-400 font-medium mt-1 flex items-center gap-2">
                                            <span>📅 {formatDate(plan.createdAt)}</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                            <span>⏳ {plan.duration} Day(s)</span>
                                        </div>
                                    </div>
                                    <div className="bg-[#2E7D6B]/10 text-[#2E7D6B] flex flex-col items-center justify-center px-3 py-1.5 rounded-xl border border-[#2E7D6B]/20 min-w-[70px]">
                                        <span className="text-xs font-bold uppercase tracking-wider text-[#2E7D6B]/70">Avg</span>
                                        <span className="text-lg font-black leading-none">{stats.cals}</span>
                                        <span className="text-[9px] font-bold opacity-80">kcal</span>
                                    </div>
                                </div>

                                {/* Macros Summary */}
                                <div className="flex gap-2 mb-4">
                                    <div className="flex-1 bg-blue-50/50 rounded-xl p-2 border border-blue-100 flex flex-col items-center">
                                        <span className="text-[9px] font-bold text-blue-400 uppercase">Protein</span>
                                        <span className="text-sm font-black text-blue-600">{stats.p}g</span>
                                    </div>
                                    <div className="flex-1 bg-blue-50/50 rounded-xl p-2 border border-blue-100 flex flex-col items-center">
                                        <span className="text-[9px] font-bold text-blue-400 uppercase">Carbs</span>
                                        <span className="text-sm font-black text-blue-500">{stats.c}g</span>
                                    </div>
                                    <div className="flex-1 bg-yellow-50/50 rounded-xl p-2 border border-yellow-100 flex flex-col items-center">
                                        <span className="text-[9px] font-bold text-yellow-500 uppercase">Fats</span>
                                        <span className="text-sm font-black text-yellow-600">{stats.f}g</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-3 border-t border-gray-100">
                                    <button
                                        onClick={() => handleOpen(plan)}
                                        className="flex-1 py-3 bg-[#2E7D6B] text-white text-sm font-bold rounded-xl shadow-lg shadow-[#2E7D6B]/20 hover:bg-[#256a5b] transition-all"
                                    >
                                        Open Plan
                                    </button>
                                    <button
                                        onClick={() => handleDelete(plan.id)}
                                        className="w-12 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default SavedPlansPage;
