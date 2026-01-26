import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userData } from '../../data/store';

const SavedPlansPage = () => {
    const navigate = useNavigate();
    const [savedPlans, setSavedPlans] = useState([]);

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

            {/* Header */}
            <div className="px-6 pt-6 pb-6 relative z-10 flex items-center justify-between">
                <button onClick={() => navigate('/meal-creation')} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors backdrop-blur-md border border-white/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-xl font-bold drop-shadow-md">Saved Plans</h1>
                <div className="w-10"></div>
            </div>

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
