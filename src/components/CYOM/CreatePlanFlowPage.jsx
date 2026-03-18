import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userData } from '../../data/store';
import { motion, AnimatePresence } from 'framer-motion';
import CommonNavbar from './CommonNavbar';
import MultiSelectDropdown from '../UI/MultiSelectDropdown';
import { generateWorkoutPlan } from '../../utils/generateWorkoutPlan';
import exerciseLoadingVideo from '../../assets/execise loading.mp4';

import TeaSmall from '../../assets/tea small.png';
import TeaMedium from '../../assets/tea medium.png';
import TeaLarge from '../../assets/tea large.png';
import MilkSmall from '../../assets/Milk Small.png';
import MilkMedium from '../../assets/Milk Medium.png';
import MilkLarge from '../../assets/Milk Large.png';
import CoffeeSmall from '../../assets/Coffee Small.png';
import CoffeeMedium from '../../assets/Coffee Medium.png';
import CoffeeLarge from '../../assets/Coffee Large.png';
import TeaTabIcon from '../../assets/tea_tab.png';
import CoffeeTabIcon from '../../assets/coffee_tab.png';
import MilkTabIcon from '../../assets/milk_tab.png';
import { LeafIcon, CoffeeBeanIcon, MilkIcon } from '../Icons/RefreshmentIcons';

const MEAL_SLOTS = [
    { id: 'breakfast', label: 'Breakfast' },
    { id: 'morningSnack', label: 'Morning Snack' },
    { id: 'lunch', label: 'Lunch' },
    { id: 'snacks', label: 'Eve Snack' },
    { id: 'dinner', label: 'Dinner' }
];

