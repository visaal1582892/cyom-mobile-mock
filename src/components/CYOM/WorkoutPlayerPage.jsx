import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Play, Pause, SkipForward, ChevronLeft, CheckCircle2, Trophy, RotateCcw, Zap, Clock, Flame } from 'lucide-react';
import { exerciseDatabase } from '../../data/exerciseDatabase';

// ── Helpers ────────────────────────────────────────────────────────────────────
const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
};

const INTENSITY_COLOR = {
    Time: 'from-[#2E7D6B] to-[#3BBF9E]',
    Reps: 'from-[#2E7D6B] to-[#3BBF9E]',
    'Distance/time': 'from-[#2E7D6B] to-[#3BBF9E]',
};

const INTENSITY_TEXT = {
    Time: 'text-[#2E7D6B]',
    Reps: 'text-[#2E7D6B]',
    'Distance/time': 'text-[#2E7D6B]',
};

// ── Rest Timer between exercises ───────────────────────────────────────────────
function RestScreen({ onContinue }) {
    const [rest, setRest] = useState(15);
    useEffect(() => {
        if (rest <= 0) { onContinue(); return; }
        const t = setTimeout(() => setRest(r => r - 1), 1000);
        return () => clearTimeout(t);
    }, [rest, onContinue]);

    return (
        <div className="fixed inset-0 z-50 bg-[#1b1b3a] flex flex-col items-center justify-center text-white">
            <div className="text-sm font-black uppercase tracking-widest opacity-60 mb-6">Rest Time</div>
            <div className="text-8xl font-black tabular-nums mb-8">{rest}</div>
            <button
                onClick={onContinue}
                className="px-10 py-4 bg-white/10 border border-white/20 rounded-full font-bold text-sm hover:bg-white/20 transition-colors"
            >
                Skip Rest →
            </button>
        </div>
    );
}

