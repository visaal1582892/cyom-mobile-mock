import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userData } from '../../data/store';

const CYOMDashboard = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleLogout = () => {
        navigate('/login');
    };

    const options = [
        {
            title: "Create New Plan",
            path: "/goal-selection",
            iconEmoji: "📝",
            colorClass: "bg-orange-50 text-orange-500",
            hoverClass: "group-hover:text-orange-600"
        },
        {
            title: "Track Your Meal",
            path: "/meal-tracker",
            iconEmoji: "🥗",
            colorClass: "bg-green-50 text-[#2E7D6B]",
            hoverClass: "group-hover:text-[#2E7D6B]"
        },
        {
            title: "Saved Plans",
            path: "/saved-plans",
            iconEmoji: "📂",
            colorClass: "bg-blue-50 text-blue-500",
            hoverClass: "group-hover:text-blue-600"
        }
    ];

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#43AA95] to-[#A8E6CF] font-sans relative overflow-hidden text-white">

            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-full h-[50vh] bg-gradient-to-b from-black/10 to-transparent pointer-events-none"></div>

            {/* Header / Status Bar Area */}
            <div className="pt-6 px-6 flex justify-between items-center relative z-20">
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsMenuOpen(true)} className="p-2 rounded-full hover:bg-white/20 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                    </button>
                    <div>
                        <div className="text-xs opacity-80 font-medium text-green-100">Welcome</div>
                        <div className="flex items-center gap-2">
                            <div className="text-lg font-bold">{userData.name}! </div>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/50 shadow-md hover:border-white transition-all"
                    >
                        <img src={userData.image} alt="Profile" className="w-full h-full object-cover" />
                    </button>

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

            {/* Sidebar Menu */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-50 flex text-[#1F2933]">
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
                                <button onClick={() => { navigate('/cyom-dashboard'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-600 font-medium flex items-center gap-3">
                                    <span className="text-lg">📊</span> Dashboard
                                </button>
                                <button onClick={() => { navigate('/goal-selection'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl bg-[#F0FDF9] text-[#2E7D6B] font-bold flex items-center gap-3">
                                    <span className="text-lg">🎯</span> Goal Selection
                                </button>
                                <button onClick={() => { navigate('/saved-plans'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-600 font-medium flex items-center gap-3">
                                    <span className="text-lg">📂</span> Saved Plans
                                </button>
                                <button onClick={() => { navigate('/'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-600 font-medium flex items-center gap-3">
                                    <span className="text-lg">🏠</span> Back to Home
                                </button>
                            </div>
                        </div>
                        <div className="text-center text-xs text-gray-400">v1.0.0 CYOM Beta</div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
                <div className="w-full max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[40px] shadow-2xl">
                    <div className="text-center mb-8 text-white">
                        <h2 className="text-2xl font-bold mb-1">What would you like to do?</h2>
                        <p className="opacity-80 text-sm">Select an option to proceed</p>
                    </div>

                    <div className="space-y-4">
                        {options.map((opt, idx) => (
                            <button
                                key={idx}
                                onClick={() => navigate(opt.path)}
                                className="w-full h-20 px-6 bg-white hover:bg-white/90 border-2 border-transparent rounded-3xl flex items-center justify-between shadow-lg transition-all transform hover:-translate-y-1 group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full ${opt.colorClass} flex items-center justify-center text-xl group-hover:scale-110 transition-transform`}>
                                        {opt.iconEmoji}
                                    </div>
                                    <span className="font-bold text-lg text-[#1F2933] group-hover:text-[#2E7D6B] transition-colors">{opt.title}</span>
                                </div>
                                <div className="p-2 bg-[#2E7D6B]/10 rounded-full text-[#2E7D6B] transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>


            </div>
        </div>
    );
};

export default CYOMDashboard;
