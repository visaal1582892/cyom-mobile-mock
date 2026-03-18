import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Play, Pause, RotateCcw, CheckCircle2, Activity, Flame, Clock, SkipForward, Zap } from 'lucide-react';
import { exerciseDatabase } from '../../data/exerciseDatabase';

// ── Helpers ─────────────────────────────────────────────────────────────────
const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    return `${m}:${(s % 60).toString().padStart(2, '0')}`;
};

const StatusBadge = ({ status }) => {
    if (status === 'completed') return <span className="text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Done</span>;
    if (status === 'skipped') return <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Skipped</span>;
    return null;
};

// ── Exercise Row ─────────────────────────────────────────────────────────────
function ExerciseRow({ exercise, existingLog, onClick, isReadOnly }) {
    const isTimeBased = exercise.intensity === 'Time' || exercise.intensity === 'Distance/time';
    const isRepsBased = exercise.intensity === 'Reps';
    const status = existingLog?.status || null;
    const isDone = status === 'completed';
    const isSkipped = status === 'skipped';
    const elapsed = existingLog?.timeInvested || 0;
    const repsInput = existingLog?.repsDone?.toString() || '';

    return (
        <button
            onClick={isReadOnly ? undefined : onClick}
            className={`w-full bg-white rounded-2xl shadow-sm border transition-all overflow-hidden flex items-center gap-3 p-4 text-left ${isReadOnly ? 'cursor-default' : 'hover:border-[#2E7D6B] cursor-pointer hover:shadow-md active:scale-[0.99]'} ${isDone ? 'border-green-200' : isSkipped ? 'border-gray-100 opacity-70' : 'border-gray-100'}`}
        >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 ${isDone ? 'bg-green-100 text-green-500' : isSkipped ? 'bg-gray-100 text-gray-400' : 'bg-gray-100 text-gray-500 ' + (!isReadOnly ? 'group-hover:bg-[#E4F1EC] group-hover:text-[#2E7D6B]' : '')}`}>
                {isDone ? <CheckCircle2 size={18} /> : isSkipped ? <SkipForward size={16} /> : (!isReadOnly ? <Play size={16} className="ml-0.5" /> : <div className="w-2 h-2 rounded-full bg-gray-300" />)}
            </div>
            <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-800 text-sm leading-snug">{exercise.name}</div>
                <div className="text-[11px] text-gray-400 font-bold flex items-center gap-2 mt-0.5">
                    <span>{exercise.category}</span>
                    <span>·</span>
                    <span className="text-[#2E7D6B]">{exercise.intensity}</span>
                    <span>·</span>
                    <span>{exercise.primaryMuscle}</span>
                </div>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <StatusBadge status={status} />
                {isTimeBased && elapsed > 0 && !isDone && (
                    <span className="text-[11px] font-black text-[#2E7D6B] tabular-nums">{formatTime(elapsed)}</span>
                )}
                {isRepsBased && repsInput && !isDone && (
                    <span className="text-[11px] font-black text-[#2E7D6B] tabular-nums">{repsInput} reps</span>
                )}
                {!isDone && !isSkipped && (
                    <span className="text-[10px] font-bold text-gray-300">{formatTime(exercise.baseTime)} target</span>
                )}
            </div>
        </button>
    );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function ActiveWorkoutPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const [date, setDate] = useState(location.state?.date || new Date().toISOString().split('T')[0]);
    const [dayId, setDayId] = useState(() => {
        if (location.state?.dayId !== undefined) return location.state.dayId;
        if (location.state?.date) return new Date(location.state.date).getDay();
        return new Date().getDay();
    });
    const isToday = location.state?.isToday ?? (date === new Date().toISOString().split('T')[0]);
    const isReadOnly = location.state?.isReadOnly ?? false;

    // Load plan
    const [activePlan, setActivePlan] = useState(null);
    useEffect(() => {
        const p = localStorage.getItem('cyom_generated_workout_plan');
        if (p) { try { setActivePlan(JSON.parse(p)); } catch { } }
    }, []);

    // Session logs
    const [sessionLogs, setSessionLogs] = useState(() => {
        try {
            const all = JSON.parse(localStorage.getItem('cyom_workout_logs') || '{}');
            // Check for date-based log first, then fallback to dayId (legacy)
            return all[date] || all[dayId] || {};
        } catch { return {}; }
    });

    useEffect(() => {
        try {
            const all = JSON.parse(localStorage.getItem('cyom_workout_logs') || '{}');
            setSessionLogs(all[date] || all[dayId] || {});
        } catch { }
    }, [date, dayId]);

    const handleSave = (exerciseId, logData) => {
        setSessionLogs(prev => ({ ...prev, [exerciseId]: logData }));
    };

    const dayExercises = (() => {
        if (isReadOnly && Object.keys(sessionLogs).length > 0) {
            return Object.keys(sessionLogs)
                .map(id => exerciseDatabase.find(e => e.id === id))
                .filter(Boolean);
        }
        if (activePlan?.plan?.[dayId]) {
            return Object.keys(activePlan.plan[dayId])
                .map(id => exerciseDatabase.find(e => e.id === id))
                .filter(Boolean);
        }
        return Object.keys(sessionLogs).length > 0
            ? Object.keys(sessionLogs).map(id => exerciseDatabase.find(e => e.id === id)).filter(Boolean)
            : exerciseDatabase.slice(0, 7);
    })();

    // ── Render ────────────────────────────────────────────────────────────────

    // Live stats
    const completedCount = dayExercises.filter(ex => sessionLogs[ex.id]?.status === 'completed').length;
    const skippedCount = dayExercises.filter(ex => sessionLogs[ex.id]?.status === 'skipped').length;
    const totalCalories = dayExercises.reduce((acc, ex) => {
        const log = sessionLogs[ex.id];
        if (log && log.timeInvested > 0) acc += (log.timeInvested / 60) * ex.caloriesPerMin;
        return acc;
    }, 0);
    const totalTime = dayExercises.reduce((acc, ex) => {
        const log = sessionLogs[ex.id];
        return acc + (log?.timeInvested || 0);
    }, 0);
    const progressPct = dayExercises.length > 0 ? ((completedCount + skippedCount) / dayExercises.length) * 100 : 0;

    const allDone = completedCount + skippedCount === dayExercises.length && dayExercises.length > 0;

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
            {/* Header */}
            <div className="bg-white px-4 py-4 shadow-sm border-b border-gray-100 flex flex-col sticky top-0 z-50">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="text-center">
                        <h1 className="text-sm font-black text-gray-800 uppercase tracking-widest">{isReadOnly ? "Workout Record" : "Active Workout"}</h1>
                        <p className="text-xs font-bold text-[#2E7D6B]">{activePlan?.name || "Workout Plan"}</p>
                    </div>
                    {!isReadOnly ? (
                        <button
                            onClick={() => navigate('/workout-player', { state: { dayId, isToday, date } })}
                            className="w-10 h-10 rounded-full bg-[#E4F1EC] text-[#2E7D6B] flex items-center justify-center hover:bg-[#d0e8e0] transition-colors"
                            title="Guided Player"
                        >
                            <Zap size={16} />
                        </button>
                    ) : (
                        <div className="w-10 h-10" />
                    )}
                </div>

                {/* Day Selection Tabs */}
                {activePlan?.plan && (
                    <div className="w-full max-w-2xl mx-auto mt-4 pt-1">
                        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
                            {Object.keys(activePlan.plan).map(day => (
                                <button
                                    key={day}
                                    onClick={() => setDayId(Number(day))}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors border ${dayId === Number(day) ? 'bg-[#2E7D6B] text-white border-transparent shadow-md' : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100 hover:text-gray-700'}`}
                                >
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][Number(day)]}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-10">
                <div className="w-full max-w-2xl mx-auto mt-4 space-y-4">

                    {/* Stats bar */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                        <div className="flex justify-between text-xs font-bold mb-2">
                            <span className="text-gray-500">{completedCount}/{dayExercises.length} Complete</span>
                            <span className="text-[#2E7D6B]">{Math.round(progressPct)}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                            <div className="h-full bg-gradient-to-r from-[#2E7D6B] to-[#3BBF9E] rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="flex items-center gap-2">
                                <Flame size={16} className="text-orange-400" />
                                <div>
                                    <div className="text-base font-black text-gray-800">{Math.round(totalCalories)}</div>
                                    <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Kcal</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-blue-400" />
                                <div>
                                    <div className="text-base font-black text-gray-800">{formatTime(totalTime)}</div>
                                    <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Time</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Activity size={16} className="text-[#2E7D6B]" />
                                <div>
                                    <div className="text-base font-black text-gray-800">{completedCount}</div>
                                    <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Done</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Exercise List */}
                    <div className="space-y-3 pb-6 border-b border-gray-100">
                        {dayExercises.map(ex => (
                            <ExerciseRow
                                key={ex.id}
                                exercise={ex}
                                existingLog={sessionLogs[ex.id]}
                                onClick={() => navigate('/workout-player', { state: { dayId, isToday, startIndex: dayExercises.findIndex(e => e.id === ex.id) } })}
                                isReadOnly={isReadOnly}
                            />
                        ))}
                    </div>

                    {/* Save & Exit / Completion prompt */}
                    {!isReadOnly && (
                        allDone ? (
                            <div className="bg-green-50 border border-green-200 text-center p-5 rounded-2xl">
                                <CheckCircle2 size={32} className="text-green-500 mx-auto mb-2" />
                                <div className="font-black text-green-700 mb-1">All exercises complete!</div>
                                <button
                                    onClick={() => navigate('/workout-tracker')}
                                    className="mt-3 px-8 py-3 bg-green-500 text-white rounded-xl font-black text-sm hover:bg-green-600 transition-colors"
                                >
                                    Save & Exit →
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => navigate('/workout-tracker')}
                                className="w-full py-4 bg-white text-[#2E7D6B] border-2 border-[#2E7D6B] rounded-2xl font-black text-sm hover:bg-gray-50 transition-colors"
                            >
                                Save Progress & Exit
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
