import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userData } from '../../data/store';

const MealCreationPage = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const [formData, setFormData] = useState({
        currentWeight: userData.weight,
        currentHeight: userData.height,
        activityLevel: 'Lightly Active',
        targetWeightLoss: '',
        proteinPreference: 'Moderate',
        dietPreference: 'Vegetarian',
        cuisineStyle: 'North Indian',
        planDuration: '1 Day'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreateMeal = () => {
        navigate('/meal-planner', { state: formData });
    };

    const handleLogout = () => {
        navigate('/login');
    };

    const InputField = ({ label, name, value, type = "text", placeholder, suffix }) => (
        <div className="relative group">
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide ml-1">{label}</label>
            <div className="relative">
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-[#A8E6CF] focus:ring-0 outline-none transition-all font-semibold text-gray-700 placeholder-gray-300 shadow-sm"
                />
                {suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">{suffix}</span>}
            </div>
        </div>
    );

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



            {/* Main Content */}
            <div className="flex-1 overflow-y-auto pb-10 custom-scrollbar px-4">
                <div className="w-full max-w-2xl mx-auto mt-6">
                    <div className="mb-6 ml-2 flex items-center justify-between text-white">
                        <div>
                            <h1 className="text-2xl font-bold">Create Your Meal</h1>
                            <p className="text-sm opacity-80">Let's craft your perfect plan</p>
                        </div>
                        <div className="flex gap-2">
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold border border-white/20">{userData.age} Years</span>
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold border border-white/20">{userData.gender}</span>
                        </div>
                    </div>

                    <div className="mt-[15%] bg-white/95 backdrop-blur-xl p-4 md:p-6 rounded-[32px] shadow-2xl border border-white/50 space-y-4 text-[#1F2933]">

                        {/* Section: Body Metrics */}
                        <div className="grid grid-cols-2 gap-3">
                            <InputField label="Current Weight" name="currentWeight" value={formData.currentWeight} placeholder="0" suffix="kg" type="number" />
                            <InputField label="Current Height" name="currentHeight" value={formData.currentHeight} placeholder="0" suffix="cm" type="number" />
                        </div>

                        {/* Section: Activity & Targets */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="relative group">
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide ml-1">Activity Level</label>
                                <div className="relative">
                                    <select
                                        name="activityLevel"
                                        value={formData.activityLevel}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-[#A8E6CF] focus:ring-0 outline-none transition-all font-semibold text-gray-700 appearance-none cursor-pointer shadow-sm"
                                    >
                                        {['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active'].map(level => (
                                            <option key={level} value={level}>{level}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <InputField label="Tgt Wt Loss/Month" name="targetWeightLoss" value={formData.targetWeightLoss} placeholder="0" suffix="kg" type="number" />
                        </div>


                        {/* Section: Preferences */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="relative group">
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide ml-1">Diet Preference</label>
                                <div className="relative">
                                    <select
                                        name="dietPreference"
                                        value={formData.dietPreference}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-[#A8E6CF] focus:ring-0 outline-none transition-all font-semibold text-gray-700 appearance-none cursor-pointer shadow-sm"
                                    >
                                        <option>Vegetarian</option>
                                        <option>Non-Vegetarian</option>
                                        <option>Eggitarian</option>
                                    </select>
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div className="relative group">
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide ml-1">Cuisine Style</label>
                                <div className="relative">
                                    <select
                                        name="cuisineStyle"
                                        value={formData.cuisineStyle}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-[#A8E6CF] focus:ring-0 outline-none transition-all font-semibold text-gray-700 appearance-none cursor-pointer shadow-sm"
                                    >
                                        <option>North Indian</option>
                                        <option>South Indian</option>
                                        <option>International</option>
                                        <option>Mixed</option>
                                    </select>
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section: Duration */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide ml-1">Plan Duration</label>
                            <div className="flex gap-3">
                                {['1 Day', '3 Days', '7 Days'].map((duration) => (
                                    <button
                                        key={duration}
                                        onClick={() => setFormData({ ...formData, planDuration: duration })}
                                        className={`flex-1 py-3 rounded-2xl border-2 font-bold text-sm transition-all duration-200 ${formData.planDuration === duration
                                            ? 'border-[#FFD166] bg-[#FFF8E1] text-gray-900 shadow-sm transform -translate-y-0.5'
                                            : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        {duration}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="pt-2">
                            <button
                                onClick={handleCreateMeal}
                                className="w-full py-4 bg-[#2E7D6B] text-white rounded-2xl font-bold text-lg shadow-[#2E7D6B]/30 shadow-lg hover:bg-[#256a5b] transform hover:-translate-y-1 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <span>Create Meal Plan</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MealCreationPage;
