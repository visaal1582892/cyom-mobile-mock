import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar as CalendarIcon, Activity, Flame, Clock, TrendingUp, Award } from 'lucide-react';
import { exerciseDatabase } from '../../data/exerciseDatabase';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
};

const getRelativeDateStr = (date) => {
    return date.toISOString().split('T')[0];
};

const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${(seconds / 3600).toFixed(1)}h`;
};

export default function WorkoutHistoryPage() {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [weeklyStats, setWeeklyStats] = useState({ totalCalories: 0, totalTime: 0, totalSessions: 0 });
    const [planName, setPlanName] = useState("Cyom Routine Workout");
    const [selectedDate, setSelectedDate] = useState(null); // ISO String
    const [availableDates, setAvailableDates] = useState(new Set());
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const todayIdx = new Date().getDay();
        const savedPlanStr = localStorage.getItem('cyom_generated_workout_plan');
        let activePlanDef = null;
        if (savedPlanStr) {
            try { 
                activePlanDef = JSON.parse(savedPlanStr); 
                if (activePlanDef.name) setPlanName(activePlanDef.name);
            } catch (e) { }
        }

        // Helper: checks whether logs contain at least one session with real progress
        const hasRealData = (logsObj) => {
            if (!logsObj) return false;
            return Object.values(logsObj).some(dayLog =>
                Object.values(dayLog).some(entry => entry.timeInvested > 0)
            );
        };

        // Try to read existing logs
        let logs = null;
        const saved = localStorage.getItem('cyom_workout_logs');
        if (saved) {
            try { 
                logs = JSON.parse(saved); 
                // Migration: if keys are numeric, clear them for the better date-based system
                if (Object.keys(logs).length > 0 && !isNaN(Object.keys(logs)[0])) {
                    logs = null;
                }
            } catch (e) { }
        }

        // Generate robust 30-day mock if no logs exist
        if (!hasRealData(logs)) {
            const sampleExercises = exerciseDatabase.filter(ex => !['Yoga', 'Warm-up'].includes(ex.category));
            const flexPool = exerciseDatabase.filter(ex => ['Yoga', 'Warm-up'].includes(ex.category));
            
            logs = {};
            const today = new Date();
            Array.from({ length: 30 }, (_, i) => i).forEach(dayOffset => {
                const d = new Date(today);
                d.setDate(today.getDate() - dayOffset);
                const ds = getRelativeDateStr(d);
                logs[ds] = {};
                
                // Active days vs Rest days
                if (dayOffset % 3 === 0 && dayOffset !== 0) {
                    // Rest day -> 2 small flexibility moves
                    flexPool.slice(0, 2).forEach(ex => {
                        logs[ds][ex.id] = {
                            timeInvested: ex.baseTime,
                            repsDone: 0,
                            status: 'completed'
                        };
                    });
                } else if (dayOffset !== todayIdx) {
                    const s = dayOffset % (sampleExercises.length - 5);
                    const e = Math.min(s + 4 + (dayOffset % 3), sampleExercises.length);
                    sampleExercises.slice(s, e).forEach(ex => {
                        logs[ds][ex.id] = {
                            timeInvested: ex.baseTime,
                            repsDone: ex.targetRepsPerMin > 0 ? Math.floor((ex.baseTime / 60) * ex.targetRepsPerMin) : 0,
                            status: 'completed'
                        };
                    });
                }
            });
            localStorage.setItem('cyom_workout_logs', JSON.stringify(logs));
        }

        const historyData = [];
        let totalCalories = 0, totalTime = 0, totalSessions = 0;
        const datesFound = new Set();

        // Build 30-day history with perfect continuity
        Array.from({ length: 30 }, (_, i) => i).forEach(dayOffset => {
            const d = new Date();
            d.setDate(d.getDate() - dayOffset);
            const ds = getRelativeDateStr(d);
            const dayLog = logs[ds];
            
            if (dayLog && Object.keys(dayLog).length > 0) {
                datesFound.add(ds);
            }

            let sessionTime = 0;
            let sessionCalories = 0;
            let completedExercises = 0;
            let skippedExercises = 0;
            const exerciseNames = [];

            if (dayLog) {
                Object.keys(dayLog).forEach(exId => {
                    const log = dayLog[exId];
                    const exDef = exerciseDatabase.find(ex => ex.id === exId);
                    if (log && exDef) {
                        if (log.timeInvested > 0) {
                            sessionTime += log.timeInvested;
                            sessionCalories += (log.timeInvested / 60) * exDef.caloriesPerMin;
                            completedExercises++;
                            exerciseNames.push(exDef.name);
                        }
                        if (log.status === 'skipped') skippedExercises++;
                    }
                });
            }

            historyData.push({
                date: ds,
                sessionTime,
                sessionCalories: Math.round(sessionCalories),
                completedExercises,
                skippedExercises,
                exerciseNames,
                isRestDay: completedExercises === 0 || (completedExercises <= 2 && sessionTime <= 600)
            });

            if (completedExercises > 0) {
                if (dayOffset < 7) {
                    totalCalories += sessionCalories;
                    totalTime += sessionTime;
                    totalSessions++;
                }
            }
        });

        historyData.sort((a, b) => new Date(b.date) - new Date(a.date));
        setHistory(historyData);
        setAvailableDates(datesFound);
        setWeeklyStats({ totalCalories: Math.round(totalCalories), totalTime, totalSessions });
    }, []);

    // Pagination Logic
    const itemsPerPage = 10;
    const filteredHistory = selectedDate ? history.filter(h => h.date === selectedDate) : history;
    const MathCeil = Math.ceil(filteredHistory.length / itemsPerPage);
    const totalPages = MathCeil === 0 ? 1 : MathCeil;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredHistory.slice(indexOfFirstItem, indexOfLastItem);

    const calendarDates = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d;
    }).reverse();

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
            {/* Header */}
            <div className="bg-white px-4 py-4 shadow-sm flex items-center justify-between sticky top-0 z-50">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>
                <h1 className="text-sm font-black text-gray-800 uppercase tracking-widest">Workout History</h1>
                <div className="w-10 h-10" />
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="w-full max-w-2xl mx-auto space-y-6">

                    {/* Horizontal Calendar Filter */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                            <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">Select Date</h2>
                            {selectedDate && (
                                <button 
                                    onClick={() => { setSelectedDate(null); setCurrentPage(1); }}
                                    className="text-[10px] font-black text-[#2E7D6B] uppercase tracking-wider hover:underline"
                                >
                                    Clear Filter
                                </button>
                            )}
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 mask-fade">
                            {calendarDates.map((date, idx) => {
                                const ds = getRelativeDateStr(date);
                                const isSelected = selectedDate === ds;
                                const hasData = availableDates.has(ds);
                                const dayNum = date.getDate();
                                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            if (hasData) {
                                                setSelectedDate(isSelected ? null : ds);
                                                setCurrentPage(1);
                                            }
                                        }}
                                        disabled={!hasData}
                                        className={`flex-shrink-0 w-14 h-20 rounded-2xl flex flex-col items-center justify-center transition-all duration-300
                                            ${isSelected 
                                                ? 'bg-[#2E7D6B] text-white shadow-lg shadow-[#2E7D6B]/30 scale-105' 
                                                : hasData 
                                                    ? 'bg-white text-gray-600 hover:bg-[#E4F1EC] hover:text-[#2E7D6B] border border-gray-100' 
                                                    : 'bg-gray-100 text-gray-300 cursor-not-allowed opacity-50 border border-transparent'
                                            }`}
                                    >
                                        <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
                                            {dayName}
                                        </span>
                                        <span className="text-lg font-black">{dayNum}</span>
                                        {hasData && !isSelected && (
                                            <div className="w-1 h-1 bg-[#2E7D6B] rounded-full mt-1"></div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Weekly Summary Card */}
                    {weeklyStats.totalSessions > 0 && !selectedDate && (
                        <div className="bg-gradient-to-br from-[#2E7D6B] to-[#3BBF9E] rounded-[24px] p-5 text-white shadow-lg">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp size={16} className="opacity-80" />
                                <span className="text-xs font-black uppercase tracking-widest opacity-80">This Week's Summary</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <div className="text-2xl font-black">{weeklyStats.totalSessions}</div>
                                    <div className="text-[10px] uppercase font-bold opacity-70 tracking-widest">Sessions</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-black">{weeklyStats.totalCalories}</div>
                                    <div className="text-[10px] uppercase font-bold opacity-70 tracking-widest">Kcal Burned</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-black">{formatTime(weeklyStats.totalTime)}</div>
                                    <div className="text-[10px] uppercase font-bold opacity-70 tracking-widest">Total Time</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* History Records */}
                    <div className="space-y-3">
                        <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">Sessions Log</h2>
                        {history.length > 0 ? (
                            <>
                                {currentItems.map((record, index) => (
                                    <div key={index} 
                                         onClick={() => navigate('/active-workout', { state: { date: record.date, isToday: record.date === getRelativeDateStr(new Date()), isReadOnly: true } })}
                                         className="bg-white p-5 rounded-[20px] shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99] relative overflow-hidden">
                                        
                                        {record.isRestDay && (
                                            <div className="absolute top-0 right-0 bg-blue-50 text-blue-500 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-lg">
                                                Rest Day
                                            </div>
                                        )}
                                        
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-[14px] bg-[#E4F1EC] flex items-center justify-center text-[#2E7D6B]">
                                                    <CalendarIcon size={22} />
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-gray-800">{formatDate(record.date)}</h3>
                                                    <div className="text-[10px] font-black text-[#2E7D6B] mt-1 tracking-widest uppercase">
                                                        {record.isRestDay ? "Recovery & Flexibility" : planName}
                                                    </div>
                                                    <div className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-widest">
                                                        {record.completedExercises} exercises
                                                        {record.skippedExercises > 0 && ` • ${record.skippedExercises} skipped`}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right mt-2">
                                                <div className="text-xl font-black text-orange-500">{record.sessionCalories}</div>
                                                <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Kcal</div>
                                            </div>
                                        </div>

                                        {/* Stat Pills */}
                                        <div className="flex gap-2 flex-wrap">
                                            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                                <Clock size={11} className="text-[#2E7D6B]" />
                                                <span className="text-[11px] font-black text-gray-600">{formatTime(record.sessionTime)}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                                <Activity size={11} className="text-purple-500" />
                                                <span className="text-[11px] font-black text-gray-600">{record.completedExercises} done</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
                                                <Flame size={11} className="text-orange-500" />
                                                <span className="text-[11px] font-black text-orange-600">{record.sessionCalories} kcal</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="pt-2 pb-4 flex items-center justify-between">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredHistory.length)} of {filteredHistory.length}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                disabled={currentPage === 1}
                                                onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => prev - 1); }}
                                                className="w-8 h-8 flex items-center justify-center bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-[#2E7D6B] disabled:opacity-30 transition-all shadow-sm"
                                            >
                                                <ChevronLeft size={16} />
                                            </button>
                                            <div className="hidden sm:flex gap-1.5">
                                                {[...Array(totalPages)].map((_, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={(e) => { e.stopPropagation(); setCurrentPage(i + 1); }}
                                                        className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${currentPage === i + 1 ? 'bg-[#2E7D6B] text-white shadow-md' : 'bg-white text-gray-400 border border-gray-100 hover:border-[#2E7D6B] hover:text-[#2E7D6B]'}`}
                                                    >
                                                        {i + 1}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="sm:hidden px-2 py-1 bg-white border border-gray-100 rounded-lg text-[10px] font-black text-[#2E7D6B]">
                                                {currentPage} / {totalPages}
                                            </div>
                                            <button
                                                disabled={currentPage === totalPages}
                                                onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => prev + 1); }}
                                                className="w-8 h-8 flex items-center justify-center bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-[#2E7D6B] disabled:opacity-30 transition-all shadow-sm transform rotate-180"
                                            >
                                                <ChevronLeft size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                                <Award size={48} className="text-gray-400 mb-4" />
                                <h2 className="text-lg font-black text-gray-700">No History Yet</h2>
                                <p className="text-sm font-bold text-gray-500 mt-2 max-w-[200px]">
                                    Complete your first workout session to see stats here.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
