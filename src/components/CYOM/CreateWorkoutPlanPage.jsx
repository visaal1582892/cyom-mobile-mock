import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CommonNavbar from './CommonNavbar';
import { userData } from '../../data/store';
import { motion, AnimatePresence } from 'framer-motion';
import MultiSelectDropdown from '../UI/MultiSelectDropdown';

const CreateWorkoutPlanPage = () => {
    const navigate = useNavigate();
    const [isCreatingPlan, setIsCreatingPlan] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    const [workoutPlace, setWorkoutPlace] = useState('Gym'); // 'Gym' or 'Home'
    const [equipment, setEquipment] = useState([]); // Array of selected equipment
    const [workoutType, setWorkoutType] = useState(['Strength Training', 'HIIT']); // Array of selected types
    const [workoutDuration, setWorkoutDuration] = useState('1'); // Hours string
    const [workoutTime, setWorkoutTime] = useState(['Morning']); // ['Morning', 'Afternoon', 'Evening']
    const [workoutDays, setWorkoutDays] = useState([0, 2, 4]); // array of day numbers (0-6, Mon-Sun)

    const equipmentOptions = ['Dumbbells', 'Resistance Bands', 'Kettlebell', 'Pull-up Bar', 'Yoga Mat', 'Jump Rope'];
    const typeOptions = ['Strength Training', 'Cardio', 'HIIT', 'Yoga', 'Pilates', 'Flexibility'];
    const timeOptions = ['Morning', 'Afternoon', 'Evening'];
    const daysOfWeek = [
        { id: 0, label: 'Mo' },
        { id: 1, label: 'Tu' },
        { id: 2, label: 'We' },
        { id: 3, label: 'Th' },
        { id: 4, label: 'Fr' },
        { id: 5, label: 'Sa' },
        { id: 6, label: 'Su' }
    ];

    const toggleSelection = (item, currentList, setter) => {
        if (currentList.includes(item)) {
            setter(currentList.filter(i => i !== item));
        } else {
            setter([...currentList, item]);
        }
    };

    const handleNext = () => {
        if (currentStep === 1) setCurrentStep(2);
    };

    const handleGenerate = () => {
        setIsCreatingPlan(true);
        setTimeout(() => {
            setIsCreatingPlan(false);
            navigate('/workout-tracker');
        }, 2500);
    };

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
                            <motion.img
                                src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExeHV5bWF2eG1kNzNmbzB5ZWhuaHVnOHpzbTZtd2Vpb2Y5NWU0cGEzYiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/SGWOYOsHtokMo2pDVt/giphy.gif"
                                alt="Crafting your plan"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="w-full h-full object-cover rounded-full relative z-10 drop-shadow-[0_0_25px_rgba(46,125,107,0.5)]"
                            />
                        </div>
                        <div className="flex flex-col items-center mt-8 space-y-2 text-center">
                            <motion.h2
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-2xl font-black text-[#2E7D6B] tracking-wide"
                            >
                                Crafting Your Plan
                            </motion.h2>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-gray-500 font-medium text-sm flex gap-1 justify-center items-center"
                            >
                                Crunching fitness data
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

            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-full h-[50vh] bg-gradient-to-b from-black/10 to-transparent pointer-events-none"></div>

            {/* Header / Status Bar Area */}
            <CommonNavbar
                showSidebarMenu={true}
            />

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-10">
                <div className="w-full max-w-2xl mx-auto mt-4">
                    <div className="mb-4 ml-2 flex items-center justify-between text-white">
                        <div>
                            <h1 className="text-xl font-bold">Create Your Workout</h1>
                            <p className="text-xs opacity-80">Let's craft your perfect routine</p>
                        </div>
                    </div>

                    <div className="mt-4 bg-white/94 backdrop-blur-xl p-6 md:p-8 rounded-[28px] shadow-2xl border border-white/50 text-[#1F2933]">
                        {/* Progress Header */}
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex gap-2">
                                <div className={`h-1.5 w-12 rounded-full transition-all duration-500 ${currentStep >= 1 ? 'bg-[#2E7D6B] shadow-[0_0_10px_rgba(46,125,107,0.5)]' : 'bg-gray-100'}`}></div>
                                <div className={`h-1.5 w-12 rounded-full transition-all duration-500 ${currentStep >= 2 ? 'bg-[#2E7D6B] shadow-[0_0_10px_rgba(46,125,107,0.5)]' : 'bg-gray-100'}`}></div>
                            </div>
                            <span className="text-[10px] font-black text-gray-400 tracking-widest uppercase">Phase {currentStep} of 2</span>
                        </div>

                        {currentStep === 1 ? (
                            <div className="space-y-5 animate-fade-in text-gray-800">
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 mb-0.5 flex items-center gap-2">
                                        <span className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center text-sm shadow-sm border border-violet-100/50">👤</span>
                                        Profile Overview
                                    </h2>
                                    <p className="text-gray-400 text-sm">Review your details before building the plan.</p>
                                </div>

                                {/* Hero Stats Row */}
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { label: 'Age', value: userData.age, unit: 'yrs', color: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', border: 'border-violet-100', text: 'text-violet-600', icon: '🎂' },
                                        { label: 'Weight', value: userData.weight, unit: 'kg', color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600', icon: '⚖️' },
                                        { label: 'Height', value: userData.height, unit: 'cm', color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600', icon: '📏' },
                                    ].map(s => (
                                        <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-3 flex flex-col items-center text-center shadow-sm`}>
                                            <span className="text-lg mb-1">{s.icon}</span>
                                            <div className={`text-xl font-black ${s.text}`}>{s.value}</div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.unit} · {s.label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Goal Banner */}
                                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#2E7D6B] to-[#469C85] p-4 shadow-lg">
                                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full" />
                                    <div className="absolute -right-2 -bottom-6 w-16 h-16 bg-white/10 rounded-full" />
                                    <div className="relative z-10">
                                        <div className="text-[10px] font-black tracking-widest text-white/60 uppercase mb-1">Primary Goal</div>
                                        <div className="text-base font-black text-white capitalize mb-2">
                                            {userData.fitnessGoal?.replace(/_/g, ' ')}
                                        </div>
                                        {(userData.fitnessGoal === 'lose_weight' || userData.fitnessGoal === 'manage_weight') && (
                                            <div className="flex flex-wrap gap-2">
                                                <span className="bg-white/20 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-bold border border-white/20 capitalize">
                                                    🎯 {userData.weightManagementType} {userData.targetWeight} kg
                                                </span>
                                                <span className="bg-white/20 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-bold border border-white/20">
                                                    ⏱ {userData.goalDuration}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Experience & Modalities (Analogous to Exercise Summary) */}
                                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 shadow-sm">
                                    <div className="text-[10px] font-black tracking-widest text-amber-500 uppercase mb-2">Fitness Background</div>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-bold">🏅 {userData.experienceLevel}</span>
                                        <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-bold">⏱ {userData.frequency} days/wk</span>
                                    </div>
                                    <div className="text-[10px] font-black tracking-widest text-amber-500/70 uppercase mb-1.5">Preferred Modalities</div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {userData.modalities?.map(m => (
                                            <span key={m} className="px-2 py-0.5 bg-amber-100/50 text-amber-700 rounded-md text-[10px] font-bold border border-amber-200/50">{m}</span>
                                        ))}
                                    </div>
                                </div>

                                {/* Lifestyle & Recovery (Analogous to Allergies / Conditions) */}
                                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 shadow-sm space-y-3">
                                    <div>
                                        <div className="text-[10px] font-black tracking-widest text-blue-400 uppercase mb-1.5">Recovery & Lifestyle</div>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="px-2.5 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">💤 {userData.sleepQuality} Sleep ({userData.sleepHours}h)</span>
                                            <span className="px-2.5 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">💧 {userData.waterIntake}L Water</span>
                                            <span className="px-2.5 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">🧠 {userData.stressLevel} Stress</span>
                                        </div>
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
                        ) : (
                            <div className="space-y-6 animate-fade-in text-gray-800">
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 mb-1 flex items-center gap-2">
                                        <span className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center text-sm shadow-sm border border-green-100/50">🏋️</span>
                                        Workout Preferences
                                    </h2>
                                    <p className="text-gray-500 text-sm">Customize your routine parameters.</p>
                                </div>

                                {/* 1. Workout Place (Select) */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Location</label>
                                    <select
                                        value={workoutPlace}
                                        onChange={(e) => {
                                            setWorkoutPlace(e.target.value);
                                            if (e.target.value !== 'Home') setEquipment([]);
                                        }}
                                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-[#2E7D6B] outline-none text-sm font-bold text-gray-700 transition-all"
                                    >
                                        <option value="" disabled>Select Location</option>
                                        <option value="Gym">Gym</option>
                                        <option value="Home">Home</option>
                                    </select>
                                </div>

                                {/* 2. Equipment (Conditional) */}
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

                                {/* 3. Workout Type */}
                                <div className="space-y-2 relative z-20">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Workout Type</label>
                                    <MultiSelectDropdown
                                        options={typeOptions}
                                        selected={workoutType}
                                        onChange={(val) => toggleSelection(val, workoutType, setWorkoutType)}
                                        placeholder="Select Type"
                                    />
                                </div>

                                {/* 4. Duration & 5. Time */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Duration</label>
                                        <div className="flex bg-gray-50 rounded-xl border border-gray-100 h-[38px] p-1 items-center justify-between">
                                            <button
                                                onClick={() => setWorkoutDuration(prev => Math.max(0.5, (parseFloat(prev || 0.5) - 0.5)).toString())}
                                                className="w-8 h-full (prev || 1) rounded-lg hover:bg-white text-gray-400 hover:text-[#2E7D6B] flex items-center justify-center font-bold text-sm transition-colors"
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

                                {/* 6. Workout Days */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between pl-1 pr-1">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Workout Days</label>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setWorkoutDays(daysOfWeek.map(d => d.id))}
                                                className="text-[10px] font-bold text-[#2E7D6B] hover:text-[#469C85] bg-[#E4F1EC] px-2 py-0.5 rounded-md transition-colors"
                                            >
                                                All
                                            </button>
                                            <button
                                                onClick={() => setWorkoutDays([])}
                                                className="text-[10px] font-bold text-gray-500 hover:text-red-500 bg-gray-100 px-2 py-0.5 rounded-md transition-colors"
                                            >
                                                Reset
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center bg-gray-50 py-2 px-2 rounded-xl border border-gray-100">
                                        {daysOfWeek.map(day => (
                                            <button
                                                key={day.id}
                                                type="button"
                                                onClick={() => toggleSelection(day.id, workoutDays, setWorkoutDays)}
                                                className={`w-8 h-8 flex items-center justify-center rounded-full text-[10px] font-black transition-all ${workoutDays.includes(day.id)
                                                    ? 'bg-[#2E7D6B] text-white shadow-sm'
                                                    : 'bg-white text-gray-400 border border-gray-200 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {day.label}
                                            </button>
                                        ))}
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
                                        onClick={handleGenerate}
                                        disabled={!workoutPlace || workoutType.length === 0 || workoutDays.length === 0}
                                        className={`flex-1 py-3 rounded-2xl font-bold shadow-xl transition-all flex items-center justify-center gap-3 ${(!workoutPlace || workoutType.length === 0 || workoutDays.length === 0)
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                            : 'bg-gradient-to-r from-[#2E7D6B] to-[#469C85] text-white shadow-[#2E7D6B]/40 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]'
                                            }`}
                                    >
                                        Create My Plan
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
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

export default CreateWorkoutPlanPage;
