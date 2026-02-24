import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userData } from '../../data/store';
import { RDA_TARGETS } from '../../utils/nutrientData';

const WellnessTab = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [todayStats, setTodayStats] = useState(null);
    const [recentMeals, setRecentMeals] = useState([]);

    // --- LOAD DYNAMIC DATA ---
    // --- LOAD DYNAMIC DATA ---
    useEffect(() => {
        const loadDashboardData = () => {
            try {
                const today = new Date().toISOString().split('T')[0];
                let allLogs = {};

                try {
                    allLogs = JSON.parse(localStorage.getItem('cyom_daily_logs') || '{}');
                } catch (e) {
                    console.error("Failed to parse logs", e);
                }

                const todayLog = allLogs[today];

                // Default Empty Stats
                let stats = {
                    calories: { consumed: 0, total: 2000 },
                    macros: {
                        carbs: { consumed: 0, total: 250 },
                        protein: { consumed: 0, total: 100 },
                        fats: { consumed: 0, total: 70 }
                    },
                    vitamins: {
                        vitBScore: { consumed: 0, total: 0 },
                        vitC: { consumed: 0, total: 0 },
                        vitA: { consumed: 0, total: 0 },
                        vitD: { consumed: 0, total: 0 }
                    },
                    minerals: {
                        calcium: { consumed: 0, total: 0 },
                        magnesium: { consumed: 0, total: 0 },
                        iron: { consumed: 0, total: 0 },
                        zinc: { consumed: 0, total: 0 },
                        iodine: { consumed: 0, total: 0 }
                    },
                    burned: 450, // Mock for now
                    steps: 5500 // Mock for now
                };

                let meals = [];

                if (todayLog) {
                    stats.calories.consumed = todayLog.calories?.consumed || 0;
                    stats.calories.total = todayLog.calories?.total || 2000;

                    if (todayLog.macros) {
                        stats.macros.carbs.consumed = todayLog.macros.carbs?.consumed || 0;
                        stats.macros.carbs.total = todayLog.macros.carbs?.total || 250;
                        stats.macros.protein.consumed = todayLog.macros.protein?.consumed || 0;
                        stats.macros.protein.total = todayLog.macros.protein?.total || 100;
                        stats.macros.fats.consumed = todayLog.macros.fats?.consumed || 0;
                        stats.macros.fats.total = todayLog.macros.fats?.total || 70;
                    }

                    // Load Micros if available - MERGE to preserve defaults/structure
                    if (todayLog.micros) {
                        if (todayLog.micros.vitamins) {
                            stats.vitamins = { ...stats.vitamins, ...todayLog.micros.vitamins };
                        }
                        if (todayLog.micros.minerals) {
                            stats.minerals = { ...stats.minerals, ...todayLog.micros.minerals };
                        }
                    }

                    // Extract Meals for History
                    if (todayLog.details && todayLog.details.trackingLogs) {
                        const trackedKeys = Object.keys(todayLog.details.trackingLogs).filter(k => todayLog.details.trackingLogs[k]);

                        const planSnapshot = todayLog.details.planSnapshot;
                        if (planSnapshot && typeof planSnapshot === 'object') {
                            const findItem = (uuid) => {
                                // Check Slots
                                for (const slot of ['breakfast', 'morningSnack', 'lunch', 'snacks', 'dinner']) {
                                    if (Array.isArray(planSnapshot[slot])) {
                                        const found = planSnapshot[slot].find(i => i.uuid === uuid);
                                        if (found) return found;
                                    }
                                }
                                // Check extras
                                if (todayLog.details.extraLogs && typeof todayLog.details.extraLogs === 'object') {
                                    for (const key in todayLog.details.extraLogs) {
                                        if (Array.isArray(todayLog.details.extraLogs[key])) {
                                            const found = todayLog.details.extraLogs[key].find(i => i.uuid === uuid);
                                            if (found) return found;
                                        }
                                    }
                                }
                                return null;
                            };

                            const consumedUUIDs = trackedKeys.map(k => k.split('_').pop());
                            const foundMeals = consumedUUIDs.map(uuid => findItem(uuid)).filter(Boolean);

                            meals = foundMeals.slice(0, 5).map((m, idx) => ({
                                id: m.uuid || idx,
                                name: m.name || 'Unknown Item',
                                calories: m.calculatedCalories || 0,
                                weight: (m.calculatedWeight || '0') + (typeof m.calculatedWeight === 'number' ? 'g' : ''),
                                imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80"
                            }));
                        }
                    }
                }

                setTodayStats(stats);
                setRecentMeals(meals);
            } catch (err) {
                console.error("Dashboard Load Error:", err);
                // Fallback to avoid white screen
                setTodayStats({
                    calories: { consumed: 0, total: 2000 },
                    macros: {
                        carbs: { consumed: 0, total: 250 },
                        protein: { consumed: 0, total: 100 },
                        fats: { consumed: 0, total: 70 }
                    },
                    vitamins: { vitBScore: { consumed: 0 }, vitC: { consumed: 0 }, vitA: { consumed: 0 }, vitD: { consumed: 0 } },
                    minerals: { calcium: { consumed: 0 }, magnesium: { consumed: 0 }, iron: { consumed: 0 }, zinc: { consumed: 0 }, iodine: { consumed: 0 } },
                    burned: 0, steps: 0
                });
            }
        };

        loadDashboardData();
    }, []);

    const handleLogout = () => {
        // Navigate to home logic or login
        navigate('/login');
    };

    if (!todayStats) return <div className="min-h-screen bg-[#43AA95] flex items-center justify-center text-white">Loading Dashboard...</div>;

    const getMacroPct = (consumed, total) => Math.min(100, Math.round((consumed / (total || 1)) * 100));

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#43AA95] to-[#A8E6CF] font-sans relative overflow-hidden text-white">

            {/* Background Decor */}
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
                        <div className="text-xs opacity-80 font-medium text-green-100">Good Morning</div>
                        <div className="text-lg font-bold">{userData.name}! 👋</div>
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
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    My Profile
                                </button>
                                <button onClick={() => navigate('/saved-plans')} className="w-full text-left px-4 py-2 hover:bg-[#2E7D6B]/10 hover:text-[#2E7D6B] text-sm font-medium transition-colors flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                                    Saved Plans
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 hover:bg-red-50 hover:text-red-500 text-sm font-medium transition-colors flex items-center gap-2 text-red-500"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                    Logout
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Sidebar Menu (Drawer) - Kept same as before */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-50 flex">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
                    <div className="relative w-3/4 max-w-xs bg-white h-full shadow-2xl p-6 flex flex-col justify-between animate-slide-in-left">
                        <div>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-[#1F2933]">Menu</h2>
                                <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <div className="space-y-2">
                                <button onClick={() => { navigate('/goal-selection'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl bg-[#F0FDF9] text-[#2E7D6B] font-bold flex items-center gap-3">
                                    <span className="text-lg">🎯</span> Goal Selection
                                </button>
                                <button onClick={() => { navigate('/saved-plans'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-600 font-medium flex items-center gap-3">
                                    <span className="text-lg">📂</span> Saved Plans
                                </button>
                            </div>
                        </div>
                        <div className="text-center text-xs text-gray-400">v1.0.0 CYOM Beta</div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="mt-6 mx-4 md:max-w-3xl md:mx-auto relative z-10">

                    {/* Date Strip */}
                    <div className="flex justify-between items-center mb-8 px-4 text-white/90">
                        <div className="text-4xl font-light opacity-60">21</div>
                        <div className="flex flex-col items-center bg-white/20 backdrop-blur-md px-6 py-2 rounded-2xl shadow-lg border border-white/20">
                            <div className="text-xs font-bold text-green-100 uppercase tracking-wider mb-1">Today</div>
                            <div className="text-sm font-bold text-white">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                        </div>
                        <div className="text-4xl font-light opacity-60">23</div>
                    </div>

                    {/* Calorie Circle */}
                    <div className="rounded-[40px] bg-white/10 backdrop-blur-xl border border-white/30 p-6 relative shadow-2xl">
                        <div className="mt-6 mb-10 pl-4 text-white">
                            <div className="text-7xl font-bold tracking-tight drop-shadow-sm">{Math.round(todayStats.calories.consumed)}</div>
                            <div className="text-sm font-bold uppercase tracking-widest mt-1 opacity-90">kcal Consumed</div>
                            <div className="text-xs font-medium mt-1 opacity-80">Target: {Math.round(todayStats.calories.total)} kcal</div>
                        </div>

                        {/* Macros Grid */}
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="bg-white/20 rounded-2xl p-3 backdrop-blur-md border border-white/10">
                                <div className="text-xs text-green-50 mb-1 font-medium">Carbs</div>
                                <div className="text-xl font-bold text-white">{Math.round(todayStats.macros.carbs.consumed)}g</div>
                                <div className="text-xs opacity-70 font-bold text-white">{getMacroPct(todayStats.macros.carbs.consumed, todayStats.macros.carbs.total)}% of {Math.round(todayStats.macros.carbs.total)}g</div>
                            </div>
                            <div className="bg-white/20 rounded-2xl p-3 backdrop-blur-md border border-white/10">
                                <div className="text-xs text-green-50 mb-1 font-medium">Protein</div>
                                <div className="text-xl font-bold text-white">{Math.round(todayStats.macros.protein.consumed)}g</div>
                                <div className="text-xs opacity-70 font-bold text-white">{getMacroPct(todayStats.macros.protein.consumed, todayStats.macros.protein.total)}% of {Math.round(todayStats.macros.protein.total)}g</div>
                            </div>
                            <div className="bg-white/20 rounded-2xl p-3 backdrop-blur-md border border-white/10">
                                <div className="text-xs text-green-50 mb-1 font-medium">Fat</div>
                                <div className="text-xl font-bold text-white">{Math.round(todayStats.macros.fats.consumed)}g</div>
                                <div className="text-xs opacity-70 font-bold text-white">{getMacroPct(todayStats.macros.fats.consumed, todayStats.macros.fats.total)}% of {Math.round(todayStats.macros.fats.total)}g</div>
                            </div>
                        </div>

                        {/* Micro Glance (New) */}
                        <div className="bg-black/20 p-4 rounded-3xl border border-white/10 mb-4">
                            <div className="text-xs font-bold uppercase tracking-wide opacity-70 mb-3 text-white">Micronutrient Health</div>
                            <div className="grid grid-cols-4 gap-2 text-center">
                                {[
                                    { label: 'Vit B', val: todayStats.vitamins.vitBScore?.consumed || 0, unit: '%' },
                                    { label: 'Iron', val: todayStats.minerals.iron?.consumed || 0, unit: 'mg' },
                                    { label: 'Calc', val: todayStats.minerals.calcium?.consumed || 0, unit: 'mg' },
                                    { label: 'Vit C', val: todayStats.vitamins.vitC?.consumed || 0, unit: 'mg' },
                                ].map((m, i) => (
                                    <div key={i} className="bg-white/10 rounded-xl p-2">
                                        <div className="text-[10px] text-green-100 mb-0.5">{m.label}</div>
                                        <div className="text-sm font-bold text-white">{Math.round(m.val)}{m.unit !== '%' && <span className="text-[9px] font-normal">{m.unit}</span>}{m.unit === '%' && '%'}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recent Meals / Consumption */}
                    <div className="bg-white rounded-t-[40px] px-8 pt-8 pb-12 mt-6 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] min-h-[300px]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-xl text-[#1F2933]">Today's Meals</h3>
                            <button onClick={() => navigate('/meal-tracker')} className="text-[#2E7D6B] text-sm font-bold hover:underline">View Tracker</button>
                        </div>

                        <div className="space-y-4">
                            {recentMeals.length > 0 ? (
                                recentMeals.map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer group border border-transparent hover:border-gray-100">
                                        <img src={item.imageUrl} alt={item.name} className="w-14 h-14 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                                        <div className="flex-1">
                                            <div className="font-bold text-lg text-gray-800 leading-tight">{item.name}</div>
                                            <div className="text-xs text-[#2E7D6B] font-bold mt-1 bg-[#2E7D6B]/10 inline-block px-2 py-0.5 rounded-md">{Math.round(item.calories)} kcal • {item.weight}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-400 italic">
                                    No meals tracked today yet.
                                </div>
                            )}
                        </div>

                        {/* Go to Tracker Button */}
                        <button onClick={() => navigate('/meal-tracker')} className="w-full mt-8 py-4 rounded-2xl bg-[#FFD166] text-[#1F2933] font-bold text-lg shadow-lg shadow-[#FFD166]/30 hover:bg-[#ffda85] hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Track Meal
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WellnessTab;
