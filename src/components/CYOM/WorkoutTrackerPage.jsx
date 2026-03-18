import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Calendar as CalendarIcon, Activity, Flame, Clock } from 'lucide-react';
import CommonNavbar from './CommonNavbar';
import SidebarMenu from './SidebarMenu';
import { exerciseDatabase } from '../../data/exerciseDatabase';

// Helper to generate current week
const generateWeekDays = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday...
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const week = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + mondayOffset + i);
        const isFuture = d > today;
        const isToday = d.getTime() === today.getTime();

        week.push({
            dateObj: d,
            id: i, // 0 to 6 (Mon to Sun)
            dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
            dateNum: d.getDate(),
            monthName: d.toLocaleDateString('en-US', { month: 'short' }),
            year: d.getFullYear(),
            isFuture,
            isToday
        });
    }
    return week;
};

// --- MAIN PAGE ---
const WorkoutTrackerPage = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const weekDays = generateWeekDays();

    // Determine Month/Year string for header
    const getMonthYearStr = () => {
        const m1 = weekDays[0].monthName;
        const m2 = weekDays[6].monthName;
        const y1 = weekDays[0].year;
        const y2 = weekDays[6].year;
        if (m1 === m2) return `${m1} ${y1}`;
        if (y1 === y2) return `${m1} - ${m2} ${y1}`;
        return `${m1} ${y1} - ${m2} ${y2}`;
    };

    // State 
    const defaultToday = weekDays.find(d => d.isToday)?.id || 0;
    const [selectedDays, setSelectedDays] = useState([defaultToday]); // Array of IDs
    // Log Data: { [dayId]: { [exerciseId]: { timeInvested: 0, repsDone: 0 } } }
    const [dailyLogs, setDailyLogs] = useState({});

    // Load active generated plan
    const [activePlan, setActivePlan] = useState(null);
    useEffect(() => {
        const savedPlan = localStorage.getItem('cyom_generated_workout_plan');
        if (savedPlan) {
            try {
                setActivePlan(JSON.parse(savedPlan));
            } catch (e) { }
        }
    }, []);

    // Load from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem('cyom_workout_logs');
        let parsedLogs = null;
        if (saved) {
            try {
                parsedLogs = JSON.parse(saved);
            } catch (e) { }
        }

        if (parsedLogs && Object.keys(parsedLogs).length > 0) {
            setDailyLogs(parsedLogs);
        } else if (activePlan) {
            // Seed robust mock data if empty based on generated plan
            const mock = {};
            const todayIdx = defaultToday;
            
            // Seed all days in the active plan except today to populate history
            Object.keys(activePlan.plan).forEach(dayIdStr => {
                const dayId = parseInt(dayIdStr);
                if (dayId !== todayIdx) {
                    const dayPlan = activePlan.plan[dayId];
                    if (dayPlan) {
                        mock[dayId] = {};
                        Object.keys(dayPlan).forEach(exId => {
                            const exDef = exerciseDatabase.find(e => e.id === exId);
                            if (exDef) {
                                mock[dayId][exId] = {
                                    timeInvested: exDef.baseTime,
                                    repsDone: exDef.targetRepsPerMin > 0 ? Math.floor((exDef.baseTime / 60) * exDef.targetRepsPerMin) : 0,
                                    status: 'completed'
                                };
                            }
                        });
                    }
                }
            });

            setDailyLogs(mock);
            localStorage.setItem('cyom_workout_logs', JSON.stringify(mock));
        }
    }, [defaultToday, activePlan]);

    // Helper to calculate totals for active days
    const getMetrics = () => {
        let totalExercises = 0;
        let totalSeconds = 0;
        let totalCalories = 0;

        selectedDays.forEach(dayId => {
            const dayLog = dailyLogs[dayId] || {};
            
            // Loop through exercises that have been logged for this day
            Object.keys(dayLog).forEach(exId => {
                const log = dayLog[exId];
                const exDef = exerciseDatabase.find(e => e.id === exId);
                
                if (log && log.timeInvested > 0 && exDef) {
                    totalExercises++;
                    totalSeconds += log.timeInvested;
                    totalCalories += (log.timeInvested / 60) * exDef.caloriesPerMin;
                }
            });
        });

        return {
            exercises: totalExercises,
            hours: (totalSeconds / 3600).toFixed(1),
            calories: Math.round(totalCalories)
        };
    };

    const metrics = getMetrics();

    // Handlers
    const handleDayToggle = (day) => {
        if (day.isFuture) return;
        if (selectedDays.includes(day.id)) {
            // Don't allow unselecting the last day
            if (selectedDays.length > 1) {
                setSelectedDays(selectedDays.filter(id => id !== day.id));
            }
        } else {
            setSelectedDays([...selectedDays, day.id]);
        }
    };

    const handleSelectAll = () => {
        const pastDays = weekDays.filter(d => !d.isFuture).map(d => d.id);
        setSelectedDays(pastDays);
    };

    const handleReset = () => {
        setSelectedDays([defaultToday]);
    };

    // Determine if we show tracking list or just summary
    const isSingleDaySelected = selectedDays.length === 1;
    const activeWriteDay = isSingleDaySelected ? selectedDays[0] : null;
    const activeDayData = isSingleDaySelected ? weekDays.find(d => d.id === activeWriteDay) : null;

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#43AA95] to-[#A8E6CF] font-sans relative overflow-hidden text-white">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-full h-[50vh] bg-gradient-to-b from-black/10 to-transparent pointer-events-none"></div>

            {/* STICKY HEADER & NAVBAR */}
            <CommonNavbar showSidebarMenu={true} />

            {/* Main scrollable area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-10 relative z-10">
                <div className="w-full max-w-2xl mx-auto mt-4 space-y-6">

                    {/* Page Title */}
                    <div className="mb-2 ml-2 flex items-center justify-between text-white">
                        <div>
                            <h1 className="text-2xl font-black tracking-tight">Workout Tracker</h1>
                            <p className="text-xs font-medium opacity-80 mt-1">Track your progress and crush your goals</p>
                        </div>
                    </div>

                    {/* --- CALENDAR & METRICS DASHBOARD --- */}
                    <div className="bg-white/94 backdrop-blur-xl p-5 rounded-[28px] shadow-2xl border border-white/50">
                        {/* Timeline Header */}
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <div className="text-[10px] font-black tracking-widest text-[#2E7D6B] uppercase mb-0.5">Timeline</div>
                                <div className="text-base font-black text-gray-800 flex items-center gap-1.5">
                                    <CalendarIcon size={18} className="text-[#2E7D6B]" />
                                    {getMonthYearStr()}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => navigate('/workout-history')} className="px-3 py-1.5 bg-[#E4F1EC] text-[#2E7D6B] hover:bg-[#d0e8e0] rounded-xl text-xs font-bold transition-colors">History</button>
                                <button onClick={handleSelectAll} className="px-3 py-1.5 bg-gray-100 text-gray-500 hover:text-gray-700 rounded-xl text-xs font-bold transition-colors">All</button>
                                <button onClick={handleReset} className="px-3 py-1.5 bg-gray-100 text-gray-500 hover:text-red-500 rounded-xl text-xs font-bold transition-colors">Reset</button>
                            </div>
                        </div>

                        {/* Calendar Scroller */}
                        <div className="flex gap-2.5 overflow-x-auto custom-scrollbar pb-6 snap-x mb-6 border-b border-gray-100/60">
                            {weekDays.map(day => {
                                const isSelected = selectedDays.includes(day.id);
                                return (
                                    <button
                                        key={day.id}
                                        onClick={() => handleDayToggle(day)}
                                        disabled={day.isFuture}
                                        className={`snap-center shrink-0 w-[56px] h-[76px] flex flex-col items-center justify-center rounded-2xl transition-all border-2 ${day.isFuture
                                            ? 'opacity-40 cursor-not-allowed bg-gray-50 border-transparent text-gray-400'
                                            : isSelected
                                                ? 'bg-gradient-to-br from-[#2E7D6B] to-[#469C85] border-transparent text-white shadow-lg transform scale-[1.02]'
                                                : 'bg-white border-gray-100 text-gray-600 hover:border-gray-300 shadow-sm'
                                            }`}
                                    >
                                        <span className={`text-[10px] font-black uppercase tracking-wider mb-1 ${isSelected ? 'text-emerald-100' : 'text-gray-400'}`}>{day.dayName}</span>
                                        <span className="text-xl font-black leading-none">{day.dateNum}</span>
                                        {day.isToday && !isSelected && <div className="w-1.5 h-1.5 bg-[#2E7D6B] rounded-full mt-2"></div>}
                                        {day.isToday && isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full mt-2"></div>}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Summary Details Header */}
                        <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Activity size={18} className="text-[#2E7D6B]" /> Summary Details
                        </h2>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
                                <Activity className="text-emerald-500 w-6 h-6 mb-2" />
                                <div className="text-2xl font-black text-emerald-700">{metrics.exercises}</div>
                                <div className="text-[10px] uppercase tracking-widest font-bold text-emerald-600/70">Workouts</div>
                            </div>
                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
                                <Clock className="text-blue-500 w-6 h-6 mb-2" />
                                <div className="text-2xl font-black text-blue-700">{metrics.hours}</div>
                                <div className="text-[10px] uppercase tracking-widest font-bold text-blue-600/70">Hours</div>
                            </div>
                            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
                                <Flame className="text-orange-500 w-6 h-6 mb-2" />
                                <div className="text-2xl font-black text-orange-700">{metrics.calories}</div>
                                <div className="text-[10px] uppercase tracking-widest font-bold text-orange-600/70">Kcal</div>
                            </div>
                        </div>
                    </div>

                    {/* --- BODY CONTENT --- */}
                    <div className="mb-10">
                        {isSingleDaySelected && activeDayData ? (
                            <div className="relative rounded-[28px] overflow-hidden shadow-2xl border border-white/50 group">
                                {/* Hero Card Background Image */}
                                <div className="absolute inset-0 pointer-events-none">
                                    <img 
                                        src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80" 
                                        alt="Workout background" 
                                        className="w-full h-full object-cover brightness-[0.4] transition-all duration-700 group-hover:scale-105 group-hover:brightness-[0.45]"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent"></div>
                                </div>
                                
                                <div className="relative z-10 p-7 flex flex-col min-h-[220px] justify-between h-full">
                                    <div>
                                        <h2 className="text-2xl font-black text-white drop-shadow-md">
                                            {activeDayData.isToday ? "Today's Plan" : `${activeDayData.dayName}, ${activeDayData.dateNum}`}
                                        </h2>
                                        <p className="text-sm font-medium text-gray-300 mt-1">
                                            {activeDayData.isToday ? "Ready to crush today's goals?" : "View past performance or enter records manually"}
                                        </p>
                                    </div>
                                    
                                    <div className="mt-8 flex justify-end">
                                        <button 
                                            onClick={() => navigate('/active-workout', { state: { dayId: activeWriteDay, isToday: activeDayData.isToday }})}
                                            disabled={!activePlan?.plan?.[activeWriteDay]}
                                            className={`px-8 py-3.5 rounded-2xl font-black text-sm flex items-center gap-3 shadow-xl transform transition-transform hover:scale-105 hover:-translate-y-1 ${!activePlan?.plan?.[activeWriteDay] ? 'bg-gray-400 cursor-not-allowed hover:scale-100 hover:translate-y-0 text-white shadow-none' : activeDayData.isToday && metrics.exercises > 0 ? 'bg-amber-500 text-white' : 'bg-[#3BBF9E] text-white hover:bg-[#2E7D6B]'}`}
                                        >
                                            <Play size={18} fill="currentColor" /> 
                                            {!activePlan?.plan?.[activeWriteDay] ? "Rest Day" : activeDayData.isToday && metrics.exercises > 0 ? "Continue Session" : "Start Session"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white/94 backdrop-blur-xl p-5 rounded-[28px] shadow-2xl border border-white/50">
                                <div className="h-full flex flex-col items-center justify-center text-center py-10 opacity-60">
                                    <CalendarIcon size={48} className="text-gray-300 mb-4" />
                                    <h3 className="text-lg font-black text-gray-700 mb-1">Multiple Days Selected</h3>
                                    <p className="text-sm font-bold text-gray-400 max-w-[200px]">Reviewing aggregated stats. Select a single day to manage exercises.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <SidebarMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </div>
    );
};

export default WorkoutTrackerPage;
