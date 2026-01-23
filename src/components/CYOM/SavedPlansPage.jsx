import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userData } from '../../data/store';

const SavedPlansPage = () => {
    const navigate = useNavigate();
    const [savedPlans, setSavedPlans] = useState([]);

    useEffect(() => {
        // Load plans from local storage
        const loadedPlans = JSON.parse(localStorage.getItem('savedPlans') || '[]');
        setSavedPlans(loadedPlans);
    }, []);

    const handleDelete = (id) => {
        const updated = savedPlans.filter(p => p.id !== id);
        setSavedPlans(updated);
        localStorage.setItem('savedPlans', JSON.stringify(updated));
    };

    const handleOpen = (plan) => {
        // Navigate to Meal Planner with saved data
        navigate('/meal-planner', {
            state: {
                savedPlanData: plan
            }
        });
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
                    savedPlans.map(plan => (
                        <div key={plan.id} className="bg-white/95 backdrop-blur-lg p-5 rounded-3xl shadow-xl border border-white/40 text-[#1F2933] animate-fade-in-up transition-transform active:scale-[0.99]">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-lg text-[#1F2933]">{plan.name}</h3>
                                    <div className="text-xs text-gray-500 font-medium">{plan.createdAt} • {plan.duration}</div>
                                </div>
                                <div className="bg-[#2E7D6B]/10 text-[#2E7D6B] text-xs font-bold px-2 py-1 rounded-lg border border-[#2E7D6B]/20">
                                    {plan.avgCalories} kcal/day
                                </div>
                            </div>

                            <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => handleOpen(plan)}
                                    className="flex-1 py-2.5 bg-[#2E7D6B] text-white text-sm font-bold rounded-xl shadow-lg hover:bg-[#256a5b] transition-colors"
                                >
                                    Open Plan
                                </button>
                                <button
                                    onClick={() => handleDelete(plan.id)}
                                    className="px-4 py-2.5 bg-red-50 text-red-500 text-sm font-bold rounded-xl hover:bg-red-100 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SavedPlansPage;
