import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar as CalendarIcon, Activity, Flame, Clock, TrendingUp, Award } from 'lucide-react';
import { exerciseDatabase } from '../../data/exerciseDatabase';
import SidebarMenu from './SidebarMenu';
import CommonProfileMenu from './CommonProfileMenu';
import DateRangeCalendar from './DateRangeCalendar';

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
    const [dateRange, setDateRange] = useState({ start: null, end: null }); // ISO String
    const [availableDates, setAvailableDates] = useState(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    const filteredHistory = history.filter(h => {
        if (!dateRange.start && !dateRange.end) return true;
        
        if (dateRange.start && !dateRange.end) {
            return h.date === dateRange.start;
        }

        if (dateRange.start && dateRange.end) {
            const startStr = dateRange.start <= dateRange.end ? dateRange.start : dateRange.end;
            const endStr = dateRange.start <= dateRange.end ? dateRange.end : dateRange.start;
            return h.date >= startStr && h.date <= endStr;
        }
        return true;
    });
    const MathCeil = Math.ceil(filteredHistory.length / itemsPerPage);
    const totalPages = MathCeil === 0 ? 1 : MathCeil;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredHistory.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
            <SidebarMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

            {/* --- COMPACT HEADER --- */}
            <div className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-30">
                <div className="px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsMenuOpen(true)} className="p-2 hover:bg-gray-50 rounded-lg text-gray-500 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                            </svg>
                        </button>
                        <div>
                            <div className="text-[10px] font-black text-[#2E7D6B] uppercase tracking-wider leading-none mb-0.5">Your Journey</div>
                            <h1 className="text-lg font-black text-gray-800">Workout History</h1>
                        </div>
                    </div>

                    <CommonProfileMenu />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="w-full max-w-2xl mx-auto space-y-6">

                    {/* Collapsible Grid Calendar Filter */}
                    <div className="mb-6 relative z-20">
                        <DateRangeCalendar 
                            dateRange={dateRange}
                            onDateRangeChange={(range) => { setDateRange(range); setCurrentPage(1); }}
                            availableDates={availableDates}
                        />
                    </div>

                    {/* Weekly Summary Card */}
                    {weeklyStats.totalSessions > 0 && !(dateRange.start || dateRange.end) && (
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
