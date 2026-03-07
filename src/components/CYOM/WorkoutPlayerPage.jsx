import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Pause, Play, SkipBack, SkipForward, Repeat, CheckCircle } from 'lucide-react';
import { MOCK_DAILY_EXERCISES } from '../../data/exerciseDatabase';

export default function WorkoutPlayerPage() {
    const navigate = useNavigate();
    const location = useLocation();

    // Context from navigation
    const dayId = location.state?.dayId || 0;
    const isToday = location.state?.isToday ?? true;

    // Load logs to find where to start
    const [dailyLogs, setDailyLogs] = useState({});
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isWorkoutComplete, setIsWorkoutComplete] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('cyom_workout_logs');
        if (saved) {
            try {
                const parsedLogs = JSON.parse(saved);
                setDailyLogs(parsedLogs);
                
                // Find first incomplete exercise
                const dayLog = parsedLogs[dayId] || {};
                const firstIncompleteIdx = MOCK_DAILY_EXERCISES.findIndex(ex => {
                    const log = dayLog[ex.id];
                    // Unstarted or incomplete (and not skipped)
                    return !log || (log.timeInvested < ex.baseTime && log.status !== 'skipped');
                });
                
                if (firstIncompleteIdx !== -1) {
                    setCurrentIndex(firstIncompleteIdx);
                } else if (MOCK_DAILY_EXERCISES.length > 0) {
                    setIsWorkoutComplete(true);
                }

            } catch (e) { }
        }
    }, [dayId]);

    // Player State
    const currentExercise = MOCK_DAILY_EXERCISES[currentIndex];
    const dayLog = dailyLogs[dayId] || {};
    const existingLog = currentExercise ? dayLog[currentExercise.id] : null;

    const [isPlaying, setIsPlaying] = useState(false);
    
    // Initialize time tracking based on existing logs or baseTime
    // We countdown from baseTime to 0
    const [timeRemaining, setTimeRemaining] = useState(
        currentExercise ? Math.max(0, currentExercise.baseTime - (existingLog?.timeInvested || 0)) : 0
    );

    // Reset timer when exercise changes
    useEffect(() => {
        if (currentExercise) {
            const exLog = dailyLogs[dayId]?.[currentExercise.id];
            setTimeRemaining(Math.max(0, currentExercise.baseTime - (exLog?.timeInvested || 0)));
            // Auto start?
            setIsPlaying(true);
        }
    }, [currentIndex, currentExercise]);

    const timerRef = useRef(null);

    // Timer Logic
    useEffect(() => {
        if (isPlaying && timeRemaining > 0 && !isWorkoutComplete) {
            timerRef.current = setInterval(() => {
                setTimeRemaining(prev => {
                    const next = prev - 1;
                    if (next <= 0) {
                        clearInterval(timerRef.current);
                        handleExerciseComplete();
                        return 0;
                    }
                    return next;
                });
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }

        return () => clearInterval(timerRef.current);
    }, [isPlaying, timeRemaining, isWorkoutComplete]);

    // Cleanup interval on unmount
    useEffect(() => {
        return () => clearInterval(timerRef.current);
    }, []);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // --- Actions ---

    const saveLogState = (exerciseId, timeInvestedDelta, statusUpdate = null) => {
        setDailyLogs(prev => {
            const currentExLog = prev[dayId]?.[exerciseId] || { timeInvested: 0, repsDone: 0 };
            const exBase = MOCK_DAILY_EXERCISES.find(e => e.id === exerciseId);
            
            let accumulatedTime = currentExLog.timeInvested + timeInvestedDelta;
            let status = statusUpdate || currentExLog.status || 'started';
            
            // If skipped, hardcode status to skipped
            if (statusUpdate === 'skipped') {
                status = 'skipped';
                accumulatedTime = 0; // Skip means it contributes 0 to progress
            }

            // Calculations
            const reps = exBase.targetRepsPerMin > 0 ? Math.floor((accumulatedTime / 60) * exBase.targetRepsPerMin) : 0;

            const newLogs = {
                ...prev,
                [dayId]: {
                    ...(prev[dayId] || {}),
                    [exerciseId]: {
                        timeInvested: accumulatedTime,
                        repsDone: reps,
                        status: status
                    }
                }
            };
            localStorage.setItem('cyom_workout_logs', JSON.stringify(newLogs));
            return newLogs;
        });
    };

    const handleExerciseComplete = () => {
        // Save current time delta
        const timeInvestedDelta = currentExercise.baseTime - timeRemaining;
        saveLogState(currentExercise.id, timeInvestedDelta, 'completed');
        autoAdvance();
    };

    const handleSkip = () => {
        saveLogState(currentExercise.id, 0, 'skipped');
        autoAdvance();
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            // Save current progress before going back
            const timeInvestedDelta = currentExercise.baseTime - timeRemaining;
            if (timeInvestedDelta > 0) {
                saveLogState(currentExercise.id, timeInvestedDelta);
            }
            setCurrentIndex(prev => prev - 1);
        }
    };

    const autoAdvance = () => {
        if (currentIndex < MOCK_DAILY_EXERCISES.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setIsWorkoutComplete(true);
        }
    };

    const handleClose = () => {
        if (!isWorkoutComplete && currentExercise) {
            // Save current progress
            const timeInvestedDelta = currentExercise.baseTime - timeRemaining;
            if (timeInvestedDelta > 0) {
                 saveLogState(currentExercise.id, timeInvestedDelta);
            }
        }
        navigate(-1);
    };

    const handleRepeat = () => {
        // Clear logs for today to restart
        setDailyLogs(prev => {
            const newLogs = { ...prev };
            delete newLogs[dayId];
            localStorage.setItem('cyom_workout_logs', JSON.stringify(newLogs));
            return newLogs;
        });
        setIsWorkoutComplete(false);
        setCurrentIndex(0);
    };


    // Render Completion View
    if (isWorkoutComplete) {
        return (
            <div className="flex flex-col min-h-screen bg-white font-sans text-[#1b1b3a] items-center justify-center px-6">
                <CheckCircle size={80} className="text-[#3BBF9E] mb-6" />
                <h1 className="text-3xl font-black mb-2 text-center">Workout Complete!</h1>
                <p className="text-gray-500 font-medium mb-10 text-center">Great job finishing your session. Your progress is saved.</p>
                
                <div className="w-full max-w-sm space-y-4">
                    <button 
                        onClick={handleClose}
                        className="w-full py-4 bg-[#1b1b3a] text-white rounded-xl font-bold text-lg shadow-xl hover:bg-[#282855] transition-colors"
                    >
                        Finish & Exit
                    </button>
                    <button 
                        onClick={handleRepeat}
                        className="w-full py-4 bg-gray-50 text-[#1b1b3a] border-2 border-gray-200 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                    >
                        <Repeat size={20} /> Repeat Workout
                    </button>
                </div>
            </div>
        );
    }

    if (!currentExercise) return null;

    // Render Player View
    return (
        <div className="flex flex-col min-h-screen bg-white font-sans text-[#1b1b3a]">
            {/* Header */}
            <div className="px-6 py-6 flex items-center justify-between">
                <button onClick={handleClose} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-lg font-bold tracking-wide">{currentExercise.type}</h2>
                <div className="w-10"></div> {/* Spacer for alignment */}
            </div>

            {/* Media Area - Circular graphic */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 mt-4">
                <div className="w-[300px] h-[300px] bg-[#E8E8E8] rounded-full flex items-center justify-center mb-10 overflow-hidden relative shadow-inner">
                    <img 
                        src={currentExercise.imageUrl || 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80'} 
                        alt={currentExercise.name} 
                        className="w-[80%] h-[80%] object-contain mix-blend-multiply opacity-90"
                    />
                </div>

                {/* Details Area */}
                <div className="w-full text-left max-w-md mx-auto">
                    <h1 className="text-3xl font-black mb-1">{currentExercise.name}</h1>
                    <div className="text-5xl font-black font-mono tracking-tighter mb-8 tabular-nums">
                        {formatTime(timeRemaining)}
                    </div>

                    {/* Play/Pause Main Control */}
                    <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-full py-5 bg-[#252550] text-white rounded-[20px] shadow-xl hover:bg-[#1a1a3a] transition-colors flex items-center justify-center group transform active:scale-95"
                    >
                        {isPlaying ? (
                            <Pause size={32} fill="currentColor" />
                        ) : (
                            <Play size={32} fill="currentColor" className="ml-2" />
                        )}
                    </button>
                </div>
            </div>

            {/* Bottom Navigation */}
            <div className="px-8 pb-10 pt-6 flex w-full max-w-md mx-auto justify-between items-center text-sm font-bold mt-auto">
                <button 
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className={`flex items-center gap-2 ${currentIndex === 0 ? 'text-gray-300' : 'text-[#1b1b3a] hover:text-gray-600 transition-colors'}`}
                >
                    <SkipBack size={18} /> Previous
                </button>
                
                <div className="text-xs text-gray-400 font-bold tracking-widest uppercase">
                    {currentIndex + 1} / {MOCK_DAILY_EXERCISES.length}
                </div>

                <button 
                    onClick={handleSkip}
                    className="flex items-center gap-2 text-[#1b1b3a] hover:text-gray-600 transition-colors"
                >
                     Skip <SkipForward size={18} />
                </button>
            </div>
        </div>
    );
}
