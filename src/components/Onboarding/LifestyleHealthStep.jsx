import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Clock, Droplets, Activity, Briefcase, AlertCircle, ChevronDown } from 'lucide-react';
import { userData as userProfileData, updateProfileData } from '../../data/store';
import { motion } from 'framer-motion';

const SelectField = ({ label, icon: Icon, value, onChange, options, error, className = "" }) => (
    <div className={`mb-3 text-left ${className}`}>
        {label && <label className="block text-[13px] font-bold text-gray-700 mb-1.5 ml-1">{label}</label>}
        <div className="relative flex items-center h-[42px]">
            <select
                value={value}
                onChange={onChange}
                className={`w-full h-full bg-gray-50 border border-gray-200 focus:border-[#2E7D6B] focus:bg-white focus:ring-2 focus:ring-[#2E7D6B]/20 rounded-xl ${Icon ? 'pl-10' : 'pl-3'} pr-8 text-sm font-bold ${value !== '' ? 'text-gray-900' : 'text-gray-400'} transition-all outline-none shadow-sm appearance-none cursor-pointer`}
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

const InputField = ({ label, type = "text", value, onChange, placeholder, suffix, min, max, error, className = "" }) => (
    <div className={`text-left ${className}`}>
        {label && <label className="block text-[13px] font-bold text-gray-700 mb-1.5 ml-1">{label}</label>}
        <div className="relative flex items-center h-[42px]">
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                min={min}
                max={max}
                className={`w-full h-full bg-gray-50 border border-gray-200 focus:border-[#2E7D6B] focus:bg-white focus:ring-2 focus:ring-[#2E7D6B]/20 rounded-xl pl-3 ${suffix ? 'pr-12' : 'pr-3'} font-bold text-sm text-gray-900 placeholder-gray-400 transition-all outline-none shadow-sm`}
            />
            {suffix && (
                <div className="absolute right-3 text-[10px] font-bold text-gray-400 pointer-events-none">
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

const LifestyleHealthStep = () => {
    const navigate = useNavigate();

    const [data, setData] = useState({
        sleepQuality: userProfileData.sleepQuality || '',
        sleepHours: userProfileData.sleepHours || '',
        waterIntake: userProfileData.waterIntake || '',
        stressLevel: userProfileData.stressLevel || '',
        workHours: userProfileData.workHours || ''
    });

    const [errors, setErrors] = useState({});

    const handleChange = (field, value) => {
        // Enforce max 15 for work hours natively
        if (field === 'workHours') {
            const numVal = parseFloat(value);
            if (numVal > 15) return;
        }

        setData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handleNext = () => {
        const newErrors = {};
        if (!data.sleepQuality) newErrors.sleepQuality = "Required";
        if (!data.sleepHours || data.sleepHours <= 0) newErrors.sleepHours = "Required";
        if (!data.waterIntake || data.waterIntake <= 0) newErrors.waterIntake = "Required";
        if (!data.stressLevel) newErrors.stressLevel = "Required";
        if (!data.workHours || data.workHours < 0) newErrors.workHours = "Required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        updateProfileData(data);

        // Final Step completes the onboarding 
        navigate('/cyom-home');
    };

    const sleepQualityOptions = [
        { label: 'Excellent (Deep, refreshing)', value: 'Excellent' },
        { label: 'Good (Mostly undisturbed)', value: 'Good' },
        { label: 'Fair (Toss & turn often)', value: 'Fair' },
        { label: 'Poor (Wake up tired)', value: 'Poor' }
    ];

    const stressOptions = [
        { label: 'Low', value: 'Low' },
        { label: 'Medium', value: 'Medium' },
        { label: 'High', value: 'High' }
    ];

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
                    <h2 className="text-2xl font-black text-gray-900 mb-1 tracking-tight">3. Lifestyle & Health</h2>
                    <p className="text-gray-500 text-xs font-medium">Almost there! Complete your daily habits.</p>
                </div>

                <div className="space-y-3">
                    {/* Sleep Section - Side by Side */}
                    <div className="flex gap-3 p-3 bg-purple-50 rounded-2xl border border-purple-100 items-start">
                        <div className="flex-1">
                            <SelectField
                                label="Sleep Quality"
                                icon={Moon}
                                value={data.sleepQuality}
                                onChange={(e) => handleChange('sleepQuality', e.target.value)}
                                options={sleepQualityOptions}
                                error={errors.sleepQuality}
                                className="mb-0"
                            />
                        </div>
                        <div className="w-20 shrink-0">
                            <InputField
                                label="Hours"
                                type="number"
                                value={data.sleepHours}
                                onChange={(e) => handleChange('sleepHours', e.target.value)}
                                placeholder="0.0"
                                suffix="hrs"
                                min="0"
                                max="24"
                                error={errors.sleepHours}
                                className="mb-0"
                            />
                        </div>
                    </div>

                    {/* Water Intake Section */}
                    <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100">
                        <label className="block text-[13px] font-bold text-gray-700 mb-1.5 ml-1">Daily Water Intake</label>
                        <div className="flex items-start gap-3">
                            <div className="w-[42px] h-[42px] bg-white rounded-xl flex items-center justify-center text-blue-500 shadow-sm border border-blue-100 shrink-0">
                                <Droplets className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                                <InputField
                                    type="number"
                                    value={data.waterIntake}
                                    onChange={(e) => handleChange('waterIntake', e.target.value)}
                                    placeholder="E.g. 2.5"
                                    suffix="Ltrs"
                                    min="0"
                                    error={errors.waterIntake}
                                    className="mb-0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Stress Level */}
                    <div className="p-3 bg-orange-50 rounded-2xl border border-orange-100">
                        <SelectField
                            label="Current Stress Level"
                            icon={Activity}
                            value={data.stressLevel}
                            onChange={(e) => handleChange('stressLevel', e.target.value)}
                            options={stressOptions}
                            error={errors.stressLevel}
                            className="mb-0"
                        />
                    </div>

                    {/* Work Hours */}
                    <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200">
                        <label className="block text-[13px] font-bold text-gray-700 mb-1.5 ml-1 flex justify-between items-center">
                            Working Hours / Day
                            <span className="text-[10px] text-gray-400 font-medium">Max: 15</span>
                        </label>
                        <div className="flex items-start gap-3">
                            <div className="w-[42px] h-[42px] bg-white rounded-xl flex items-center justify-center text-gray-500 shadow-sm border border-gray-200 shrink-0">
                                <Briefcase className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                                <InputField
                                    type="number"
                                    value={data.workHours}
                                    onChange={(e) => handleChange('workHours', e.target.value)}
                                    placeholder="E.g. 8"
                                    suffix="hrs"
                                    min="0"
                                    max="15"
                                    error={errors.workHours}
                                    className="mb-0"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Step-specific Complete Button */}
            <div className="w-full px-4 py-3 flex justify-center shrink-0 bg-white border-t border-gray-100 pb-safe">
                <div className="w-full max-w-md">
                    <button
                        onClick={handleNext}
                        className="w-full py-3 bg-[#2E7D6B] text-white rounded-xl font-black text-base shadow-md hover:shadow-lg hover:bg-[#236354] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        Complete Profile
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default LifestyleHealthStep;
