import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userData } from '../../data/store';
import SidebarMenu from './SidebarMenu';
import { RDA_TARGETS } from '../../utils/nutrientData';

const DashboardPage = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [dailyLogs, setDailyLogs] = useState({});
    const [loading, setLoading] = useState(true);

    // Filter States
    const [timeRange, setTimeRange] = useState(7); // 7 or 30 days
    const [selectedNutrient, setSelectedNutrient] = useState('calories'); // 'calories', 'protein', 'vitC', 'iron', etc.

    // --- MOCK DATA GENERATOR ---
    const generateMockData = (existingLogs) => {
        const today = new Date();
        const mockLogs = { ...existingLogs };

        // Generate last 30 days if missing
        for (let i = 0; i < 30; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];

            if (!mockLogs[dateStr]) {
                // Randomize data
                const variance = Math.random() * 0.4 + 0.8; // 0.8 to 1.2

                // Helper to generate a micro value
                const genMicro = (target) => ({
                    consumed: Math.round(target * variance),
                    total: target
                });

                const vitamins = {};
                Object.entries(RDA_TARGETS.vitamins).forEach(([k, v]) => {
                    vitamins[k] = genMicro(v.target);
                });

                const minerals = {};
                Object.entries(RDA_TARGETS.minerals).forEach(([k, v]) => {
                    minerals[k] = genMicro(v.target);
                });

                mockLogs[dateStr] = {
                    date: dateStr,
                    dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
                    calories: { consumed: Math.round(2000 * variance), total: 2000 },
                    macros: {
                        protein: { consumed: Math.round(150 * variance), total: 150 },
                        carbs: { consumed: Math.round(250 * variance), total: 250 },
                        fats: { consumed: Math.round(70 * variance), total: 70 }
                    },
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

        // Check if we need to regenerate to get new fields (e.g. if a newly added vitamin is missing)
        // Simple check: see if a known vitamin key exists in the first log
        const firstLog = Object.values(logs)[0];
        const needsRegen = !firstLog || !firstLog.micros || !firstLog.micros.vitamins || !firstLog.micros.vitamins.vitC;

        if (Object.keys(logs).length < 5 || needsRegen) {
            logs = generateMockData(logs);
            // We don't forcefully save mock data to localStorage to avoid overwriting user progress if possible,
            // but for a smooth demo update, we might need to. 
            // Let's just use it in state for now unless it was empty.
            if (Object.keys(logs).length < 2) {
                localStorage.setItem('cyom_daily_logs', JSON.stringify(logs));
            }
        }
        setDailyLogs(logs);
        setLoading(false);
    }, []);

    const handleLogout = () => navigate('/login');

    // --- HELPER: Get Trend Data ---
    const getTrendData = () => {
        const days = [];
        const today = new Date();
        for (let i = timeRange - 1; i >= 0; i--) { // Reverse order for graph (left to right)
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const log = dailyLogs[dateStr];

            let val = 0;
            let target = 100;
            let unit = '';

            if (selectedNutrient === 'calories') {
                val = log?.calories?.consumed || 0;
                target = log?.calories?.total || 2000;
                unit = 'kcal';
            } else if (['protein', 'carbs', 'fats'].includes(selectedNutrient)) {
                val = log?.macros?.[selectedNutrient]?.consumed || 0;
                target = log?.macros?.[selectedNutrient]?.total || 100;
                unit = 'g';
            } else {
                // Check micros
                const vit = log?.micros?.vitamins?.[selectedNutrient];
                const min = log?.micros?.minerals?.[selectedNutrient];

                // Get target/unit from RDA constant
                const rdaVit = RDA_TARGETS.vitamins[selectedNutrient];
                const rdaMin = RDA_TARGETS.minerals[selectedNutrient];

                if (vit) {
                    val = vit.consumed;
                    target = vit.total || rdaVit?.target || 100;
                    unit = rdaVit?.unit || '';
                } else if (min) {
                    val = min.consumed;
                    target = min.total || rdaMin?.target || 100;
                    unit = rdaMin?.unit || '';
                }
            }

            days.push({
                date: dateStr,
                dayName: d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
                value: Math.round(val),
                target: Math.round(target),
                unit
            });
        }
        return days;
    };

    const trendData = getTrendData();

    // --- HELPER: Get Today's Stats ---
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLog = dailyLogs[todayStr] || {
        calories: { consumed: 0, total: 2000 },
        macros: { carbs: { consumed: 0, total: 0 }, protein: { consumed: 0, total: 0 }, fats: { consumed: 0, total: 0 } },
        micros: { vitamins: {}, minerals: {} }
    };

    // Macro Data for Donut
    const macroData = [
        { name: 'Protein', value: todayLog.macros?.protein?.consumed || 0, color: '#3B82F6', total: todayLog.macros?.protein?.total || 1 },
        { name: 'Carbs', value: todayLog.macros?.carbs?.consumed || 0, color: '#10B981', total: todayLog.macros?.carbs?.total || 1 },
        { name: 'Fats', value: todayLog.macros?.fats?.consumed || 0, color: '#F59E0B', total: todayLog.macros?.fats?.total || 1 },
    ];
    const totalMacroConsumed = macroData.reduce((a, b) => a + b.value, 0) || 1;


    // --- COMPONENTS ---

    const BarChart = ({ data }) => {
        const maxVal = Math.max(...data.map(d => d.value), ...data.map(d => d.target), 10);
        const height = 180;

        return (
            <div className="flex gap-2 pt-6 overflow-x-auto custom-scrollbar pb-2 px-2 snap-x">
                {data.map((d, i) => {
                    const barHeight = (d.value / maxVal) * height;
                    const isToday = d.date === todayStr;
                    return (
                        <div key={i} className="flex flex-col items-center gap-2 min-w-[36px] flex-1 cursor-pointer group relative snap-center">
                            {/* Tooltip */}
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none shadow-lg">
                                <div className="font-bold">{d.date}</div>
                                <div>{d.value} / {d.target} {d.unit}</div>
                            </div>

                            <div className="w-full bg-gray-50 rounded-lg relative h-[180px] flex items-end overflow-hidden group-hover:bg-gray-100 transition-colors border border-gray-100">
                                {/* Target Line */}
                                <div
                                    className="absolute w-full border-t border-dashed border-gray-300 z-10 opacity-50"
                                    style={{ bottom: `${(d.target / maxVal) * 100}%` }}
                                ></div>

                                <div
                                    style={{ height: `${barHeight}px` }}
                                    className={`w-full rounded-t-md transition-all duration-500 ${isToday ? 'bg-[#2E7D6B]' : 'bg-[#43AA95]/70'} group-hover:bg-[#2E7D6B]`}
                                ></div>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 rotate-0 whitespace-nowrap w-full text-center">{d.dayName.split(' ')[0]}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    const MacroDonut = () => {
        const size = 160;
        const strokeWidth = 12;
        const radius = (size - strokeWidth) / 2;
        const center = size / 2;
        let startAngle = 0;

        return (
            <div className="relative w-[160px] h-[160px] flex items-center justify-center">
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    <circle cx={center} cy={center} r={radius} fill="none" stroke="#E5E7EB" strokeWidth={strokeWidth} />
                    {macroData.map((d, i) => {
                        const percentage = d.value / totalMacroConsumed;
                        const dashArray = 2 * Math.PI * radius;
                        const dashOffset = dashArray * (1 - percentage);
                        const rotation = startAngle * 360 - 90;
                        startAngle += percentage;
                        if (d.value === 0) return null;
                        return (
                            <circle
                                key={i}
                                cx={center}
                                cy={center}
                                r={radius}
                                fill="none"
                                stroke={d.color}
                                strokeWidth={strokeWidth}
                                strokeDasharray={dashArray}
                                strokeDashoffset={dashOffset}
                                transform={`rotate(${rotation} ${center} ${center})`}
                                strokeLinecap="round"
                            />
                        );
                    })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-gray-800">{todayLog.calories?.consumed || 0}</span>
                    <span className="text-[10px] uppercase font-bold text-gray-400">kcal Today</span>
                </div>
            </div>
        );
    };

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
                <div className="relative">
                    <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/50 shadow-md hover:border-white transition-all">
                        <img src={userData.image} alt="Profile" className="w-full h-full object-cover" />
                    </button>
                    {isProfileOpen && (
                        <>
                            <div className="fixed inset-0 z-10 cursor-default" onClick={() => setIsProfileOpen(false)}></div>
                            <div className="absolute right-0 top-14 w-48 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 py-2 z-20 animate-fade-in-up text-gray-800">
                                <button onClick={() => navigate('/profile')} className="w-full text-left px-4 py-2 hover:bg-[#2E7D6B]/10 hover:text-[#2E7D6B] text-sm font-medium transition-colors">My Profile</button>
                                <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-500 text-sm font-medium transition-colors">Logout</button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <SidebarMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

            {/* MAIN CONTENT */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pb-20 space-y-6 relative z-10">

                {/* 1. DYNAMIC TREND CHART */}
                <div className="bg-white/95 backdrop-blur-xl p-5 md:p-6 rounded-[32px] shadow-xl text-gray-800">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <h2 className="text-lg font-black tracking-tight text-gray-800">Trends</h2>

                        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                            {/* Nutrient Selector - Compact & Mobile Friendly */}
                            <div className="relative flex-1 sm:flex-none min-w-[140px]">
                                <select
                                    value={selectedNutrient}
                                    onChange={(e) => setSelectedNutrient(e.target.value)}
                                    className="w-full appearance-none bg-gray-50 text-sm font-bold text-gray-700 pl-4 pr-8 py-2.5 rounded-xl border border-gray-100 outline-none focus:ring-2 focus:ring-[#2E7D6B] focus:border-[#2E7D6B] transition-all cursor-pointer shadow-sm"
                                >
                                    <optgroup label="General">
                                        <option value="calories">Calories (kcal)</option>
                                    </optgroup>
                                    <optgroup label="Macros">
                                        <option value="protein">Protein (g)</option>
                                        <option value="carbs">Carbs (g)</option>
                                        <option value="fats">Fats (g)</option>
                                    </optgroup>
                                    <optgroup label="Vitamins">
                                        {Object.entries(RDA_TARGETS.vitamins).map(([key, val]) => (
                                            <option key={key} value={key}>{val.label} ({val.unit})</option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="Minerals">
                                        {Object.entries(RDA_TARGETS.minerals).map(([key, val]) => (
                                            <option key={key} value={key}>{val.label} ({val.unit})</option>
                                        ))}
                                    </optgroup>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>

                            {/* Time Range Toggle */}
                            <div className="flex bg-gray-100 rounded-xl p-1 shrink-0">
                                <button
                                    onClick={() => setTimeRange(7)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${timeRange === 7 ? 'bg-white shadow-sm text-[#2E7D6B]' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    7D
                                </button>
                                <button
                                    onClick={() => setTimeRange(30)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${timeRange === 30 ? 'bg-white shadow-sm text-[#2E7D6B]' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    30D
                                </button>
                            </div>
                        </div>
                    </div>

                    <BarChart data={trendData} />
                </div>

                {/* 2. MACRO BREAKDOWN & MICROS REMOVED */}
            </div>
        </div>
    );
};

export default DashboardPage;
