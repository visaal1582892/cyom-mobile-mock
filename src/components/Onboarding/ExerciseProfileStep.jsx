import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ChevronDown, Activity, Award } from 'lucide-react';
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

// Custom MultiSelect to maintain styling and compact nature
const MultiSelectField = ({ value = [], onChange, options, placeholder = "Select modalities" }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleOption = (opt) => {
        if (value.includes(opt)) {
            onChange(value.filter(v => v !== opt));
        } else {
            onChange([...value, opt]);
        }
    };

    return (
        <div className="relative h-[42px] w-full">
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-full bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-xl px-3 flex items-center justify-between cursor-pointer shadow-sm transition-colors"
            >
                <div className="truncate flex-1 text-sm font-bold text-gray-900">
                    {value.length > 0 ? (
                        <div className="flex gap-1 overflow-x-auto custom-scrollbar items-center">
                            {value.map(v => (
                                <span key={v} className="bg-[#2E7D6B]/10 text-[#2E7D6B] px-2 py-0.5 rounded text-xs whitespace-nowrap">
                                    {v}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <span className="text-gray-400">{placeholder}</span>
                    )}
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto custom-scrollbar p-1">
                        {options.map(opt => (
                            <div
                                key={opt}
                                onClick={() => toggleOption(opt)}
                                className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer rounded-lg text-sm font-medium text-gray-700"
                            >
                                <div className={`w-4 h-4 rounded border mr-2 flex items-center justify-center ${value.includes(opt) ? 'bg-[#2E7D6B] border-[#2E7D6B]' : 'border-gray-300'}`}>
                                    {value.includes(opt) && (
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                {opt}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

const ExerciseProfileStep = () => {
    const navigate = useNavigate();

    // Default structure for shift data
    const initialShiftData = {
        Morning: { hours: '', modalities: [] },
        Afternoon: { hours: '', modalities: [] },
        Evening: { hours: '', modalities: [] }
    };

    const getInitialExercise = () => {
        const val = userProfileData.exercises;
        if (val === true || val === 'Yes') return 'Yes';
        if (val === false || val === 'No' || !val) return 'No';
        return 'No';
    };

    const [data, setData] = useState({
        exercises: getInitialExercise(),
        frequency: userProfileData.frequency || '',
        activeShifts: userProfileData.activeShifts || [],
        shifts: userProfileData.shifts || initialShiftData,
        intensity: userProfileData.intensity || '',
        experienceLevel: userProfileData.experienceLevel || ''
    });

    const [error, setError] = useState('');

    const isYesSelected = data.exercises === 'Yes';

    const modalitiesList = ['Strength training', 'Cardio', 'HIIT', 'Yoga', 'Walking', 'Sports'];
    const intensities = ['Low', 'Medium', 'High'];
    const experienceLevels = ['Beginner', 'Intermediate', 'Advanced'];
    const shiftOptions = ['Morning', 'Afternoon', 'Evening'];
    const daysOptions = Array.from({ length: 7 }, (_, i) => ({ label: `${i + 1} ${i === 0 ? 'Day' : 'Days'}/wk`, value: i + 1 }));

    // Calculate total hours across active shifts
    const totalHours = useMemo(() => {
        let sum = 0;
        data.activeShifts.forEach(shift => {
            const hrs = parseFloat(data.shifts[shift]?.hours || 0);
            if (!isNaN(hrs)) sum += hrs;
        });
        return sum;
    }, [data.activeShifts, data.shifts]);

    const handleChange = (updates) => {
        setData(prev => ({ ...prev, ...updates }));
        setError('');
    };

    const handleShiftChange = (shift, field, value) => {
        setData(prev => ({
            ...prev,
            shifts: {
                ...prev.shifts,
                [shift]: {
                    ...prev.shifts[shift],
                    [field]: value
                }
            }
        }));
        setError('');
    };

    const handleNext = () => {
        if (!data.exercises) {
            setError("Please answer if you currently exercise.");
            return;
        }

        if (data.exercises === 'Yes') {
            if (!data.frequency) {
                setError("Please select how many days per week you exercise.");
                return;
            }

            if (data.activeShifts.length === 0) {
                setError("Please select at least one shift when you exercise.");
                return;
            }

            if (totalHours === 0) {
                setError("Please enter exercise hours for at least one active shift.");
                return;
            }

            // Verify that any active shift with hours has modalities, and vice versa
            let hasIncompleteShift = false;
            data.activeShifts.forEach(shift => {
                const shiftData = data.shifts[shift];
                const hasHours = parseFloat(shiftData.hours) > 0;
                const hasModalities = shiftData.modalities.length > 0;

                if ((hasHours && !hasModalities) || (!hasHours && hasModalities)) {
                    hasIncompleteShift = true;
                }
            });

            if (hasIncompleteShift) {
                setError("If you enter hours for a shift, please select modalities too (and vice versa).");
                return;
            }

            if (!data.intensity) {
                setError("Please select an intensity level.");
                return;
            }
            if (!data.experienceLevel) {
                setError("Please select your experience level.");
                return;
            }
        }

        // Save to global profile and proceed
        // If 'No', clear out specific data
        const finalData = data.exercises === 'No'
            ? { ...data, frequency: '', activeShifts: [], shifts: initialShiftData, intensity: '', experienceLevel: '' }
            : data;

        updateProfileData(finalData);
        navigate('/onboarding/lifestyle-health');
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
                    <h2 className="text-2xl font-black text-gray-900 mb-1 tracking-tight">2. Current Activity</h2>
                </div>

                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-3 py-2.5 rounded-xl flex items-center gap-2 text-[13px] font-medium animate-fade-in shadow-sm">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        {error}
                    </div>
                )}
 
                {/* Compact "Do you exercise?" row */}
                <div className="mb-4 bg-purple-50 p-3 rounded-2xl border border-purple-100 flex gap-4 items-center">
                    <div className="flex-1">
                        <label className="block text-[13px] font-bold text-gray-700 mb-1.5 ml-1">Do You Exercise</label>
                        <SelectField
                            value={data.exercises}
                            onChange={(e) => {
                                handleChange({ exercises: e.target.value });
                                if (e.target.value === 'No') {
                                    handleChange({ frequency: '', activeShifts: [], shifts: initialShiftData, intensity: '', experienceLevel: '' });
                                }
                            }}
                            options={[
                                { label: 'Yes', value: 'Yes' },
                                { label: 'No', value: 'No' }
                            ]}
                            className="mb-0"
                        />
                    </div>

                    {isYesSelected && (
                        <div className="flex-1 animate-fade-in">
                            <label className="block text-[13px] font-bold text-gray-700 mb-1.5 ml-1">Days / Week</label>
                            <SelectField
                                value={data.frequency}
                                onChange={(e) => handleChange({ frequency: parseInt(e.target.value) })}
                                options={daysOptions}
                                className="mb-0"
                            />
                        </div>
                    )}
                </div>

                {/* Shift Details Content if Yes */}
                {isYesSelected && (
                    <div className="space-y-4 animate-fade-in pb-4">
                        <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100">
                            <div className="mb-3">
                                <label className="block text-[13px] font-bold text-gray-700 mb-1.5 ml-1">When do you exercise?</label>
                                <MultiSelectField
                                    value={data.activeShifts}
                                    onChange={(val) => handleChange({ activeShifts: val })}
                                    options={shiftOptions}
                                    placeholder="Select active shifts..."
                                />
                            </div>

                            {data.activeShifts.length > 0 && (
                                <div className="space-y-3 bg-white border border-blue-200 rounded-2xl p-3 shadow-sm animate-fade-in">
                                    <div className="flex justify-between items-end mb-1 ml-1">
                                        <label className="text-[13px] font-bold text-gray-700">Daily Exercise</label>
                                        {totalHours > 0 && (
                                            <span className="text-[11px] font-bold text-[#2E7D6B] bg-[#2E7D6B]/10 px-2 py-0.5 rounded-full">
                                                Total: {totalHours} hrs/day
                                            </span>
                                        )}
                                    </div>

                                    {/* Shifts Rows - 2 Column Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {shiftOptions.filter(shift => data.activeShifts.includes(shift)).map((shift) => (
                                            <div key={shift} className="flex flex-col gap-2 p-3 border border-blue-100 rounded-xl bg-blue-50/50">
                                                <div className="text-sm font-bold text-gray-700">
                                                    {shift}
                                                </div>
                                                <div className="flex gap-2 w-full">
                                                    {/* Hours Input */}
                                                    <div className="relative w-24 h-[40px] shrink-0">
                                                        <input
                                                            type="number"
                                                            step="0.5"
                                                            min="0"
                                                            max="24"
                                                            value={data.shifts[shift].hours}
                                                            onChange={(e) => handleShiftChange(shift, 'hours', e.target.value)}
                                                            placeholder="0.0"
                                                            className="w-full h-full bg-white border border-blue-100 focus:border-[#2E7D6B] focus:ring-2 focus:ring-[#2E7D6B]/20 rounded-lg pl-3 pr-8 font-bold text-sm text-gray-900 placeholder-gray-400 transition-all outline-none"
                                                        />
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 pointer-events-none">
                                                            hrs
                                                        </div>
                                                    </div>

                                                    {/* Modalities MultiSelect */}
                                                    <div className="flex-1 h-[40px]">
                                                        <MultiSelectField
                                                            value={data.shifts[shift].modalities}
                                                            onChange={(val) => handleShiftChange(shift, 'modalities', val)}
                                                            options={modalitiesList}
                                                            placeholder="Select type(s)..."
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Intensity & Experience */}
                        <div className="flex gap-4 p-3 bg-orange-50 rounded-2xl border border-orange-100 items-start">
                            <div className="flex-1">
                                <SelectField
                                    label="Intensity Level"
                                    icon={Activity}
                                    value={data.intensity}
                                    onChange={(e) => handleChange({ intensity: e.target.value })}
                                    options={intensities.map(i => ({ label: i, value: i }))}
                                    className="mb-0"
                                />
                            </div>
                            <div className="flex-1">
                                <SelectField
                                    label="Experience Level"
                                    icon={Award}
                                    value={data.experienceLevel}
                                    onChange={(e) => handleChange({ experienceLevel: e.target.value })}
                                    options={experienceLevels.map(i => ({ label: i, value: i }))}
                                    className="mb-0"
                                />
                            </div>
                        </div>
                    </div>
                )}
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

export default ExerciseProfileStep;
