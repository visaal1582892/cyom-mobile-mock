import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Activity, CalendarDays, AlertCircle, ChevronDown, Scale, X, Target, Timer, Ruler } from 'lucide-react';
import { userData as userProfileData, updateProfileData } from '../../data/store';
import { motion } from 'framer-motion';

const InputField = ({ label, icon: Icon, type = "text", value, onChange, placeholder, suffix, error, className = "" }) => (
    <div className={`mb-3 ${className}`}>
        <label className="block text-[13px] font-bold text-gray-700 mb-1.5 ml-1">{label}</label>
        <div className="relative flex items-center">
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full bg-gray-50 border border-gray-200 focus:border-[#2E7D6B] focus:bg-white focus:ring-2 focus:ring-[#2E7D6B]/20 rounded-xl py-2.5 ${Icon ? 'pl-10' : 'pl-3'} ${suffix ? 'pr-10' : 'pr-3'} text-sm font-bold text-gray-900 placeholder-gray-400 transition-all outline-none shadow-sm`}
            />
            {Icon && (
                <div className="absolute left-3 text-gray-400 pointer-events-none">
                    <Icon className="w-4 h-4" />
                </div>
            )}
            {suffix && (
                <div className="absolute right-3 text-gray-600 font-bold text-xs bg-gray-200 px-1.5 py-0.5 rounded-md">
                    {suffix}
                </div>
            )}
        </div>
        {error && (
            <div className="flex items-center gap-1 mt-1 ml-1 text-red-500 text-[11px] font-medium">
                <AlertCircle className="w-3 h-3" />
                <span>{error}</span>
            </div>
        )}
    </div>
);

const SelectField = ({ label, icon: Icon, value, onChange, options, error, className = "" }) => (
    <div className={`mb-3 ${className}`}>
        <label className="block text-[13px] font-bold text-gray-700 mb-1.5 ml-1">{label}</label>
        <div className="relative flex items-center">
            <select
                value={value}
                onChange={onChange}
                className={`w-full bg-gray-50 border border-gray-200 focus:border-[#2E7D6B] focus:bg-white focus:ring-2 focus:ring-[#2E7D6B]/20 rounded-xl py-2.5 ${Icon ? 'pl-10' : 'pl-3'} pr-8 text-sm font-bold ${value ? 'text-gray-900' : 'text-gray-400'} transition-all outline-none shadow-sm appearance-none cursor-pointer`}
            >
                <option value="" disabled className="text-gray-400 font-medium">Select...</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value} className="text-gray-900 font-medium">
                        {opt.label}
                    </option>
                ))}
            </select>
            {Icon && (
                <div className="absolute left-3 text-gray-400 pointer-events-none">
                    <Icon className="w-4 h-4" />
                </div>
            )}
            <div className="absolute right-3 text-gray-400 pointer-events-none">
                <ChevronDown className="w-4 h-4" />
            </div>
        </div>
        {error && (
            <div className="flex items-center gap-1 mt-1 ml-1 text-red-500 text-[11px] font-medium">
                <AlertCircle className="w-3 h-3" />
                <span>{error}</span>
            </div>
        )}
    </div>
);

