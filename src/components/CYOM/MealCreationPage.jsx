import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userData } from '../../data/store';
import { foodDatabase } from '../../data/foodDatabase';

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
                slots: { breakfast: true, lunch: false, snacks: false, dinner: false },
                withSugar: false
            }]
        }));
        setBevSearch('');
        setBevResults([]);
    };

    const updateBevSlot = (bevId, slot) => {
        setFormData(prev => ({
            ...prev,
            beverageSchedule: prev.beverageSchedule.map(b =>
                b.id === bevId ? { ...b, slots: { ...b.slots, [slot]: !b.slots[slot] } } : b
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
                                        Next: Beverage Schedule
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-fade-in text-gray-800">
                                <div className="bg-green-50/50 p-4 rounded-2xl border border-green-100 font-medium">
                                    <h3 className="text-sm font-bold text-green-800 mb-1 flex items-center gap-2">
                                        <span className="text-lg">☕</span> Beverage Schedule
                                    </h3>
                                    <p className="text-[11px] text-green-600">Add drinks to your daily routine. We'll balance your meal calories accordingly.</p>
                                </div>
                                <div className="relative group">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={bevSearch}
                                            onChange={(e) => handleBevSearch(e.target.value)}
                                            placeholder="Search beverages (Milk, Coffee, Tea...)"
                                            className="w-full px-4 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-[#A8E6CF] focus:ring-0 outline-none transition-all font-semibold text-gray-700 placeholder-gray-400 shadow-sm"
                                        />
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                        </div>
                                        {bevResults.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 max-h-56 overflow-y-auto custom-scrollbar">
                                                {bevResults.map(bev => (
                                                    <button key={bev.id} onClick={() => addBeverage(bev)} className="w-full text-left px-5 py-4 hover:bg-green-50 flex items-center justify-between border-b last:border-0 border-gray-50 transition-colors">
                                                        <div>
                                                            <div className="text-sm font-bold text-gray-800">{bev.name}</div>
                                                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-0.5">{bev.calories} kcal / serving</div>
                                                        </div>
                                                        <div className="p-2 bg-[#2E7D6B] rounded-xl shadow-lg shadow-[#2E7D6B]/20 text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg></div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {formData.beverageSchedule.map(bev => (
                                        <div key={bev.id} className="p-5 rounded-[28px] bg-white border border-gray-100 shadow-sm space-y-4 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-2">
                                                <button onClick={() => removeBeverage(bev.id)} className="p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-full transition-all">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center text-xl">☕</div>
                                                <div>
                                                    <div className="font-bold text-gray-800 text-base">{bev.name}</div>
                                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">Base: {bev.calories} kcal</div>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2 pt-1 font-bold">
                                                {['breakfast', 'lunch', 'snacks', 'dinner'].map(slot => (
                                                    <button
                                                        key={slot}
                                                        onClick={() => updateBevSlot(bev.id, slot)}
                                                        className={`px-4 py-2 rounded-xl text-[10px] uppercase tracking-wider transition-all ${bev.slots[slot] ? 'bg-[#2E7D6B] text-white shadow-lg shadow-[#2E7D6B]/20' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        {slot}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => toggleSugar(bev.id)}
                                                        className={`w-12 h-6 rounded-full relative transition-all duration-300 ${bev.withSugar ? 'bg-[#FFD166]' : 'bg-gray-200'}`}
                                                    >
                                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${bev.withSugar ? 'left-7' : 'left-1'}`}></div>
                                                    </button>
                                                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">With Sugar {bev.withSugar && <span className="text-[#FFD166] text-xs ml-1 font-black">(+40 KCAL)</span>}</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Sub-Total</div>
                                                    <div className="text-sm font-black text-gray-700">
                                                        {((bev.calories + (bev.withSugar ? 40 : 0)) * Object.values(bev.slots).filter(Boolean).length)} kcal
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {formData.beverageSchedule.length === 0 && (
                                        <div className="py-16 text-center border-4 border-dashed border-gray-50 rounded-[40px] bg-gray-50/20">
                                            <div className="text-4xl mb-3 opacity-20">🥤</div>
                                            <p className="text-sm text-gray-300 font-bold uppercase tracking-widest">No Beverages added</p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => setCurrentStep(1)}
                                        className="px-8 py-4 bg-white border-2 border-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-95 shadow-sm"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleCreateMeal}
                                        className="flex-1 py-4 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-orange-200 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
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
        </div>
    );
};

export default MealCreationPage;
