import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userData } from '../../data/store';
import { foodDatabase } from '../../data/foodDatabase';

import TeaSmall from '../../assets/tea small.png';
import TeaMedium from '../../assets/tea medium.png';
import TeaLarge from '../../assets/tea large.png';
import MilkSmall from '../../assets/Milk Small.png';
import MilkMedium from '../../assets/Milk Medium.png';
import MilkLarge from '../../assets/Milk Large.png';
import CoffeeSmall from '../../assets/Coffee Small.png';
import CoffeeMedium from '../../assets/Coffee Medium.png';
import CoffeeLarge from '../../assets/Coffee Large.png';
import { LeafIcon, CoffeeBeanIcon, MilkIcon } from '../Icons/RefreshmentIcons';

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
        goalDuration: '1 Month', // Default to 1 Month
        proteinPreference: 'Moderate',
        dietPreference: 'Vegetarian',
        cuisineStyle: 'North Indian',
        planDuration: '1 Day',
        allergies: [],
        beverageSchedule: [] // Adapted structure to match MealPlannerPage requirements
    });

    const [currentStep, setCurrentStep] = useState(1);
    const [allergySearch, setAllergySearch] = useState('');
    const [allergyResults, setAllergyResults] = useState([]);

    // Refreshment Planner Tab State
    const [activeTab, setActiveTab] = useState('Tea');
    const [tempBev, setTempBev] = useState({
        time: 'Morning',
        vessel: 'Medium', // Matches 'cupSize' values expected: Small, Medium, Large
        quantity: 1,
        sugar: 0
    });

    const TABS = ['Tea', 'Coffee', 'Milk'];
    const TIME_SPANS = ['Morning', 'Afternoon', 'Evening', 'Night'];

    // Updated Vessel Config: Use Small, Medium, Large keys.
    // Tea/Coffee: Small, Medium, Large. Milk: Small, Large.
    const VESSELS = {
        Tea: [
            { id: 'Small', label: 'Small (100-150ml)', icon: TeaSmall, sizeClass: 'h-6' },
            { id: 'Medium', label: 'Medium (200-250ml)', icon: TeaMedium, sizeClass: 'h-7' },
            { id: 'Large', label: 'Large (300-350ml)', icon: TeaLarge, sizeClass: 'h-9' }
        ],
        Coffee: [
            { id: 'Small', label: 'Small (100-150ml)', icon: CoffeeSmall, sizeClass: 'h-6' },
            { id: 'Medium', label: 'Medium (200-250ml)', icon: CoffeeMedium, sizeClass: 'h-7' },
            { id: 'Large', label: 'Large (300-350ml)', icon: CoffeeLarge, sizeClass: 'h-9' }
        ],
        Milk: [
            { id: 'Small', label: 'Small (100-150ml)', icon: MilkSmall, sizeClass: 'h-6' },
            { id: 'Medium', label: 'Medium (200-250ml)', icon: MilkMedium, sizeClass: 'h-7' },
            { id: 'Large', label: 'Large (300-350ml)', icon: MilkLarge, sizeClass: 'h-9' }
        ]
    };

    const getMaxWeightLoss = (duration) => {
        if (duration === '1 Month') return 3;
        if (duration === '3 Months') return 10;
        if (duration === '6 Months') return 20;
        return 20;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'targetWeightLoss') {
            const max = getMaxWeightLoss(formData.goalDuration);
            if (parseFloat(value) > max) {
                // We can either clamp or just allow typing but show error. 
                // Let's allow typing but block Next, and ideally show a visual cue.
                // For now, let's just set it, we will validate in render or on Next.
            }
        }

        // If changing duration, we should strictly re-validate existing weight loss? 
        // Maybe later.

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateStep1 = () => {
        const max = getMaxWeightLoss(formData.goalDuration);
        const loss = parseFloat(formData.targetWeightLoss);
        if (loss > max) {
            alert(`For ${formData.goalDuration}, maximum weight loss allowed is ${max}kg.`);
            return false;
        }
        if (!formData.currentWeight || !formData.currentHeight || !formData.targetWeightLoss) {
            alert("Please fill in all fields.");
            return false;
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep1()) {
            setCurrentStep(2);
        }
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

    const handleLogout = () => {
        navigate('/login');
    };

    // --- New Refreshment Logic ---

    const handleAddRefreshment = () => {
        const baseCalories = activeTab === 'Tea' ? 30 : activeTab === 'Coffee' ? 40 : 120;
        const slotMap = { 'Morning': 'breakfast', 'Afternoon': 'lunch', 'Evening': 'snacks', 'Night': 'dinner' };
        const targetSlot = slotMap[tempBev.time];

        // Check for duplicate slot usage for this beverage type
        const existing = formData.beverageSchedule.find(b => b.name === activeTab && b.slots[targetSlot]?.active);
        if (existing) {
            alert(`You already have a ${activeTab} scheduled for ${tempBev.time}. Please remove it first to change details.`);
            return;
        }

        const newBev = {
            id: Date.now(),
            name: activeTab,
            category: 'Liquid',
            type: activeTab,
            calories: baseCalories,
            protein: activeTab === 'Milk' ? 8 : 1,
            carbs: activeTab === 'Milk' ? 12 : 2,
            fats: activeTab === 'Milk' ? 5 : 0,
            slots: {
                breakfast: { active: false, cupSize: 'Medium', quantity: 1, sugarTabs: 0 },
                lunch: { active: false, cupSize: 'Medium', quantity: 1, sugarTabs: 0 },
                snacks: { active: false, cupSize: 'Medium', quantity: 1, sugarTabs: 0 },
                dinner: { active: false, cupSize: 'Medium', quantity: 1, sugarTabs: 0 },
                [targetSlot]: {
                    active: true,
                    cupSize: tempBev.vessel,
                    quantity: tempBev.quantity,
                    sugarTabs: tempBev.sugar
                }
            },
            withSugar: tempBev.sugar > 0 // Required for Planner calculation
        };

        setFormData(prev => ({
            ...prev,
            beverageSchedule: [...prev.beverageSchedule, newBev]
        }));

        // Reset specific fields only if desired, or keep for rapid entry. 
        // Resetting quantity to 1 seems reasonable.
        setTempBev(prev => ({ ...prev, quantity: 1, sugar: 0 }));
    };

    const removeBeverage = (id) => {
        setFormData(prev => ({
            ...prev,
            beverageSchedule: prev.beverageSchedule.filter(b => b.id !== id)
        }));
    };

    const savedRows = formData.beverageSchedule;

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

                    <div className="mt-8 bg-white/94 backdrop-blur-xl p-6 md:p-8 rounded-[32px] shadow-2xl border border-white/50 text-[#1F2933]">
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
                                    <div className="relative group">
                                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide ml-1">Duration to Achieve</label>
                                        <div className="relative">
                                            <select
                                                name="goalDuration"
                                                value={formData.goalDuration}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-[#A8E6CF] focus:ring-0 outline-none transition-all font-semibold text-gray-700 appearance-none cursor-pointer shadow-sm"
                                            >
                                                {['1 Month', '3 Months', '6 Months'].map(d => (
                                                    <option key={d}>{d}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="relative group">
                                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide ml-1">Total Weight to Lose</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="targetWeightLoss"
                                                value={formData.targetWeightLoss}
                                                onChange={handleChange}
                                                placeholder={`Max ${getMaxWeightLoss(formData.goalDuration)}kg`}
                                                className={`w-full px-4 py-3 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:ring-0 outline-none transition-all font-semibold text-gray-700 placeholder-gray-300 shadow-sm ${parseFloat(formData.targetWeightLoss) > getMaxWeightLoss(formData.goalDuration) ? 'border-red-400 focus:border-red-500 text-red-600' : 'focus:border-[#A8E6CF]'}`}
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">kg</span>
                                        </div>
                                        {parseFloat(formData.targetWeightLoss) > getMaxWeightLoss(formData.goalDuration) && (
                                            <div className="text-[10px] text-red-500 font-bold mt-1 ml-1 animate-pulse">
                                                Max allowed is {getMaxWeightLoss(formData.goalDuration)}kg for {formData.goalDuration}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
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
                                </div>
                                <div className="grid grid-cols-2 gap-4">
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
                                        onClick={handleNext}
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
                            <div className="space-y-3 animate-fade-in text-gray-800">
                                <div className="mb-2">
                                    <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                                        <span className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-sm shadow-sm border border-blue-100/50">🥤</span>
                                        Beverages Planner
                                    </h2>
                                </div>

                                {/* Saved List - ALL Beverages */}
                                <div className="bg-gray-50/50 rounded-2xl border border-gray-100 min-h-[60px] max-h-64 overflow-y-auto custom-scrollbar relative">

                                    <div className="space-y-2 p-2 pt-1">
                                        {savedRows.length === 0 ? (
                                            <div className="text-center py-4 text-xs text-gray-400 italic">No beverages added yet.</div>
                                        ) : (
                                            savedRows.map(row => {
                                                const activeSlotName = Object.keys(row.slots).find(k => row.slots[k].active);
                                                const slotData = row.slots[activeSlotName];
                                                const mapSpan = Object.entries({ 'breakfast': 'Morning', 'lunch': 'Afternoon', 'snacks': 'Evening', 'dinner': 'Night' }).find(([k, v]) => k === activeSlotName)?.[1] || activeSlotName;
                                                return (
                                                    <div key={row.id} className="bg-white p-3 rounded-xl border border-gray-200 flex items-center justify-between shadow-sm">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-xs">
                                                                {row.name === 'Tea' ? <LeafIcon className="w-5 h-5" /> : row.name === 'Coffee' ? <CoffeeBeanIcon className="w-5 h-5" /> : <MilkIcon className="w-5 h-5" />}
                                                            </div>
                                                            <div>
                                                                <div className="text-xs font-bold text-gray-800">{mapSpan} <span className="text-gray-400 font-normal">• {row.name}</span></div>
                                                                <div className="text-[10px] text-gray-500 font-medium">
                                                                    {slotData.quantity}x {slotData.cupSize} • {slotData.sugarTabs} sugar
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button onClick={() => removeBeverage(row.id)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="flex bg-gray-50 p-1 rounded-2xl">
                                    {TABS.map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => { setActiveTab(tab); setTempBev(prev => ({ ...prev, vessel: tab === 'Milk' && prev.vessel === 'Medium' ? 'Small' : prev.vessel })); }}
                                            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeTab === tab ? 'bg-white text-[#2E7D6B] shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                            {tab === 'Tea' ? <LeafIcon className="w-5 h-5" /> : tab === 'Coffee' ? <CoffeeBeanIcon className="w-5 h-5" /> : <MilkIcon className="w-5 h-5" />}
                                            <span>{tab}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Compact Add Form - Split Layout */}
                                <div className="bg-white border-2 border-[#E0F2F1] rounded-2xl p-3 shadow-lg shadow-[#2E7D6B]/5 relative overflow-hidden">
                                    <div className="relative z-10 space-y-2">
                                        <div className="flex items-end gap-2">
                                            <div className="w-[35%]">
                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-0.5 pl-1">Time</label>
                                                <div className="relative">
                                                    <select
                                                        value={tempBev.time}
                                                        onChange={(e) => setTempBev(prev => ({ ...prev, time: e.target.value }))}
                                                        className="w-full pl-2 pr-6 py-1.5 rounded-lg bg-gray-50 border-2 border-transparent focus:bg-white focus:border-[#2E7D6B] outline-none text-xs font-bold text-gray-700 appearance-none transition-all"
                                                    >
                                                        {TIME_SPANS.map(time => (
                                                            <option key={time} value={time}>{time}</option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex-1">
                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-0.5 text-center">Container</label>
                                                <div className="flex gap-1 justify-end h-full">
                                                    {VESSELS[activeTab].map((v) => (
                                                        <button
                                                            key={v.id}
                                                            onClick={() => setTempBev(prev => ({ ...prev, vessel: v.id }))}
                                                            className={`flex-1 flex flex-col items-center justify-between p-1 rounded-lg border-2 transition-all h-[56px] text-center ${tempBev.vessel === v.id ? 'border-[#2E7D6B] bg-[#F0FDF9] shadow-sm' : 'border-gray-50 bg-gray-50 hover:bg-white hover:border-gray-200'} `}
                                                            title={v.label}
                                                        >
                                                            <div className="flex-1 flex items-center justify-center">
                                                                <img src={v.icon} alt={v.id} className="h-6 w-auto object-contain" />
                                                            </div>
                                                            <div className="flex flex-col items-center w-full leading-tight">
                                                                <span className={`text-[9px] font-bold ${tempBev.vessel === v.id ? 'text-[#2E7D6B]' : 'text-gray-700'}`}>{v.id}</span>
                                                                <span className={`text-[7.5px] font-semibold whitespace-nowrap ${tempBev.vessel === v.id ? 'text-[#2E7D6B]/80' : 'text-gray-500'}`}>{v.label.match(/\((.*?)\)/)?.[1] || ''}</span>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-end gap-2">
                                            <div className="w-[28%]">
                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-0.5 text-center">Cups</label>
                                                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-0.5 border border-gray-100 h-8">
                                                    <button onClick={() => setTempBev(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))} className="w-6 h-full rounded-md hover:bg-white text-gray-400 hover:text-red-500 flex items-center justify-center font-bold text-xs transition-colors">-</button>
                                                    <span className="font-bold text-xs text-gray-800">{tempBev.quantity}</span>
                                                    <button onClick={() => setTempBev(prev => ({ ...prev, quantity: prev.quantity + 1 }))} className="w-6 h-full rounded-md bg-[#2E7D6B] text-white shadow-sm flex items-center justify-center font-bold text-xs">+</button>
                                                </div>
                                            </div>

                                            <div className="w-[28%]">
                                                <label className="text-[9px] font-black text-yellow-600/60 uppercase tracking-widest block mb-0.5 text-center">Sugar(tsp)</label>
                                                <div className="flex items-center justify-between bg-yellow-50/30 rounded-lg p-0.5 border border-yellow-100/50 h-8">
                                                    <button onClick={() => setTempBev(prev => ({ ...prev, sugar: Math.max(0, prev.sugar - 0.5) }))} className="w-6 h-full rounded-md hover:bg-white text-yellow-600 hover:text-yellow-700 flex items-center justify-center font-bold text-xs transition-colors">-</button>
                                                    <span className="font-bold text-xs text-yellow-800">{tempBev.sugar}</span>
                                                    <button onClick={() => setTempBev(prev => ({ ...prev, sugar: prev.sugar + 0.5 }))} className="w-6 h-full rounded-md bg-[#FFD166] text-white shadow-sm flex items-center justify-center font-bold text-xs">+</button>
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleAddRefreshment}
                                                className="flex-1 h-8 bg-gray-900 text-white rounded-lg font-bold text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1 hover:bg-black mt-auto"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-2">
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