const PersonalInfoStep = () => {
    const navigate = useNavigate();

    // Local state initialized with global data
    const [data, setData] = useState({
        gender: userProfileData.gender || '',
        age: userProfileData.age || '',
        height: userProfileData.height || '',
        weight: userProfileData.weight || '',
        healthConditions: userProfileData.healthConditions || [],
        allergies: userProfileData.allergies || [],
        fitnessGoal: userProfileData.fitnessGoal || '',
        weightManagementType: userProfileData.weightManagementType || 'lose',
        targetWeight: userProfileData.targetWeight || '',
        goalDuration: userProfileData.goalDuration || ''
    });

    const [errors, setErrors] = useState({});

    const addAllergy = (allergy) => {
        if (!data.allergies.includes(allergy)) {
            setData(prev => ({ ...prev, allergies: [...prev.allergies, allergy] }));
        }
    };

    const removeAllergy = (allergy) => {
        setData(prev => ({ ...prev, allergies: prev.allergies.filter(a => a !== allergy) }));
    };

    const addHealthCondition = (condition) => {
        if (!data.healthConditions.includes(condition)) {
            setData(prev => ({ ...prev, healthConditions: [...prev.healthConditions, condition] }));
        }
    };

    const removeHealthCondition = (condition) => {
        setData(prev => ({ ...prev, healthConditions: prev.healthConditions.filter(c => c !== condition) }));
    };

    const handleChange = (field, value) => {
        setData(prev => ({ ...prev, [field]: value }));
        // Clear error when user types
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handleNext = () => {
        // Validation
        const newErrors = {};
        if (!data.gender) newErrors.gender = "Required";
        if (!data.age || data.age <= 0) newErrors.age = "Required";
        if (!data.height || data.height <= 0) newErrors.height = "Required";
        if (!data.weight || data.weight <= 0) newErrors.weight = "Required";
        if (!data.fitnessGoal) newErrors.fitnessGoal = "Required";

        if (data.fitnessGoal === 'manage_weight') {
            if (!data.weightManagementType) newErrors.weightManagementType = "Required";

            if (data.weightManagementType === 'lose' || data.weightManagementType === 'gain') {
                if (!data.goalDuration) newErrors.goalDuration = "Required";
                if (!data.targetWeight || data.targetWeight <= 0) {
                    newErrors.targetWeight = "Required";
                } else {
                    // Determine max weight based on duration
                    let maxWeight = 3;
                    if (data.goalDuration === '3 months') maxWeight = 10;
                    else if (data.goalDuration === '6 months') maxWeight = 20;

                    if (data.targetWeight > maxWeight) {
                        newErrors.targetWeight = `Max ${maxWeight}kg for ${data.goalDuration}`;
                    }
                }
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Save to global profile and proceed
        updateProfileData(data);
        navigate('/onboarding/exercise-profile');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex flex-col h-full w-full absolute inset-0 bg-white rounded-t-[2rem] shadow-2xl pt-2"
        >
            <div className="p-4 md:p-6 flex-1 overflow-y-auto custom-scrollbar pb-4 block">
                <div className="text-center mb-4">
                    <h2 className="text-2xl font-black text-gray-900 mb-1 tracking-tight">1. General Profile</h2>
                    <p className="text-gray-500 text-xs font-medium">Let's start with the basics.</p>
                </div>

                <div className="space-y-3">
                    <div className="flex gap-4 p-3 bg-blue-50 rounded-2xl border border-blue-100 items-start">
                        <div className="flex-1">
                            <SelectField
                                label="Gender"
                                icon={User}
                                value={data.gender}
                                onChange={(e) => handleChange('gender', e.target.value)}
                                options={[
                                    { label: 'Male', value: 'Male' },
                                    { label: 'Female', value: 'Female' },
                                    { label: 'Other', value: 'Other' }
                                ]}
                                error={errors.gender}
                                className="mb-0"
                            />
                        </div>
                        <div className="flex-1">
                            <InputField
                                label="Age"
                                icon={CalendarDays}
                                type="number"
                                value={data.age}
                                onChange={(e) => handleChange('age', e.target.value)}
                                placeholder="E.g. 28"
                                suffix="Yrs"
                                error={errors.age}
                                className="mb-0"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 p-3 bg-purple-50 rounded-2xl border border-purple-100 items-start">
                        <div className="flex-1">
                            <InputField
                                label="Height"
                                icon={Ruler}
                                type="number"
                                value={data.height}
                                onChange={(e) => handleChange('height', e.target.value)}
                                placeholder="E.g. 175"
                                suffix="cm"
                                error={errors.height}
                                className="mb-0"
                            />
                        </div>
                        <div className="flex-1">
                            <InputField
                                label="Weight"
                                icon={Scale}
                                type="number"
                                value={data.weight}
                                onChange={(e) => handleChange('weight', e.target.value)}
                                placeholder="E.g. 70"
                                suffix="kg"
                                error={errors.weight}
                                className="mb-0"
                            />
                        </div>
                    </div>

                    {/* Goal Selection Card */}
                    <div className="relative">
                        <div className="bg-orange-50 p-3 rounded-2xl border border-orange-100 transition-all duration-300">
                            <label className="block text-[13px] font-bold text-gray-700 mb-1.5 ml-1">Primary Goal</label>
                            <SelectField
                                icon={Target}
                                value={data.fitnessGoal}
                                onChange={(e) => {
                                    handleChange('fitnessGoal', e.target.value);
                                    if (e.target.value !== 'manage_weight') {
                                        handleChange('targetWeight', '');
                                        handleChange('goalDuration', '');
                                        handleChange('weightManagementType', 'lose');
                                    }
                                }}
                                options={[
                                    { label: 'Manage Weight', value: 'manage_weight' },
                                    { label: 'Build Muscle', value: 'build_muscle' },
                                    { label: 'Improve Endurance', value: 'improve_endurance' }
                                ]}
                                error={errors.fitnessGoal}
                                // We remove the bottom margin here as we handle spacing internally
                                className="!mb-0"
                            />

                            {/* Contained Conditional Inputs for Manage Weight */}
                            {data.fitnessGoal === 'manage_weight' && (
                                <div className="mt-3 animate-fade-in border-t border-orange-200/60 pt-3">
                                    <label className="block text-[11px] font-bold text-gray-700 mb-1.5 ml-1 uppercase tracking-wider">Management Strategy</label>

                                    {/* Triple Toggle */}
                                    <div className="flex bg-orange-100/60 p-1 rounded-xl mb-4 relative z-0 relative h-10">
                                        {['lose', 'maintain', 'gain'].map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => {
                                                    handleChange('weightManagementType', type);
                                                    if (type === 'maintain') {
                                                        handleChange('targetWeight', '');
                                                        handleChange('goalDuration', '');
                                                    }
                                                }}
                                                className={`flex-1 flex items-center justify-center text-xs font-bold rounded-lg transition-all duration-200 capitalize relative z-10 ${data.weightManagementType === type
                                                    ? 'text-[#2E7D6B] shadow-sm bg-white'
                                                    : 'text-gray-500 hover:text-gray-700'
                                                    }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>

                                    {(data.weightManagementType === 'lose' || data.weightManagementType === 'gain') && (
                                        <div className="grid grid-cols-2 gap-3 animate-fade-in">
                                            <div className="relative">
                                                <label className="block text-[10px] font-bold text-gray-500 mb-1 ml-1 uppercase tracking-wider">Duration</label>
                                                <div className="relative flex items-center h-[42px]">
                                                    <select
                                                        value={data.goalDuration}
                                                        onChange={(e) => {
                                                            handleChange('goalDuration', e.target.value);
                                                            if (data.targetWeight) {
                                                                let maxWeight = 0;
                                                                if (e.target.value === '1 month') maxWeight = 3;
                                                                else if (e.target.value === '3 months') maxWeight = 10;
                                                                else if (e.target.value === '6 months') maxWeight = 20;

                                                                if (parseFloat(data.targetWeight) > maxWeight) {
                                                                    handleChange('targetWeight', '');
                                                                }
                                                            }
                                                        }}
                                                        className={`w-full h-full bg-white border border-orange-200 focus:border-[#2E7D6B] focus:ring-2 focus:ring-[#2E7D6B]/20 rounded-xl pl-9 pr-8 text-xs font-bold ${data.goalDuration !== '' ? 'text-gray-900' : 'text-gray-400'} transition-all outline-none shadow-sm appearance-none cursor-pointer`}
                                                    >
                                                        <option value="" disabled className="text-gray-400 font-medium">Select...</option>
                                                        {[{ label: '1 Month', value: '1 month' }, { label: '3 Months', value: '3 months' }, { label: '6 Months', value: '6 months' }].map((opt) => (
                                                            <option key={opt.value} value={opt.value} className="text-gray-900 font-medium">{opt.label}</option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute left-3 text-gray-400 pointer-events-none">
                                                        <Timer className="w-4 h-4" />
                                                    </div>
                                                    <div className="absolute right-2 text-gray-400 pointer-events-none">
                                                        <ChevronDown className="w-4 h-4" />
                                                    </div>
                                                </div>
                                                {errors.goalDuration && (
                                                    <div className="flex items-center gap-1 mt-1 ml-1 text-red-500 text-[10px] font-medium leading-tight">
                                                        <AlertCircle className="w-3 h-3 shrink-0" />
                                                        <span>{errors.goalDuration}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="relative">
                                                <label className="block text-[10px] font-bold text-gray-500 mb-1 ml-1 uppercase tracking-wider">Target ±</label>
                                                <div className="relative flex items-center h-[42px]">
                                                    <input
                                                        type="number"
                                                        value={data.targetWeight}
                                                        onChange={(e) => handleChange('targetWeight', e.target.value)}
                                                        placeholder={data.goalDuration === '1 month' ? 'Max 3' : data.goalDuration === '3 months' ? 'Max 10' : data.goalDuration === '6 months' ? 'Max 20' : 'E.g. 5'}
                                                        max={data.goalDuration === '1 month' ? 3 : data.goalDuration === '3 months' ? 10 : data.goalDuration === '6 months' ? 20 : undefined}
                                                        className={`w-full h-full bg-white border border-orange-200 focus:border-[#2E7D6B] focus:ring-2 focus:ring-[#2E7D6B]/20 rounded-xl pl-9 pr-10 text-xs font-bold text-gray-900 placeholder-gray-400 transition-all outline-none shadow-sm`}
                                                    />
                                                    <div className="absolute left-3 text-gray-400 pointer-events-none">
                                                        <Scale className="w-4 h-4" />
                                                    </div>
                                                    <div className="absolute right-3 text-[10px] font-bold text-gray-400 pointer-events-none">kg</div>
                                                </div>
                                                {errors.targetWeight && (
                                                    <div className="flex items-start gap-1 mt-1 ml-1 text-red-500 text-[10px] font-medium leading-tight">
                                                        <AlertCircle className="w-3 h-3 shrink-0 mt-[1px]" />
                                                        <span className="flex-1">{errors.targetWeight}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>



                    {/* Multi-Selects Layout */}
                    <div className="flex gap-4 p-3 bg-red-50 rounded-2xl border border-red-100 items-start">
                        {/* Health Conditions Multi-Select */}
                        <div className="flex-1">
                            <label className="block text-[13px] font-bold text-gray-700 mb-1.5 ml-1">Health Conditions</label>
                            <div className="relative flex flex-col gap-2">
                                <div className="relative flex items-center">
                                    <select
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                addHealthCondition(e.target.value);
                                                e.target.value = "";
                                            }
                                        }}
                                        className="w-full bg-white border border-red-200 focus:border-[#2E7D6B] focus:ring-2 focus:ring-[#2E7D6B]/20 rounded-xl py-2.5 pl-3 pr-8 text-sm font-bold text-gray-900 transition-all outline-none shadow-sm appearance-none cursor-pointer"
                                    >
                                        <option value="" disabled selected className="text-gray-400 font-medium">Select...</option>
                                        {[
                                            "Diabetes",
                                            "Hypertension",
                                            "PCOD/PCOS",
                                            "Thyroid",
                                            "High Cholesterol",
                                            "Arthritis",
                                            "None"
                                        ].map(opt => (
                                            <option key={opt} value={opt} className="text-gray-900 font-medium">{opt}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 text-gray-400 pointer-events-none transition-colors">
                                        <ChevronDown className="w-4 h-4" />
                                    </div>
                                </div>

                                {/* Selected Health Conditions Tags */}
                                {data.healthConditions.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 px-0.5">
                                        {data.healthConditions.map(cond => (
                                            <span key={cond} className="px-2 py-1 bg-white text-orange-700 rounded-md text-[10px] uppercase font-bold border border-orange-200 flex items-center gap-1 shadow-sm">
                                                {cond}
                                                <button
                                                    onClick={() => removeHealthCondition(cond)}
                                                    className="hover:text-orange-900 hover:bg-orange-100 p-0.5 rounded-full transition-colors flex items-center justify-center"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Food Allergies Multi-Select */}
                        <div className="flex-1">
                            <label className="block text-[13px] font-bold text-gray-700 mb-1.5 ml-1">Food Allergies</label>
                            <div className="relative flex flex-col gap-2">
                                <div className="relative flex items-center">
                                    <select
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                addAllergy(e.target.value);
                                                e.target.value = "";
                                            }
                                        }}
                                        className="w-full bg-white border border-red-200 focus:border-[#2E7D6B] focus:ring-2 focus:ring-[#2E7D6B]/20 rounded-xl py-2.5 pl-3 pr-8 text-sm font-bold text-gray-900 transition-all outline-none shadow-sm appearance-none cursor-pointer"
                                    >
                                        <option value="" disabled selected className="text-gray-400 font-medium">Select...</option>
                                        {[
                                            "Nuts & Legumes",
                                            "Seafood",
                                            "Grains & Gluten",
                                            "Dairy",
                                            "Eggs",
                                            "Soy & Plant Protein",
                                            "Pollen",
                                            "Seeds & Others"
                                        ].map(opt => (
                                            <option key={opt} value={opt} className="text-gray-900 font-medium">{opt}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 text-gray-400 pointer-events-none transition-colors">
                                        <ChevronDown className="w-4 h-4" />
                                    </div>
                                </div>

                                {/* Selected Allergies Tags */}
                                {data.allergies.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 px-0.5">
                                        {data.allergies.map(all => (
                                            <span key={all} className="px-2 py-1 bg-white text-red-700 rounded-md text-[10px] uppercase font-bold border border-red-200 flex items-center gap-1 shadow-sm">
                                                {all}
                                                <button
                                                    onClick={() => removeAllergy(all)}
                                                    className="hover:text-red-900 hover:bg-red-100 p-0.5 rounded-full transition-colors flex items-center justify-center"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Step-specific Next Button */}
            <div className="w-full px-4 py-3 flex justify-center shrink-0 bg-white border-t border-gray-100 pb-safe">
                <div className="w-full max-w-md">
                    <button
                        onClick={handleNext}
                        className="w-full py-3 bg-[#2E7D6B] text-white rounded-xl font-black text-base shadow-md hover:shadow-lg hover:bg-[#236354] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        Next
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default PersonalInfoStep;
