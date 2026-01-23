import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dailyStats, consumptionHistory, userData } from '../../data/store';

const WellnessTab = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleLogout = () => {
        // Navigate to home logic or login
        navigate('/login');
    };

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#2E7D6B] to-[#A8E6CF] font-sans relative overflow-hidden text-white">

            {/* Background Decor (Subtle overlays for richness) */}
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
                                <button onClick={() => { navigate('/goal-selection'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl bg-[#F0FDF9] text-[#2E7D6B] font-bold flex items-center gap-3">
                                    <span className="text-lg">🎯</span> Goal Selection
                                </button>
                                <button onClick={() => { navigate('/saved-plans'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-600 font-medium flex items-center gap-3">
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

            {/* Main Content Scrollable */}
            <div className="flex-1 overflow-y-auto pb-20 custom-scrollbar">
                {/* Main Card */}
                <div className="mt-6 mx-4 md:max-w-3xl md:mx-auto relative z-10">

                    {/* Calendar Strip Mock */}
                    <div className="flex justify-between items-center mb-8 px-4 text-white/90">
                        <div className="text-4xl font-light opacity-60 hover:opacity-100 transition-opacity cursor-pointer transform hover:scale-110">21</div>
                        <div className="flex flex-col items-center bg-white/20 backdrop-blur-md px-6 py-2 rounded-2xl shadow-lg border border-white/20">
                            <div className="text-xs font-bold text-green-100 uppercase tracking-wider mb-1">Today</div>
                            <div className="text-sm font-bold text-white">22 October 2026</div>
                        </div>
                        <div className="text-4xl font-light opacity-60 hover:opacity-100 transition-opacity cursor-pointer transform hover:scale-110">23</div>
                    </div>

                    {/* Calorie Circle */}
                    <div className="rounded-[40px] bg-white/10 backdrop-blur-xl border border-white/30 p-6 relative shadow-2xl">
                        <div className="absolute top-6 right-6 animate-pulse">
                            <svg width="60" height="60" viewBox="0 0 100 100" className="opacity-90 drop-shadow-lg">
                                <path d="M50 10 C 20 10 10 40 10 50 S 30 90 50 90 S 90 60 90 50 S 80 10 50 10" fill="none" stroke="#FFFFFF" strokeWidth="3" />
                                {/* Abstract leaf shape */}
                                <path d="M50 20 Q 30 20 30 50 Q 30 80 50 80 Q 70 80 70 50 Q 70 20 50 20" fill="#FFFFFF" className="opacity-80" />
                            </svg>
                        </div>

                        <div className="mt-6 mb-10 pl-4 text-white">
                            <div className="text-7xl font-bold tracking-tight drop-shadow-sm">{dailyStats.calories.current}</div>
                            <div className="text-sm font-bold uppercase tracking-widest mt-1 opacity-90">kcal</div>
                            <div className="text-xs font-medium mt-1 opacity-80">from last consumed</div>
                        </div>

                        {/* Macros Grid */}
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="bg-white/20 rounded-2xl p-3 backdrop-blur-md border border-white/10">
                                <div className="text-xs text-green-50 mb-1 font-medium">Carbs</div>
                                <div className="text-xl font-bold text-white">{dailyStats.macros.carbs.value}</div>
                                <div className="text-xs opacity-70 font-bold text-white">{dailyStats.macros.carbs.label}</div>
                            </div>
                            <div className="bg-white/20 rounded-2xl p-3 backdrop-blur-md border border-white/10">
                                <div className="text-xs text-green-50 mb-1 font-medium">Protein</div>
                                <div className="text-xl font-bold text-white">{dailyStats.macros.protein.value}</div>
                                <div className="text-xs opacity-70 font-bold text-white">{dailyStats.macros.protein.label}</div>
                            </div>
                            <div className="bg-white/20 rounded-2xl p-3 backdrop-blur-md border border-white/10">
                                <div className="text-xs text-green-50 mb-1 font-medium">Fat</div>
                                <div className="text-xl font-bold text-white">{dailyStats.macros.fat.value}</div>
                                <div className="text-xs opacity-70 font-bold text-white">{dailyStats.macros.fat.label}</div>
                            </div>
                        </div>

                        {/* Activity Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-black/20 p-5 rounded-3xl flex items-center gap-4 border border-white/10 shadow-inner">
                                <div className="text-2xl bg-white/90 p-2 rounded-full shadow-sm">🔥</div>
                                <div className="text-white">
                                    <div className="text-xs font-bold uppercase tracking-wide opacity-70">Burned</div>
                                    <div className="text-xl font-bold">{dailyStats.burned} <span className="text-xs font-normal opacity-70">kcal</span></div>
                                </div>
                            </div>
                            <div className="bg-black/20 p-5 rounded-3xl flex items-center gap-4 border border-white/10 shadow-inner">
                                <div className="text-2xl bg-white/90 p-2 rounded-full shadow-sm">👟</div>
                                <div className="text-white">
                                    <div className="text-xs font-bold uppercase tracking-wide opacity-70">Steps</div>
                                    <div className="text-xl font-bold">{dailyStats.steps.value}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Consumption Sheet */}
                    <div className="bg-white rounded-t-[40px] px-8 pt-8 pb-12 mt-6 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] min-h-[300px]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-xl text-[#1F2933]">Today's Consumption</h3>
                            <button className="text-[#2E7D6B] hover:bg-[#2E7D6B]/10 p-2 rounded-full transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>

                        {/* List Items */}
                        <div className="space-y-4">
                            {consumptionHistory.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer group border border-transparent hover:border-gray-100">
                                    <img src={item.imageUrl} alt={item.name} className="w-14 h-14 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                                    <div className="flex-1">
                                        <div className="font-bold text-lg text-gray-800">{item.name}</div>
                                        <div className="text-xs text-[#2E7D6B] font-bold mt-1 bg-[#2E7D6B]/10 inline-block px-2 py-0.5 rounded-md">{item.calories} kcal • {item.weight}</div>
                                    </div>
                                    <div className="text-gray-300 group-hover:text-[#2E7D6B] transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Add Meal Button */}
                        <button className="w-full mt-8 py-4 rounded-2xl bg-[#FFD166] text-[#1F2933] font-bold text-lg shadow-lg shadow-[#FFD166]/30 hover:bg-[#ffda85] hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Add Meal
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WellnessTab;
