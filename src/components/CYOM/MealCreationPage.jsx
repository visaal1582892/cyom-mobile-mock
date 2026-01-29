import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userData } from '../../data/store';
import { foodDatabase } from '../../data/foodDatabase';

import SmallCup from '../../assets/small_cup.png';
import MediumCup from '../../assets/medium_cup.png';
import LargeCup from '../../assets/large_cup.png';

const InputField = ({ label, name, value, type = "text", placeholder, suffix, onChange }) => (
    <div className="relative group">
        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide ml-1">{label}</label>
        <div className="relative">
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-[#A8E6CF] focus:ring-0 outline-none transition-all font-semibold text-gray-700 placeholder-gray-300 shadow-sm"
            />
            {suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">{suffix}</span>}
        </div>
    </div>
);

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
        planDuration: '1 Day',
        allergies: [],
        beverageSchedule: [] // [{ name, id, slots: { breakfast, lunch, snacks, dinner }, withSugar: false }]
    });

    const [currentStep, setCurrentStep] = useState(1);
    const [allergySearch, setAllergySearch] = useState('');
    const [allergyResults, setAllergyResults] = useState([]);

    // Beverage specific state
    const [bevSearch, setBevSearch] = useState('');
    const [bevResults, setBevResults] = useState([]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreateMeal = () => {
        navigate('/meal-planner', { state: formData });
    };

    const handleAllergySearch = (val) => {
        setAllergySearch(val);
        if (val.trim()) {
            const ingredients = new Set();
            foodDatabase.forEach(item => {
                if (item.name.toLowerCase().includes(val.toLowerCase())) {
                    ingredients.add(item.name);
                }
                if (item.composition) {
                    item.composition.forEach(comp => {
                        if (comp.name.toLowerCase().includes(val.toLowerCase())) {
                            ingredients.add(comp.name);
                        }
                    });
                }
            });
            setAllergyResults(Array.from(ingredients).filter(ing => !formData.allergies.includes(ing)).slice(0, 10));
        } else {
            setAllergyResults([]);
        }
    };

    const addAllergy = (ing) => {
        setFormData(prev => ({
            ...prev,
            allergies: [...prev.allergies, ing]
        }));
        setAllergySearch('');
        setAllergyResults([]);
    };

    const removeAllergy = (ing) => {
        setFormData(prev => ({
            ...prev,
            allergies: prev.allergies.filter(a => a !== ing)
        }));
    };

    const handleBevSearch = (val) => {
        setBevSearch(val);
        if (val.trim()) {
            const results = foodDatabase.filter(f =>
                (f.category === 'Liquid' || f.subType === 'Drink') &&
                f.name.toLowerCase().includes(val.toLowerCase())
            );
            setBevResults(results.slice(0, 10));
        } else {
            setBevResults([]);
        }
    };

    const addBeverage = (bev) => {
        if (formData.beverageSchedule.some(b => b.id === bev.id)) return;
        setFormData(prev => ({
            ...prev,
            beverageSchedule: [...prev.beverageSchedule, {
                ...bev,
                slots: {
                    breakfast: { active: true, cupSize: 'Medium', quantity: 1, sugarTabs: 0 },
                    lunch: { active: false, cupSize: 'Medium', quantity: 1, sugarTabs: 0 },
                    snacks: { active: false, cupSize: 'Medium', quantity: 1, sugarTabs: 0 },
                    dinner: { active: false, cupSize: 'Medium', quantity: 1, sugarTabs: 0 }
                },
                withSugar: false
            }]
        }));
        setBevSearch('');
        setBevResults([]);
    };

    const updateBevSlot = (bevId, slot, field, value) => {
        setFormData(prev => ({
            ...prev,
            beverageSchedule: prev.beverageSchedule.map(b =>
                b.id === bevId ? {
                    ...b,
                    slots: {
                        ...b.slots,
                        [slot]: { ...b.slots[slot], [field]: value }
                    }
                } : b
            )
        }));
    };

    const toggleBevSlot = (bevId, slot) => {
        setFormData(prev => ({
            ...prev,
            beverageSchedule: prev.beverageSchedule.map(b =>
                b.id === bevId ? {
                    ...b,
                    slots: {
                        ...b.slots,
                        [slot]: { ...b.slots[slot], active: !b.slots[slot].active }
                    }
                } : b
            )
        }));
    };

    const toggleSugar = (bevId) => {
        setFormData(prev => ({
            ...prev,
            beverageSchedule: prev.beverageSchedule.map(b =>
                b.id === bevId ? { ...b, withSugar: !b.withSugar } : b
            )
        }));
    };

    const removeBeverage = (bevId) => {
        setFormData(prev => ({
            ...prev,
            beverageSchedule: prev.beverageSchedule.filter(b => b.id !== bevId)
        }));
    };

    const handleLogout = () => {
        navigate('/login');
    };

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
                        <div className="text-xs opacity-80 font-medium text-green-100">Good Morning</div>
                        <div className="text-lg font-bold">{userData.name}! 👋</div>
                    </div>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/50 shadow-md hover:border-white transition-all"
                    >
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-[10px]">
                            USER
                        </div>
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
                            </div>
                        </div>
                        <div className="text-center text-xs text-gray-400">v1.0.0 CYOM Beta</div>
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
                        <div className="flex gap-2 text-white">
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold border border-white/20">{userData.age} Years</span>
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold border border-white/20 uppercase">{userData.gender}</span>
                        </div>
                    </div>

                    <div className="mt-8 bg-white/95 backdrop-blur-xl p-6 md:p-8 rounded-[32px] shadow-2xl border border-white/50 text-[#1F2933]">
                        {/* Progress Header */}
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex gap-2">
                                <div className={`h-1.5 w-16 rounded-full transition-all duration-500 ${currentStep === 1 ? 'bg-[#FFD166] shadow-[0_0_10px_rgba(255,209,102,0.5)]' : 'bg-green-400'}`}></div>
                                <div className={`h-1.5 w-16 rounded-full transition-all duration-500 ${currentStep === 2 ? 'bg-[#FFD166] shadow-[0_0_10px_rgba(255,209,102,0.5)]' : 'bg-gray-100'}`}></div>
                            </div>
                            <span className="text-[10px] font-black text-gray-400 tracking-widest uppercase">Phase {currentStep} of 2</span>
                        </div>

                        {currentStep === 1 ? (
                            <div className="space-y-5 animate-fade-in">
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="Current Weight" name="currentWeight" value={formData.currentWeight} placeholder="0" suffix="kg" type="number" onChange={handleChange} />
                                    <InputField label="Current Height" name="currentHeight" value={formData.currentHeight} placeholder="0" suffix="cm" type="number" onChange={handleChange} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="Tgt Loss/Mo" name="targetWeightLoss" value={formData.targetWeightLoss} placeholder="0" suffix="kg" type="number" onChange={handleChange} />
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
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative group">
                                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide ml-1">Diet Preference</label>
                                        <select
                                            name="dietPreference"
                                            value={formData.dietPreference}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-[#A8E6CF] focus:ring-0 outline-none transition-all font-semibold text-gray-700 appearance-none cursor-pointer shadow-sm"
                                        >
                                            <option>Vegetarian</option>
                                            <option>Non-Vegetarian</option>
                                            <option>Eggetarian</option>
                                        </select>
                                    </div>
                                    <div className="relative group">
                                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide ml-1">Cuisine Style</label>
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
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative group">
                                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide ml-1">Plan Duration</label>
                                        <select
                                            name="planDuration"
                                            value={formData.planDuration}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-[#A8E6CF] focus:ring-0 outline-none transition-all font-semibold text-gray-700 appearance-none cursor-pointer shadow-sm"
                                        >
                                            {['1 Day', '3 Days', '7 Days'].map(d => (
                                                <option key={d}>{d}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="relative group">
                                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide ml-1">Allergies</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={allergySearch}
                                                onChange={(e) => handleAllergySearch(e.target.value)}
                                                placeholder="Search..."
                                                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-[#A8E6CF] focus:ring-0 outline-none transition-all font-semibold text-gray-700 placeholder-gray-300 shadow-sm"
                                            />
                                            {allergyResults.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 max-h-48 overflow-y-auto custom-scrollbar">
                                                    {allergyResults.map(res => (
                                                        <button key={res} onClick={() => addAllergy(res)} className="w-full text-left px-4 py-2 hover:bg-green-50 text-gray-700 font-medium text-sm transition-colors">{res}</button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {formData.allergies.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {formData.allergies.map(all => (
                                            <span key={all} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-[10px] font-bold border border-red-100 flex items-center gap-2">
                                                {all}
                                                <button onClick={() => removeAllergy(all)} className="hover:text-red-800"><svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div className="pt-4">
                                    <button
                                        onClick={() => setCurrentStep(2)}
                                        className="w-full py-4 bg-gradient-to-r from-[#2E7D6B] to-[#469C85] text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
                                    >
                                        Next
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-fade-in text-gray-800">
                                <div className="mb-4">
                                    <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                                        <span className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-sm shadow-sm border border-blue-100/50">🥤</span>
                                        Refreshment Planner
                                    </h2>
                                </div>

                                <div className="relative group">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={bevSearch}
                                            onChange={(e) => handleBevSearch(e.target.value)}
                                            placeholder="Search drinks (Milk, Coffee, Tea...)"
                                            className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-[#A8E6CF] focus:ring-0 outline-none transition-all font-bold text-gray-700 placeholder-gray-400 shadow-sm"
                                        />
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                        </div>
                                        {bevResults.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 max-h-56 overflow-y-auto custom-scrollbar">
                                                {bevResults.map(bev => (
                                                    <button key={bev.id} onClick={() => addBeverage(bev)} className="w-full text-left px-5 py-3 hover:bg-green-50 flex items-center justify-between border-b last:border-0 border-gray-50 transition-colors">
                                                        <div>
                                                            <div className="text-sm font-bold text-gray-800">{bev.name}</div>
                                                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-0.5">{bev.calories} kcal / serving</div>
                                                        </div>
                                                        <div className="p-2 bg-[#2E7D6B] rounded-xl shadow-lg shadow-[#2E7D6B]/20 text-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg></div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1.5 custom-scrollbar">
                                    {formData.beverageSchedule.map(bev => (
                                        <div key={bev.id} className="p-3.5 rounded-[28px] bg-white border border-gray-100 shadow-sm space-y-3 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-1.5 z-10">
                                                <button onClick={() => removeBeverage(bev.id)} className="p-1.5 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-full transition-all">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center text-sm">🥤</div>
                                                <div className="flex-1">
                                                    <div className="font-black text-gray-800 text-sm leading-tight">{bev.name}</div>
                                                    <div className="text-[8px] text-gray-400 font-black uppercase tracking-widest leading-none">Base: {bev.calories} kcal</div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-2">
                                                {['breakfast', 'lunch', 'snacks', 'dinner'].map(slot => (
                                                    <div key={slot} className={`p-2.5 rounded-xl border transition-all ${bev.slots[slot].active ? 'bg-green-50/20 border-green-100/50' : 'bg-gray-50/20 border-transparent opacity-50'}`}>
                                                        <div className="flex items-center justify-between mb-1.5">
                                                            <button
                                                                onClick={() => toggleBevSlot(bev.id, slot)}
                                                                className={`flex items-center gap-2 font-black text-[9px] uppercase tracking-wider transition-all ${bev.slots[slot].active ? 'text-[#2E7D6B]' : 'text-gray-400'}`}
                                                            >
                                                                <div className={`w-3.5 h-3.5 rounded-md border-2 flex items-center justify-center transition-all ${bev.slots[slot].active ? 'bg-[#2E7D6B] border-[#2E7D6B]' : 'border-gray-200'}`}>
                                                                    {bev.slots[slot].active && <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="M5 13l4 4L19 7" /></svg>}
                                                                </div>
                                                                {slot}
                                                            </button>
                                                        </div>

                                                        {bev.slots[slot].active && (
                                                            <div className="flex flex-col gap-3 animate-fade-in pl-1">
                                                                <div className="flex items-center justify-between gap-4">
                                                                    <div className="flex-1">
                                                                        <label className="text-[7px] font-black text-gray-400 uppercase tracking-widest block mb-1">Cup Size</label>
                                                                        <div className="flex gap-1">
                                                                            {[
                                                                                { id: 'S', img: LargeCup, full: 'Small', sizeClass: 'h-5 ' },
                                                                                { id: 'M', img: LargeCup, full: 'Medium', sizeClass: 'h-6' },
                                                                                { id: 'L', img: LargeCup, full: 'Large', sizeClass: 'h-7' }
                                                                            ].map(cup => (
                                                                                <button
                                                                                    key={cup.id}
                                                                                    onClick={() => updateBevSlot(bev.id, slot, 'cupSize', cup.full)}
                                                                                    className={`flex-1 h-10 flex items-end justify-center pb-1 rounded-lg border-2 transition-all ${bev.slots[slot].cupSize === cup.full ? 'border-[#2E7D6B] bg-white shadow-sm' : 'border-transparent hover:bg-white/50'}`}
                                                                                >
                                                                                    <img src={cup.img} alt={cup.id} className={`${cup.sizeClass} w-auto object-contain transition-all`} />
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    <div className="w-20">
                                                                        <label className="text-[7px] font-black text-gray-400 uppercase tracking-widest block mb-1">Qty</label>
                                                                        <div className="flex items-center justify-between bg-white rounded-lg border px-1 h-7">
                                                                            <button onClick={() => updateBevSlot(bev.id, slot, 'quantity', Math.max(1, bev.slots[slot].quantity - 1))} className="text-gray-300 hover:text-red-500 font-black"><svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M20 12H4" /></svg></button>
                                                                            <span className="font-black text-gray-700 text-[9px]">{bev.slots[slot].quantity}</span>
                                                                            <button onClick={() => updateBevSlot(bev.id, slot, 'quantity', bev.slots[slot].quantity + 1)} className="text-[#2E7D6B] font-black"><svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M12 4v16m8-8H4" /></svg></button>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center justify-between bg-yellow-50/20 p-2 rounded-lg border border-yellow-100/20">
                                                                    <div className="text-[8px] font-black text-yellow-600 uppercase tracking-wider flex items-center gap-1">
                                                                        <span className="text-[10px]">🍯</span> Sugar (tbsp)
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <button onClick={() => updateBevSlot(bev.id, slot, 'sugarTabs', Math.max(0, (bev.slots[slot].sugarTabs || 0) - 0.5))} className="w-5 h-5 flex items-center justify-center bg-white rounded-md border border-yellow-200 text-yellow-600 font-black text-[10px]">-</button>
                                                                        <span className="w-5 text-center text-[9px] font-black text-yellow-700">{bev.slots[slot].sugarTabs || 0}</span>
                                                                        <button onClick={() => updateBevSlot(bev.id, slot, 'sugarTabs', (bev.slots[slot].sugarTabs || 0) + 0.5)} className="w-5 h-5 flex items-center justify-center bg-white rounded-md border border-yellow-200 text-yellow-600 font-black text-[10px]">+</button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-between pt-2.5 border-t border-gray-50/50">
                                                <div></div>
                                                <div className="text-right">
                                                    <div className="text-[7px] text-gray-400 font-black uppercase tracking-widest leading-none mb-0.5">Total Daily</div>
                                                    <div className="text-[13px] font-black text-[#2E7D6B]">
                                                        {Object.values(bev.slots).reduce((acc, s) => {
                                                            if (!s.active) return acc;
                                                            const sizeMult = s.cupSize === 'Small' ? 0.7 : s.cupSize === 'Large' ? 1.5 : 1;
                                                            const sugarCals = (s.sugarTabs || 0) * 40;
                                                            return acc + (Math.round(bev.calories * sizeMult + sugarCals) * s.quantity);
                                                        }, 0)} kcal
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {formData.beverageSchedule.length === 0 && (
                                        <div className="py-12 text-center border-4 border-dashed border-gray-50 rounded-[40px] bg-gray-50/20">
                                            <div className="text-3xl mb-2 opacity-20">🥤</div>
                                            <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest">No Drinks Added</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => setCurrentStep(1)}
                                        className="px-6 py-3 bg-white border-2 border-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-95 shadow-sm"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleCreateMeal}
                                        className="flex-1 py-3 bg-gradient-to-r from-[#2E7D6B] to-[#469C85] text-white rounded-2xl font-bold shadow-xl shadow-[#2E7D6B]/40 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                                    >
                                        Create My Plan
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default MealCreationPage;
