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
    const [swapSearchQuery, setSwapSearchQuery] = useState("");

    // Save Modal State
    const [saveModalOpen, setSaveModalOpen] = useState(false);
    const [planName, setPlanName] = useState("");

    // Edit State
    const [editingWeightId, setEditingWeightId] = useState(null); // For main item weight
    const [tempWeight, setTempWeight] = useState("");

    // Multi-Day State
    const [planDuration, setPlanDuration] = useState(1);
    const [currentDay, setCurrentDay] = useState(1);
    const [selectedTab, setSelectedTab] = useState('breakfast');

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

        // Helper to get items
        // Allow International combos always to ensure variety
        const getItems = (category, region, mustBeCombo = false) => foodDatabase.filter(item =>
            item.isCooked &&
            (dietPref === 'Vegetarian' ? item.type === 'veg' : true) &&
            (cuisine === 'Mixed' || item.region === 'All' || item.region === cuisine || (mustBeCombo && item.region === 'International')) &&
            (Array.isArray(category) ? category.includes(item.category) : item.category === category) &&
            (mustBeCombo ? item.isCombo : !item.isCombo)
        );

        const pickSmart = (pool, targetCals) => {
            if (!pool.length) return null;
            const item = pool[Math.floor(Math.random() * pool.length)];
            const ratio = targetCals / item.calories;
            const baseWeight = parseServingWeight(item);
            return createItemInstance(item, targetCals, Math.round(baseWeight * ratio));
        };

        // Breakfast
        const bfCombos = getItems('Breakfast', cuisine, true);
        if (bfCombos.length > 0) {
            const combo = pickSmart(bfCombos, targets.breakfast);
            if (combo) dayPlan.breakfast.push(combo);
        } else {
            const bf = pickSmart(getItems('Breakfast', 'All', false), targets.breakfast);
            if (bf) dayPlan.breakfast.push(bf);
        }

        // Lunch
        // Lunch: Strict "Lunch" only
        const lCombos = getItems('Lunch', cuisine, true);
        let lCombo = null;
        if (lCombos.length > 0) {
            lCombo = pickSmart(lCombos, targets.lunch);
        }

        if (lCombo) {
            dayPlan.lunch.push(lCombo);
        } else {
            const lStaples = getItems(['Main Course', 'Breads'], cuisine, false).filter(i => i.subType.includes('Rice') || i.subType.includes('Bread'));
            const lMains = getItems(['Main Course'], cuisine, false).filter(i => !i.subType.includes('Rice') && !i.subType.includes('Bread'));

            const ls = pickSmart(lStaples, targets.lunch * 0.45); // Increase weight for staple
            const lm = pickSmart(lMains, targets.lunch * 0.55);
            if (ls && lm) {
                dayPlan.lunch.push(ls, lm);
            } else if (lMains.length > 0) {
                // Fallback: Just one big main
                const bigMain = pickSmart(lMains, targets.lunch);
                if (bigMain) dayPlan.lunch.push(bigMain);
            }
        }

        // Snacks
        const sCombos = getItems('Snacks', cuisine, true);
        let sCombo = null;
        if (sCombos.length > 0) {
            sCombo = pickSmart(sCombos, targets.snacks);
        }

        if (sCombo) {
            dayPlan.snacks.push(sCombo);
        } else {
            const sn = pickSmart(getItems('Snacks', 'All', false), targets.snacks);
            if (sn) dayPlan.snacks.push(sn);
        }

        // Dinner
        // Dinner: Strict "Dinner" only
        const dCombos = getItems('Dinner', cuisine, true);
        let dCombo = null;
        if (dCombos.length > 0) {
            dCombo = pickSmart(dCombos, targets.dinner);
        }

        if (dCombo) {
            dayPlan.dinner.push(dCombo);
        } else {
            // Fallback to Staples/Mains
            const dStaples = getItems(['Main Course', 'Breads'], cuisine, false).filter(i => i.subType.includes('Rice') || i.subType.includes('Bread'));
            const dMains = getItems(['Main Course'], cuisine, false).filter(i => !i.subType.includes('Rice') && !i.subType.includes('Bread'));

            const ds = pickSmart(dStaples, targets.dinner * 0.45);
            const dm = pickSmart(dMains, targets.dinner * 0.55);

            if (ds && dm) {
                dayPlan.dinner.push(ds, dm);
            } else if (dMains.length > 0) {
                const bigMain = pickSmart(dMains, targets.dinner);
                if (bigMain) dayPlan.dinner.push(bigMain);
            }
        }

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

    const initiateSwap = (slot, originalItem) => {
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
            if (!item.isCooked) return false;

            // Strict Filter: Category must match active Slot
            // Convert slot to lowercase for comparison
            const activeSlotLower = slot.toLowerCase();
            if (activeSlotLower === 'breakfast' && item.category !== 'Breakfast') return false;
            if (activeSlotLower === 'lunch' && item.category !== 'Lunch') return false;
            if (activeSlotLower === 'dinner' && item.category !== 'Dinner') return false;
            if (activeSlotLower === 'snacks' && item.category !== 'Snacks') return false;

            // ... (rest of logic)
            // Filter by Region/Category if desired
            const isVeg = userData.dietPreference === 'Vegetarian';
            if (isVeg && item.type !== 'veg') return false;

            const s = getStats(item);
            const tolerance = 10; // Relaxed tolerance to 10% to show more relevant "similar" items

            return Math.abs(s.p - origStats.p) < tolerance &&
                Math.abs(s.c - origStats.c) < tolerance &&
                Math.abs(s.f - origStats.f) < tolerance;
        }).map(item => {
            // We need to calculate what the stats WOULD be if we swapped.
            // Standard smart swap scales by CALORIES matching.
            const targetCals = originalItem.calculatedCalories;
            const ratio = targetCals / item.calories;

            return {
                ...item,
                scaledCalories: Math.round(targetCals),
                scaledProtein: Math.round(item.protein * ratio),
                scaledCarbs: Math.round(item.carbs * ratio),
                scaledFats: Math.round(item.fats * ratio)
            };
        });

        setSwapSearchQuery("");
        setSubstitutionModal({ open: true, originalItem, candidates, slot });
    };



    // ... (removeFood was already added in previous turn but initiateSwap replaces the block above it)

    // [SKIPPING removeFood duplicate to avoid error, I will target the EXACT block of handleSmartSwap]
    /* Wait, the previous view showed handleSmartSwap ending around line 272. 
       I will replace handleSmartSwap completely. */

    /* AND I will update the Modal UI further down (separate edit or multi-chunk). */

    /* [SPLITTING THIS TOOL CALL INTO TWO CHUNKS IS BETTER] */

    const removeFood = (slot, itemUuid) => {
        setPlan(prev => ({
            ...prev,
            [currentDay]: {
                ...prev[currentDay],
                [slot]: prev[currentDay][slot].filter(i => i.uuid !== itemUuid)
            }
        }));
    };

    // --- MACRO SWAP Logic ---
    const handleMacroClick = (slot, item, macroType) => {
        if (!item.macros || item.macros[macroType] === undefined) return;

        const targetValue = item.macros[macroType];

        const candidates = foodDatabase.filter(candidate => {
            if (candidate.id === item.id) return false;
            // Strict match: Must be Cooked
            if (!candidate.isCooked) return false;

            // Respect Diet Preference
            if (userData.dietPreference === 'Vegetarian' && candidate.type !== 'veg') return false;

            // Strict Filter: Category must match active Slot
            const activeSlotLower = slot.toLowerCase();
            if (activeSlotLower === 'breakfast' && candidate.category !== 'Breakfast') return false;
            if (activeSlotLower === 'lunch' && candidate.category !== 'Lunch') return false;
            if (activeSlotLower === 'dinner' && candidate.category !== 'Dinner') return false;
            if (activeSlotLower === 'snacks' && candidate.category !== 'Snacks') return false;

            // Basic Filter: Candidate must HAVE this macro
            // We want to find items that can providing this macro amount reasonable
            // Let's filter items where macro per 100g > 0
            const cVal = candidate[macroType] || 0;
            return cVal > 0;
        }).map(candidate => {
            // Calculate weight needed to match TARGET VALUE
            const candidateMacroContent = candidate[macroType]; // e.g. 12g per ediblePortion(100g)
            // If data is per serving, we need to handle that. 
            // foodDatabase structure: "protein": 12, "ediblePortion": 100.
            // So it's 12g per 100g.

            // We need 'targetValue' grams of macro.
            // Weight Needed = (targetValue / candidateMacroContent) * 100
            if (candidateMacroContent <= 0) return null;

            const weightNeeded = (targetValue / candidateMacroContent) * 100;
            const ratio = weightNeeded / 100;

            return {
                ...candidate,
                scaledWeight: Math.round(weightNeeded),
                scaledCalories: Math.round(candidate.calories * ratio),
                scaledProtein: Math.round(candidate.protein * ratio),
                scaledCarbs: Math.round(candidate.carbs * ratio),
                scaledFats: Math.round(candidate.fats * ratio),
                matchMacro: Math.round(candidate[macroType] * ratio), // Should equal targetValue
                ratio: ratio
            };
        }).filter(c => c !== null);

        setSubstitutionModal({
            open: true,
            originalItem: item,
            candidates: candidates,
            slot,
            swapType: 'macro',
            targetMacro: macroType
        });
        setSwapSearchQuery("");
    };

    const confirmSwap = (newItem) => {
        const { slot, originalItem, swapType } = substitutionModal;
        if (!slot || !originalItem) return;

        let finalItem;
        if (swapType === 'macro') {
            // New Item is already scaled in the map logic above (newItem.scaledWeight etc)
            // But 'createItemInstance' expects baseItem, targetCals, targetWeight
            // We can pass the calculated values.
            // Note: createItemInstance recalculates based on ratio. 
            // We can reuse it or manually construct. Reuse is safer.
            // newItem.ratio was stored in map above
            finalItem = createItemInstance(newItem, newItem.scaledCalories, newItem.scaledWeight);
        } else {
            // Standard Smart Swap logic (Match Calories)
            const targetCals = originalItem.calculatedCalories;
            const baseWeight = parseServingWeight(newItem);
            const ratio = targetCals / newItem.calories;
            const targetWeight = baseWeight * ratio;
            finalItem = createItemInstance(newItem, targetCals, targetWeight);
        }

        setPlan(prev => ({
            ...prev,
            [currentDay]: {
                ...prev[currentDay],
                [slot]: prev[currentDay][slot].map(i => i.uuid === originalItem.uuid ? finalItem : i)
            }
        }));

        setSubstitutionModal({ open: false, originalItem: null, candidates: [], slot: null, swapType: null });
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
        let weight = 0;

        // LIMIT: Prevent large values (> 999g)
        if (newIngWeight.length > 3) return;

        if (newIngWeight !== "") {
            weight = parseInt(newIngWeight);
            if (isNaN(weight) || weight < 0) return;
        }

        // LIMIT: Max weight explicitly (redundant with length check but safer)
        if (weight > 999) return;

        setPlan(prev => ({
            ...prev,
            [currentDay]: {
                ...prev[currentDay],
                [slot]: prev[currentDay][slot].map(item => {
                    if (item.uuid === itemUuid) {
                        const newComposition = [...item.composition];
                        const ing = newComposition[ingredientIdx];

                        // Robust Calc: Use BASE weight (ing.weight) to calculate ratio
                        // This prevents cumulative rounding errors and DivZero issues
                        const baseWeight = ing.weight || 1;
                        const ratio = weight / baseWeight;

                        // Update this ingredient
                        newComposition[ingredientIdx] = {
                            ...ing,
                            scaledWeight: weight,
                            // Use base values (calories/macros) for scaling
                            scaledCalories: Math.round((ing.calories || 0) * ratio),
                            scaledCarbs: Math.round((ing.carbs || 0) * ratio),
                            scaledProtein: Math.round((ing.protein || 0) * ratio),
                            scaledFats: Math.round((ing.fats || 0) * ratio)
                        };

                        // Recalculate Meal Totals based on new composition
                        const newTotalWeight = newComposition.reduce((sum, c) => sum + (c.scaledWeight || 0), 0);
                        const totalCarbs = newComposition.reduce((sum, c) => sum + (c.scaledCarbs || 0), 0);
                        const totalProtein = newComposition.reduce((sum, c) => sum + (c.scaledProtein || 0), 0);
                        const totalFats = newComposition.reduce((sum, c) => sum + (c.scaledFats || 0), 0);

                        // Sum scaled calories directly for better accuracy
                        const totalCals = newComposition.reduce((sum, c) => sum + (c.scaledCalories || 0), 0);

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
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#43AA95] to-[#A8E6CF] font-sans relative overflow-hidden text-white">
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
                                // Base filter: Must be Cooked + Diet Pref
                                let base = foodDatabase.filter(f =>
                                    f.isCooked &&
                                    (userData.dietPreference === 'Vegetarian' ? f.type === 'veg' : true)
                                );

                                // STRICT SLOT FILTERING
                                switch (activeMealSlot) {
                                    case 'breakfast':
                                        return base.filter(i => i.category === 'Breakfast');
                                    case 'lunch':
                                        // Strict Lunch
                                        return base.filter(i => i.category === 'Lunch');
                                    case 'dinner':
                                        // Strict Dinner
                                        return base.filter(i => i.category === 'Dinner');
                                    case 'snacks':
                                        return base.filter(i => i.category === 'Snacks');
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
                <Modal title={substitutionModal.swapType === 'macro' ? `Smart Swap (Matches ${substitutionModal.targetMacro})` : "Smart Swap Matches"} onClose={() => setSubstitutionModal({ ...substitutionModal, open: false })}>
                    <div className="space-y-3">
                        {/* Search Input */}
                        <div className="sticky top-0 bg-white z-10 pb-2">
                            <input
                                className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-[#2E7D6B] text-gray-800"
                                placeholder="Search substitution..."
                                value={swapSearchQuery}
                                onChange={(e) => setSwapSearchQuery(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="text-xs text-gray-400 mb-2">
                            Similar nutritional profile to <span className="font-bold text-gray-600">{substitutionModal.originalItem?.name}</span>
                        </div>

                        {(() => {
                            // FILTER AND RENDER
                            const filtered = substitutionModal.candidates.filter(item =>
                                item.name.toLowerCase().includes(swapSearchQuery.toLowerCase()) ||
                                (item.subType && item.subType.toLowerCase().includes(swapSearchQuery.toLowerCase()))
                            );

                            if (filtered.length > 0) {
                                return filtered.map(item => (
                                    <button key={item.id} onClick={() => confirmSwap(item)} className="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-[#2E7D6B]/10 rounded-xl transition-colors border border-transparent hover:border-[#2E7D6B]/30 group">
                                        <div className="text-left flex-1">
                                            <div className="font-bold text-gray-800">{item.name}</div>
                                            <div className="text-[10px] text-gray-400 mb-1">{item.subType}</div>

                                            {/* Candidate Stats */}
                                            <div className="flex gap-2 text-[10px] items-center">
                                                <span className="font-bold text-gray-600">{item.scaledCalories || item.calories} kcal</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                <span className="text-blue-600">P: {item.scaledProtein || item.protein}g</span>
                                                <span className="text-orange-600">C: {item.scaledCarbs || item.carbs}g</span>
                                                <span className="text-yellow-600">F: {item.scaledFats || item.fats}g</span>
                                            </div>
                                        </div>
                                        <div className="text-xs font-bold text-[#2E7D6B] px-3 py-1 bg-white rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                            Select
                                        </div>
                                    </button>
                                ));
                            } else {
                                return (
                                    <div className="text-center py-8 text-gray-400">
                                        <div className="text-2xl mb-2">🤔</div>
                                        No matching foods found.
                                    </div>
                                );
                            }
                        })()}
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
                    {/* STATS */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white p-4 rounded-3xl text-center shadow-lg border-2 border-white/20">
                            <div className="text-xs text-gray-400 font-bold uppercase mb-1 tracking-wider">TDEE</div>
                            <div className="text-xl font-black text-gray-800">{stats.tdee} <span className="text-xs font-bold text-gray-400">kcal</span></div>
                        </div>
                        <div className="bg-[#2E7D6B] p-4 rounded-3xl text-center shadow-xl border-2 border-[#A8E6CF] transform scale-105 z-10">
                            <div className="text-xs text-[#A8E6CF] font-bold uppercase mb-1 tracking-wider">Target</div>
                            {(() => {
                                const currentPlan = plan[currentDay] || {};
                                const totalCurrent = ['breakfast', 'lunch', 'snacks', 'dinner'].reduce((acc, slot) => {
                                    return acc + (currentPlan[slot] || []).reduce((sAcc, i) => sAcc + i.calculatedCalories, 0);
                                }, 0);
                                return (
                                    <div className="text-xl font-black text-white">
                                        {totalCurrent} <span className="text-xs font-bold opacity-80">/ {stats.targetCalories}</span>
                                    </div>
                                );
                            })()}
                        </div>
                        <div className="bg-white p-4 rounded-3xl text-center shadow-lg border-2 border-white/20">
                            <div className="text-xs text-gray-400 font-bold uppercase mb-1 tracking-wider">BMR</div>
                            <div className="text-xl font-black text-gray-600">{stats.bmr} <span className="text-xs font-bold text-gray-400">kcal</span></div>
                        </div>
                    </div>


                    {/* CONTROLS AREA */}
                    <div className="space-y-4">
                        {/* Day & View Selector */}
                        <div className="flex justify-between items-center bg-white/10 p-2 pl-4 rounded-2xl backdrop-blur-md border border-white/10">
                            <div className="text-sm font-bold text-white/90 uppercase tracking-wider flex items-center gap-2">
                                <span className="text-lg">🗓️</span> Day {currentDay} of {planDuration}
                            </div>

                            {planDuration > 1 && (
                                <div className="relative">
                                    <select
                                        value={currentDay}
                                        onChange={(e) => setCurrentDay(parseInt(e.target.value))}
                                        className="appearance-none bg-[#2E7D6B] text-white pl-4 pr-10 py-2 rounded-xl font-bold outline-none cursor-pointer border-l border-white/10 hover:bg-[#266859] transition-colors"
                                    >
                                        {Array.from({ length: planDuration }, (_, i) => i + 1).map(day => (
                                            <option key={day} value={day} className="bg-white text-gray-800">Day {day}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-white">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* MEAL TABS */}
                        <div className="flex bg-black/20 p-1.5 rounded-2xl backdrop-blur-md">
                            {['breakfast', 'lunch', 'snacks', 'dinner'].map(slot => (
                                <button
                                    key={slot}
                                    onClick={() => setSelectedTab(slot)}
                                    className={`flex-1 py-3 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-wide transition-all duration-300 ${selectedTab === slot
                                        ? 'bg-white text-[#2E7D6B] shadow-lg scale-[1.02]'
                                        : 'text-white/70 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    {slot === 'breakfast' ? 'Break-Fast' : slot === 'lunch' ? 'Lunch' : slot === 'snacks' ? 'Snack' : 'Dinner'}
                                    <span className="hidden md:inline">{slot === 'breakfast' ? 'fast' : slot === 'snacks' ? 's' : ''}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* MEAL CARD - TAB VIEW */}
                    {(() => {
                        const slot = selectedTab;
                        const target = stats.mealSplit[slot] || 0;
                        const items = (plan[currentDay] && plan[currentDay][slot]) || [];
                        const currentCals = items.reduce((acc, i) => acc + i.calculatedCalories, 0);

                        return (
                            <div key={slot} className="bg-white/95 text-[#1F2933] rounded-[32px] p-2 shadow-2xl animate-fade-in-up min-h-[50vh]">
                                <div className="p-6 pb-2 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-2xl font-bold capitalize text-gray-800">{slot}</h3>
                                        <div className="text-sm text-[#2E7D6B] font-bold uppercase tracking-wide opacity-80 mt-1">{currentCals} / {target} kcal</div>
                                    </div>
                                    <button onClick={() => { setActiveMealSlot(slot); setSearchModalOpen(true); }} className="p-3 bg-[#2E7D6B] rounded-full text-white shadow-lg hover:bg-[#20574B] active:scale-95 transition-all">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="p-4 space-y-4">
                                    {items.length > 0 ? (
                                        items.map((item) => (
                                            <div key={item.uuid} className="rounded-3xl border border-gray-100 bg-gray-50/50 overflow-hidden shadow-sm hover:shadow-md transition-shadow">

                                                {/* Item Header */}
                                                <div
                                                    onClick={() => setExpandedItemId(expandedItemId === item.uuid ? null : item.uuid)}
                                                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white transition-colors"
                                                >
                                                    <div className="text-3xl bg-white p-2 rounded-2xl shadow-sm">🥣</div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-bold text-base text-gray-800 truncate">{item.name}</div>

                                                        {/* Editable Total Weight */}
                                                        <div className="flex items-center gap-2 mt-0.5" onClick={(e) => startEditingWeight(e, item)}>
                                                            {editingWeightId === item.uuid ? (
                                                                <input
                                                                    autoFocus
                                                                    type="text"
                                                                    className="w-16 p-1 text-xs border border-[#2E7D6B] rounded bg-white text-gray-800 font-bold outline-none"
                                                                    value={tempWeight}
                                                                    onChange={(e) => setTempWeight(e.target.value)}
                                                                    onBlur={() => saveWeight(slot, item.uuid)}
                                                                    onKeyDown={(e) => e.key === 'Enter' && saveWeight(slot, item.uuid)}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                />
                                                            ) : (
                                                                <div className="text-xs text-gray-500 font-medium border-b border-dotted border-gray-300 hover:text-[#2E7D6B] hover:border-[#2E7D6B] transition-colors inline-block">
                                                                    {item.calculatedWeight}g
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Macro Badges - Click to Smart Swap */}
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            <button onClick={(e) => { e.stopPropagation(); handleMacroClick(slot, item, 'protein'); }} className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors shadow-sm">
                                                                P: {item.macros?.protein}g
                                                            </button>
                                                            <button onClick={(e) => { e.stopPropagation(); handleMacroClick(slot, item, 'carbs'); }} className="px-2 py-1 bg-orange-50 text-orange-600 text-[10px] font-bold rounded-lg border border-orange-100 hover:bg-orange-100 transition-colors shadow-sm">
                                                                C: {item.macros?.carbs}g
                                                            </button>
                                                            <button onClick={(e) => { e.stopPropagation(); handleMacroClick(slot, item, 'fats'); }} className="px-2 py-1 bg-yellow-50 text-yellow-600 text-[10px] font-bold rounded-lg border border-yellow-100 hover:bg-yellow-100 transition-colors shadow-sm">
                                                                F: {item.macros?.fats}g
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-lg text-[#2E7D6B]">{item.calculatedCalories}</div>
                                                        <div className="text-[10px] text-gray-400 font-bold uppercase">kcal</div>
                                                    </div>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${expandedItemId === item.uuid ? 'rotate-180 text-[#2E7D6B]' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>

                                                {/* Expanded Composition */}
                                                {expandedItemId === item.uuid && (
                                                    <div className="bg-white p-5 border-t border-gray-100 animate-slide-down">
                                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Ingredients & Composition</div>
                                                        <div className="space-y-3">
                                                            {item.composition && item.composition.map((comp, idx) => (
                                                                <div key={idx} className="flex justify-between items-center text-sm py-1 border-b border-gray-50 last:border-0">
                                                                    <span className="text-gray-600 font-medium">{comp.name}</span>
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-lg">
                                                                            <input
                                                                                type="text"
                                                                                className="w-10 bg-transparent text-right font-bold text-gray-700 outline-none text-xs"
                                                                                value={comp.scaledWeight === 0 && document.activeElement !== document.querySelector(`input[data-uuid="${item.uuid}-${idx}"]`) ? "" : comp.scaledWeight}
                                                                                data-uuid={`${item.uuid}-${idx}`}
                                                                                onChange={(e) => handleIngredientChange(slot, item.uuid, idx, e.target.value)}
                                                                                onBlur={(e) => {
                                                                                    // Prevent 0g on blur - reset to 1 if empty or 0
                                                                                    if (!e.target.value || parseInt(e.target.value) === 0) {
                                                                                        handleIngredientChange(slot, item.uuid, idx, "1");
                                                                                    }
                                                                                }}
                                                                            />
                                                                            <span className="text-[10px] text-gray-400">g</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                                                            <button
                                                                onClick={() => initiateSwap(slot, item)}
                                                                className="flex-1 py-2 text-xs font-bold text-[#2E7D6B] bg-[#2E7D6B]/10 rounded-xl hover:bg-[#2E7D6B]/20 transition-colors flex justify-center items-center gap-2"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                                </svg>
                                                                Swap Item
                                                            </button>
                                                            <button
                                                                onClick={() => removeFood(slot, item.uuid)}
                                                                className="px-4 py-2 text-xs font-bold text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10 flex flex-col items-center justify-center opacity-60">
                                            <div className="bg-gray-100 p-4 rounded-full mb-3">
                                                <span className="text-4xl">🍽️</span>
                                            </div>
                                            <div className="font-bold text-gray-400">Your Plate is Empty</div>
                                            <div className="text-xs text-gray-400 max-w-[150px] mt-1">Tap + to add food or Auto-Generate a plan</div>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => { setActiveMealSlot(slot); setSearchModalOpen(true); }}
                                        className="w-full py-4 rounded-2xl border-2 border-dashed border-[#2E7D6B]/30 text-[#2E7D6B] font-bold text-sm hover:bg-[#2E7D6B]/5 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add Food to {slot}
                                    </button>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </div >
        </div >
    );
};

export default MealPlannerPage;
