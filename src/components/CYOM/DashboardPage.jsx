import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userData } from '../../data/store';
import SidebarMenu from './SidebarMenu';
import CommonProfileMenu from './CommonProfileMenu';
import { RDA_TARGETS } from '../../utils/nutrientData';

const DashboardPage = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [dailyLogs, setDailyLogs] = useState({});
    const [loading, setLoading] = useState(true);

    // Filter States
    const [timeRange, setTimeRange] = useState(1); // 1, 7, or 15 days
    const [selectedCategory, setSelectedCategory] = useState('macros'); // 'macros', 'vitamins', 'minerals'

    // --- MOCK DATA GENERATOR ---
    const generateMockData = (existingLogs) => {
        const today = new Date();
        const mockLogs = { ...existingLogs };
        const userGender = userData.gender || 'Male';
        const userRDA = RDA_TARGETS[userGender] || RDA_TARGETS.Male;

        // Constants for goals (Daily)
        const GOAL_CALS = 2000;
        const GOAL_PRO = 150;
        const GOAL_CARBS = 250;
        const GOAL_FATS = 70;

        // Generate last 30 days if missing OR if missing micro data
        for (let i = 0; i < 30; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];

            const existingLog = mockLogs[dateStr];

            // Check if log has valid data (non-zero calories)
            const hasData = existingLog && existingLog.calories && existingLog.calories.consumed > 0;

            // Check if log has micro-nutrient structure AND non-zero values
            let hasValidMicros = false;
            if (existingLog && existingLog.micros && existingLog.micros.vitamins) {
                const vitValues = Object.values(existingLog.micros.vitamins);
                if (vitValues.length > 0) {
                    // Check if at least some vitamins have been consumed (sum > 0)
                    const totalVitConsumed = vitValues.reduce((acc, curr) => acc + (curr.consumed || 0), 0);
                    if (totalVitConsumed > 0) hasValidMicros = true;
                }
            }

            // Regenerate if log is missing, has no valid micros (0 values), or is an "empty" log (0 calories)
            if (!existingLog || !hasValidMicros || !hasData) {
                // Randomize data
                const variance = Math.random() * 0.4 + 0.8; // 0.8 to 1.2

                // Helper to generate a micro value
                const genMicro = (target) => ({
                    consumed: Math.round(target * variance),
                    total: target
                });

                const vitamins = {};
                Object.entries(userRDA.vitamins).forEach(([k, v]) => {
                    vitamins[k] = genMicro(v.target);
                });

                const minerals = {};
                Object.entries(userRDA.minerals).forEach(([k, v]) => {
                    minerals[k] = genMicro(v.target);
                });

                // Preserve existing macro data if available, otherwise generate
                const calories = existingLog?.calories || { consumed: Math.round(GOAL_CALS * variance), total: GOAL_CALS };
                const macros = existingLog?.macros || {
                    protein: { consumed: Math.round(GOAL_PRO * variance), total: GOAL_PRO },
                    carbs: { consumed: Math.round(GOAL_CARBS * variance), total: GOAL_CARBS },
                    fats: { consumed: Math.round(GOAL_FATS * variance), total: GOAL_FATS }
                };

                mockLogs[dateStr] = {
                    date: dateStr,
                    dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
                    calories,
                    macros,
                    micros: {
                        vitamins,
                        minerals
                    }
                };
            }
        }
        return mockLogs;
    };

    useEffect(() => {
        let logs = JSON.parse(localStorage.getItem('cyom_daily_logs') || '{}');

        // Always run generation to backfill any missing micro data in past logs
        logs = generateMockData(logs);

        // Save back updated logs
        localStorage.setItem('cyom_daily_logs', JSON.stringify(logs));

        setDailyLogs(logs);
        setLoading(false);
    }, []);

    // --- CALCULATE TOTALS (Not Averages) ---
    const getTotals = (range) => {
        const today = new Date();
        const userGender = userData.gender || 'Male';
        const userRDA = RDA_TARGETS[userGender] || RDA_TARGETS.Male;

        // Initial Consumption Sums
        const sums = {
            calories: { consumed: 0 },
            protein: { consumed: 0 },
            carbs: { consumed: 0 },
            fats: { consumed: 0 },
            vitamins: {},
            minerals: {}
        };

        // Initialize micro sums
        Object.keys(userRDA.vitamins).forEach(k => sums.vitamins[k] = { consumed: 0 });
        Object.keys(userRDA.minerals).forEach(k => sums.minerals[k] = { consumed: 0 });

        // Sum up Consumption from Logs
        for (let i = 0; i < range; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - (i + 1)); // Start from Yesterday
            const dateStr = d.toISOString().split('T')[0];
            const log = dailyLogs[dateStr];

            if (log) {
                sums.calories.consumed += log.calories?.consumed || 0;
                sums.protein.consumed += log.macros?.protein?.consumed || 0;
                sums.carbs.consumed += log.macros?.carbs?.consumed || 0;
                sums.fats.consumed += log.macros?.fats?.consumed || 0;

                Object.keys(sums.vitamins).forEach(k => {
                    const v = log.micros?.vitamins?.[k];
                    if (v) {
                        sums.vitamins[k].consumed += v.consumed;
                    }
                });

                Object.keys(sums.minerals).forEach(k => {
                    const m = log.micros?.minerals?.[k];
                    if (m) {
                        sums.minerals[k].consumed += m.consumed;
                    }
                });
            }
        }

        // --- LOGIC FIX: CALCULATE TARGETS BASED ON RANGE ---
        // Goals are fixed per day, so Range Total Goal = Daily Goal * Range
        const dailyGoals = {
            calories: 2000,
            protein: 150,
            carbs: 250,
            fats: 70
        };

        sums.calories.total = dailyGoals.calories * range;
        sums.protein.total = dailyGoals.protein * range;
        sums.carbs.total = dailyGoals.carbs * range;
        sums.fats.total = dailyGoals.fats * range;

        Object.keys(sums.vitamins).forEach(k => {
            sums.vitamins[k].total = userRDA.vitamins[k].target * range;
        });

        Object.keys(sums.minerals).forEach(k => {
            sums.minerals[k].total = userRDA.minerals[k].target * range;
        });

        // --- AGGREGATE B-VITAMINS INTO B-SCORE ---
        const bVitKeys = ['thiamine', 'riboflavin', 'niacin', 'vitB6', 'folate', 'vitB12'];
        let bScoreSum = 0;

        bVitKeys.forEach(key => {
            const data = sums.vitamins[key];
            if (data && data.total > 0) {
                bScoreSum += Math.min(1, data.consumed / data.total);
            }
            // Remove individual key from display list
            delete sums.vitamins[key];
        });

        const bScoreValue = Math.round((bScoreSum / bVitKeys.length) * 100);

        // Add B-Score
        sums.vitamins['vitBScore'] = {
            consumed: bScoreValue,
            total: 100 // Score is out of 100
        };

        return sums;
    };

    const totals = getTotals(timeRange);

    // --- COMPONENTS ---

    const LargeCircularProgress = ({ value, max, label, unit, color }) => {
        const radius = 58; // Increased radius for more internal space
        const stroke = 6;  // Thinner stroke
        const normalizedRadius = radius - stroke * 2;
        const circumference = normalizedRadius * 2 * Math.PI;
        const strokeDashoffset = circumference - (Math.min(value / max, 1) * circumference);

        return (
            <div className="flex flex-col items-center justify-center p-3 bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all w-full">
                <div className="relative flex items-center justify-center mb-2 group">
                    {/* Shadow Behind Ring */}
                    <div className="absolute inset-0 rounded-full blur-xl opacity-20 transform scale-90" style={{ backgroundColor: color }}></div>

                    <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg] relative z-10">
                        <circle
                            stroke="#F3F4F6"
                            strokeWidth={stroke}
                            fill="transparent"
                            r={normalizedRadius}
                            cx={radius}
                            cy={radius}
                            strokeLinecap="round"
                        />
                        <circle
                            stroke={color}
                            fill="transparent"
                            strokeWidth={stroke}
                            strokeDasharray={circumference + ' ' + circumference}
                            style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
                            strokeLinecap="round"
                            r={normalizedRadius}
                            cx={radius}
                            cy={radius}
                        />
                    </svg>
                    <div className="absolute flex flex-col items-center z-20">
                        <span className="text-lg font-black text-gray-800 tracking-tight">{value}</span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase">{unit}</span>
                    </div>
                </div>
                <div className="text-sm font-bold text-gray-700">{label}</div>
                <div className="text-[10px] font-medium text-gray-400 mt-1 bg-gray-50 px-2 py-0.5 rounded-md">Goal: {max}</div>
            </div>
        );
    };

    const SpaciousLinearProgress = ({ label, value, max, unit, color }) => {
        const percentage = Math.min((value / max) * 100, 100);
        return (
            <div className="mb-2 bg-white p-3 rounded-xl border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.03)] hover:shadow-[0_4px_20px_rgb(0,0,0,0.05)] transition-all">
                <div className="flex justify-between items-end mb-1.5">
                    <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm`} style={{ backgroundColor: color }}>
                            {label.charAt(0)}
                        </div>
                        <div>
                            <span className="text-xs font-bold text-gray-800 block leading-tight">{label}</span>
                            <span className="text-[9px] text-gray-400 font-medium">Target: {max} {unit}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-sm font-black text-gray-800 block">{value} <span className="text-[9px] font-medium text-gray-400">{unit}</span></span>
                    </div>
                </div>
                <div className="w-full bg-gray-50 rounded-full h-1.5 overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-700 ease-out relative"
                        style={{ width: `${percentage}%`, backgroundColor: color }}
                    >
                    </div>
                </div>
            </div>
        );
    };

    const ToggleButton = ({ label, value, selected, onClick }) => (
        <button
            onClick={() => onClick(value)}
            className={`flex-1 py-1.5 px-3 rounded-lg text-[11px] font-bold transition-all ${selected === value
                ? 'bg-white text-[#0F4C3E] shadow-sm border border-gray-100'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
        >
            {label}
        </button>
    );

    const userGender = userData.gender || 'Male';
    const userRDA = RDA_TARGETS[userGender] || RDA_TARGETS.Male;

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#43AA95] to-[#A8E6CF] font-sans relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 w-full h-[50vh] bg-gradient-to-b from-black/10 to-transparent pointer-events-none"></div>

            {/* Header */}
            <div className="pt-6 px-6 flex justify-between items-center relative z-20">
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsMenuOpen(true)} className="p-2 rounded-full hover:bg-white/20 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                    </button>
                    <div>
                        <div className="text-xs opacity-80 font-medium text-green-100">Analytics</div>
                        <div className="text-lg font-bold">Health Dashboard</div>
                    </div>
                </div>
                <CommonProfileMenu />
            </div>

            <SidebarMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

            {/* MAIN CONTENT */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4 relative z-10">

                <div className="bg-[#F8FAFC]/95 backdrop-blur-2xl p-5 md:p-6 rounded-[32px] shadow-2xl text-gray-800 min-h-[500px]">

                    {/* TOP CONTROLS - SINGLE ROW */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                        <div>
                            <h2 className="text-lg font-black tracking-tight text-gray-800">Your Totals</h2>
                            <p className="text-xs text-gray-500 font-medium">Accumulated intake</p>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            {/* Category Select */}
                            <div className="relative">
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="appearance-none bg-white text-xs font-bold text-gray-700 pl-4 pr-9 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#2E7D6B]/20 focus:border-[#2E7D6B] shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                                >
                                    <option value="macros">Macros</option>
                                    <option value="vitamins">Vitamins</option>
                                    <option value="minerals">Minerals</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>

                            {/* Time Toggle */}
                            <div className="flex bg-gray-100 p-1 rounded-xl flex-1 sm:flex-none">
                                <ToggleButton label="1 Day" value={1} selected={timeRange} onClick={setTimeRange} />
                                <ToggleButton label="7 Days" value={7} selected={timeRange} onClick={setTimeRange} />
                                <ToggleButton label="15 Days" value={15} selected={timeRange} onClick={setTimeRange} />
                            </div>
                        </div>
                    </div>

                    {/* CONTENT AREA */}
                    <div className="animate-fade-in-up">
                        {selectedCategory === 'macros' && (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <LargeCircularProgress
                                    value={totals.calories.consumed}
                                    max={totals.calories.total}
                                    label="Calories"
                                    unit="kcal"
                                    color="#10B981"
                                />
                                <LargeCircularProgress
                                    value={totals.protein.consumed}
                                    max={totals.protein.total}
                                    label="Protein"
                                    unit="g"
                                    color="#3B82F6"
                                />
                                <LargeCircularProgress
                                    value={totals.carbs.consumed}
                                    max={totals.carbs.total}
                                    label="Carbs"
                                    unit="g"
                                    color="#F59E0B"
                                />
                                <LargeCircularProgress
                                    value={totals.fats.consumed}
                                    max={totals.fats.total}
                                    label="Fats"
                                    unit="g"
                                    color="#EC4899"
                                />
                            </div>
                        )}

                        {selectedCategory === 'vitamins' && (
                            <div className="space-y-3">
                                <h3 className="text-xs font-black text-gray-500 mb-2 uppercase tracking-widest px-1">Vitamin Intake</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {Object.keys(totals.vitamins).map((key) => {
                                        let info = userRDA.vitamins[key];
                                        if (key === 'vitBScore') {
                                            info = { label: 'Vitamin B Complex', unit: 'Score' };
                                        }
                                        if (!info) return null;

                                        return (
                                            <SpaciousLinearProgress
                                                key={key}
                                                label={info.label}
                                                value={totals.vitamins[key]?.consumed || 0}
                                                max={totals.vitamins[key]?.total || 0}
                                                unit={info.unit}
                                                color="#8B5CF6"
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {selectedCategory === 'minerals' && (
                            <div className="space-y-3">
                                <h3 className="text-xs font-black text-gray-500 mb-2 uppercase tracking-widest px-1">Mineral Intake</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {Object.entries(userRDA.minerals).map(([key, info]) => (
                                        <SpaciousLinearProgress
                                            key={key}
                                            label={info.label}
                                            value={totals.minerals[key]?.consumed || 0}
                                            max={totals.minerals[key]?.total || 0}
                                            unit={info.unit}
                                            color="#14B8A6"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