const MealSlotMultiSelect = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selected = MEAL_SLOTS.filter(m => value[m.id]);

    return (
        <div className="relative">
            <div
                onClick={() => setIsOpen(o => !o)}
                className="w-full h-[46px] bg-[#F4F9F8] border-2 border-transparent focus-within:border-[#2E7D6B] rounded-2xl px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
            >
                <div className="flex flex-nowrap gap-1.5 flex-1 items-center overflow-hidden pr-2">
                    {selected.length === 0 ? (
                        <span className="text-gray-400 text-xs font-bold pl-1">Select meals…</span>
                    ) : (
                        <>
                            {selected.slice(0, 2).map(m => (
                                <span key={m.id} className="bg-[#E4F1EC] text-[#2E7D6B] px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap">
                                    {m.label}
                                </span>
                            ))}
                            {selected.length > 2 && (
                                <span className="text-gray-400 font-black text-lg leading-none transform -translate-y-1 ml-1">...</span>
                            )}
                        </>
                    )}
                </div>
                <svg className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} />
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 p-2 max-h-60 overflow-y-auto custom-scrollbar">
                        {MEAL_SLOTS.map(meal => {
                            const isSelected = value[meal.id];
                            return (
                                <div
                                    key={meal.id}
                                    onClick={(e) => { e.stopPropagation(); onChange(meal.id); }}
                                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer rounded-xl transition-colors"
                                >
                                    <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-[#2E7D6B] border-transparent' : 'bg-white border-2 border-gray-200'}`}>
                                        {isSelected && (
                                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="text-sm font-bold text-gray-700">{meal.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

const CreatePlanFlowPage = () => {
    const navigate = useNavigate();
    const [isCreatingPlan, setIsCreatingPlan] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    const formatTime = (hour) => {
        if (hour === 0) return '12 AM';
        if (hour === 12) return '12 PM';
        return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
    };

    // Shared / Nutrition State
    const [formData, setFormData] = useState({
        currentWeight: userData.weight || '',
        currentHeight: userData.height || '',
        fitnessGoal: userData.fitnessGoal || 'lose_weight',
        targetWeightLoss: userData.targetWeight || '',
        goalDuration: userData.goalDuration === '1 month' ? '1 Month' :
            userData.goalDuration === '3 months' ? '3 Months' :
                userData.goalDuration === '6 months' ? '6 Months' : '1 Month',
        dietPreference: 'Vegetarian',
        cuisineStyle: 'North Indian',
        planDuration: '1 Day',
        allergies: userData.allergies || [],
        healthConditions: userData.healthConditions || [],
        beverageSchedule: [],
        selectedMeals: {
            breakfast: true,
            morningSnack: false,
            lunch: true,
            snacks: true,
            dinner: true
        },
        eatingWindow: { start: 8, end: 20 }
    });

    // Workout State
    const [workoutPlace, setWorkoutPlace] = useState('Gym');
    const [equipment, setEquipment] = useState([]);
    const [workoutType, setWorkoutType] = useState(['Strength Training', 'HIIT']);
    const [workoutDuration, setWorkoutDuration] = useState('1');
    const [workoutTime, setWorkoutTime] = useState(['Morning']);
    const [workoutDays, setWorkoutDays] = useState([0, 2, 4]);

    const equipmentOptions = ['Dumbbells', 'Resistance Bands', 'Kettlebell', 'Pull-up Bar', 'Yoga Mat', 'Jump Rope'];
    const typeOptions = ['Strength Training', 'Cardio', 'HIIT', 'Yoga', 'Pilates', 'Flexibility'];
    const timeOptions = ['Morning', 'Afternoon', 'Evening'];

    const toggleSelection = (item, currentList, setter) => {
        if (currentList.includes(item)) setter(currentList.filter(i => i !== item));
        else setter([...currentList, item]);
    };

    const getMaxWeightLoss = (duration) => {
        if (duration === '1 Month') return 3;
        if (duration === '3 Months') return 10;
        if (duration === '6 Months') return 20;
        return 20;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateStep1 = () => {
        const max = getMaxWeightLoss(formData.goalDuration);
        const loss = parseFloat(formData.targetWeightLoss);
        if (loss > max) {
            alert(`For ${formData.goalDuration}, maximum weight loss allowed is ${max}kg.`);
            return false;
        }
        if (!formData.currentWeight || !formData.currentHeight || formData.targetWeightLoss === '') {
            alert("Please fill in all fields.");
            return false;
        }
        return true;
    };

    const handleNext = () => {
        if (currentStep === 1) {
            if (validateStep1()) setCurrentStep(2);
        } else if (currentStep === 2) {
            setCurrentStep(3);
        } else if (currentStep === 3) {
            setCurrentStep(4);
        } else if (currentStep === 4) {
            handleCreatePlan();
        }
    };

    const handleCreatePlan = () => {
        setIsCreatingPlan(true);

        // Generate personalized workout plan
        const newWorkoutPlan = generateWorkoutPlan({
            workoutPlace,
            equipment,
            workoutType,
            workoutDuration: parseFloat(workoutDuration),
            workoutDays,
            experienceLevel: userData.experienceLevel || 'Intermediate'
        });

        // Save workout plan
        localStorage.setItem('cyom_generated_workout_plan', JSON.stringify(newWorkoutPlan));

        setTimeout(() => {
            setIsCreatingPlan(false);
            // Navigate to meal planner with nutrition form data
            navigate('/meal-planner', { state: formData });
        }, 3000);
    };

    // Beverage Planner State
    const [activeTab, setActiveTab] = useState('Tea');
    const [tempBev, setTempBev] = useState({
        time: 'Morning',
        vessel: 'Medium',
        quantity: 1,
        sugar: 0
    });

    const TABS = ['Tea', 'Coffee', 'Milk'];
    const TIME_SPANS = ['Morning', 'Afternoon', 'Evening', 'Night'];
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

    const handleAddRefreshment = () => {
        const baseCalories = activeTab === 'Tea' ? 30 : activeTab === 'Coffee' ? 40 : 120;
        const slotMap = { 'Morning': 'breakfast', 'Afternoon': 'lunch', 'Evening': 'snacks', 'Night': 'dinner' };
        const targetSlot = slotMap[tempBev.time];

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
            withSugar: tempBev.sugar > 0
        };

        setFormData(prev => ({
            ...prev,
            beverageSchedule: [...prev.beverageSchedule, newBev]
        }));

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

            {/* Custom Plan Creation Loader Overlay */}
            <AnimatePresence>
                {isCreatingPlan && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-xl p-8"
                    >
                        <div className="relative w-56 h-56 flex items-center justify-center mt-4">
                            <motion.div
                                animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.9, 0.6] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute inset-0 bg-gradient-to-tr from-[#A8E6CF]/40 to-[#FFD166]/40 rounded-full blur-3xl"
                            />
                            <div className="w-full h-full relative z-10 flex gap-4 overflow-hidden rounded-full drop-shadow-[0_0_25px_rgba(46,125,107,0.5)]">
                                {/* Use GIF on one half, Video on other half to symbolize split plan, or just the image */}
                                <motion.img
                                    src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExeHV5bWF2eG1kNzNmbzB5ZWhuaHVnOHpzbTZtd2Vpb2Y5NWU0cGEzYiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/SGWOYOsHtokMo2pDVt/giphy.gif"
                                    alt="Crafting your plan"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col items-center mt-8 space-y-2 text-center">
                            <motion.h2
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-2xl font-black text-[#2E7D6B] tracking-wide"
                            >
                                Crafting Your Plans
                            </motion.h2>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-gray-500 font-medium text-sm flex gap-1 justify-center items-center"
                            >
                                Crunching nutritional and fitness data
                                {[0, 1, 2].map(i => (
                                    <motion.span
                                        key={i}
                                        animate={{ opacity: [0, 1, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                                    >.</motion.span>
                                ))}
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="absolute top-0 right-0 w-full h-[50vh] bg-gradient-to-b from-black/10 to-transparent pointer-events-none"></div>

            <CommonNavbar showSidebarMenu={true} />

            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-10">
                <div className="w-full max-w-2xl mx-auto mt-4">
                    <div className="mb-4 ml-2 flex items-center justify-between text-white">
                        <div>
                            <h1 className="text-xl font-bold">Create Your Master Plan</h1>
                            <p className="text-xs opacity-80">Let's craft your diet and workout routines</p>
                        </div>
                    </div>

                    <div className="mt-4 bg-white/94 backdrop-blur-xl p-6 md:p-8 rounded-[28px] shadow-2xl border border-white/50 text-[#1F2933]">
                        {/* Progress Header */}
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex gap-2">
                                <div className={`h-1.5 w-8 rounded-full transition-all duration-500 ${currentStep >= 1 ? 'bg-[#2E7D6B] shadow-[0_0_10px_rgba(46,125,107,0.5)]' : 'bg-gray-100'}`}></div>
                                <div className={`h-1.5 w-8 rounded-full transition-all duration-500 ${currentStep >= 2 ? 'bg-[#2E7D6B] shadow-[0_0_10px_rgba(46,125,107,0.5)]' : 'bg-gray-100'}`}></div>
                                <div className={`h-1.5 w-8 rounded-full transition-all duration-500 ${currentStep >= 3 ? 'bg-[#2E7D6B] shadow-[0_0_10px_rgba(46,125,107,0.5)]' : 'bg-gray-100'}`}></div>
                                <div className={`h-1.5 w-8 rounded-full transition-all duration-500 ${currentStep >= 4 ? 'bg-[#2E7D6B] shadow-[0_0_10px_rgba(46,125,107,0.5)]' : 'bg-gray-100'}`}></div>
                            </div>
                            <span className="text-[10px] font-black text-gray-400 tracking-widest uppercase">Phase {currentStep} of 4</span>
                        </div>

                        {currentStep === 1 ? (
                            <div className="space-y-5 animate-fade-in text-gray-800">
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 mb-0.5 flex items-center gap-2">
                                        <div className="w-8 h-8 flex items-center justify-center bg-violet-50 text-violet-600 rounded-lg shadow-sm border border-violet-100/50">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        </div>
                                        Profile Overview
                                    </h2>
                                    <p className="text-gray-400 text-sm">Review your details before building the plan.</p>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { label: 'Age', value: formData.currentAge || userData.age, unit: 'yrs', bg: 'bg-violet-50', border: 'border-violet-100', text: 'text-violet-600', icon: '👴' },
                                        { label: 'Weight', value: formData.currentWeight, unit: 'kg', bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600', icon: '⚖️' },
                                        { label: 'Height', value: formData.currentHeight, unit: 'cm', bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600', icon: '📏' },
                                    ].map(s => (
                                        <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-3 flex flex-col items-center text-center shadow-sm`}>
                                            <span className="text-lg mb-1">{s.icon}</span>
                                            <div className={`text-xl font-black ${s.text}`}>{s.value}</div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.unit} · {s.label}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#2E7D6B] to-[#469C85] p-4 shadow-lg">
                                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full" />
                                    <div className="absolute -right-2 -bottom-6 w-16 h-16 bg-white/10 rounded-full" />
                                    <div className="relative z-10">
                                        <div className="text-[10px] font-black tracking-widest text-white/60 uppercase mb-1">Primary Goal</div>
                                        <div className="text-base font-black text-white capitalize mb-2">
                                            {formData.fitnessGoal.replace(/_/g, ' ')}
                                        </div>
                                        {(formData.fitnessGoal === 'lose_weight' || formData.fitnessGoal === 'manage_weight') && (
                                            <div className="flex gap-2">
                                                <span className="bg-white/20 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-bold border border-white/20">
                                                    🎯 {userData.weightManagementType || 'Lose'} {formData.targetWeightLoss} kg
                                                </span>
                                                <span className="bg-white/20 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-bold border border-white/20">
                                                    ⏱ {formData.goalDuration}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 shadow-sm">
                                    <div className="text-[10px] font-black tracking-widest text-amber-500 uppercase mb-2">Fitness Background</div>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-bold">🏅 {userData.experienceLevel || "Beginner"}</span>
                                        <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-bold">⏱ {userData.frequency || 0} days/wk</span>
                                    </div>
                                    <div className="text-[10px] font-black tracking-widest text-amber-500/70 uppercase mb-1.5">Preferred Modalities</div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {userData.modalities?.map(m => (
                                            <span key={m} className="px-2 py-0.5 bg-amber-100/50 text-amber-700 rounded-md text-[10px] font-bold border border-amber-200/50">{m}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-1 flex gap-3">
                                    <button
                                        onClick={() => navigate('/onboarding/personal-info')}
                                        className="px-5 py-3 bg-white border-2 border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95 shadow-sm text-sm"
                                    >
                                        Edit Profile
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        className="flex-1 py-3 bg-gradient-to-r from-[#2E7D6B] to-[#469C85] text-white rounded-2xl font-bold text-base shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                    >
                                        Looks Good, Next
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ) : currentStep === 2 ? (
                            <div className="space-y-6 animate-fade-in text-gray-800">
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 mb-1 flex items-center gap-2">
                                        <span className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center text-sm shadow-sm border border-green-100/50">🥗</span>
                                        Nutrition Preferences
                                    </h2>
                                    <p className="text-gray-500 text-sm">Customize your eating schedule and diet.</p>
                                </div>

                                {/* 24-Hour Eating Window Slider */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Eating Window</label>
                                        <div className="text-sm font-bold text-[#2E7D6B] bg-[#E0F2F1] px-2 py-1 rounded-lg">
                                            {formatTime(formData.eatingWindow.start)} - {formatTime(formData.eatingWindow.end)} ({formData.eatingWindow.end - formData.eatingWindow.start} hrs)
                                        </div>
                                    </div>
                                    <div className="relative h-12 flex items-center px-2">
                                        <div className="absolute inset-x-2 h-2 bg-gray-100 rounded-full"></div>
                                        <div
                                            className="absolute h-2 bg-gradient-to-r from-[#2E7D6B] to-[#469C85] rounded-full"
                                            style={{
                                                left: `${(formData.eatingWindow.start / 24) * 100}%`,
                                                right: `${100 - (formData.eatingWindow.end / 24) * 100}%`
                                            }}
                                        ></div>
                                        <input
                                            type="range" min="0" max="24" step="1"
                                            value={formData.eatingWindow.start}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                if (val < formData.eatingWindow.end) {
                                                    setFormData(prev => ({ ...prev, eatingWindow: { ...prev.eatingWindow, start: val } }));
                                                }
                                            }}
                                            className="absolute inset-x-0 w-full appearance-none bg-transparent pointer-events-none z-20 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#2E7D6B] [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#2E7D6B] [&::-moz-range-thumb]:shadow-md"
                                        />
                                        <input
                                            type="range" min="0" max="24" step="1"
                                            value={formData.eatingWindow.end}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                if (val > formData.eatingWindow.start) {
                                                    setFormData(prev => ({ ...prev, eatingWindow: { ...prev.eatingWindow, end: val } }));
                                                }
                                            }}
                                            className="absolute inset-x-0 w-full appearance-none bg-transparent pointer-events-none z-20 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#2E7D6B] [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#2E7D6B] [&::-moz-range-thumb]:shadow-md"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Diet Preference</label>
                                        <select
                                            name="dietPreference"
                                            value={formData.dietPreference}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-[#2E7D6B] outline-none text-sm font-bold text-gray-700 transition-all"
                                        >
                                            <option value="Vegetarian">Vegetarian</option>
                                            <option value="Non-Vegetarian">Non-Vegetarian</option>
                                            <option value="Eggetarian">Eggetarian</option>
                                            <option value="Vegan">Vegan</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Cuisine Style</label>
                                        <select
                                            name="cuisineStyle"
                                            value={formData.cuisineStyle}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-[#2E7D6B] outline-none text-sm font-bold text-gray-700 transition-all"
                                        >
                                            <option value="North Indian">North Indian</option>
                                            <option value="South Indian">South Indian</option>
                                            <option value="Continental">Continental</option>
                                            <option value="Mixed">Mixed</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-3 items-start relative z-30">
                                    <div className="flex-1 space-y-1.5">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Active Meal Slots</label>
                                        <MealSlotMultiSelect
                                            value={formData.selectedMeals}
                                            onChange={(id) => setFormData(prev => ({
                                                ...prev,
                                                selectedMeals: { ...prev.selectedMeals, [id]: !prev.selectedMeals[id] }
                                            }))}
                                        />
                                    </div>

                                    <div className="w-28 space-y-1.5">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Duration</label>
                                        <select
                                            value={formData.planDuration}
                                            onChange={(e) => setFormData(prev => ({ ...prev, planDuration: e.target.value }))}
                                            className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-[#2E7D6B] outline-none text-sm font-bold text-gray-700 transition-all cursor-pointer"
                                        >
                                            <option value="1 Day">1 Day</option>
                                            <option value="3 Days">3 Days</option>
                                            <option value="7 Days">7 Days</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setCurrentStep(1)}
                                        className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95 shadow-sm text-sm"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        className="flex-1 py-3 bg-gradient-to-r from-[#2E7D6B] to-[#469C85] text-white rounded-2xl font-bold text-base shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                    >
                                        Next Phase
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ) : currentStep === 3 ? (
                            <div className="space-y-6 animate-fade-in text-gray-800">
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 mb-1 flex items-center gap-2">
                                        <span className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center text-sm shadow-sm border border-purple-100/50">🏋️</span>
                                        Workout Preferences
                                    </h2>
                                    <p className="text-gray-500 text-sm">Customize your exercise routine details.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Location</label>
                                        <select
                                            value={workoutPlace}
                                            onChange={(e) => {
                                                setWorkoutPlace(e.target.value);
                                                if (e.target.value !== 'Home') setEquipment([]);
                                            }}
                                            className="w-full px-4 h-[42px] rounded-xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-[#2E7D6B] outline-none text-sm font-bold text-gray-700 transition-all"
                                        >
                                            <option value="" disabled>Select Location</option>
                                            <option value="Gym">Gym</option>
                                            <option value="Home">Home</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2 relative z-20">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Workout Type</label>
                                        <MultiSelectDropdown
                                            options={typeOptions}
                                            selected={workoutType}
                                            onChange={(val) => toggleSelection(val, workoutType, setWorkoutType)}
                                            placeholder="Select Type"
                                        />
                                    </div>
                                </div>

                                {workoutPlace === 'Home' && (
                                    <div className="space-y-2 animate-fade-in relative z-30">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Available Equipment</label>
                                        <MultiSelectDropdown
                                            options={equipmentOptions}
                                            selected={equipment}
                                            onChange={(val) => toggleSelection(val, equipment, setEquipment)}
                                            placeholder="Select Equipment"
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Duration</label>
                                        <div className="flex bg-gray-50 rounded-xl border border-gray-100 h-[38px] p-1 items-center justify-between">
                                            <button
                                                onClick={() => setWorkoutDuration(prev => Math.max(0.5, (parseFloat(prev || 0.5) - 0.5)).toString())}
                                                className="w-8 h-full rounded-lg hover:bg-white text-gray-400 hover:text-[#2E7D6B] flex items-center justify-center font-bold text-sm transition-colors"
                                            >-</button>
                                            <span className="font-bold text-sm text-gray-800">{workoutDuration || "1"} hr</span>
                                            <button
                                                onClick={() => setWorkoutDuration(prev => (parseFloat(prev || 1) + 0.5).toString())}
                                                className="w-8 h-full rounded-lg bg-[#2E7D6B] text-white shadow-sm flex items-center justify-center font-bold text-sm"
                                            >+</button>
                                        </div>
                                    </div>
                                    <div className="space-y-2 relative z-10 w-full min-w-0">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Time</label>
                                        <MultiSelectDropdown
                                            options={timeOptions}
                                            selected={workoutTime}
                                            onChange={(val) => toggleSelection(val, workoutTime, setWorkoutTime)}
                                            placeholder="Select Time"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Workout Days</label>
                                    <select
                                        value={workoutDays.length}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            if (val === 3) setWorkoutDays([0, 2, 4]); // Mon, Wed, Fri
                                            else if (val === 5) setWorkoutDays([0, 1, 2, 3, 4]); // Mon-Fri
                                            else if (val === 7) setWorkoutDays([0, 1, 2, 3, 4, 5, 6]); // Everyday
                                        }}
                                        className="w-full px-4 h-[42px] rounded-xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-[#2E7D6B] outline-none text-sm font-bold text-gray-700 transition-all"
                                    >
                                        <option value={3}>3 Days per week</option>
                                        <option value={5}>5 Days per week</option>
                                        <option value={7}>7 Days per week</option>
                                    </select>
                                </div>

                                <div className="flex gap-4 pt-2">
                                    <button
                                        onClick={() => setCurrentStep(2)}
                                        className="px-6 py-3 bg-white border-2 border-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-95 shadow-sm"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        disabled={!workoutPlace || workoutType.length === 0 || workoutDays.length === 0}
                                        className={`flex-1 py-3 bg-gradient-to-r from-[#2E7D6B] to-[#469C85] text-white rounded-2xl font-bold text-base shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2`}
                                    >
                                        Next Phase
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

                                {/* Saved List */}
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
                                <div className="flex bg-gray-50 p-1.5 rounded-2xl gap-1">
                                    {TABS.map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => { setActiveTab(tab); setTempBev(prev => ({ ...prev, vessel: tab === 'Milk' && prev.vessel === 'Medium' ? 'Small' : prev.vessel })); }}
                                            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === tab ? 'bg-white text-[#2E7D6B] shadow-md transform scale-[1.02]' : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                            {tab === 'Tea' ? <img src={TeaTabIcon} className="w-8 h-8 object-contain" alt="Tea" /> : tab === 'Coffee' ? <img src={CoffeeTabIcon} className="w-8 h-8 object-contain" alt="Coffee" /> : <img src={MilkTabIcon} className="w-8 h-8 object-contain" alt="Milk" />}
                                            <span>{tab}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="bg-white border-2 border-[#E0F2F1] rounded-2xl p-4 shadow-lg shadow-[#2E7D6B]/5 relative overflow-hidden">
                                    <div className="relative z-10 space-y-4">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-4">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1 pl-1">Time</label>
                                                <div className="relative">
                                                    <select
                                                        value={tempBev.time}
                                                        onChange={(e) => setTempBev(prev => ({ ...prev, time: e.target.value }))}
                                                        className="w-full px-2 py-2.5 rounded-xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-[#2E7D6B] outline-none text-xs font-bold text-gray-700 appearance-none transition-all"
                                                    >
                                                        {TIME_SPANS.map(time => (
                                                            <option key={time} value={time}>{time}</option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-span-4">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1 text-center">Cups</label>
                                                <div className="flex items-center justify-between bg-gray-50 rounded-xl p-1 border border-gray-100 h-[38px]">
                                                    <button onClick={() => setTempBev(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))} className="w-8 h-full rounded-lg hover:bg-white text-gray-400 hover:text-red-500 flex items-center justify-center font-bold text-sm transition-colors">-</button>
                                                    <span className="font-bold text-sm text-gray-800">{tempBev.quantity}</span>
                                                    <button onClick={() => setTempBev(prev => ({ ...prev, quantity: prev.quantity + 1 }))} className="w-8 h-full rounded-lg bg-[#2E7D6B] text-white shadow-sm flex items-center justify-center font-bold text-sm">+</button>
                                                </div>
                                            </div>

                                            <div className="col-span-4">
                                                <label className="text-[10px] font-black text-yellow-600/60 uppercase tracking-widest block mb-1 text-center">Sugar(tsp)</label>
                                                <div className="flex items-center justify-between bg-yellow-50/30 rounded-xl p-1 border border-yellow-100/50 h-[38px]">
                                                    <button onClick={() => setTempBev(prev => ({ ...prev, sugar: Math.max(0, prev.sugar - 0.5) }))} className="w-8 h-full rounded-lg hover:bg-white text-yellow-600 hover:text-yellow-700 flex items-center justify-center font-bold text-sm transition-colors">-</button>
                                                    <span className="font-bold text-sm text-yellow-800">{tempBev.sugar}</span>
                                                    <button onClick={() => setTempBev(prev => ({ ...prev, sugar: prev.sugar + 0.5 }))} className="w-8 h-full rounded-lg bg-[#FFD166] text-white shadow-sm flex items-center justify-center font-bold text-sm">+</button>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1 pl-1">Select Size</label>
                                            <div className="flex gap-2">
                                                {VESSELS[activeTab].map((v) => (
                                                    <button
                                                        key={v.id}
                                                        onClick={() => setTempBev(prev => ({ ...prev, vessel: v.id }))}
                                                        className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all h-16 ${tempBev.vessel === v.id ? 'border-[#2E7D6B] bg-[#F0FDF9] shadow-sm' : 'border-gray-50 bg-gray-50 hover:bg-white hover:border-gray-200'} `}
                                                    >
                                                        <img src={v.icon} alt={v.id} className="h-7 w-auto object-contain mb-1" />
                                                        <div className="leading-tight">
                                                            <span className={`text-[10px] font-bold block ${tempBev.vessel === v.id ? 'text-[#2E7D6B]' : 'text-gray-700'}`}>{v.id}</span>
                                                            <span className={`text-[8px] font-semibold block ${tempBev.vessel === v.id ? 'text-[#2E7D6B]/80' : 'text-gray-400'}`}>{v.label.match(/\((.*?)\)/)?.[1] || ''}</span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex justify-center pt-2">
                                            <button
                                                onClick={handleAddRefreshment}
                                                className="px-8 py-2 bg-gray-900 text-white rounded-lg font-bold text-sm shadow-md active:scale-95 transition-all flex items-center gap-2 hover:bg-black"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                                Add Beverage
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-2">
                                    <button
                                        onClick={() => setCurrentStep(3)}
                                        className="px-6 py-3 bg-white border-2 border-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-95 shadow-sm"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        className={`flex-1 py-3 bg-gradient-to-r from-[#2E7D6B] to-[#469C85] text-white rounded-2xl font-bold text-base shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2`}
                                    >
                                        Create Plan
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

export default CreatePlanFlowPage;
