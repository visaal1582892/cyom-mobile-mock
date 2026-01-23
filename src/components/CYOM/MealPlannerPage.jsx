import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { userData } from '../../data/store';
import { foodDatabase } from '../../data/foodDatabase';
import { calculateBMR, calculateTDEE, calculateTargetCalories, calculateMealTargets, calculateMacroTargets } from '../../utils/calculations';

// Generic Modal (Reuse)
const Modal = ({ title, onClose, children }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl overflow-hidden relative">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                {children}
            </div>
        </div>
    </div>
);

const MealPlannerPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Interaction State
    const [searchModalOpen, setSearchModalOpen] = useState(false);
    const [activeMealSlot, setActiveMealSlot] = useState(null);
    const [expandedItemId, setExpandedItemId] = useState(null);
    const [substitutionModal, setSubstitutionModal] = useState({ open: false, originalItem: null, candidates: [], slot: null });

    // Save Modal State
    const [saveModalOpen, setSaveModalOpen] = useState(false);
    const [planName, setPlanName] = useState("");

    // Edit State
    const [editingWeightId, setEditingWeightId] = useState(null); // For main item weight
    const [tempWeight, setTempWeight] = useState("");

    // Multi-Day State
    const [planDuration, setPlanDuration] = useState(1);
    const [currentDay, setCurrentDay] = useState(1);

    const [stats, setStats] = useState({ bmr: 0, tdee: 0, targetCalories: 0, mealSplit: {} });
    // Plan State: { 1: { breakfast: [], ... }, 2: { ... } }
    const [plan, setPlan] = useState({ 1: { breakfast: [], lunch: [], snacks: [], dinner: [] } });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (location.state) {
            // Check if loading a saved plan
            if (location.state.savedPlanData) {
                const saved = location.state.savedPlanData;
                setStats(saved.stats);
                setPlan(saved.plan);
                setPlanDuration(parseInt(saved.duration) || 1);
                setLoading(false);
                return;
            }

            const { currentWeight, currentHeight, activityLevel, targetWeightLoss, planDuration: durationStr, dietPreference, cuisineStyle } = location.state;
            const weight = parseFloat(currentWeight);
            const height = parseFloat(currentHeight);
            const loss = parseFloat(targetWeightLoss) || 0;

            // Parse duration "7 Days" -> 7
            const days = parseInt(durationStr) || 1;
            setPlanDuration(days);

            const bmr = calculateBMR(weight, height, userData.age, userData.gender);
            const tdee = calculateTDEE(bmr, activityLevel);
            const target = calculateTargetCalories(tdee, loss, bmr);
            const split = calculateMealTargets(target);

            setStats({ bmr, tdee, targetCalories: target, mealSplit: split });
            generateMultiDayPlan(days, split, dietPreference, cuisineStyle);
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, [location.state]);

    const handleLogout = () => navigate('/login');

    // Helper to get gram weight from serving string
    const parseServingWeight = (item) => {
        // Try to find (200g) or (150ml) pattern
        const match = item.servingSize?.match(/\((\d+)\s*(?:g|ml)\)/i);
        if (match) return parseInt(match[1]);

        // If no parens, check if string starts with number and has g/ml, e.g. "100g"
        const directMatch = item.servingSize?.match(/^(\d+)\s*(?:g|ml)/i);
        if (directMatch) return parseInt(directMatch[1]);

        // Fallback: Use composition sum if available
        if (item.composition) {
            const sum = item.composition.reduce((acc, c) => acc + (c.weight || 0), 0);
            if (sum > 0) return sum;
        }

        // Final fallback
        return 100;
    };

    const generateMultiDayPlan = (days, targets, dietPref, cuisine) => {
        const fullPlan = {};

        for (let day = 1; day <= days; day++) {
            fullPlan[day] = generateSingleDay(targets, dietPref, cuisine);
        }
        setPlan(fullPlan);
    };

    const generateSingleDay = (targets, dietPref, cuisine) => {
        const dayPlan = { breakfast: [], lunch: [], snacks: [], dinner: [] };

        // Strict Cooked Only Filter
        const getPool = (category, region) => foodDatabase.filter(item =>
            item.isCooked &&
            (dietPref === 'Vegetarian' ? item.type === 'veg' : true) &&
            (cuisine === 'Mixed' || item.region === 'All' || item.region === cuisine) &&
            (Array.isArray(category) ? category.includes(item.category) : item.category === category)
        );

        const pickSmart = (pool, targetCals) => {
            if (!pool.length) return null;
            const item = pool[Math.floor(Math.random() * pool.length)];
            const ratio = targetCals / item.calories;
            const baseWeight = parseServingWeight(item);
            return createItemInstance(item, targetCals, Math.round(baseWeight * ratio));
        };

        const bf = pickSmart(getPool('Breakfast', 'All'), targets.breakfast);
        if (bf) dayPlan.breakfast.push(bf);

        const lStaples = getPool(['Main Course', 'Breads'], cuisine).filter(i => i.subType.includes('Rice') || i.subType.includes('Bread'));
        const lMains = getPool(['Main Course'], cuisine).filter(i => !i.subType.includes('Rice') && !i.subType.includes('Bread'));

        const ls = pickSmart(lStaples, targets.lunch * 0.4);
        const lm = pickSmart(lMains, targets.lunch * 0.6);
        if (ls) dayPlan.lunch.push(ls);
        if (lm) dayPlan.lunch.push(lm);

        const sn = pickSmart(getPool('Snacks', 'All'), targets.snacks);
        if (sn) dayPlan.snacks.push(sn);

        const ds = pickSmart(lStaples, targets.dinner * 0.4);
        const dm = pickSmart(lMains, targets.dinner * 0.6);
        if (ds) dayPlan.dinner.push(ds);
        if (dm) dayPlan.dinner.push(dm);

        return dayPlan;
    };

    // Helper to create/recalculate an item instance
    const createItemInstance = (baseItem, targetCals, targetWeight) => {
        // Find ratio based on weight change or calorie change
        // Here we use weight as the driver if provided
        const baseWeight = parseServingWeight(baseItem);
        const ratio = targetWeight / baseWeight;

        return {
            ...baseItem,
            uuid: baseItem.uuid || Math.random().toString(36),
            calculatedCalories: Math.round(baseItem.calories * ratio),
            calculatedWeight: Math.round(targetWeight),
            macros: {
                carbs: Math.round((baseItem.carbs || 0) * ratio),
                protein: Math.round((baseItem.protein || 0) * ratio),
                fats: Math.round((baseItem.fats || 0) * ratio)
            },
            composition: baseItem.composition?.map(c => ({
                ...c,
                scaledWeight: Math.round(c.weight * ratio),
                scaledCarbs: Math.round((c.carbs || 0) * ratio),
                scaledProtein: Math.round((c.protein || 0) * ratio),
                scaledFats: Math.round((c.fats || 0) * ratio)
            }))
        };
    };

    const handleAdd = (item) => {
        if (!activeMealSlot) return;
        const baseWeight = parseServingWeight(item);
        const newItem = createItemInstance(item, item.calories, baseWeight);

        setPlan(prev => ({
            ...prev,
            [currentDay]: {
                ...prev[currentDay],
                [activeMealSlot]: [...prev[currentDay][activeMealSlot], newItem]
            }
        }));
        setSearchModalOpen(false);
    };

    const handleSmartSwap = (slot, originalItem) => {
        const baseWeight = parseServingWeight(originalItem);

        // Calculate macro percentages (g per 100g approx, or just ratio)
        const getStats = (i) => {
            const w = parseServingWeight(i);
            // Safety check for 0 weight
            if (w === 0) return { p: 0, c: 0, f: 0 };
            return {
                p: (i.protein / w) * 100,
                c: (i.carbs / w) * 100,
                f: (i.fats / w) * 100
            };
        };

        const origStats = getStats(originalItem);

        const candidates = foodDatabase.filter(item => {
            if (item.id === originalItem.id) return false;
            // Strict Filter: Must be Cooked
            if (!item.isCooked) return false;
            // Filter by Region/Category if desired, but user said "similar item". 
            // Let's keep it broad but respect Veg/NonVeg
            const isVeg = userData.dietPreference === 'Vegetarian';
            if (isVeg && item.type !== 'veg') return false;

            const s = getStats(item);
            const tolerance = 5; // +/- 5g per 100g difference allowed

            return Math.abs(s.p - origStats.p) < tolerance &&
                Math.abs(s.c - origStats.c) < tolerance &&
                Math.abs(s.f - origStats.f) < tolerance;
        });

        setSubstitutionModal({ open: true, originalItem, candidates, slot });
    };

    const confirmSwap = (newItem) => {
        const { slot, originalItem } = substitutionModal;
        if (!slot || !originalItem) return;

        // Create new item instance scaled to match ORIGINAL ITEM'S Calories
        const targetCals = originalItem.calculatedCalories;
        const baseWeight = parseServingWeight(newItem);

        // We want new item to provide 'targetCals'
        const ratio = targetCals / newItem.calories;
        const targetWeight = baseWeight * ratio;

        const swappedItem = createItemInstance(newItem, targetCals, targetWeight);

        setPlan(prev => ({
            ...prev,
            [currentDay]: {
                ...prev[currentDay],
                [slot]: prev[currentDay][slot].map(i => i.uuid === originalItem.uuid ? swappedItem : i)
            }
        }));

        setSubstitutionModal({ open: false, originalItem: null, candidates: [], slot: null });
    };

    // --- EDIT HANDLERS ---

    // 1. Edit Total Item Weight
    const startEditingWeight = (e, item) => {
        e.stopPropagation();
        setEditingWeightId(item.uuid);
        setTempWeight(item.calculatedWeight);
    };

    const saveWeight = (slot, itemUuid) => {
        const newWeight = parseInt(tempWeight);
        if (isNaN(newWeight) || newWeight <= 0) {
            setEditingWeightId(null);
            return;
        }

        setPlan(prev => ({
            ...prev,
            [currentDay]: {
                ...prev[currentDay],
                [slot]: prev[currentDay][slot].map(item => {
                    if (item.uuid === itemUuid) {
                        // Recalculate everything based on new weight
                        const ratio = newWeight / item.calculatedWeight; // Ratio of change

                        return {
                            ...item,
                            calculatedCalories: Math.round(item.calculatedCalories * ratio),
                            calculatedWeight: newWeight,
                            macros: {
                                carbs: Math.round(item.macros.carbs * ratio),
                                protein: Math.round(item.macros.protein * ratio),
                                fats: Math.round(item.macros.fats * ratio)
                            },
                            composition: item.composition?.map(c => ({
                                ...c,
                                scaledWeight: Math.round(c.scaledWeight * ratio),
                                scaledCarbs: Math.round(c.scaledCarbs * ratio),
                                scaledProtein: Math.round(c.scaledProtein * ratio),
                                scaledFats: Math.round(c.scaledFats * ratio)
                            }))
                        };
                    }
                    return item;
                })
            }
        }));
        setEditingWeightId(null);
    };

    // 2. Edit Ingredient Weight
    const handleIngredientChange = (slot, itemUuid, ingredientIdx, newIngWeight) => {
        const weight = parseInt(newIngWeight);
        if (isNaN(weight) || weight < 0) return;

        setPlan(prev => ({
            ...prev,
            [currentDay]: {
                ...prev[currentDay],
                [slot]: prev[currentDay][slot].map(item => {
                    if (item.uuid === itemUuid) {
                        const newComposition = [...item.composition];
                        const ing = newComposition[ingredientIdx];

                        // Calc ratio for this ingredient change
                        const ratio = weight / ing.scaledWeight;

                        // Update this ingredient
                        newComposition[ingredientIdx] = {
                            ...ing,
                            scaledWeight: weight,
                            scaledCarbs: Math.round(ing.scaledCarbs * ratio),
                            scaledProtein: Math.round(ing.scaledProtein * ratio),
                            scaledFats: Math.round(ing.scaledFats * ratio)
                        };

                        // Re-sum total item stats
                        const newTotalWeight = newComposition.reduce((sum, c) => sum + c.scaledWeight, 0);
                        const totalCarbs = newComposition.reduce((sum, c) => sum + c.scaledCarbs, 0);
                        const totalProtein = newComposition.reduce((sum, c) => sum + c.scaledProtein, 0);
                        const totalFats = newComposition.reduce((sum, c) => sum + c.scaledFats, 0);
                        const totalCals = (totalCarbs * 4) + (totalProtein * 4) + (totalFats * 9);

                        return {
                            ...item,
                            calculatedWeight: newTotalWeight,
                            calculatedCalories: Math.round(totalCals),
                            macros: {
                                carbs: totalCarbs,
                                protein: totalProtein,
                                fats: totalFats
                            },
                            composition: newComposition
                        };
                    }
                    return item;
                })
            }
        }));
    };

    // --- SAVE PLAN ---
    const handleSavePlan = () => {
        if (!planName.trim()) return;

        const newPlan = {
            id: Date.now(),
            name: planName,
            duration: `${planDuration} Day${planDuration > 1 ? 's' : ''}`,
            avgCalories: stats.targetCalories,
            createdAt: new Date().toLocaleDateString(),
            stats: stats,
            plan: plan
        };

        // Push to local storage
        const existing = JSON.parse(localStorage.getItem('savedPlans') || '[]');
        existing.push(newPlan);
        localStorage.setItem('savedPlans', JSON.stringify(existing));

        setSaveModalOpen(false);
        setPlanName("");
        alert("Plan Saved Successfully!"); // Or use a toast if available
    };

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#2E7D6B] to-[#A8E6CF] font-sans relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 w-full h-[50vh] bg-gradient-to-b from-black/10 to-transparent pointer-events-none"></div>

            {/* SAVE MODAL */}
            {saveModalOpen && (
                <Modal title="Save Meal Plan" onClose={() => setSaveModalOpen(false)}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Plan Name</label>
                            <input
                                className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-[#2E7D6B] font-bold text-gray-800"
                                placeholder="e.g. My Weight Loss Week 1"
                                value={planName}
                                onChange={(e) => setPlanName(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <button onClick={handleSavePlan} className="w-full py-3 bg-[#2E7D6B] text-white font-bold rounded-xl shadow-lg hover:bg-[#256a5b]">
                            Save Plan
                        </button>
                    </div>
                </Modal>
            )}

            {/* ADD FOOD MODAL */}
            {searchModalOpen && (
                <Modal title={`Add to ${activeMealSlot} (Day ${currentDay})`} onClose={() => setSearchModalOpen(false)}>
                    <input
                        className="w-full p-3 bg-gray-50 border rounded-xl mb-4 text-gray-800 outline-none focus:border-[#2E7D6B]"
                        placeholder={`Search ${activeMealSlot} items...`}
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                // Search Logic
                            }
                        }}
                    />
                    <div className="space-y-2">
                        {(() => {
                            const getFilteredItems = () => {
                                // Base filter: Must be Cooked
                                let base = foodDatabase.filter(f => f.isCooked);

                                // Slot specific filter
                                switch (activeMealSlot) {
                                    case 'breakfast':
                                        return base.filter(i => i.category === 'Breakfast');
                                    case 'snacks':
                                        return base.filter(i => i.category === 'Snacks');
                                    case 'lunch':
                                    case 'dinner':
                                        // Show Main Course, Breads, Rice, and maybe Breakfast items that are suitable?
                                        // Strict: Main Course, Breads, Rice, Accompaniments
                                        return base.filter(i => ['Main Course', 'Breads', 'Rice', 'Accompaniments'].includes(i.category));
                                    default:
                                        return base;
                                }
                            };

                            const items = getFilteredItems().slice(0, 20); // Limit to 20 for perf

                            if (items.length === 0) {
                                return <div className="text-center text-gray-400 py-4">No specific items found for this slot.</div>;
                            }

                            return items.map(item => {
                                const w = parseServingWeight(item);
                                const kcalPer100 = w > 0 ? Math.round((item.calories / w) * 100) : 0;
                                return (
                                    <button key={item.id} onClick={() => handleAdd(item)} className="w-full flex items-center justify-between p-3 hover:bg-green-50 rounded-xl text-gray-700">
                                        <div className="text-left">
                                            <div className="font-bold">{item.name}</div>
                                            <div className="text-[10px] text-gray-400">{item.subType || item.category}</div>
                                        </div>
                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">{kcalPer100} kcal/100g</span>
                                    </button>
                                );
                            });
                        })()}
                    </div>
                </Modal>
            )}

            {/* SMART SWAP MODAL */}
            {substitutionModal.open && (
                <Modal title="Smart Swap Matches" onClose={() => setSubstitutionModal({ ...substitutionModal, open: false })}>
                    <div className="space-y-3">
                        <div className="text-xs text-gray-400 mb-2">
                            Similar nutritional profile to <span className="font-bold text-gray-600">{substitutionModal.originalItem?.name}</span>
                        </div>
                        {substitutionModal.candidates.length > 0 ? (
                            substitutionModal.candidates.map(item => {
                                // Show difference preview?
                                return (
                                    <button key={item.id} onClick={() => confirmSwap(item)} className="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-[#2E7D6B]/10 rounded-xl transition-colors border border-transparent hover:border-[#2E7D6B]/30">
                                        <div className="text-left">
                                            <div className="font-bold text-gray-800">{item.name}</div>
                                            <div className="text-[10px] text-gray-400">{item.subType}</div>
                                        </div>
                                        <div className="text-xs font-bold text-[#2E7D6B] px-3 py-1 bg-white rounded-lg shadow-sm">
                                            Select
                                        </div>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                <div className="text-2xl mb-2">🤔</div>
                                No similar foods found.
                            </div>
                        )}
                    </div>
                </Modal>
            )}

            {/* NAV */}
            <div className="pt-6 px-6 flex justify-between items-center relative z-20">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/meal-creation')} className="p-2 rounded-full hover:bg-white/20 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <div className="text-xs opacity-80 font-medium text-green-100">Meal Planner</div>
                        <div className="text-lg font-bold">{userData.name}</div>
                    </div>
                </div>
                <div className="flex gap-3 relative">
                    <button
                        onClick={() => setSaveModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 active:scale-95 rounded-full text-xs font-bold text-white transition-all backdrop-blur-md border border-white/20 shadow-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        <span>Save Plan</span>
                    </button>

                    <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="w-12 h-12 rounded-full border-2 border-white/50 overflow-hidden relative active:scale-95 transition-transform">
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">IMG</div>
                    </button>

                    {/* PROFILE DROPDOWN */}
                    {isProfileOpen && (
                        <>
                            <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsProfileOpen(false)}></div>
                            <div className="absolute top-14 right-0 w-56 bg-white rounded-2xl shadow-2xl py-2 z-50 text-gray-800 animate-fade-in-up origin-top-right ring-1 ring-black/5">
                                <div className="px-4 py-3 border-b border-gray-100 mb-1 bg-gray-50/50">
                                    <div className="font-bold text-sm text-[#1F2933]">{userData.name}</div>
                                    <div className="text-xs text-[#2E7D6B] font-medium">Standard Plan</div>
                                </div>
                                <div className="p-1">
                                    <button
                                        onClick={() => navigate('/profile')}
                                        className="w-full text-left px-3 py-2 hover:bg-[#2E7D6B]/10 rounded-xl text-sm font-bold text-gray-600 hover:text-[#2E7D6B] transition-colors flex items-center gap-3"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        My Profile
                                    </button>
                                    <button
                                        onClick={() => navigate('/saved-plans')}
                                        className="w-full text-left px-3 py-2 hover:bg-[#2E7D6B]/10 rounded-xl text-sm font-bold text-gray-600 hover:text-[#2E7D6B] transition-colors flex items-center gap-3"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                        </svg>
                                        Saved Plans
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-3 py-2 hover:bg-red-50 rounded-xl text-sm font-bold text-gray-600 hover:text-red-500 transition-colors flex items-center gap-3"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>



            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto pb-10 custom-scrollbar px-4 pt-6">
                <div className="w-full max-w-2xl mx-auto space-y-6">

                    {/* STATS */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-[#1F2933]/40 p-4 rounded-3xl text-center backdrop-blur-md border border-white/10">
                            <div className="text-xs text-gray-300 font-bold uppercase mb-1">TDEE</div>
                            <div className="text-xl font-bold">{stats.tdee} <span className="text-xs font-normal text-gray-400">kcal</span></div>
                        </div>
                        <div className="bg-[#2E7D6B] p-4 rounded-3xl text-center border border-[#A8E6CF]/30 shadow-lg">
                            <div className="text-xs text-green-100 font-bold uppercase mb-1">Target</div>
                            {(() => {
                                const currentPlan = plan[currentDay] || {};
                                const totalCurrent = ['breakfast', 'lunch', 'snacks', 'dinner'].reduce((acc, slot) => {
                                    return acc + (currentPlan[slot] || []).reduce((sAcc, i) => sAcc + i.calculatedCalories, 0);
                                }, 0);
                                return (
                                    <div className="text-xl font-bold">
                                        {totalCurrent} <span className="text-sm font-normal opacity-80">/ {stats.targetCalories} kcal</span>
                                    </div>
                                );
                            })()}
                        </div>
                        <div className="bg-[#1F2933]/40 p-4 rounded-3xl text-center backdrop-blur-md border border-white/10">
                            <div className="text-xs text-gray-300 font-bold uppercase mb-1">BMR</div>
                            <div className="text-xl text-gray-400 font-bold">{stats.bmr} <span className="text-xs font-normal text-gray-500">kcal</span></div>
                        </div>
                    </div>

                    {/* DAY TABS (Moved Below Stats) */}
                    {planDuration > 1 && (
                        <div className="relative z-10">
                            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
                                {Array.from({ length: planDuration }, (_, i) => i + 1).map(day => (
                                    <button
                                        key={day}
                                        onClick={() => setCurrentDay(day)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${currentDay === day
                                            ? 'bg-[#2E7D6B] text-white border-[#2E7D6B] shadow-md'
                                            : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        Day {day}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* MEAL CARDS */}
                    {['breakfast', 'lunch', 'snacks', 'dinner'].map(slot => {
                        const target = stats.mealSplit[slot] || 0;
                        const items = (plan[currentDay] && plan[currentDay][slot]) || [];
                        const currentCals = items.reduce((acc, i) => acc + i.calculatedCalories, 0);

                        return (
                            <div key={slot} className="bg-white/95 text-[#1F2933] rounded-3xl p-5 shadow-xl">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold capitalize">{slot}</h3>
                                        <div className="text-xs text-[#2E7D6B] font-bold uppercase tracking-wide">{currentCals} / {target} kcal</div>
                                    </div>
                                    <button onClick={() => { setActiveMealSlot(slot); setSearchModalOpen(true); }} className="p-2 bg-[#2E7D6B]/10 rounded-xl text-[#2E7D6B] hover:bg-[#2E7D6B]/20">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {items.map((item) => (
                                        <div key={item.uuid} className="rounded-2xl border border-gray-100 bg-gray-50 overflow-hidden">

                                            {/* Item Header */}
                                            <div
                                                onClick={() => setExpandedItemId(expandedItemId === item.uuid ? null : item.uuid)}
                                                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                                            >
                                                <div className="text-2xl">🥣</div>
                                                <div className="flex-1">
                                                    <div className="font-bold text-sm text-gray-800">{item.name}</div>

                                                    {/* Editable Total Weight */}
                                                    <div className="flex items-center gap-2" onClick={(e) => startEditingWeight(e, item)}>
                                                        {editingWeightId === item.uuid ? (
                                                            <input
                                                                autoFocus
                                                                type="text"
                                                                className="w-16 p-1 text-xs border border-green-500 rounded bg-white text-gray-800"
                                                                value={tempWeight}
                                                                onChange={(e) => setTempWeight(e.target.value)}
                                                                onBlur={() => saveWeight(slot, item.uuid)}
                                                                onKeyDown={(e) => e.key === 'Enter' && saveWeight(slot, item.uuid)}
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        ) : (
                                                            <div className="text-xs text-gray-500 border-b border-dotted border-gray-400 hover:text-blue-500 hover:border-blue-500 inline-block">
                                                                {item.calculatedWeight}g
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="font-bold text-sm text-[#2E7D6B]">{item.calculatedCalories}</div>
                                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transition-transform ${expandedItemId === item.uuid ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>

                                            {/* Expanded Composition */}
                                            {expandedItemId === item.uuid && (
                                                <div className="bg-white p-4 border-t border-gray-100 animate-slide-down">
                                                    <div className="text-xs font-bold text-gray-400 uppercase mb-2">Composition Breakdown</div>
                                                    {item.composition ? (
                                                        <div className="space-y-2">
                                                            {item.composition.map((comp, idx) => (
                                                                <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-50 last:border-0 pb-2">
                                                                    <div className="flex-1 mr-4">
                                                                        <div className="font-bold text-gray-700">{comp.name}</div>
                                                                        {/* Editable Ingredient Weight */}
                                                                        <div className="flex items-center gap-1 mt-1">
                                                                            <input
                                                                                type="number"
                                                                                className="w-16 p-1 text-xs bg-gray-50 border border-gray-200 rounded focus:border-green-500 outline-none text-gray-600 font-medium"
                                                                                value={comp.scaledWeight}
                                                                                onChange={(e) => handleIngredientChange(slot, item.uuid, idx, e.target.value)}
                                                                            />
                                                                            <span className="text-xs text-gray-400">g</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-xs text-gray-400 italic">No breakdown available</div>
                                                    )}

                                                    <button
                                                        onClick={() => handleSmartSwap(slot, item)}
                                                        className="w-full mt-3 py-2 bg-gradient-to-r from-[#2E7D6B] to-[#1F2933] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                                        </svg>
                                                        Smart Swap Similar Food
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Macro Summary Strip */}
                                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
                                    {(() => {
                                        const currentMacros = items.reduce((acc, i) => ({
                                            c: acc.c + (i.macros?.carbs || 0),
                                            p: acc.p + (i.macros?.protein || 0),
                                            f: acc.f + (i.macros?.fats || 0)
                                        }), { c: 0, p: 0, f: 0 });

                                        const targetMacros = calculateMacroTargets(target);
                                        const getPct = (c, t) => Math.min((c / t) * 100, 100);

                                        return (
                                            <>
                                                <div className="text-center">
                                                    <div className="text-[10px] uppercase font-bold text-gray-400">Carbs</div>
                                                    <div className="text-xs font-bold text-gray-800">{currentMacros.c} / {targetMacros.carbs}g</div>
                                                    <div className="h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                                        <div className="h-full bg-blue-500 w-full transition-all" style={{ width: `${getPct(currentMacros.c, targetMacros.carbs)}%` }}></div>
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-[10px] uppercase font-bold text-gray-400">Protein</div>
                                                    <div className="text-xs font-bold text-gray-800">{currentMacros.p} / {targetMacros.protein}g</div>
                                                    <div className="h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                                        <div className="h-full bg-green-500 w-full transition-all" style={{ width: `${getPct(currentMacros.p, targetMacros.protein)}%` }}></div>
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-[10px] uppercase font-bold text-gray-400">Fat</div>
                                                    <div className="text-xs font-bold text-gray-800">{currentMacros.f} / {targetMacros.fats}g</div>
                                                    <div className="h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                                        <div className="h-full bg-yellow-500 w-full transition-all" style={{ width: `${getPct(currentMacros.f, targetMacros.fats)}%` }}></div>
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div >
        </div >
    );
};

export default MealPlannerPage;
