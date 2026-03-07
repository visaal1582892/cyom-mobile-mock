import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Play, Pause, Square, RotateCcw, Activity, Flame, Clock, CheckCircle2, ChevronLeft } from 'lucide-react';
import { MOCK_DAILY_EXERCISES } from '../../data/exerciseDatabase';

const ExerciseRow = ({ exercise, logData, onUpdateLog }) => {
    const [isActive, setIsActive] = useState(false);
    const [elapsed, setElapsed] = useState(logData?.timeInvested || 0); // seconds
    const timerRef = useRef(null);

    // Editable Inputs State
    const [editReps, setEditReps] = useState(logData?.repsDone || 0);
    const [editMins, setEditMins] = useState(Math.floor((logData?.timeInvested || 0) / 60));

    // Update parent when local editable fields change
    useEffect(() => {
        onUpdateLog(exercise.id, { repsDone: editReps, timeInvested: elapsed });
    }, [editReps, elapsed]);

    useEffect(() => {
        if (isActive) {
            timerRef.current = setInterval(() => {
                setElapsed(prev => {
                    const next = prev + 1;
                    // Auto-calc reps every 60 seconds roughly or smoothly based on intervals
                    if (exercise.targetRepsPerMin > 0 && next % 5 === 0) {
                        const newCalculatedReps = Math.floor((next / 60) * exercise.targetRepsPerMin);
                        setEditReps(newCalculatedReps);
                    }
                    return next;
                });
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isActive, exercise.targetRepsPerMin]);

    // Format mm:ss
    const formatTime = (totalSeconds) => {
        const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleManualTimeChange = (e) => {
        const mins = parseInt(e.target.value) || 0;
        setEditMins(mins);
        const newSecs = mins * 60;
        setElapsed(newSecs);
        if (exercise.targetRepsPerMin > 0) {
            setEditReps(Math.floor(mins * exercise.targetRepsPerMin));
        }
    };

    const isComplete = elapsed >= exercise.baseTime;

    return (
        <div className={`bg-white rounded-2xl p-4 shadow-sm border ${isActive ? 'border-[#2E7D6B] ring-1 ring-[#2E7D6B]/20' : 'border-gray-100'} transition-all`}>
            <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3 items-center">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm ${isActive ? 'bg-[#2E7D6B] animate-pulse' : isComplete ? 'bg-[#3BBF9E]' : 'bg-gray-300'}`}>
                        {isActive ? <Activity size={20} /> : isComplete ? <CheckCircle2 size={20} /> : <Play size={20} className="ml-1" />}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-sm">{exercise.name}</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{exercise.type} • Target: {exercise.baseTime / 60}m</p>
                    </div>
                </div>

                {/* Timer Controls */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsActive(!isActive)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-sm ${isActive ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 'bg-[#E4F1EC] text-[#2E7D6B] hover:bg-[#d0e8e0]'}`}
                    >
                        {isActive ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                    </button>
                    {elapsed > 0 && !isActive && (
                        <button
                            onClick={() => { setElapsed(0); setEditReps(0); setEditMins(0); setIsActive(false); }}
                            className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors shadow-sm"
                        >
                            <RotateCcw size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Editing Grid */}
            <div className="grid grid-cols-2 gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100/50">
                <div className="relative">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Time Invested</label>
                    <div className="flex items-center">
                        <input
                            type="number"
                            value={isActive ? Math.floor(elapsed / 60) : editMins}
                            onChange={handleManualTimeChange}
                            disabled={isActive}
                            className={`w-full py-2 pl-3 pr-8 rounded-lg text-sm font-bold text-gray-700 outline-none border ${isActive ? 'bg-gray-100 border-transparent text-gray-400' : 'bg-white border-gray-200 focus:border-[#2E7D6B]'} transition-colors`}
                        />
                        <span className="absolute right-3 text-[10px] font-bold text-gray-400 pointer-events-none">MIN</span>
                    </div>
                    {isActive && (
                        <div className="mt-1 ml-1 text-xs font-black text-[#2E7D6B] tabular-nums tracking-widest">
                            ⏱ {formatTime(elapsed)}
                        </div>
                    )}
                </div>

                <div className="relative">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Reps Done</label>
                    <div className="flex items-center">
                        <input
                            type="number"
                            value={editReps}
                            onChange={(e) => setEditReps(parseInt(e.target.value) || 0)}
                            disabled={exercise.targetRepsPerMin === 0}
                            className={`w-full py-2 pl-3 pr-8 rounded-lg text-sm font-bold text-gray-700 outline-none border ${exercise.targetRepsPerMin === 0 ? 'bg-gray-100 border-transparent text-gray-400' : 'bg-white border-gray-200 focus:border-[#2E7D6B]'} transition-colors`}
                        />
                        <span className="absolute right-3 text-[10px] font-bold text-gray-400 pointer-events-none">X</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function ActiveWorkoutPage() {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Day context passed from tracker
    const dayId = location.state?.dayId || 0;
    const isToday = location.state?.isToday ?? true;

    // Load daily logs
    const [dailyLogs, setDailyLogs] = useState({});
    
    useEffect(() => {
        const saved = localStorage.getItem('cyom_workout_logs');
        if (saved) {
            try {
                setDailyLogs(JSON.parse(saved));
            } catch (e) { }
        }
    }, []);

    const currentDayLog = dailyLogs[dayId] || {};

    const handleUpdateLog = (exerciseId, data) => {
        setDailyLogs(prev => {
            const newLogs = {
                ...prev,
                [dayId]: {
                    ...(prev[dayId] || {}),
                    [exerciseId]: data
                }
            };
            localStorage.setItem('cyom_workout_logs', JSON.stringify(newLogs));
            return newLogs;
        });
    };

    // Calculate metrics
    let totalTime = 0;
    let totalCalories = 0;
    let completedCount = 0;

    MOCK_DAILY_EXERCISES.forEach(ex => {
        const log = currentDayLog[ex.id];
        if (log && log.timeInvested > 0) {
            totalTime += log.timeInvested;
            totalCalories += (log.timeInvested / 60) * ex.caloriesPerMin;
            if (log.timeInvested >= ex.baseTime) {
                completedCount++;
            }
        }
    });

    const progressPercentage = (completedCount / MOCK_DAILY_EXERCISES.length) * 100;
    const formattedHours = (totalTime / 3600).toFixed(1);

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 font-sans relative">
            {/* Simple Header */}
            <div className="bg-white px-4 py-4 shadow-sm flex items-center justify-between sticky top-0 z-50">
                <button 
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="text-center">
                    <h1 className="text-sm font-black text-gray-800 uppercase tracking-widest">Active Workout</h1>
                    <p className="text-xs font-bold text-[#2E7D6B]">{isToday ? "Today's Plan" : "Past Workout"}</p>
                </div>
                <button 
                    onClick={() => navigate('/workout-tracker')}
                    className="w-10 h-10 rounded-full bg-[#E4F1EC] text-[#2E7D6B] flex items-center justify-center hover:bg-[#d0e8e0] transition-colors"
                >
                    <Square size={16} fill="currentColor" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-10">
                <div className="w-full max-w-2xl mx-auto mt-6 space-y-6">
                    
                    {/* Live Details Dashboard */}
                    <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#2E7D6B]/10 to-transparent rounded-bl-full pointer-events-none"></div>
                        
                        <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-4">Live Session</h2>
                        
                        <div className="grid grid-cols-2 gap-4 mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500">
                                    <Flame size={20} />
                                </div>
                                <div>
                                    <div className="text-xl font-black text-gray-800">{Math.round(totalCalories)}</div>
                                    <div className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Calories</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-500">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <div className="text-xl font-black text-gray-800">{Math.floor(totalTime / 60)}m {totalTime % 60}s</div>
                                    <div className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Elapsed</div>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div>
                            <div className="flex justify-between text-xs font-bold mb-2">
                                <span className="text-gray-500">Workout Progress</span>
                                <span className="text-[#2E7D6B]">{completedCount} / {MOCK_DAILY_EXERCISES.length} Complete</span>
                            </div>
                            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-[#2E7D6B] to-[#469C85] rounded-full transition-all duration-500"
                                    style={{ width: `${progressPercentage}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Exercises List */}
                    <div className="space-y-3">
                        {MOCK_DAILY_EXERCISES.map(ex => (
                            <ExerciseRow 
                                key={ex.id}
                                exercise={ex}
                                logData={currentDayLog[ex.id]}
                                onUpdateLog={handleUpdateLog}
                            />
                        ))}
                    </div>

                    <button 
                        onClick={() => navigate('/workout-tracker')}
                        className="w-full py-4 mt-6 bg-white text-[#2E7D6B] border-2 border-[#2E7D6B] rounded-2xl font-black text-lg shadow-sm hover:bg-gray-50 transition-colors"
                    >
                        Save & Exit
                    </button>
                    
                </div>
            </div>

            {/* Floating Action Button to launch Player */}
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => navigate('/workout-player', { state: { dayId, isToday }})}
                    className="flex items-center gap-2 bg-[#1b1b3a] text-white px-6 py-4 rounded-full shadow-2xl hover:bg-[#282855] transition-all transform hover:scale-105 active:scale-95"
                >
                    <Play size={20} fill="currentColor" />
                    <span className="font-black tracking-widest uppercase text-sm">
                        {completedCount > 0 ? 'Resume' : 'Start'}
                    </span>
                </button>
            </div>
        </div>
    );
}
