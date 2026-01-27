import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { userData } from '../../data/store';
import { foodDatabase } from '../../data/foodDatabase';
import Loader from '../UI/Loader';
import Toast from '../UI/Toast';
import { calculateBMR, calculateTDEE, calculateTargetCalories, calculateMealTargets } from '../../utils/calculations';

// --- SUB-COMPONENTS ---

// 1. Mini Donut Chart
const MacroDonut = ({ p, c, f, size = 40 }) => {
    const total = p + c + f || 1;
    const pDeg = (p / total) * 360;
    const cDeg = (c / total) * 360;
    const fDeg = (f / total) * 360;

    return (
        <div className="relative rounded-full flex items-center justify-center font-bold text-[10px]" style={{ width: size, height: size, background: `conic-gradient(#4ADE80 0deg ${pDeg}deg, #60A5FA ${pDeg}deg ${pDeg + cDeg}deg, #FACC15 ${pDeg + cDeg}deg 360deg)` }}>
            <div className="bg-white rounded-full flex items-center justify-center" style={{ width: size * 0.6, height: size * 0.6 }}></div>
        </div>
    );
};

// 2. Connected Macro Slider
const MacroBalancer = ({ macros, totalCalories, onUpdate }) => {
    const pCal = macros.protein * 4;
    const cCal = macros.carbs * 4;
    const fCal = macros.fats * 9;
    const currentTotal = pCal + cCal + fCal || 1;

    const pPerc = (pCal / currentTotal) * 100;
    const cPerc = (cCal / currentTotal) * 100;
    const fPerc = (fCal / currentTotal) * 100;

    return (
        <div className="space-y-2">
            {/* Visual Bar */}
            <div className="h-3 w-full rounded-full flex overflow-hidden shadow-inner bg-gray-100/50">
                <div style={{ width: `${pPerc}%` }} className="bg-[#4ADE80] transition-all duration-300"></div>
                <div style={{ width: `${cPerc}%` }} className="bg-[#60A5FA] transition-all duration-300"></div>
                <div style={{ width: `${fPerc}%` }} className="bg-[#FACC15] transition-all duration-300"></div>
            </div>

            {/* Sliders / Inputs */}
            <div className="grid grid-cols-3 gap-1 text-center text-[10px]">
                <div className='flex flex-col'>
                    <span className="text-gray-400 font-bold uppercase text-[9px]">PROT</span>
                    <span className="text-[#4ADE80] font-black">{macros.protein}g</span>
                </div>
                <div className='flex flex-col'>
                    <span className="text-gray-400 font-bold uppercase text-[9px]">CARB</span>
                    <span className="text-[#60A5FA] font-black">{macros.carbs}g</span>
                </div>
                <div className='flex flex-col'>
                    <span className="text-gray-400 font-bold uppercase text-[9px]">FAT</span>
                    <span className="text-[#FACC15] font-black">{macros.fats}g</span>
                </div>
            </div>
        </div>
    );
};

// --- MAIN PAGE ---

const MealPlannerPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // --- STATE ---
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ bmr: 0, tdee: 0, targetCalories: 0, mealSplit: {} });
    const [plan, setPlan] = useState({ 1: { breakfast: [], lunch: [], snacks: [], dinner: [] } });
    const [preferences, setPreferences] = useState({ dietPreference: 'Vegetarian', cuisineStyle: 'All' });

    // UI State
    const [currentDay, setCurrentDay] = useState(1);
    const [planDuration, setPlanDuration] = useState(1);
    const [expandedCard, setExpandedCard] = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Toggle State for Ingredient Info (Key: "mealUuid_ingIndex")
    const [visibleInfo, setVisibleInfo] = useState({});

    const toggleInfo = (id) => {
        setVisibleInfo(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Modal State
    const [searchModal, setSearchModal] = useState({ open: false, slot: null });

    // Swap Modal State
    const [swapModal, setSwapModal] = useState({
        open: false,
        mode: null,
        slot: null,
        originalItem: null,
        originalIndex: null,
        candidates: []
    });

    // Save Modal
    const [saveModalOpen, setSaveModalOpen] = useState(false);
    const [planName, setPlanName] = useState("");

    const [searchValue, setSearchValue] = useState("");
    const [toast, setToast] = useState(null);

    // Helpers
    const parseServingWeight = (item) => {
        if (item.composition && item.composition.length > 0) return item.composition.reduce((a, b) => a + (b.weight || 0), 0);
        const match = item.servingSize?.match(/\((\d+)\s*(?:g|ml)\)/i);
        return match ? parseInt(match[1]) : 100;
    };

    // --- INITIALIZATION ---
    useEffect(() => {
        if (location.state) {
            if (location.state.savedPlanData) {
                const saved = location.state.savedPlanData;
                setStats(saved.stats); setPlan(saved.plan); setPlanDuration(parseInt(saved.duration) || 1);
                setPreferences(saved.stats.preferences || {});
                setPlanName(saved.name || "");
            } else {
                const { currentWeight, currentHeight, activityLevel, targetWeightLoss, planDuration: d, dietPreference, cuisineStyle } = location.state;
                const bmr = calculateBMR(currentWeight, currentHeight, userData.age, userData.gender);
                const tdee = calculateTDEE(bmr, activityLevel);
                const target = calculateTargetCalories(tdee, targetWeightLoss, bmr);
                const split = calculateMealTargets(target);
                setStats({ bmr, tdee, targetCalories: target, mealSplit: split });
                setPreferences({ dietPreference, cuisineStyle });
                setPlanDuration(parseInt(d) || 1);
                generateMultiDayPlan(parseInt(d) || 1, split, dietPreference, cuisineStyle);
            }
            setLoading(false);
        } else { setLoading(false); }
    }, [location.state]);

    const generateMultiDayPlan = (days, targets, diet, cuisine) => {
        const newPlan = {};
        for (let i = 1; i <= days; i++) {
            newPlan[i] = { breakfast: [], lunch: [], snacks: [], dinner: [] };
            ['breakfast', 'lunch', 'snacks', 'dinner'].forEach(slot => {
                let pool = foodDatabase.filter(f => f.isCooked && (diet === 'Vegetarian' ? f.type === 'veg' : true) && (slot === 'snacks' ? f.category === 'Snacks' : f.category.toLowerCase().includes(slot)));
                if (cuisine !== 'Mixed' && cuisine !== 'All') pool = pool.filter(f => f.region === cuisine || f.region === 'All' || f.region === 'International');

                if (pool.length > 0) {
                    const item = pool[Math.floor(Math.random() * pool.length)];
                    const instance = createItemInstance(item, targets[slot]);
                    newPlan[i][slot].push(instance);
                }
            });
        }
        setPlan(newPlan);
    };

    const createItemInstance = (baseItem, targetCals) => {
        let baseCals = baseItem.calories;
        if (baseItem.composition?.length) baseCals = baseItem.composition.reduce((a, b) => a + b.calories, 0) || baseCals;

        const ratio = targetCals / baseCals;

        return {
            ...baseItem,
            uuid: Math.random().toString(36),
            calculatedCalories: Math.round(targetCals),
            calculatedWeight: Math.round((parseServingWeight(baseItem) || 100) * ratio),
            macros: {
                protein: Math.round((baseItem.protein || 0) * ratio),
                carbs: Math.round((baseItem.carbs || 0) * ratio),
                fats: Math.round((baseItem.fats || 0) * ratio)
            },
            composition: baseItem.composition?.map(c => ({
                ...c,
                scaledWeight: Math.round((c.weight || 0) * ratio),
                scaledCalories: Math.round((c.calories || 0) * ratio),
                scaledProtein: Math.round((c.protein || 0) * ratio),
                scaledCarbs: Math.round((c.carbs || 0) * ratio),
                scaledFats: Math.round((c.fats || 0) * ratio)
            }))
        };
    };

    // --- SWAP LOGIC ---
    const initiateMealSwap = (slot, originalItem) => {
        const cands = foodDatabase.filter(f =>
            f.id !== originalItem.id && f.isCooked &&
            (preferences.dietPreference === 'Vegetarian' ? f.type === 'veg' : true) &&
            f.category === originalItem.category
        ).map(c => {
            const ratio = originalItem.calculatedCalories / (c.calories || 1);
            return createItemInstance(c, originalItem.calculatedCalories);
        });

        setSwapModal({ open: true, mode: 'MEAL', slot, originalItem, candidates: cands });
    };

    const initiateIngredientSwap = (slot, mealItem, ingIndex) => {
        const originalIng = mealItem.composition[ingIndex];
        const cands = foodDatabase.filter(f =>
            !f.isCooked &&
            f.name !== originalIng.name &&
            (
                (originalIng.name.toLowerCase().includes("rice") && f.name.toLowerCase().includes("rice")) ||
                (originalIng.name.toLowerCase().includes("rice") && f.name.toLowerCase().includes("quinoa")) ||
                (originalIng.name.toLowerCase().includes("chicken") && f.name.toLowerCase().includes("chicken")) ||
                (originalIng.name.toLowerCase().includes("chicken") && f.name.toLowerCase().includes("turkey")) ||
                (originalIng.name.toLowerCase().includes("dal") && f.name.toLowerCase().includes("dal")) ||
                (originalIng.name.toLowerCase().includes("egg") && f.name.toLowerCase().includes("egg")) ||
                f.category === 'Generic'
            )
        ).slice(0, 10).map(c => {
            const targetCals = originalIng.scaledCalories || 100;
            const baseCals = c.calories;
            const newWeight = Math.round((targetCals / (baseCals || 1)) * 100);
            const ratio = newWeight / 100;

            return {
                ...c,
                scaledWeight: newWeight,
                scaledCalories: Math.round(baseCals * ratio),
                scaledProtein: Math.round(c.protein * ratio),
                scaledCarbs: Math.round(c.carbs * ratio),
                scaledFats: Math.round(c.fats * ratio)
            };
        });

        if (cands.length === 0) {
            setToast({ msg: "No suitable alternatives found.", type: "error" });
            return;
        }

        setSwapModal({ open: true, mode: 'INGREDIENT', slot, originalItem: mealItem, originalIndex: ingIndex, candidates: cands });
    };

    const confirmSwap = (candidate) => {
        const { slot, originalItem, mode, originalIndex } = swapModal;

        if (mode === 'MEAL') {
            setPlan(prev => ({
                ...prev,
                [currentDay]: {
                    ...prev[currentDay],
                    [slot]: prev[currentDay][slot].map(i => i.uuid === originalItem.uuid ? candidate : i)
                }
            }));
        } else {
            const newItem = { ...originalItem };
            const newComp = [...newItem.composition];
            newComp[originalIndex] = { ...candidate, name: candidate.name };

            const totalCals = newComp.reduce((a, b) => a + (b.scaledCalories || 0), 0);
            const totalP = newComp.reduce((a, b) => a + (b.scaledProtein || 0), 0);
            const totalC = newComp.reduce((a, b) => a + (b.scaledCarbs || 0), 0);
            const totalF = newComp.reduce((a, b) => a + (b.scaledFats || 0), 0);
            const totalW = newComp.reduce((a, b) => a + (b.scaledWeight || 0), 0);

            newItem.composition = newComp;
            newItem.calculatedCalories = totalCals;
            newItem.calculatedWeight = totalW;
            newItem.macros = { protein: totalP, carbs: totalC, fats: totalF };

            setPlan(prev => ({
                ...prev,
                [currentDay]: {
                    ...prev[currentDay],
                    [slot]: prev[currentDay][slot].map(i => i.uuid === originalItem.uuid ? newItem : i)
                }
            }));
        }

        setSwapModal({ open: false, mode: null, slot: null, originalItem: null, candidates: [] });
        setToast({ msg: `${mode === 'MEAL' ? 'Meal' : 'Ingredient'} swapped!`, type: "success" });
    };

    // --- INLINE EDIT (Smart Balancing) ---
    const handleIngredientWeightChange = (slot, itemUuid, idx, newVal) => {
        let weight = parseInt(newVal);
        if (isNaN(weight) || weight < 0) weight = 0;
        if (weight > 2000) return;

        setPlan(prev => ({
            ...prev,
            [currentDay]: {
                ...prev[currentDay],
                [slot]: prev[currentDay][slot].map(item => {
                    if (item.uuid !== itemUuid) return item;
                    const targetTotalCals = item.calculatedCalories;
                    const comp = [...item.composition];
                    const editedIng = comp[idx];
                    const oldWeight = editedIng.scaledWeight || 1;
                    const oldCals = editedIng.scaledCalories || 0;

                    const calPerGram = oldWeight > 0 ? oldCals / oldWeight : 0;
                    const newCals_edited = Math.round(weight * calPerGram);

                    let remainingBudget = targetTotalCals - newCals_edited;
                    if (remainingBudget < 0) remainingBudget = 0;

                    const weightRatio = oldWeight > 0 ? weight / oldWeight : 0;
                    comp[idx] = {
                        ...editedIng,
                        scaledWeight: weight,
                        scaledCalories: newCals_edited,
                        scaledProtein: Math.round((editedIng.scaledProtein || 0) * weightRatio),
                        scaledCarbs: Math.round((editedIng.scaledCarbs || 0) * weightRatio),
                        scaledFats: Math.round((editedIng.scaledFats || 0) * weightRatio)
                    };

                    const otherIndices = comp.map((_, i) => i).filter(i => i !== idx);
                    const currentOtherTotalCals = otherIndices.reduce((sum, i) => sum + (comp[i].scaledCalories || 0), 0);

                    if (otherIndices.length > 0) {
                        otherIndices.forEach(i => {
                            const ing = comp[i];
                            const ingCal = ing.scaledCalories || 0;
                            const ingWeight = ing.scaledWeight || 1;

                            let newAllocatedCals = 0;
                            if (currentOtherTotalCals > 0) {
                                const prop = ingCal / currentOtherTotalCals;
                                newAllocatedCals = remainingBudget * prop;
                            } else {
                                newAllocatedCals = 0;
                            }
                            const ingRatio = ingCal > 0 ? newAllocatedCals / ingCal : 0;
                            const newWt = Math.round(ingWeight * ingRatio);

                            comp[i] = {
                                ...ing,
                                scaledWeight: newWt,
                                scaledCalories: Math.round(newAllocatedCals),
                                scaledProtein: Math.round((ing.scaledProtein || 0) * ingRatio),
                                scaledCarbs: Math.round((ing.scaledCarbs || 0) * ingRatio),
                                scaledFats: Math.round((ing.scaledFats || 0) * ingRatio)
                            };
                        });
                    }

                    const finalTotalCals = comp.reduce((a, b) => a + (b.scaledCalories || 0), 0);
                    const finalTotalW = comp.reduce((a, b) => a + (b.scaledWeight || 0), 0);
                    const finalP = comp.reduce((a, b) => a + (b.scaledProtein || 0), 0);
                    const finalC = comp.reduce((a, b) => a + (b.scaledCarbs || 0), 0);
                    const finalF = comp.reduce((a, b) => a + (b.scaledFats || 0), 0);

                    return {
                        ...item,
                        calculatedCalories: finalTotalCals,
                        calculatedWeight: finalTotalW,
                        macros: { protein: finalP, carbs: finalC, fats: finalF },
                        composition: comp
                    };
                })
            }
        }));
    };

    const handleSavePlan = () => {
        if (!planName.trim()) {
            setToast({ msg: "Please verify plan name", type: "error" });
            return;
        }
        const planData = {
            id: Date.now(),
            name: planName,
            createdAt: new Date().toISOString(),
            stats: { ...stats, preferences },
            plan: plan,
            duration: planDuration
        };
        const existing = JSON.parse(localStorage.getItem('cyom_saved_plans') || '[]');
        localStorage.setItem('cyom_saved_plans', JSON.stringify([...existing, planData]));
        setSaveModalOpen(false);
        setToast({ msg: "Plan saved successfully!", type: "success" });
    };

    const handleLogout = () => {
        navigate('/');
    };

    const calculateDailyTotal = () => {
        const slots = ['breakfast', 'lunch', 'snacks', 'dinner'];
        if (!plan[currentDay]) return 0;
        return slots.reduce((total, slot) => {
            return total + (plan[currentDay][slot]?.reduce((acc, i) => acc + i.calculatedCalories, 0) || 0);
        }, 0);
    };

    const dailyTotalCals = calculateDailyTotal();

    // --- RENDER ---
    const slots = ['breakfast', 'lunch', 'snacks', 'dinner'];

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#43AA95] to-[#A8E6CF] font-sans relative overflow-hidden text-white" >
            {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-full h-[50vh] bg-gradient-to-b from-black/10 to-transparent pointer-events-none"></div>

            {/* --- HEADER --- */}
            <div className="pt-6 px-4 flex justify-between items-center relative z-20">
                <div className="flex items-center gap-4">
                    {/* BACK BUTTON */}
                    <button onClick={() => navigate('/meal-creation')} className="rounded-full hover:bg-white/20 transition-all active:scale-95 group">
                        <svg className="w-8 h-8 text-white group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                    </button>

                    <div className="font-bold text-lg flex items-center ">
                        MEAL <span className="text-green-100 text-xs ml-1 opacity-80">Planner</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold backdrop-blur-md shadow-lg hover:border-white transition-all overflow-hidden p-0.5">
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold rounded-full text-xs">
                                IMG
                            </div>
                        </button>
                        {isProfileOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                                <div className="absolute top-12 right-0 w-48 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl py-2 z-50 text-gray-800 border border-white/50 animate-slide-down">
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <div className="font-bold text-sm text-[#2E7D6B]">{userData.name}</div>
                                        <div className="text-[10px] text-gray-500">Premium Member</div>
                                    </div>
                                    <button onClick={() => navigate('/profile')} className="w-full text-left px-4 py-2.5 hover:bg-[#2E7D6B]/5 text-sm text-gray-600 flex items-center gap-3 transition-colors">
                                        <span>👤</span> My Profile
                                    </button>
                                    <button onClick={() => navigate('/saved-plans')} className="w-full text-left px-4 py-2.5 hover:bg-[#2E7D6B]/5 text-sm text-gray-600 flex items-center gap-3 transition-colors">
                                        <span>📂</span> Saved Plans
                                    </button>
                                    <div className="h-px bg-gray-100 my-1"></div>
                                    <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-sm text-red-500 flex items-center gap-3 transition-colors">
                                        <span>🚪</span> Logout
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* --- SUB-HEADER (Stats & Day Selection) --- */}
            <div className="px-5 mt-6 flex justify-between items-center z-10 text-white">

                {/* LEFT: Daily Goal */}
                <div>
                    <div className="text-[10px] uppercase font-bold text-green-100 tracking-wider mb-0.5 opacity-80">Daily Goal</div>
                    <div className="text-xl font-bold leading-none flex items-baseline gap-1.5 font-mono tracking-tight">
                        <span>{dailyTotalCals}</span>
                        <span className="opacity-60 text-xs font-sans font-medium">/ {stats.targetCalories} kcal</span>
                    </div>
                </div>

                {/* RIGHT: Enhanced Day Selector */}
                <div className="relative group">
                    {/* Glass Pill Container */}
                    <div className="flex items-center gap-3 bg-white/20 pl-4 pr-3 py-2 rounded-2xl backdrop-blur-md border border-white/20 hover:bg-white/30 transition-all cursor-pointer shadow-lg shadow-black/5">
                        <span className="text-sm font-bold tracking-wide">Day {currentDay}</span>
                        <div className="bg-white/90 text-[#2E7D6B] rounded-xl p-1 shadow-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>

                    {/* Hidden Select Overlay for Functionality */}
                    {planDuration > 1 && (
                        <select
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            value={currentDay}
                            onChange={e => setCurrentDay(parseInt(e.target.value))}
                        >
                            {Array.from({ length: planDuration }, (_, i) => i + 1).map(d => (
                                <option key={d} value={d} className="text-gray-800 font-medium">Jump to Day {d}</option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            {/* MAIN CONTENT - SCROLLABLE & COMPACT */}
            <div className="flex-1 overflow-y-auto px-4 pt-6 pb-24 space-y-2 custom-scrollbar">
                {slots.map(slot => {
                    const items = plan[currentDay]?.[slot] || [];
                    const totalCals = items.reduce((a, b) => a + b.calculatedCalories, 0);
                    const target = stats.mealSplit[slot] || 0;
                    const isExpanded = expandedCard === slot;

                    const slotP = items.reduce((a, b) => a + b.macros.protein, 0);
                    const slotC = items.reduce((a, b) => a + b.macros.carbs, 0);
                    const slotF = items.reduce((a, b) => a + b.macros.fats, 0);

                    // Accordion Card Styling (White Glass)
                    return (
                        <div key={slot} className={`bg-white/95 backdrop-blur-xl rounded-2xl shadow-sm transition-all duration-300 overflow-hidden ${isExpanded ? 'ring-2 ring-white/30 transform scale-[1.00]' : 'border border-white/30 hover:bg-white'}`}>
                            {/* Accoridon Header - Compact */}
                            <div onClick={() => setExpandedCard(isExpanded ? null : slot)} className="p-3 flex justify-between items-center cursor-pointer active:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm transition-colors ${isExpanded ? 'bg-[#2E7D6B] text-white shadow-[#2E7D6B]/40' : 'bg-gray-100 text-gray-500'}`}>
                                        {slot === 'breakfast' ? '🌅' : slot === 'lunch' ? '☀️' : slot === 'snacks' ? '🍎' : '🌙'}
                                    </div>
                                    <div>
                                        <div className="uppercase font-bold text-[12px] tracking-widest text-gray-500">{slot}</div>
                                        <div className="text-sm font-bold mt-0 text-[#1F2933]">
                                            <span className={totalCals > target ? 'text-red-500' : 'text-[#2E7D6B]'}>{totalCals}</span> / {target} kcal
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {isExpanded ? (
                                        <div className="text-[10px] font-bold text-gray-400">Hide Details</div>
                                    ) : (
                                        <MacroDonut p={slotP} c={slotC} f={slotF} size={30} />
                                    )}
                                    <div className={`p-1.5 rounded-full transition-all duration-300 ${isExpanded ? 'rotate-180 text-[#2E7D6B] bg-[#2E7D6B]/10' : 'text-gray-300'}`}>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>

                            {/* EXPANDED CONTENT - MORE COMPACT */}
                            {isExpanded && (
                                <div className="px-2 pb-2 animate-slide-down bg-gray-50/50">
                                    {items.length > 0 ? items.map((item, iDx) => (
                                        <div key={item.uuid} className="bg-white rounded-xl border border-gray-100 p-2 mb-2 shadow-[0_2px_4px_-2px_rgba(0,0,0,0.05)]">
                                            {/* MEAL HEADER ROW */}
                                            <div className="flex justify-between items-center mb-2 border-b border-gray-50 pb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="font-bold text-sm text-gray-800">{item.name}</div>
                                                    {/* MEAL SWAP BUTTON */}
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); initiateMealSwap(slot, item); }}
                                                        className="text-[#2E7D6B] bg-[#2E7D6B]/5 hover:bg-[#2E7D6B]/10 p-1 rounded transition-colors"
                                                        title="Swap Entire Meal"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                                    </button>
                                                </div>
                                                <button onClick={() => {
                                                    const currentItems = plan[currentDay]?.[slot] || [];
                                                    const remainingItems = currentItems.filter(i => i.uuid !== item.uuid);

                                                    // Smart Re-balance
                                                    if (remainingItems.length > 0) {
                                                        const targetCals = stats.mealSplit[slot] || 600;
                                                        const newTotal = remainingItems.length;
                                                        const calsPerItem = Math.floor(targetCals / newTotal);

                                                        const updatedRemaining = remainingItems.map(rem => ({
                                                            ...createItemInstance(rem, calsPerItem),
                                                            uuid: rem.uuid
                                                        }));

                                                        setPlan(p => ({ ...p, [currentDay]: { ...p[currentDay], [slot]: updatedRemaining } }));
                                                    } else {
                                                        setPlan(p => ({ ...p, [currentDay]: { ...p[currentDay], [slot]: [] } }));
                                                    }
                                                }} className="text-red-300 hover:text-red-500 hover:bg-red-50 p-1 rounded transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                            </div>

                                            {/* MACRO BALANCER - COMPACT */}
                                            <div className="bg-gray-50/80 rounded-lg p-2 mb-2 border border-gray-100">
                                                <MacroBalancer macros={item.macros} />
                                            </div>

                                            {/* INGREDIENTS LIST - COMPACT */}
                                            <div className="space-y-1">
                                                {item.composition?.map((comp, idx) => {
                                                    const infoKey = `${item.uuid}_${idx}`;
                                                    const showInfo = visibleInfo[infoKey]; // Check toggle state

                                                    return (
                                                        <div key={idx} className="flex flex-col border-b border-gray-50 pb-1 last:border-0 last:pb-0">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                                                    {/* INGREDIENT SWAP BUTTON */}
                                                                    <button
                                                                        onClick={() => initiateIngredientSwap(slot, item, idx)}
                                                                        className="text-gray-400 hover:text-[#2E7D6B] hover:bg-gray-100 p-0.5 rounded transition-colors shrink-0"
                                                                        title="Swap Ingredient"
                                                                    >
                                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                                                                    </button>

                                                                    <span className="text-xs font-bold text-gray-700 truncate">{comp.name}</span>

                                                                    {/* INFO TOGGLE BUTTON */}
                                                                    <button
                                                                        onClick={() => toggleInfo(infoKey)}
                                                                        className={`p-0.5 rounded-full border transition-all shrink-0 ${showInfo ? 'bg-[#2E7D6B] text-white border-[#2E7D6B]' : 'bg-transparent text-gray-300 border-gray-200 hover:border-[#2E7D6B] hover:text-[#2E7D6B]'}`}
                                                                    >
                                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                                    </button>
                                                                </div>

                                                                {/* Weight Input */}
                                                                <div className="flex items-center border border-gray-200 rounded-md focus-within:border-[#2E7D6B] focus-within:ring-1 focus-within:ring-[#2E7D6B]/20 w-16 overflow-hidden bg-gray-50 shrink-0">
                                                                    <input
                                                                        className="w-full text-right text-[10px] font-bold outline-none bg-transparent p-1 text-gray-800"
                                                                        value={comp.scaledWeight}
                                                                        onChange={(e) => handleIngredientWeightChange(slot, item.uuid, idx, e.target.value)}
                                                                    />
                                                                    <span className="text-[9px] text-gray-400 pr-1 font-medium">g</span>
                                                                </div>
                                                            </div>

                                                            {/* DETAILED STATS PILL (CONDITIONAL) */}
                                                            {showInfo && (
                                                                <div className="flex justify-end pt-1 animate-fade-in">
                                                                    <div className="text-[9px] bg-white border border-gray-200 px-2 py-0.5 rounded text-gray-500 font-bold flex gap-2 shadow-sm items-center">
                                                                        <span className="text-blue-500">P <span className="text-gray-400 font-normal">{comp.scaledProtein}</span></span>
                                                                        <span className="text-blue-400">C <span className="text-gray-400 font-normal">{comp.scaledCarbs}</span></span>
                                                                        <span className="text-yellow-500">F <span className="text-gray-400 font-normal">{comp.scaledFats}</span></span>
                                                                        <div className="h-3 w-px bg-gray-200 mx-1"></div>
                                                                        <span className="text-[#2E7D6B]">{comp.scaledCalories} kcal</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-6 bg-white rounded-xl border border-dashed border-gray-200">
                                            <div className="text-gray-400 text-xs mb-3 italic">No meals added yet</div>
                                            <button onClick={() => { setSearchModal({ open: true, slot }); setSearchValue("") }} className="text-xs bg-[#2E7D6B] text-white px-4 py-2 rounded-xl shadow-lg shadow-[#2E7D6B]/20 hover:bg-[#256a5b] transition-all font-bold">+ Add Food</button>
                                        </div>
                                    )}

                                    {items.length > 0 && <button onClick={() => { setSearchModal({ open: true, slot }); setSearchValue("") }} className="w-full mt-2 py-2 border border-dashed border-[#2E7D6B]/30 text-[#2E7D6B] rounded-xl text-xs font-bold hover:bg-[#2E7D6B]/5 transition-all">Add More Items</button>}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* BOTTOM SAVE BAR */}
            <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl border-t border-white/50 z-30 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                <button onClick={() => setSaveModalOpen(true)} className="w-full py-4 bg-[#2E7D6B] text-white rounded-2xl font-bold text-lg shadow-[#FFD166]/30 shadow-lg hover:bg-[#ffda85] hover:-translate-y-1 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Save Meal Plan
                </button>
            </div>

            {/* MODALS */}

            {/* Search Modal */}
            {
                searchModal.open && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto" onClick={() => setSearchModal({ open: false, slot: null })}></div>
                        <div className="bg-white w-full max-w-md h-[80vh] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto text-[#1F2933] relative z-10">
                            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                                <h3 className="font-bold text-base capitalize pl-2">Add to {searchModal.slot}</h3>
                                <button onClick={() => setSearchModal({ open: false })} className="p-2 bg-gray-200 rounded-full text-gray-500 hover:bg-gray-300"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                            </div>
                            <div className="p-4 bg-gray-50 border-b border-gray-100 pb-2">
                                <input
                                    className="w-full bg-white border border-gray-200 p-3 rounded-xl font-medium text-sm outline-none focus:border-[#2E7D6B] shadow-sm"
                                    placeholder="Search food database..."
                                    autoFocus
                                    value={searchValue}
                                    onChange={e => setSearchValue(e.target.value)}
                                />
                            </div>
                            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
                                {foodDatabase.filter(f => (!searchValue || f.name.toLowerCase().includes(searchValue.toLowerCase())) && (searchModal.slot === 'snacks' ? f.category === 'Snacks' : true))
                                    .slice(0, 20).map(item => (
                                        <button key={item.id} onClick={() => {
                                            const slot = searchModal.slot;
                                            const currentItems = plan[currentDay]?.[slot] || [];
                                            const targetCals = stats.mealSplit[slot] || 600;

                                            // Smart Distribution: Split total target among all items (existing + new)
                                            const newTotalItems = currentItems.length + 1;
                                            const calsPerItem = Math.floor(targetCals / newTotalItems);

                                            // 1. Re-scale EXISTING items
                                            const updatedExistingItems = currentItems.map(existing => ({
                                                ...createItemInstance(existing, calsPerItem),
                                                uuid: existing.uuid // Preserve identity
                                            }));

                                            // 2. Create NEW item scaled
                                            const newItem = createItemInstance(item, calsPerItem);

                                            const newSlotList = [...updatedExistingItems, newItem];

                                            setPlan(p => ({
                                                ...p,
                                                [currentDay]: {
                                                    ...p[currentDay],
                                                    [slot]: newSlotList
                                                }
                                            }));
                                            setSearchModal({ open: false });
                                        }} className="w-full text-left p-4 rounded-2xl border border-transparent hover:border-[#2E7D6B]/30 hover:bg-white transition-all flex justify-between items-center bg-white shadow-sm hover:shadow-md group">
                                            <div>
                                                <div className="font-bold text-gray-800 text-sm group-hover:text-[#2E7D6B] transition-colors">{item.name}</div>
                                                <div className="text-[10px] text-gray-400 font-medium">{item.calories} kcal <span className="text-gray-300">•</span> {item.servingSize}</div>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-[#2E7D6B]/10 text-[#2E7D6B] flex items-center justify-center text-lg font-bold group-hover:bg-[#2E7D6B] group-hover:text-white transition-all">+</div>
                                        </button>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Swap Modal */}
            {
                swapModal.open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-[#1F2933]">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setSwapModal({ open: false })}></div>
                        <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[70vh] animate-scale-up">
                            <div className="p-5 bg-gray-50 border-b">
                                <h3 className="font-bold text-center text-sm uppercase tracking-wide text-gray-500">Swap {swapModal.mode === 'MEAL' ? 'Meal' : 'Ingredient'}</h3>
                                <p className="text-xs text-center font-bold text-[#1F2933] mt-1 bg-white inline-block px-3 py-1 rounded-full border border-gray-200 shadow-sm mx-auto flex items-center justify-center">
                                    {swapModal.mode === 'MEAL' ? swapModal.originalItem?.name : swapModal.originalItem.composition[swapModal.originalIndex].name}
                                </p>
                            </div>
                            <div className="flex-1 overflow-y-auto p-3 bg-gray-50 space-y-2">
                                {swapModal.candidates.length > 0 ? swapModal.candidates.map((c, i) => (
                                    <button key={i} onClick={() => confirmSwap(c)} className="w-full text-left p-3 bg-white rounded-xl border border-gray-100 hover:border-[#2E7D6B] hover:shadow-md transition-all group">
                                        <div className="font-bold text-sm text-gray-800 group-hover:text-[#2E7D6B] transition-colors">{c.name}</div>
                                        <div className="flex gap-2 mt-2 text-[10px]">
                                            <span className="font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">{swapModal.mode === 'MEAL' ? (c.calculatedCalories || c.scaledCalories) : c.scaledCalories} kcal</span>
                                            <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">P:{swapModal.mode === 'MEAL' ? c.macros.protein : c.scaledProtein}</span>
                                            <span className="text-blue-400 bg-blue-50 px-1.5 py-0.5 rounded">C:{swapModal.mode === 'MEAL' ? c.macros.carbs : c.scaledCarbs}</span>
                                            <span className="text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded">F:{swapModal.mode === 'MEAL' ? c.macros.fats : c.scaledFats}</span>
                                        </div>
                                    </button>
                                )) : (
                                    <div className="text-center py-8">
                                        <div className="text-3xl mb-3 grayscale opacity-50">🥗</div>
                                        <div className="text-gray-500 font-bold text-sm">No alternatives found</div>
                                        <div className="text-gray-400 text-xs mt-1">Try searching for other items manually</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Save Modal */}
            {saveModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in text-[#1F2933]">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setSaveModalOpen(false)}></div>
                    <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl relative z-10 transform transition-all animate-slide-up-mobile text-center">
                        <div className="w-12 h-12 bg-[#FFD166] rounded-full flex items-center justify-center text-2xl mx-auto mb-4 text-white shadow-lg shadow-[#FFD166]/40">💾</div>
                        <h3 className="text-xl font-bold mb-2">Save Meal Plan</h3>
                        <p className="text-xs text-gray-400 mb-6 px-4">Give your plan a unique name to easily find it later in your library.</p>

                        <div className="mb-6 text-left">
                            <label className="text-[10px] font-bold text-gray-400 ml-2 mb-1 block uppercase tracking-wide">Plan Name</label>
                            <input
                                className="w-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-[#2E7D6B] p-3 rounded-2xl font-bold text-lg outline-none text-gray-800 placeholder-gray-300 transition-all text-center"
                                placeholder="My Awesome Plan"
                                value={planName}
                                onChange={(e) => setPlanName(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setSaveModalOpen(false)} className="flex-1 py-3 text-gray-500 font-bold text-sm hover:bg-gray-50 rounded-xl transition-colors">Cancel</button>
                            <button onClick={handleSavePlan} className="flex-1 py-3 bg-[#2E7D6B] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#2E7D6B]/30 hover:bg-[#256a5b] transition-all">Save Now</button>
                        </div>
                    </div>
                </div>
            )}

        </div >
    );
};

export default MealPlannerPage;