// ── Completion Screen ──────────────────────────────────────────────────────────
function CompletionScreen({ stats, onFinish, onRepeat }) {
    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#1b1b3a] to-[#2E7D6B] text-white items-center justify-center px-6 font-sans">
            <div className="mb-6 relative">
                <div className="w-28 h-28 rounded-full bg-white/10 flex items-center justify-center">
                    <Trophy size={52} className="text-yellow-400" />
                </div>
            </div>
            <h1 className="text-3xl font-black mb-2 text-center">Workout Done!</h1>
            <p className="text-white/60 font-medium mb-10 text-center">Amazing session. Your progress is saved.</p>

            <div className="grid grid-cols-3 gap-4 w-full max-w-sm mb-10">
                <div className="bg-white/10 rounded-2xl p-4 text-center">
                    <Flame size={20} className="text-orange-400 mx-auto mb-1" />
                    <div className="text-xl font-black">{stats.calories}</div>
                    <div className="text-[10px] opacity-60 uppercase tracking-widest font-bold">Kcal</div>
                </div>
                <div className="bg-white/10 rounded-2xl p-4 text-center">
                    <CheckCircle2 size={20} className="text-green-400 mx-auto mb-1" />
                    <div className="text-xl font-black">{stats.completed}</div>
                    <div className="text-[10px] opacity-60 uppercase tracking-widest font-bold">Done</div>
                </div>
                <div className="bg-white/10 rounded-2xl p-4 text-center">
                    <Clock size={20} className="text-blue-400 mx-auto mb-1" />
                    <div className="text-xl font-black">{formatTime(stats.totalTime)}</div>
                    <div className="text-[10px] opacity-60 uppercase tracking-widest font-bold">Time</div>
                </div>
            </div>

            <div className="w-full max-w-sm space-y-3">
                <button
                    onClick={onFinish}
                    className="w-full py-4 bg-white text-[#1b1b3a] rounded-2xl font-black text-base shadow-xl hover:bg-gray-100 transition-colors"
                >
                    Finish & Exit
                </button>
                <button
                    onClick={onRepeat}
                    className="w-full py-4 bg-white/10 border border-white/20 rounded-2xl font-bold text-base hover:bg-white/15 transition-colors flex items-center justify-center gap-2"
                >
                    <RotateCcw size={18} /> Repeat Workout
                </button>
            </div>
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function WorkoutPlayerPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const dayId = location.state?.dayId ?? new Date().getDay();

    // ── Load exercises ─────────────────────────────────────────────────────────
    const [activePlan, setActivePlan] = useState(null);
    useEffect(() => {
        const p = localStorage.getItem('cyom_generated_workout_plan');
        if (p) { try { setActivePlan(JSON.parse(p)); } catch { } }
    }, []);

    const dayExercises = (() => {
        if (activePlan?.plan?.[dayId]) {
            return Object.keys(activePlan.plan[dayId])
                .map(id => exerciseDatabase.find(e => e.id === id))
                .filter(Boolean);
        }
        // Fallback: use first 7 exercises from DB as mock
        return exerciseDatabase.slice(0, 7);
    })();

    // ── Session state ──────────────────────────────────────────────────────────
    const [currentIndex, setCurrentIndex] = useState(location.state?.startIndex ?? 0);
    const [sessionLogs, setSessionLogs] = useState(() => {
        try {
            const all = JSON.parse(localStorage.getItem('cyom_workout_logs') || '{}');
            return all[dayId] || {};
        } catch { return {}; }
    }); // { [exId]: { timeSpent, reps, distance, status } }
    const [phase, setPhase] = useState('player'); // 'player' | 'rest' | 'complete'

    // ── Timer state ────────────────────────────────────────────────────────────
    const [isPlaying, setIsPlaying] = useState(false);
    const [elapsed, setElapsed] = useState(0);      // seconds elapsed for current exercise
    const [repsInput, setRepsInput] = useState(''); // for Reps intensity
    const timerRef = useRef(null);

    const currentEx = dayExercises[currentIndex];
    const isTimeBased = currentEx?.intensity === 'Time' || currentEx?.intensity === 'Distance/time';
    const isRepsBased = currentEx?.intensity === 'Reps';

    // Reset when exercise changes
    useEffect(() => {
        clearInterval(timerRef.current);
        setIsPlaying(false);
        setElapsed(0);
        setRepsInput('');
    }, [currentIndex]);

    // Timer tick
    useEffect(() => {
        if (isPlaying && isTimeBased) {
            timerRef.current = setInterval(() => {
                setElapsed(prev => prev + 1);
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isPlaying, isTimeBased]);

    // Auto-complete when timer hits target time
    useEffect(() => {
        if (isTimeBased && elapsed >= currentEx?.baseTime && isPlaying) {
            clearInterval(timerRef.current);
            setIsPlaying(false);
        }
    }, [elapsed, currentEx, isTimeBased, isPlaying]);

    // ── Log helpers ────────────────────────────────────────────────────────────
    const saveLog = useCallback((exId, data) => {
        setSessionLogs(prev => {
            const updated = { ...prev, [exId]: { ...prev[exId], ...data } };
            // Persist merged with existing workout_logs
            const all = JSON.parse(localStorage.getItem('cyom_workout_logs') || '{}');
            all[dayId] = { ...(all[dayId] || {}) };
            all[dayId][exId] = { ...all[dayId][exId], ...data };
            localStorage.setItem('cyom_workout_logs', JSON.stringify(all));
            return updated;
        });
    }, [dayId]);

    // ── Actions ────────────────────────────────────────────────────────────────
    const markComplete = () => {
        clearInterval(timerRef.current);
        const finalTime = isTimeBased ? elapsed : (parseInt(repsInput) > 0 ? 60 : 0);
        const dist = currentEx?.intensity === 'Distance/time' && currentEx.targetDistancePerMin
            ? parseFloat(((elapsed / 60) * currentEx.targetDistancePerMin).toFixed(2))
            : null;

        saveLog(currentEx.id, {
            timeInvested: isTimeBased ? elapsed : finalTime,
            repsDone: isRepsBased ? (parseInt(repsInput) || 0) : (dist ?? 0),
            status: 'completed'
        });
        advanceOrComplete('rest');
    };

    const skipExercise = () => {
        clearInterval(timerRef.current);
        saveLog(currentEx.id, { timeInvested: elapsed, repsDone: 0, status: 'skipped' });
        advanceOrComplete('skip');
    };

    const advanceOrComplete = (mode) => {
        if (currentIndex < dayExercises.length - 1) {
            if (mode === 'rest') {
                setPhase('rest');
            } else {
                setCurrentIndex(i => i + 1);
            }
        } else {
            setPhase('complete');
        }
    };

    const goNext = () => {
        clearInterval(timerRef.current);
        if (currentIndex < dayExercises.length - 1) setCurrentIndex(i => i + 1);
    };

    const goPrev = () => {
        clearInterval(timerRef.current);
        if (currentIndex > 0) setCurrentIndex(i => i - 1);
    };

    const handleRepeat = () => {
        setCurrentIndex(0);
        setSessionLogs({});
        setPhase('player');
    };

    const handleFinish = () => navigate(-1);

    // ── Rest screen ────────────────────────────────────────────────────────────
    if (phase === 'rest') {
        return <RestScreen onContinue={() => { setPhase('player'); setCurrentIndex(i => i + 1); }} />;
    }

    // ── Completion ─────────────────────────────────────────────────────────────
    if (phase === 'complete') {
        const stats = Object.entries(sessionLogs).reduce((acc, [exId, log]) => {
            const ex = exerciseDatabase.find(e => e.id === exId);
            if (ex && log.status === 'completed') {
                acc.calories += Math.round((log.timeInvested / 60) * ex.caloriesPerMin);
                acc.totalTime += log.timeInvested;
                acc.completed += 1;
            }
            return acc;
        }, { calories: 0, totalTime: 0, completed: 0 });

        return <CompletionScreen stats={stats} onFinish={handleFinish} onRepeat={handleRepeat} />;
    }

    if (!currentEx) return null;

    // ── Progress indicators ────────────────────────────────────────────────────
    const completedCount = dayExercises.filter(ex => sessionLogs[ex.id]?.status === 'completed').length;
    const skippedCount = dayExercises.filter(ex => sessionLogs[ex.id]?.status === 'skipped').length;
    const progressPct = dayExercises.length > 0 ? ((completedCount + skippedCount) / dayExercises.length) * 100 : 0;
    const timeLeft      = Math.max(0, (currentEx.baseTime || 60) - elapsed);
    const timerPct      = Math.min(100, (elapsed / (currentEx.baseTime || 60)) * 100);

    const gradClass = INTENSITY_COLOR[currentEx.intensity] || INTENSITY_COLOR['Time'];
    const textClass = INTENSITY_TEXT[currentEx.intensity] || INTENSITY_TEXT['Time'];
    const isComplete = isTimeBased ? elapsed >= currentEx.baseTime : (parseInt(repsInput) > 0);

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col min-h-screen bg-white font-sans select-none">

            {/* ── Top Bar ─────────────────────────────────────────────────── */}
            <div className="px-4 pt-5 pb-3 flex items-center justify-between">
                <button onClick={handleFinish} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div className="text-center">
                    <div className="text-xs font-black uppercase tracking-widest text-gray-400">Exercise {currentIndex + 1} of {dayExercises.length}</div>
                </div>
                <div className="text-xs font-black text-gray-400">{completedCount} ✓ {skippedCount > 0 && `${skippedCount} ↷`}</div>
            </div>

            {/* ── Progress Bar ────────────────────────────────────────────── */}
            <div className="px-4 mb-4">
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${gradClass} rounded-full transition-all duration-500`} style={{ width: `${progressPct}%` }} />
                </div>
            </div>

            {/* ── Exercise Dots ────────────────────────────────────────────── */}
            <div className="flex gap-1.5 justify-center mb-5 px-4 flex-wrap">
                {dayExercises.map((ex, i) => {
                    const log = sessionLogs[ex.id];
                    let dot = 'bg-gray-200';
                    if (log?.status === 'completed') dot = 'bg-[#3BBF9E]';
                    else if (log?.status === 'skipped') dot = 'bg-gray-300';
                    else if (i === currentIndex) dot = `bg-gradient-to-r ${gradClass} scale-125 shadow-sm`;
                    return <div key={ex.id} className={`w-2.5 h-2.5 rounded-full transition-all ${dot}`} />;
                })}
            </div>

            {/* ── Exercise Image ───────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col items-center px-5">
                <div className={`w-56 h-56 rounded-full bg-gradient-to-br ${gradClass} flex items-center justify-center mb-6 shadow-xl relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-20 bg-white rounded-full scale-75" />
                    <img
                        src={currentEx.imageUrl || 'https://cdn-icons-png.flaticon.com/512/2548/2548540.png'}
                        alt={currentEx.name}
                        className="w-28 h-28 object-contain mix-blend-screen drop-shadow-2xl"
                    />
                    {/* Circular timer ring for time-based */}
                    {isTimeBased && (
                        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="47" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                            <circle
                                cx="50" cy="50" r="47" fill="none"
                                stroke="rgba(255,255,255,0.7)" strokeWidth="3"
                                strokeDasharray={`${2 * Math.PI * 47}`}
                                strokeDashoffset={`${2 * Math.PI * 47 * (1 - timerPct / 100)}`}
                                strokeLinecap="round"
                                className="transition-all duration-1000"
                            />
                        </svg>
                    )}
                </div>

                {/* ── Exercise Info ─────────────────────────────────────────── */}
                <div className="w-full max-w-sm">
                    <div className={`text-xs font-black uppercase tracking-widest mb-1 ${textClass}`}>
                        {currentEx.category} · {currentEx.intensity}
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 mb-1">{currentEx.name}</h1>
                    <div className="flex gap-3 text-[11px] font-bold text-gray-400 mb-5 flex-wrap">
                        <span>🎯 {currentEx.primaryMuscle}</span>
                        <span>⚡ {currentEx.difficulty}</span>
                        <span>🔥 {currentEx.caloriesPerMin} kcal/min</span>
                        {currentEx.equipment !== 'None' && <span>🏋 {currentEx.equipment}</span>}
                    </div>

                    {/* ── Timer (Time / Distance/time) ─────────────────────── */}
                    {isTimeBased && (
                        <div className="mb-5">
                            <div className="flex items-end justify-between mb-2">
                                <div>
                                    <div className="text-5xl font-black tabular-nums text-gray-900 leading-none">
                                        {isPlaying || elapsed > 0 ? formatTime(elapsed) : formatTime(currentEx.baseTime)}
                                    </div>
                                    <div className="text-xs font-bold text-gray-400 mt-1">
                                        {elapsed > 0 ? `${formatTime(timeLeft)} remaining` : `Target: ${formatTime(currentEx.baseTime)}`}
                                    </div>
                                </div>
                                {currentEx.intensity === 'Distance/time' && elapsed > 0 && currentEx.targetDistancePerMin && (
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-amber-500">
                                            {((elapsed / 60) * currentEx.targetDistancePerMin).toFixed(2)}
                                        </div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase">km covered</div>
                                    </div>
                                )}
                            </div>

                            {/* Timer progress bar */}
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                                <div className={`h-full bg-gradient-to-r ${gradClass} rounded-full transition-all duration-500`} style={{ width: `${timerPct}%` }} />
                            </div>

                            {/* Controls */}
                            <div className="flex gap-3">
                                {elapsed === 0 && !isPlaying ? (
                                    <button
                                        onClick={() => setIsPlaying(true)}
                                        className={`flex-1 py-4 bg-gradient-to-r ${gradClass} text-white rounded-2xl font-black text-base shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform`}
                                    >
                                        <Play size={20} fill="currentColor" /> Start Timer
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setIsPlaying(p => !p)}
                                        className={`flex-1 py-4 ${isPlaying ? 'bg-gray-100 text-gray-700' : `bg-gradient-to-r ${gradClass} text-white`} rounded-2xl font-black text-base shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all`}
                                    >
                                        {isPlaying ? <><Pause size={20} /> Pause</> : <><Play size={20} fill="currentColor" /> Resume</>}
                                    </button>
                                )}
                                <button
                                    onClick={markComplete}
                                    disabled={elapsed === 0}
                                    className={`py-4 px-5 rounded-2xl font-black text-sm flex items-center gap-2 transition-all active:scale-95 ${elapsed === 0 ? 'bg-gray-100 text-gray-400' : 'bg-green-500 text-white shadow-md'}`}
                                >
                                    <CheckCircle2 size={18} /> Done
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Reps Input ───────────────────────────────────────── */}
                    {isRepsBased && (
                        <div className="mb-5">
                            <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 text-center">
                                Target: ~{Math.round((currentEx.baseTime / 60) * currentEx.targetRepsPerMin)} reps
                            </div>

                            {/* Big stepper */}
                            <div className="flex gap-4 items-center justify-center mb-5">
                                <button
                                    onClick={() => setRepsInput(r => Math.max(0, parseInt(r || 0) - 1).toString())}
                                    className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-700 font-black text-2xl hover:bg-gray-200 active:scale-95 transition-all flex items-center justify-center"
                                >−</button>
                                <div className="flex-1 flex flex-col items-center">
                                    <div className="text-5xl font-black text-[#2E7D6B] tabular-nums leading-none">
                                        {repsInput || '0'}
                                    </div>
                                    <div className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Reps</div>
                                </div>
                                <button
                                    onClick={() => setRepsInput(r => (parseInt(r || 0) + 1).toString())}
                                    className="w-14 h-14 rounded-2xl bg-[#E4F1EC] text-[#2E7D6B] font-black text-2xl hover:bg-[#d0e8e0] active:scale-95 transition-all flex items-center justify-center"
                                >+</button>
                            </div>

                            {/* Quick preset buttons */}
                            <div className="flex gap-2 mb-5 justify-center flex-wrap">
                                {[5, 8, 10, 12, 15, 20].map(n => (
                                    <button key={n} onClick={() => setRepsInput(n.toString())}
                                        className={`px-4 py-1.5 rounded-full text-xs font-black border transition-all ${
                                            parseInt(repsInput) === n
                                                ? 'bg-[#2E7D6B] text-white border-transparent shadow-sm'
                                                : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-[#3BBF9E] hover:text-[#2E7D6B]'
                                        }`}
                                    >{n}</button>
                                ))}
                            </div>

                            <button
                                onClick={markComplete}
                                disabled={!repsInput || parseInt(repsInput) <= 0}
                                className={`w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 ${
                                    !repsInput || parseInt(repsInput) <= 0
                                        ? 'bg-gray-100 text-gray-400'
                                        : 'bg-gradient-to-r from-[#2E7D6B] to-[#3BBF9E] text-white'
                                }`}
                            >
                                <CheckCircle2 size={20} /> Mark Complete
                            </button>
                        </div>
                    )}

                    {/* ── Bottom: Previous / Skip ───────────────────────────── */}
                    <div className="flex justify-between items-center pt-2 pb-8">
                        <button
                            onClick={goPrev}
                            disabled={currentIndex === 0}
                            className={`flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl transition-colors ${currentIndex === 0 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                            <ChevronLeft size={18} /> Previous
                        </button>
                        <button
                            onClick={skipExercise}
                            className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-400 transition-colors"
                        >
                            <SkipForward size={16} /> Skip
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
