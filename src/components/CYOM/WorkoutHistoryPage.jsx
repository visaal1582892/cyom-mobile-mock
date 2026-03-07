import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar as CalendarIcon, Activity, Flame, Clock } from 'lucide-react';
import { MOCK_DAILY_EXERCISES } from '../../data/exerciseDatabase';

export default function WorkoutHistoryPage() {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const saved = localStorage.getItem('cyom_workout_logs');
        if (saved) {
            try {
                const logs = JSON.parse(saved);
                const historyData = [];
                
                // Process each day in logs to summarize
                Object.keys(logs).forEach(dayId => {
                    const dayLog = logs[dayId];
                    let totalTime = 0;
                    let totalCalories = 0;
                    let completedExercises = 0;

                    Object.keys(dayLog).forEach(exId => {
                        const log = dayLog[exId];
                        const exDef = MOCK_DAILY_EXERCISES.find(e => e.id === exId);
                        
                        if (log && log.timeInvested > 0 && exDef) {
                            totalTime += log.timeInvested;
                            totalCalories += (log.timeInvested / 60) * exDef.caloriesPerMin;
                            completedExercises++;
                        }
                    });

                    if (completedExercises > 0) {
                        historyData.push({
                            dayId,
                            totalTime,
                            totalCalories: Math.round(totalCalories),
                            completedExercises
                        });
                    }
                });

                setHistory(historyData);
            } catch (e) { }
        }
    }, []);

    // Helper to map dayId to name
    const getDayName = (id) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[id] || `Day ${id}`;
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
            <div className="bg-white px-4 py-4 shadow-sm flex items-center justify-between sticky top-0 z-50">
                <button 
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>
                <h1 className="text-sm font-black text-gray-800 uppercase tracking-widest">Workout History</h1>
                <div className="w-10 h-10"></div> {/* Spacer */}
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="w-full max-w-2xl mx-auto space-y-4">
                    {history.length > 0 ? (
                        history.map((record, index) => (
                            <div key={index} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-[14px] bg-[#E4F1EC] flex items-center justify-center text-[#2E7D6B]">
                                        <CalendarIcon size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-gray-800">{getDayName(record.dayId)}</h3>
                                        <div className="text-xs font-bold text-gray-400 mt-1 flex items-center gap-3">
                                            <span className="flex items-center gap-1"><Activity size={12} /> {record.completedExercises} Exs</span>
                                            <span className="flex items-center gap-1"><Clock size={12} /> {Math.floor(record.totalTime / 60)}m</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-black text-orange-500">{record.totalCalories}</div>
                                    <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-gray-500">Kcal</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                            <Activity size={48} className="text-gray-400 mb-4" />
                            <h2 className="text-lg font-black text-gray-700">No History Yet</h2>
                            <p className="text-sm font-bold text-gray-500 mt-2 max-w-[200px]">Complete your first workout session to see stats here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
