import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userData } from '../../data/store';
import SidebarMenu from './SidebarMenu';
import CommonProfileMenu from './CommonProfileMenu';
import DateRangeCalendar from './DateRangeCalendar';

const MealHistoryPage = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [historyLogs, setHistoryLogs] = useState([]);
    const [dateRange, setDateRange] = useState({ start: null, end: null });

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // --- MOCK DATA GENERATOR ---
    const generateMockHistory = (existingLogs) => {
        const today = new Date();
        const mockLogs = { ...existingLogs };
        let plans = JSON.parse(localStorage.getItem('cyom_saved_plans') || '[]');

        const activePlan = plans.find(p => String(p.id) === localStorage.getItem('cyom_tracker_active_plan_id')) || plans[0];
        const activePlanId = activePlan?.id || 'demo-plan';
        const planDuration = activePlan?.duration || 7;

        for (let i = 1; i < 15; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];

            if (!mockLogs[dateStr]) {
                const currentDay = ((i - 1) % planDuration) + 1; // Cycle through days
                const dayPlan = activePlan?.plan?.[currentDay] || {};

                // --- 1. SIMULATE TRACKING ---
                const tLogs = {}; // trackingLogs
                const eLogs = {}; // extraLogs
                const rLogs = {}; // removedLogs (keep empty for mock simplicity)
                const cImages = {}; // capturedImages

                let consumed = { calories: 0, protein: 0, carbs: 0, fats: 0 };
                let total = { calories: 0, protein: 0, carbs: 0, fats: 0 };

                // A. Process Scheduled Plan Items
                ['breakfast', 'morningSnack', 'lunch', 'snacks', 'dinner'].forEach(slot => {
                    const items = dayPlan[slot] || [];
                    items.forEach(item => {
                        // Always add to Total Target
                        total.calories += (item.calculatedCalories || 0);
                        total.protein += (item.protein || 0);
                        total.carbs += (item.carbs || 0);
                        total.fats += (item.fats || 0);

                        // Randomly "track" (consume) it (80% chance)
                        // Make older days slightly less complete to look realistic
                        const trackChance = 0.9 - (i * 0.02);
                        if (Math.random() < trackChance) {
                            const key = `${activePlanId}_${currentDay}_${slot}_${item.uuid}`;
                            tLogs[key] = true;

                            consumed.calories += (item.calculatedCalories || 0);
                            consumed.protein += (item.protein || 0);
                            consumed.carbs += (item.carbs || 0);
                            consumed.fats += (item.fats || 0);
                        }
                    });
                });

                // B. Add Random Extras (Occasional coffee or snack)
                if (Math.random() > 0.6) {
                    const extraSlot = Math.random() > 0.5 ? 'morningSnack' : 'snacks';
                    const extraUuid = `mock_extra_${Date.now()}_${i}`;
                    const extraItem = {
                        uuid: extraUuid,
                        name: Math.random() > 0.5 ? 'Cappuccino' : 'Chocolate Cookie',
                        calculatedCalories: 120,
                        protein: 4,
                        carbs: 15,
                        fats: 5,
                        isExtra: true
                    };

                    const key = `${activePlanId}_${currentDay}_${extraSlot}`;
                    eLogs[key] = [extraItem];

                    // Mark as consumed automatically
                    const logKey = `${key}_${extraUuid}`;
                    tLogs[logKey] = true;

                    // Extras add to CONSUMED, but usually NOT to Plan Totals (Targets)
                    // (Unless we want dynamic targets, but standard behavior is fixed plan target)
                    consumed.calories += extraItem.calculatedCalories;
                    consumed.protein += extraItem.protein;
                    consumed.carbs += extraItem.carbs;
                    consumed.fats += extraItem.fats;
                }

                mockLogs[dateStr] = {
                    date: dateStr,
                    planId: activePlanId,
                    day: currentDay,
                    calories: {
                        consumed: Math.round(consumed.calories),
                        total: Math.round(total.calories)
                    },
                    macros: {
                        protein: { consumed: Math.round(consumed.protein), total: Math.round(total.protein) },
                        carbs: { consumed: Math.round(consumed.carbs), total: Math.round(total.carbs) },
                        fats: { consumed: Math.round(consumed.fats), total: Math.round(total.fats) }
                    },
                    details: {
                        trackingLogs: tLogs,
                        extraLogs: eLogs,
                        removedLogs: rLogs,
                        capturedImages: cImages,
                        planSnapshot: dayPlan // Important: Save the state of the plan at this time
                    }
                };
            }
        }
        return mockLogs;
    };

    useEffect(() => {
        let logs = JSON.parse(localStorage.getItem('cyom_daily_logs') || '{}');

        // Detect stale or broken data (logs missing planSnapshot, or mismatched corrupted snapshots)
        const hasStaleData = Object.values(logs).some(log => {
            if (!log.details) return true;
            if (!log.details.planSnapshot) return true;
            // Strict check: if it's a mock log, check if its snapshot was wiped into an empty object
            if (Object.keys(log.details.planSnapshot).length === 0) return true;

            // Check for UUID mismatch corruption (where auto-save corrupted the snapshot)
            // If there's a tracking log but the UUID isn't anywhere in the snapshot, it's corrupt.
            const tLogsList = Object.keys(log.details.trackingLogs || {});
            if (tLogsList.length > 0) {
                const firstLogKey = tLogsList[0];
                const parts = firstLogKey.split('_');
                if (parts.length >= 4) {
                    const testUuid = parts[parts.length - 1];
                    // Check if this testUuid exists in the plan snapshot
                    let found = false;
                    Object.values(log.details.planSnapshot).forEach(slotItems => {
                        if (Array.isArray(slotItems) && slotItems.some(i => i.uuid === testUuid || testUuid.includes(i.uuid))) found = true;
                    });
                    // If tracking log exists but item doesn't exist in snapshot, data is corrupted
                    if (!found && !testLogIsExtra(firstLogKey)) return true;
                }
            }
            return false;
        });

        function testLogIsExtra(key) { return key.includes('extra'); }

        if (Object.keys(logs).length < 2 || hasStaleData) {
            // If stale, start fresh or specific logic. Here we regenerate fresh for consistency.
            if (hasStaleData) {
                console.log("Stale mock data detected, regenerating...");
                logs = {}; // Clear corrupted dict
            }
            logs = generateMockHistory(logs);
            localStorage.setItem('cyom_daily_logs', JSON.stringify(logs));
        }

        // Filter out 0 calorie entries
        const validLogs = Object.values(logs)
            .filter(log => log.calories && log.calories.consumed > 0)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        setHistoryLogs(validLogs);
    }, []);

    const handleDeleteLog = (e, date) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this log?')) {
            const logs = JSON.parse(localStorage.getItem('cyom_daily_logs') || '{}');
            delete logs[date];
            localStorage.setItem('cyom_daily_logs', JSON.stringify(logs));
            const newHistory = Object.values(logs)
                .filter(log => log.calories && log.calories.consumed > 0)
                .sort((a, b) => new Date(b.date) - new Date(a.date));
            setHistoryLogs(newHistory);

            const maxPage = Math.ceil(newHistory.length / itemsPerPage);
            if (currentPage > maxPage && maxPage > 0) setCurrentPage(maxPage);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Pagination & Filtering Logic
    const availableDates = historyLogs.map(log => log.date);

    const filteredHistory = historyLogs.filter(log => {
        if (!dateRange.start && !dateRange.end) return true;

        if (dateRange.start && !dateRange.end) {
            return log.date === dateRange.start;
        }

        if (dateRange.start && dateRange.end) {
            const startStr = dateRange.start <= dateRange.end ? dateRange.start : dateRange.end;
            const endStr = dateRange.start <= dateRange.end ? dateRange.end : dateRange.start;
            return log.date >= startStr && log.date <= endStr;
        }
        return true;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredHistory.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 font-sans text-gray-800 relative">
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
                            <h1 className="text-lg font-black text-gray-800">Meal History</h1>
                        </div>
                    </div>

                    <CommonProfileMenu />
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 px-4 pt-6 relative z-10 max-w-4xl mx-auto w-full pb-8">
                {/* Collapsible Grid Calendar Filter */}
                <div className="mb-6 relative z-20">
                    <DateRangeCalendar 
                        dateRange={dateRange}
                        onDateRangeChange={(range) => { setDateRange(range); setCurrentPage(1); }}
                        availableDates={availableDates}
                    />
                </div>

                {filteredHistory.length === 0 ? (
                    <div className="bg-white p-10 rounded-2xl border border-gray-100 text-center shadow-sm">
                        <div className="text-4xl mb-4">📜</div>
                        <h3 className="font-bold text-gray-800">No history found</h3>
                        <p className="text-gray-400 text-sm">Capture a log in Tracker to see it here.</p>
                        <button
                            onClick={() => navigate('/meal-tracker')}
                            className="mt-6 px-6 py-2.5 bg-[#2E7D6B] text-white text-sm font-bold rounded-xl shadow-md hover:bg-[#256a5b] transition-all"
                        >
                            Go to Tracker
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* TABLE */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-full">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400">
                                        <th className="px-4 py-3 text-[9px] font-black uppercase tracking-wider">Date</th>
                                        <th className="px-4 py-3 text-center text-[9px] font-black uppercase tracking-wider">Calories</th>
                                        <th className="px-4 py-3 text-center text-[9px] font-black uppercase tracking-wider">Target</th>
                                        <th className="px-4 py-3 text-right text-[9px] font-black uppercase tracking-wider w-16">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {currentItems.map((log, index) => (
                                        <tr
                                            key={log.date}
                                            onClick={() => {
                                                if (log.planId) localStorage.setItem('cyom_tracker_active_plan_id', String(log.planId));
                                                // Store the entire log details for the tracker to load
                                                localStorage.setItem('cyom_selected_history_log', JSON.stringify(log));
                                                navigate(`/meal-tracker?day=${log.day || 1}&date=${log.date}`);
                                            }}
                                            className={`cursor-pointer transition-all hover:bg-[#F0FDF9]/50 border-b border-gray-50 last:border-b-0 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/20'}`}
                                        >
                                            <td className="px-4 py-3">
                                                <div className="text-xs font-bold text-gray-700">{formatDate(log.date)}</div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="text-sm font-black text-gray-800">{Math.round(log.calories.consumed)}</div>
                                                <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">/ {log.calories.total}</div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex flex-col items-center gap-1.5">
                                                    <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full transition-all duration-500 ${log.calories.consumed >= log.calories.total ? 'bg-[#43AA95]' : 'bg-[#FFB347]'}`}
                                                            style={{ width: `${Math.min(100, Math.round((log.calories.consumed / (log.calories.total || 1)) * 100))}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className={`text-[8px] font-black uppercase tracking-tighter ${log.calories.consumed >= log.calories.total ? 'text-[#2E7D6B]' : 'text-[#D97706]'}`}>
                                                        {Math.round((log.calories.consumed / (log.calories.total || 1)) * 100)}%
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={(e) => handleDeleteLog(e, log.date)}
                                                    className="p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete log"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION */}
                        {totalPages > 1 && (
                            <div className="px-4 py-3 bg-white border-t border-gray-50 flex items-center justify-between">
                                <div className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                                    {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredHistory.length)} of {filteredHistory.length}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => prev - 1); }}
                                        className="w-8 h-8 flex items-center justify-center bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-[#2E7D6B] disabled:opacity-30 transition-all shadow-sm"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                    </button>

                                    <div className="hidden sm:flex gap-1.5">
                                        {[...Array(totalPages)].map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={(e) => { e.stopPropagation(); setCurrentPage(i + 1); }}
                                                className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${currentPage === i + 1 ? 'bg-[#2E7D6B] text-white shadow-md shadow-[#2E7D6B]/20' : 'bg-white text-gray-400 border border-gray-100 hover:border-[#2E7D6B] hover:text-[#2E7D6B]'}`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="sm:hidden px-2 py-1 bg-gray-50 rounded-lg text-[10px] font-black text-[#2E7D6B]">
                                        {currentPage} / {totalPages}
                                    </div>

                                    <button
                                        disabled={currentPage === totalPages}
                                        onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => prev + 1); }}
                                        className="w-8 h-8 flex items-center justify-center bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-[#2E7D6B] disabled:opacity-30 transition-all shadow-sm"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MealHistoryPage;
