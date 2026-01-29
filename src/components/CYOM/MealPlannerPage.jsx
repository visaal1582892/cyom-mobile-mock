import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { userData } from '../../data/store';
import { foodDatabase } from '../../data/foodDatabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Loader from '../UI/Loader';
import Toast from '../UI/Toast';
import { calculateBMR, calculateTDEE, calculateTargetCalories, calculateMealTargets } from '../../utils/calculations';

// --- SUB-COMPONENTS ---

const MacroCell = ({ val, target, type }) => {
    return (
        <span className="font-medium text-gray-700">{val}</span>
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
    const [preferences, setPreferences] = useState({ dietPreference: 'Vegetarian', cuisineStyle: 'All', allergies: [], beverageSchedule: [] });

    // UI State
    const [currentDay, setCurrentDay] = useState(1);
    const [planDuration, setPlanDuration] = useState(1);
    const [expandedMeals, setExpandedMeals] = useState({}); // { [mealUuid]: boolean }
    const [activeBoosterTab, setActiveBoosterTab] = useState({}); // { [mealUuid]: 'Protein' | 'Carb' | 'Fat' }

    const toggleMeal = (uuid) => {
        setExpandedMeals(prev => ({ ...prev, [uuid]: !prev[uuid] }));
        if (!activeBoosterTab[uuid]) setActiveBoosterTab(prev => ({ ...prev, [uuid]: 'Protein' }));
    };

    // INLINE SEARCH STATE
    // Moved to Overlay, but keeping same state structure
    const [inlineSearch, setInlineSearch] = useState({
        active: false,
        slot: null,
        itemUuid: null,
        ingIdx: null,
        type: null, // 'MEAL', 'ING', 'ADD'
        query: ''
    });

    const [saveModalOpen, setSaveModalOpen] = useState(false);
    const [planName, setPlanName] = useState("");
    const [toast, setToast] = useState(null);
    const [infoModalOpen, setInfoModalOpen] = useState(false);
    const [infoItem, setInfoItem] = useState(null);
    const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
    const downloadRef = useRef(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (downloadRef.current && !downloadRef.current.contains(event.target)) {
                setDownloadMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleShowInfo = (e, item) => {
        e.stopPropagation();
        let fullItem = { ...item };

        // If it's a component (has a name but no composition), 
        // check if we can find a more detailed version in DB
        if (!fullItem.composition || fullItem.composition.length === 0) {
            // Refined Lookup: 
            // 1. Strict equality first, prioritizing non-combos
            // 2. Case-insensitive
            const dbMatch = foodDatabase.find(f =>
                (f.name.toLowerCase() === fullItem.name.toLowerCase() && !f.isCombo)
            ) || foodDatabase.find(f =>
                f.name.toLowerCase() === fullItem.name.toLowerCase()
            ) || foodDatabase.find(f =>
                f.isCooked && f.name.toLowerCase().includes(fullItem.name.toLowerCase()) && !f.isCombo
            );

            if (dbMatch && dbMatch.composition && dbMatch.composition.length > 0) {
                // If found, we want to scale the DB match composition to the item's weight if possible
                const itemWeight = fullItem.calculatedWeight || fullItem.scaledWeight || parseServingWeight(fullItem) || 100;
                const ratio = itemWeight / (parseServingWeight(dbMatch) || 100);
                fullItem.composition = dbMatch.composition.map(c => ({
                    ...c,
                    scaledWeight: Math.round((c.weight || 0) * ratio)
                }));
            }
        }

        setInfoItem(fullItem);
        setInfoModalOpen(true);
    };

    // Helpers
    const parseServingWeight = (item) => {
        if (item.composition && item.composition.length > 0) return item.composition.reduce((a, b) => a + (b.weight || 0), 0);
        const match = item.servingSize?.match(/\((\d+)\s*(?:g|ml)\)/i);
        return match ? parseInt(match[1]) : 100;
    };

    const isAllergic = (item) => {
        if (!preferences.allergies || preferences.allergies.length === 0) return false;
        const allSet = new Set(preferences.allergies.map(a => a.toLowerCase()));

        // Check main item name
        if (allSet.has(item.name.toLowerCase())) return true;

        // Deep check composition
        if (item.composition) {
            return item.composition.some(c => allSet.has(c.name.toLowerCase()));
        }

        return false;
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
                const { currentWeight, currentHeight, activityLevel, targetWeightLoss, planDuration: d, dietPreference, cuisineStyle, allergies = [], beverageSchedule = [] } = location.state;
                const bmr = calculateBMR(currentWeight, currentHeight, userData.age, userData.gender);
                const tdee = calculateTDEE(bmr, activityLevel);
                const target = calculateTargetCalories(tdee, targetWeightLoss, bmr);
                const split = calculateMealTargets(target);
                setStats({ bmr, tdee, targetCalories: target, mealSplit: split });
                setPreferences({ dietPreference, cuisineStyle, allergies, beverageSchedule });
                setPlanDuration(parseInt(d) || 1);
                generateMultiDayPlan(parseInt(d) || 1, split, dietPreference, cuisineStyle, allergies, beverageSchedule);
            }
            setLoading(false);
        } else { setLoading(false); }
    }, [location.state]);

    const generateMultiDayPlan = (days, targets, diet, cuisine, allergies, bevSchedule = []) => {
        const newPlan = {};
        for (let i = 1; i <= days; i++) {
            newPlan[i] = { breakfast: [], lunch: [], snacks: [], dinner: [] };
            ['breakfast', 'lunch', 'snacks', 'dinner'].forEach(slot => {
                // Calculate Beverage Calories for this slot
                const bevCalories = bevSchedule.reduce((sum, bev) => {
                    const s = bev.slots[slot];
                    if (s?.active) {
                        const sizeMult = s.cupSize === 'Small' ? 0.7 : s.cupSize === 'Large' ? 1.5 : 1;
                        const sugarCals = bev.withSugar ? (s.sugarTabs || 1) * 40 : 0;
                        return sum + (Math.round(bev.calories * sizeMult + sugarCals) * s.quantity);
                    }
                    return sum;
                }, 0);

                // Adjust Target Calories for the slot
                const adjustedTarget = Math.max(50, targets[slot] - bevCalories);

                let pool = foodDatabase.filter(f => {
                    // 0. Allergy Exclusion
                    if (isAllergic(f)) return false;

                    // 1. Cooked & Slot Match
                    const isCookedAndSlot = f.isCooked && (slot === 'snacks' ? f.category === 'Snacks' : f.category.toLowerCase().includes(slot));
                    if (!isCookedAndSlot) return false;

                    // 2. Strict Diet Match
                    if (diet === 'Vegetarian') return f.type === 'veg';
                    if (diet === 'Eggetarian' || diet === 'Eggetarian' || diet === 'Eggitarian') return (f.type === 'veg' || f.type === 'egg');
                    return true; // Non-Veg sees all
                });

                if (cuisine !== 'Mixed' && cuisine !== 'All') pool = pool.filter(f => f.region === cuisine || f.region === 'All' || f.region === 'International');

                if (pool.length > 0) {
                    const item = pool[Math.floor(Math.random() * pool.length)];
                    const instance = createItemInstance(item, adjustedTarget);
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

    // --- SMART MACRO BOOSTER LOGIC ---
    const handleBoostAdd = (slot, mealUuid, boosterItem) => {
        const currentItems = [...plan[currentDay][slot]];
        const mealIdx = currentItems.findIndex(i => i.uuid === mealUuid);
        if (mealIdx === -1) return;

        const meal = { ...currentItems[mealIdx] };

        // 1. Calculate Standard Amount for Booster (e.g. 50g or 1 serving)
        const boosterWeight = parseServingWeight(boosterItem) || 50;
        const boosterCals = (boosterItem.calories / (boosterItem.ediblePortion || 100)) * boosterWeight;

        // 2. Current Meal Totals
        const currentTotalCals = meal.calculatedCalories;

        // 3. New Unscaled Total if simply added
        const unscaledTotal = currentTotalCals + boosterCals;

        // 4. Scaling Factor to MAINTAIN Energy (Neutral Addition)
        const scaleFactor = currentTotalCals / unscaledTotal;

        // 5. Create New Ingredient Object
        const newIng = {
            name: boosterItem.name,
            weight: boosterWeight,
            calories: boosterCals,
            protein: (boosterItem.protein / 100) * boosterWeight,
            carbs: (boosterItem.carbs / 100) * boosterWeight,
            fats: (boosterItem.fats / 100) * boosterWeight,
            category: boosterItem.category,
            type: boosterItem.type
        };

        // 6. Apply Scaling to ALL Ingredients (Existing + New)
        const newComposition = [...(meal.composition || []), newIng].map(c => {
            const ratio = scaleFactor; // Decrease existing, scale down new
            // FIX: Prioritize current scaledWeight to chain reductions correctly
            const currentWeight = c.scaledWeight !== undefined ? c.scaledWeight : c.weight;
            const currentCals = c.scaledCalories !== undefined ? c.scaledCalories : c.calories;
            const currentP = c.scaledProtein !== undefined ? c.scaledProtein : c.protein;
            const currentC = c.scaledCarbs !== undefined ? c.scaledCarbs : c.carbs;
            const currentF = c.scaledFats !== undefined ? c.scaledFats : c.fats;

            return {
                ...c,
                scaledWeight: Math.round((currentWeight || 0) * ratio),
                scaledCalories: Math.round((currentCals || 0) * ratio),
                scaledProtein: Math.round((currentP || 0) * ratio),
                scaledCarbs: Math.round((currentC || 0) * ratio),
                scaledFats: Math.round((currentF || 0) * ratio)
            };
        });

        // 7. Update Meal Totals
        meal.composition = newComposition;
        // Total Cals stays roughly same (due to rounding)
        meal.calculatedCalories = newComposition.reduce((a, b) => a + b.scaledCalories, 0);
        meal.calculatedWeight = newComposition.reduce((a, b) => a + b.scaledWeight, 0); // FIXED: Update Total Weight
        meal.macros.protein = newComposition.reduce((a, b) => a + b.scaledProtein, 0);
        meal.macros.carbs = newComposition.reduce((a, b) => a + b.scaledCarbs, 0);
        meal.macros.fats = newComposition.reduce((a, b) => a + b.scaledFats, 0);

        currentItems[mealIdx] = meal;
        setPlan(prev => ({ ...prev, [currentDay]: { ...prev[currentDay], [slot]: currentItems } }));
    };

    // --- SEARCH / SWAP LOGIC ---

    const handleSearchSelect = (selectedItem) => {
        const { slot, itemUuid, ingIdx, type } = inlineSearch;
        const currentItems = plan[currentDay][slot];

        if (type === 'MEAL') {
            const originalItem = currentItems.find(i => i.uuid === itemUuid);
            // Meal Swap Logic - Maintain Calorie Target (Smart Swap)
            const targetCals = originalItem.calculatedCalories;
            const newItem = createItemInstance(selectedItem, targetCals);

            setPlan(prev => ({
                ...prev,
                [currentDay]: {
                    ...prev[currentDay],
                    [slot]: prev[currentDay][slot].map(i => i.uuid === itemUuid ? newItem : i)
                }
            }));
        } else if (type === 'ING') {
            const originalItem = currentItems.find(i => i.uuid === itemUuid);
            // Ingredient Swap Logic
            const originalIng = originalItem.composition[ingIdx];
            const targetCals = originalIng.scaledCalories || 50;
            const baseCals = selectedItem.calories;
            const ratio = targetCals / (baseCals || 1);

            const newIng = {
                ...selectedItem,
                scaledWeight: Math.round((parseServingWeight(selectedItem) || 100) * ratio),
                scaledCalories: Math.round(targetCals),
                scaledProtein: Math.round((selectedItem.protein || 0) * ratio),
                scaledCarbs: Math.round((selectedItem.carbs || 0) * ratio),
                scaledFats: Math.round((selectedItem.fats || 0) * ratio)
            };

            // Recalculate Parent Meal
            const newComp = [...originalItem.composition];
            newComp[ingIdx] = newIng;

            const totalCals = newComp.reduce((a, b) => a + (b.scaledCalories || 0), 0);
            const totalP = newComp.reduce((a, b) => a + (b.scaledProtein || 0), 0);
            const totalC = newComp.reduce((a, b) => a + (b.scaledCarbs || 0), 0);
            const totalF = newComp.reduce((a, b) => a + (b.scaledFats || 0), 0);
            const totalW = newComp.reduce((a, b) => a + (b.scaledWeight || 0), 0);

            const updatedMeal = {
                ...originalItem,
                composition: newComp,
                calculatedCalories: totalCals,
                calculatedWeight: totalW,
                macros: { protein: totalP, carbs: totalC, fats: totalF }
            };

            setPlan(prev => ({
                ...prev,
                [currentDay]: {
                    ...prev[currentDay],
                    [slot]: prev[currentDay][slot].map(i => i.uuid === itemUuid ? updatedMeal : i)
                }
            }));
        } else if (type === 'ADD') {
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
            const newItem = createItemInstance(selectedItem, calsPerItem);

            const newSlotList = [...updatedExistingItems, newItem];

            setPlan(p => ({
                ...p,
                [currentDay]: {
                    ...p[currentDay],
                    [slot]: newSlotList
                }
            }));
        }

        setInlineSearch({ active: false, slot: null, itemUuid: null, ingIdx: null, type: null, query: '' });
    };

    const handleIngredientWeightChange = (slot, itemUuid, ingIdx, newVal) => {
        let weight = parseInt(newVal);
        if (isNaN(weight) || weight < 0) weight = 0;
        if (weight > 2000) return;

        setPlan(prev => ({
            ...prev,
            [currentDay]: {
                ...prev[currentDay],
                [slot]: prev[currentDay][slot].map(item => {
                    if (item.uuid !== itemUuid) return item;

                    // 1. Calculate new values for the edited ingredient
                    const targetTotalCals = item.calculatedCalories; // Keep Meal Total constant
                    const comp = [...item.composition];
                    const editedIng = comp[ingIdx];
                    const oldWeight = editedIng.scaledWeight || 0; // Use 0 if undefined
                    const oldCals = editedIng.scaledCalories || 0;

                    // Calculate Caloric Density (safe)
                    const calPerGram = oldWeight > 0 ? oldCals / oldWeight : 0;

                    // --- LIMIT CALCULATION START ---
                    // Calculate constraints to prevent starving other seeds to strict 0 if possible
                    const otherIndices = comp.map((_, i) => i).filter(i => i !== ingIdx);
                    let minBudgetForOthers = 0;
                    if (otherIndices.length > 0) {
                        // Reserve at least 2 calories for each other ingredient to keep them "alive" if possible
                        minBudgetForOthers = otherIndices.length * 2;
                    }

                    const maxAllocatableCals = Math.max(0, targetTotalCals - minBudgetForOthers);

                    // Determine Max Weight allowed for this item
                    let maxWeight = 5000; // Hard max constraint
                    if (calPerGram > 0) {
                        const calculatedMax = Math.floor(maxAllocatableCals / calPerGram);
                        maxWeight = Math.min(maxWeight, calculatedMax);
                    }

                    // Clamp the user input weight
                    if (weight > maxWeight) weight = maxWeight;
                    // --- LIMIT CALCULATION END ---

                    const newCals_edited = Math.round(weight * calPerGram);

                    // 2. Determine Remaining Budget for other ingredients
                    let remainingBudget = targetTotalCals - newCals_edited;
                    if (remainingBudget < 0) remainingBudget = 0;

                    const baseWeight_edited = editedIng.weight || 1;
                    const macroRatio_edited = weight / baseWeight_edited;

                    // Update the edited ingredient
                    comp[ingIdx] = {
                        ...editedIng,
                        scaledWeight: weight,
                        scaledCalories: newCals_edited,
                        scaledProtein: Math.round((editedIng.protein || 0) * macroRatio_edited),
                        scaledCarbs: Math.round((editedIng.carbs || 0) * macroRatio_edited),
                        scaledFats: Math.round((editedIng.fats || 0) * macroRatio_edited)
                    };

                    // 3. Smart Redistribute remaining budget among OTHER ingredients
                    // Use base caloric ratios to ensure items can "recover" from 0
                    const totalBaseCalsOfOthers = otherIndices.reduce((sum, i) => sum + (comp[i].calories || 0), 1);

                    if (otherIndices.length > 0) {
                        otherIndices.forEach(i => {
                            const ing = comp[i];

                            // Calculate Base Density from original/base values (preserved in object)
                            const baseCals = ing.calories || 0;
                            const baseWeight = ing.weight || 0;
                            const calPerGram = baseWeight > 0 ? baseCals / baseWeight : 0;

                            // Use original ratios for distribution
                            const prop = baseCals / totalBaseCalsOfOthers;
                            const newAllocatedCals = remainingBudget * prop;

                            // Calculate new weight using Base Density
                            let newWt = 0;
                            if (calPerGram > 0) {
                                newWt = Math.round(newAllocatedCals / calPerGram);
                            }

                            // Update Ingredient
                            const ratio = baseWeight > 0 ? newWt / baseWeight : 0;

                            comp[i] = {
                                ...ing,
                                scaledWeight: newWt,
                                scaledCalories: Math.round(newAllocatedCals),
                                scaledProtein: Math.round((ing.protein || 0) * ratio),
                                scaledCarbs: Math.round((ing.carbs || 0) * ratio),
                                scaledFats: Math.round((ing.fats || 0) * ratio)
                            };
                        });
                    }

                    // 4. Final Recalculation to ensure sums match exactly (handle rounding errors)
                    const finalTotalCals = comp.reduce((a, b) => a + (b.scaledCalories || 0), 0);
                    const finalTotalW = comp.reduce((a, b) => a + (b.scaledWeight || 0), 0);
                    const finalP = comp.reduce((a, b) => a + (b.scaledProtein || 0), 0);
                    const finalC = comp.reduce((a, b) => a + (b.scaledCarbs || 0), 0);
                    const finalF = comp.reduce((a, b) => a + (b.scaledFats || 0), 0);

                    return {
                        ...item,
                        calculatedCalories: finalTotalCals, // Should be close to targetTotalCals
                        calculatedWeight: finalTotalW,
                        macros: { protein: finalP, carbs: finalC, fats: finalF },
                        composition: comp
                    };
                })
            }
        }));
    };
    const handleDeleteIngredient = (slot, itemUuid, ingIdx) => {
        setPlan(prev => ({
            ...prev,
            [currentDay]: {
                ...prev[currentDay],
                [slot]: prev[currentDay][slot].map((item) => {
                    if (item.uuid !== itemUuid) return item;

                    // 1. Remove the ingredient
                    const newComposition = item.composition.filter((_, idx) => idx !== ingIdx);

                    // If no ingredients left, return null (will be filtered out by parent logic if desired, or handled here)
                    // Better approach: If empty, we should arguably delete the meal? 
                    // But here we are mapping. Let's just return empty composition for now, and let the user delete the meal if they want, 
                    // OR trigger a deleteMeal if empty.
                    if (newComposition.length === 0) {
                        // We can't delete the meal from inside the map nicely. 
                        // We'll return a marked item or just empty composition.
                        // Let's call handleDeleteMeal separately if we want to remove it entirely, 
                        // but since we are inside a setState callback, we can't easily call another handler that sets state.
                        // For now, let's allow empty meals (shells) or just handle it below.
                        return { ...item, composition: [], calculatedCalories: 0, macros: { protein: 0, carbs: 0, fats: 0 } };
                    }

                    // 2. Redistribute Calories
                    // We want to maintain `item.calculatedCalories` (Total Target).
                    const targetTotalCals = item.calculatedCalories;

                    // Logic: Get current total of remaining items
                    const currentRemainingTotal = newComposition.reduce((sum, ing) => sum + (ing.scaledCalories || 0), 0) || 1;

                    // Calculate scaling factor to bring remaining total back up to target
                    const ratio = targetTotalCals / currentRemainingTotal;

                    // 3. Scale remaining ingredients
                    const scaledComposition = newComposition.map(ing => {
                        const newCals = Math.round((ing.scaledCalories || 0) * ratio);
                        const newWeight = Math.round((ing.scaledWeight || 0) * ratio);

                        return {
                            ...ing,
                            scaledWeight: newWeight,
                            scaledCalories: newCals,
                            scaledProtein: Math.round((ing.scaledProtein || 0) * ratio),
                            scaledCarbs: Math.round((ing.scaledCarbs || 0) * ratio),
                            scaledFats: Math.round((ing.scaledFats || 0) * ratio)
                        };
                    });

                    // 4. Re-calculate actual totals from scaled ingredients (to fix rounding errors)
                    const finalTotalCals = scaledComposition.reduce((a, b) => a + b.scaledCalories, 0);
                    const finalTotalW = scaledComposition.reduce((a, b) => a + b.scaledWeight, 0);
                    const finalP = scaledComposition.reduce((a, b) => a + b.scaledProtein, 0);
                    const finalC = scaledComposition.reduce((a, b) => a + b.scaledCarbs, 0);
                    const finalF = scaledComposition.reduce((a, b) => a + b.scaledFats, 0);

                    return {
                        ...item,
                        composition: scaledComposition,
                        calculatedCalories: finalTotalCals,
                        calculatedWeight: finalTotalW,
                        macros: { protein: finalP, carbs: finalC, fats: finalF }
                    };
                }).filter(item => item.composition.length > 0) // Remove meal if it became empty
            }
        }));
    };

    const handleDeleteMeal = (slot, itemUuid) => {
        // 1. Get current list and target
        const currentList = plan[currentDay]?.[slot] || [];
        const slotTarget = stats.mealSplit[slot] || 0;

        // 2. Remove target item
        const remainingList = currentList.filter(item => item.uuid !== itemUuid);

        // 3. If empty, just set empty (0)
        if (remainingList.length === 0) {
            setPlan(prev => ({
                ...prev,
                [currentDay]: {
                    ...prev[currentDay],
                    [slot]: []
                }
            }));
            return;
        }

        // 4. Calculate total calories of remaining items
        const currentRemainingTotal = remainingList.reduce((a, b) => a + (b.calculatedCalories || 0), 0) || 1;

        // 5. Calculate scaling ratio
        const ratio = slotTarget / currentRemainingTotal;

        // 6. Scale remaining items
        const scaledList = remainingList.map(item => {
            // Deep clone composition and scale
            const newComposition = (item.composition || []).map(comp => {
                return {
                    ...comp,
                    scaledWeight: Math.round((comp.scaledWeight || 0) * ratio),
                    scaledCalories: Math.round((comp.scaledCalories || 0) * ratio),
                    scaledProtein: Math.round((comp.scaledProtein || 0) * ratio),
                    scaledCarbs: Math.round((comp.scaledCarbs || 0) * ratio),
                    scaledFats: Math.round((comp.scaledFats || 0) * ratio)
                };
            });

            // Re-sum item totals
            const newTotalCals = newComposition.reduce((a, b) => a + b.scaledCalories, 0);
            const newTotalW = newComposition.reduce((a, b) => a + b.scaledWeight, 0);
            const newP = newComposition.reduce((a, b) => a + b.scaledProtein, 0);
            const newC = newComposition.reduce((a, b) => a + b.scaledCarbs, 0);
            const newF = newComposition.reduce((a, b) => a + b.scaledFats, 0);

            return {
                ...item,
                calculatedCalories: newTotalCals,
                calculatedWeight: newTotalW,
                macros: { protein: newP, carbs: newC, fats: newF },
                composition: newComposition
            };
        });

        // 7. Update State
        setPlan(prev => ({
            ...prev,
            [currentDay]: {
                ...prev[currentDay],
                [slot]: scaledList
            }
        }));
    };

    const handleSavePlan = () => {
        if (!planName.trim()) {
            setToast({ message: "Please enter a plan name.", type: "error" });
            return;
        }

        const newPlan = {
            id: Date.now(),
            name: planName.trim(),
            createdAt: new Date().toISOString(),
            duration: planDuration,
            stats,
            preferences,
            plan
        };

        const existingPlans = JSON.parse(localStorage.getItem('cyom_saved_plans') || '[]');
        localStorage.setItem('cyom_saved_plans', JSON.stringify([newPlan, ...existingPlans]));

        setSaveModalOpen(false);
        setToast({ message: "Plan saved successfully!", type: "success" });
    };

    const handleDownloadExcel = () => {
        const wb = XLSX.utils.book_new();
        const data = [];
        data.push(["Day", "Slot", "Item Name", "Weight (g)", "Calories (kcal)", "Protein (g)", "Carbs (g)", "Fats (g)"]);

        for (let d = 1; d <= (planDuration || 1); d++) {
            ['breakfast', 'lunch', 'snacks', 'dinner'].forEach(slot => {
                const items = plan[d]?.[slot] || [];
                items.forEach(item => {
                    data.push([
                        d, slot.toUpperCase(), item.name, item.calculatedWeight, item.calculatedCalories,
                        item.macros.protein, item.macros.carbs, item.macros.fats
                    ]);
                });

                // Add Beverages for this slot
                const slotBeverages = (preferences.beverageSchedule || []).filter(bev => bev.slots[slot]?.active);
                slotBeverages.forEach(bev => {
                    const s = bev.slots[slot];
                    const sizeMult = s.cupSize === 'Small' ? 0.7 : s.cupSize === 'Large' ? 1.5 : 1;
                    const sugarCals = bev.withSugar ? (s.sugarTabs || 1) * 40 : 0;
                    const cals = Math.round(bev.calories * sizeMult + sugarCals) * s.quantity;
                    const sugarText = bev.withSugar ? ` w/ ${s.sugarTabs} tbsp sugar` : '';
                    data.push([
                        d, slot.toUpperCase(), `${bev.name}${sugarText} (${s.quantity}x ${s.cupSize})`, "1 Serving",
                        cals, Math.round((bev.protein || 0) * sizeMult * s.quantity), Math.round((bev.carbs || 0) * sizeMult * s.quantity), Math.round((bev.fats || 0) * sizeMult * s.quantity)
                    ]);
                });
            });
        }

        const ws = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Meal Plan");
        XLSX.writeFile(wb, `meal_plan_${userData.name || 'user'}_${new Date().toISOString().split('T')[0]}.xlsx`);
        setDownloadMenuOpen(false);
    };

    const handleDownloadPDF = () => {
        try {
            const doc = new jsPDF();
            const title = `Meal Plan for ${userData.name || 'User'}`;
            const date = new Date().toLocaleDateString();

            doc.setFontSize(22);
            doc.setTextColor(46, 125, 107);
            doc.text(title, 14, 22);

            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Generated on: ${date}`, 14, 30);

            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text("Plan Preferences", 14, 45);
            doc.setDrawColor(46, 125, 107);
            doc.line(14, 47, 60, 47);

            doc.setFontSize(10);
            doc.text(`Diet Preference: ${preferences.dietPreference}`, 14, 55);
            doc.text(`Cuisine Style: ${preferences.cuisineStyle}`, 14, 62);
            doc.text(`Target Calories: ${stats.targetCalories} kcal`, 14, 69);
            doc.text(`Plan Duration: ${planDuration} Day(s)`, 14, 76);

            const tableColumn = ["Day", "Slot", "Item", "Weight", "Kcal", "P", "C", "F"];
            const tableRows = [];

            for (let d = 1; d <= (planDuration || 1); d++) {
                ['breakfast', 'lunch', 'snacks', 'dinner'].forEach(slot => {
                    const items = plan[d]?.[slot] || [];
                    items.forEach(item => {
                        tableRows.push([
                            d, slot.charAt(0).toUpperCase() + slot.slice(1), item.name, `${item.calculatedWeight}g`,
                            item.calculatedCalories, item.macros.protein, item.macros.carbs, item.macros.fats
                        ]);
                    });

                    // Add Beverages
                    const slotBeverages = (preferences.beverageSchedule || []).filter(bev => bev.slots[slot]?.active);
                    slotBeverages.forEach(bev => {
                        const s = bev.slots[slot];
                        const sizeMult = s.cupSize === 'Small' ? 0.7 : s.cupSize === 'Large' ? 1.5 : 1;
                        const sugarCals = bev.withSugar ? (s.sugarTabs || 1) * 40 : 0;
                        const cals = Math.round(bev.calories * sizeMult + sugarCals) * s.quantity;
                        const sugarText = bev.withSugar ? ` w/ ${s.sugarTabs} tbsp` : '';
                        tableRows.push([
                            d, slot.charAt(0).toUpperCase() + slot.slice(1), `${bev.name}${sugarText} (${s.quantity}x ${s.cupSize})`, "1 Serv",
                            cals, Math.round((bev.protein || 0) * sizeMult * s.quantity), Math.round((bev.carbs || 0) * sizeMult * s.quantity), Math.round((bev.fats || 0) * sizeMult * s.quantity)
                        ]);
                    });
                });
            }

            autoTable(doc, {
                startY: 85,
                head: [tableColumn],
                body: tableRows,
                theme: 'grid',
                headStyles: { fillColor: [46, 125, 107], textColor: [255, 255, 255], fontStyle: 'bold' },
                styles: { fontSize: 8, cellPadding: 2 },
                columnStyles: {
                    0: { cellWidth: 10 }, 1: { cellWidth: 20 }, 2: { cellWidth: 'auto' },
                    3: { cellWidth: 15, halign: 'center' }, 4: { cellWidth: 15, halign: 'center' },
                    5: { cellWidth: 10, halign: 'center' }, 6: { cellWidth: 10, halign: 'center' }, 7: { cellWidth: 10, halign: 'center' },
                }
            });

            doc.save(`meal_plan_${userData.name || 'user'}_${new Date().toISOString().split('T')[0]}.pdf`);
            setDownloadMenuOpen(false);
            setToast({ message: "PDF Downloaded Successfully!", type: "success" });
        } catch (error) {
            console.error("PDF Generation Error:", error);
            setToast({ message: "Failed to generate PDF.", type: "error" });
            setDownloadMenuOpen(false);
        }
    };



    const slots = ['breakfast', 'lunch', 'snacks', 'dinner'];
    const bevDailyTotals = (preferences.beverageSchedule || []).reduce((acc, bev) => {
        let bevCals = 0, bevP = 0, bevC = 0, bevF = 0;
        Object.values(bev.slots).forEach(s => {
            if (s.active) {
                const sizeMult = s.cupSize === 'Small' ? 0.7 : s.cupSize === 'Large' ? 1.5 : 1;
                const sugarCals = bev.withSugar ? (s.sugarTabs || 1) * 40 : 0;
                bevCals += Math.round(bev.calories * sizeMult + sugarCals) * s.quantity;
                bevP += (bev.protein || 0) * sizeMult * s.quantity;
                bevC += (bev.carbs || 0) * sizeMult * s.quantity;
                bevF += (bev.fats || 0) * sizeMult * s.quantity;
            }
        });
        return {
            calories: acc.calories + bevCals,
            protein: acc.protein + Math.round(bevP),
            carbs: acc.carbs + Math.round(bevC),
            fats: acc.fats + Math.round(bevF)
        };
    }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

    const dailyTotal = slots.reduce((total, slot) => total + (plan[currentDay]?.[slot]?.reduce((a, b) => a + b.calculatedCalories, 0) || 0), 0) + bevDailyTotals.calories;
    const dailyProtein = slots.reduce((total, slot) => total + (plan[currentDay]?.[slot]?.reduce((a, b) => a + b.macros.protein, 0) || 0), 0) + bevDailyTotals.protein;
    const dailyCarbs = slots.reduce((total, slot) => total + (plan[currentDay]?.[slot]?.reduce((a, b) => a + b.macros.carbs, 0) || 0), 0) + bevDailyTotals.carbs;
    const dailyFats = slots.reduce((total, slot) => total + (plan[currentDay]?.[slot]?.reduce((a, b) => a + b.macros.fats, 0) || 0), 0) + bevDailyTotals.fats;

    const targetP = Math.round(stats.targetCalories * 0.25 / 4);
    const targetC = Math.round(stats.targetCalories * 0.50 / 4);
    const targetF = Math.round(stats.targetCalories * 0.25 / 9);

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 font-sans text-[#1F2933]">
            {/* --- HEADER --- */}
            <div className="bg-white shadow-sm border-b border-gray-100 z-20 sticky top-0">
                <div className="p-3 sm:p-4 flex justify-between items-center max-w-7xl mx-auto w-full">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <button onClick={() => navigate('/meal-creation')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <div>
                            <div className="font-black text-lg sm:text-xl text-[#2E7D6B] tracking-tight">MEAL PLANNER</div>
                            <div className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-widest">{userData.name} • Day {currentDay}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">

                        <div className="flex items-center gap-2 sm:gap-3">
                            <select
                                value={currentDay}
                                onChange={(e) => setCurrentDay(Number(e.target.value))}
                                className="bg-gray-50 border border-gray-200 text-gray-700 text-xs sm:text-sm font-bold py-1.5 px-3 rounded-xl outline-none focus:border-[#2E7D6B] transition-colors"
                            >
                                {Array.from({ length: planDuration || 1 }, (_, i) => i + 1).map(d => (
                                    <option key={d} value={d}>Day {d}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>



            {/* --- DAILY SUMMARY TAB (COMPACT) --- */}
            <div className="max-w-7xl mx-auto mt-2 px-2 sm:px-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 sm:p-3">
                    <div className="flex flex-row gap-2 sm:gap-4 justify-between items-center">
                        {/* Calories */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 sm:border-4 border-[#2E7D6B] flex items-center justify-center shrink-0">
                                <span className="text-xs sm:text-sm font-black text-[#2E7D6B]">{Math.round((dailyTotal / (stats.targetCalories || 1)) * 100)}%</span>
                            </div>
                            <div>
                                <div className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider">Target</div>
                                <div className="text-sm sm:text-base font-black text-gray-900 leading-tight">
                                    {dailyTotal} <span className="text-gray-400 text-xs font-medium">/ {stats.targetCalories}</span>
                                </div>
                                {bevDailyTotals.calories > 0 && (
                                    <div className="text-[9px] font-bold text-orange-500 bg-orange-50 px-1.5 rounded mt-0.5 inline-block">
                                        🥤 Includes {bevDailyTotals.calories} kcal from drinks
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Macros PCF */}
                        <div className="flex items-center gap-2 sm:gap-6">
                            {/* Protein */}
                            <div className="text-center min-w-[50px] sm:min-w-[60px]">
                                <div className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase mb-0.5">Prot</div>
                                <div className="text-sm sm:text-base font-bold text-gray-700 leading-none">{dailyProtein} <span className="text-gray-300">/ {targetP}</span></div>
                                <div className="h-0.5 sm:h-1 w-full bg-gray-100 rounded-full mt-1 overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min((dailyProtein / (targetP || 1)) * 100, 100)}%` }}></div>
                                </div>
                            </div>
                            {/* Carbs */}
                            <div className="text-center min-w-[50px] sm:min-w-[60px]">
                                <div className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase mb-0.5">Carbs</div>
                                <div className="text-sm sm:text-base font-bold text-gray-700 leading-none">{dailyCarbs} <span className="text-gray-300">/ {targetC}</span></div>
                                <div className="h-0.5 sm:h-1 w-full bg-gray-100 rounded-full mt-1 overflow-hidden">
                                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${Math.min((dailyCarbs / (targetC || 1)) * 100, 100)}%` }}></div>
                                </div>
                            </div>
                            {/* Fats */}
                            <div className="text-center min-w-[50px] sm:min-w-[60px]">
                                <div className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase mb-0.5">Fats</div>
                                <div className="text-sm sm:text-base font-bold text-gray-700 leading-none">{dailyFats} <span className="text-gray-300">/ {targetF}</span></div>
                                <div className="h-0.5 sm:h-1 w-full bg-gray-100 rounded-full mt-1 overflow-hidden">
                                    <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${Math.min((dailyFats / (targetF || 1)) * 100, 100)}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- TABLE CONTENT --- */}
            <div className="flex-1 overflow-x-auto overflow-y-auto px-0 sm:px-6 py-0 sm:py-4 custom-scrollbar pb-24 mt-4">
                <div className="max-w-7xl mx-auto bg-white sm:rounded-2xl shadow-sm border-0 sm:border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-full table-fixed">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500">
                                    <th className="p-1 sm:p-4 w-[52%] text-[10px] sm:text-xs font-bold uppercase tracking-wider sticky left-0 bg-gray-50 z-10 border-r border-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">Meal / Ingredient</th>
                                    <th className="p-0.5 sm:p-4 w-[12%] text-[9px] sm:text-xs font-bold uppercase tracking-wider text-center">Energy <span className="text-[8px] sm:text-[9px] lowercase opacity-70 block sm:inline">(kcal)</span></th>
                                    <th className="p-0.5 sm:p-4 w-[12%] text-[9px] sm:text-xs font-bold uppercase tracking-wider text-center">P <span className="text-[8px] sm:text-[9px] lowercase opacity-70 block sm:inline">(g)</span></th>
                                    <th className="p-0.5 sm:p-4 w-[12%] text-[9px] sm:text-xs font-bold uppercase tracking-wider text-center">C <span className="text-[8px] sm:text-[9px] lowercase opacity-70 block sm:inline">(g)</span></th>
                                    <th className="p-0.5 sm:p-4 w-[12%] text-[9px] sm:text-xs font-bold uppercase tracking-wider text-center">F <span className="text-[8px] sm:text-[9px] lowercase opacity-70 block sm:inline">(g)</span></th>
                                </tr>
                            </thead>

                            {slots.map(slot => {
                                const items = plan[currentDay]?.[slot] || [];
                                const target = stats.mealSplit[slot] || 0;
                                const reqP = Math.round(target * 0.25 / 4);
                                const reqC = Math.round(target * 0.50 / 4);
                                const reqF = Math.round(target * 0.25 / 9);

                                const slotBeverages = (preferences.beverageSchedule || []).filter(bev => bev.slots[slot]?.active);
                                const bevSlotCals = slotBeverages.reduce((sum, bev) => {
                                    const s = bev.slots[slot];
                                    const sizeMult = s.cupSize === 'Small' ? 0.7 : s.cupSize === 'Large' ? 1.5 : 1;
                                    const sugarCals = bev.withSugar ? (s.sugarTabs || 1) * 40 : 0;
                                    return sum + (Math.round(bev.calories * sizeMult + sugarCals) * s.quantity);
                                }, 0);

                                const totalCals = items.reduce((a, b) => a + b.calculatedCalories, 0) + bevSlotCals;
                                const totalP = items.reduce((a, b) => a + b.macros.protein, 0);
                                const totalC = items.reduce((a, b) => a + b.macros.carbs, 0);
                                const totalF = items.reduce((a, b) => a + b.macros.fats, 0);

                                return (
                                    <tbody key={slot} className="border-b border-gray-100 last:border-0 text-sm sm:text-base">
                                        {/* SECTION HEADER / TARGETS */}
                                        <tr className="bg-[#2E7D6B]/5">
                                            <td className="p-2 sm:p-3 pl-3 sm:pl-4 sticky left-0 bg-[#f0fdf9] z-10 border-r border-[#2E7D6B]/10 shadow-[2px_0_5px_-2px_rgba(46,125,107,0.1)]">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-base sm:text-lg">{slot === 'breakfast' ? '🌅' : slot === 'lunch' ? '☀️' : slot === 'snacks' ? '🍎' : '🌙'}</span>
                                                    <div>
                                                        <div className="font-black text-sm sm:text-base uppercase text-[#2E7D6B] tracking-wide">{slot}</div>
                                                        <div className="text-[10px] sm:text-xs text-gray-400 font-medium">Requirements</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-2 sm:p-3 text-center text-base sm:text-lg text-[#2E7D6B] font-black border-l border-white bg-[#2E7D6B]/10">{target}</td>
                                            <td className="p-2 sm:p-3 text-center text-[#2E7D6B] font-bold text-base sm:text-lg border-l border-white">{reqP}</td>
                                            <td className="p-2 sm:p-3 text-center text-[#2E7D6B] font-bold text-base sm:text-lg border-l border-white">{reqC}</td>
                                            <td className="p-2 sm:p-3 text-center text-[#2E7D6B] font-bold text-base sm:text-lg border-l border-white">{reqF}</td>
                                        </tr>

                                        {/* MEAL ITEMS */}
                                        {items.map((item) => {
                                            const isExpanded = expandedMeals[item.uuid];
                                            return (
                                                <React.Fragment key={item.uuid}>
                                                    {/* PARENT ROW */}
                                                    <tr className="hover:bg-gray-50 transition-colors group">
                                                        <td className="p-2 sm:p-3 pl-3 sm:pl-4 border-r border-gray-100 border-dashed relative sticky left-0 bg-white group-hover:bg-gray-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] cursor-pointer" onClick={() => toggleMeal(item.uuid)}>
                                                            <div className="flex items-center justify-between gap-2">
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    {/* Chevron */}
                                                                    <div className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-90 text-[#2E7D6B]' : ''}`}>
                                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 min-w-0">
                                                                        <span className="font-bold text-gray-800 text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">{item.name}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-1 sm:gap-2">
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); setInlineSearch({ active: true, slot, itemUuid: item.uuid, ingIdx: null, type: 'MEAL', query: '' }); }}
                                                                        className="text-[#2E7D6B] hover:text-[#256a5b] bg-[#2E7D6B]/10 hover:bg-[#2E7D6B]/20 p-1 rounded opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all font-bold"
                                                                        title="Swap Meal"
                                                                    >
                                                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                                                                            <path d="M20 7H4M4 7l4-4M4 7l4 4M4 17h16m0 0l-4-4m4 4l-4 4" />
                                                                        </svg>
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handleDeleteMeal(slot, item.uuid); }}
                                                                        className="text-gray-300 hover:text-red-500 p-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                                                    >
                                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-2 sm:p-3 text-center font-black text-gray-900 text-base sm:text-lg">{item.calculatedCalories}</td>
                                                        <td className="p-2 sm:p-3 text-center text-base sm:text-lg font-bold text-gray-700">{item.macros.protein}</td>
                                                        <td className="p-2 sm:p-3 text-center text-base sm:text-lg font-bold text-gray-700">{item.macros.carbs}</td>
                                                        <td className="p-2 sm:p-3 text-center text-base sm:text-lg font-bold text-gray-700">{item.macros.fats}</td>
                                                    </tr>

                                                    {/* INGREDIENT ROWS (EXPANDABLE) */}
                                                    {isExpanded && item.composition?.map((comp, idx) => (
                                                        <tr key={`${item.uuid}_${idx}`} className="bg-gray-50/50 hover:bg-gray-50 transition-colors group/ing animate-fade-in">
                                                            <td className="p-1 sm:p-2 pl-4 sm:pl-12 border-r border-gray-100 border-dashed relative sticky left-0 bg-gray-50/50 group-hover:bg-gray-50 z-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.02)]">
                                                                <div className="flex items-center justify-between gap-1 sm:gap-4">
                                                                    <div className="flex items-center gap-1 sm:gap-2 flex-1 relative min-w-0">
                                                                        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-gray-300 absolute -left-2 sm:-left-4"></div>
                                                                        <button
                                                                            onClick={() => setInlineSearch({ active: true, slot, itemUuid: item.uuid, ingIdx: idx, type: 'ING', query: '' })}
                                                                            className="text-xs sm:text-sm text-gray-600 truncate hover:text-[#2E7D6B] hover:underline transition-all text-left"
                                                                            title="Click to Swap"
                                                                        >
                                                                            {comp.name}
                                                                        </button>
                                                                        <button
                                                                            onClick={(e) => handleShowInfo(e, comp)}
                                                                            className="w-3.5 h-3.5 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:text-[#2E7D6B] transition-colors"
                                                                        >
                                                                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                            </svg>
                                                                        </button>
                                                                        {/* Inline Weight Input */}
                                                                        <div className="flex items-center bg-white border border-gray-200 rounded px-1 ml-auto shrink-0">
                                                                            <input
                                                                                className="w-10 sm:w-16 text-right text-xs sm:text-sm outline-none font-bold text-gray-700 p-0.5 sm:p-1"
                                                                                value={comp.scaledWeight}
                                                                                onChange={(e) => handleIngredientWeightChange(slot, item.uuid, idx, e.target.value)}
                                                                            />
                                                                            <span className="text-[8px] sm:text-[9px] text-gray-400 ml-0.5">g</span>
                                                                        </div>
                                                                    </div>

                                                                    <button
                                                                        onClick={() => handleDeleteIngredient(slot, item.uuid, idx)}
                                                                        className="text-gray-400 hover:text-red-500 p-1 opacity-100 sm:opacity-0 group-hover/ing:opacity-100 transition-opacity"
                                                                        title="Delete Ingredient"
                                                                    >
                                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                            <td className="p-1 sm:p-2 text-center text-sm sm:text-base text-gray-500">{comp.scaledCalories}</td>
                                                            <td className="p-1 sm:p-2 text-center text-sm sm:text-base text-gray-400">{comp.scaledProtein}</td>
                                                            <td className="p-1 sm:p-2 text-center text-sm sm:text-base text-gray-400">{comp.scaledCarbs}</td>
                                                            <td className="p-1 sm:p-2 text-center text-sm sm:text-base text-gray-400">{comp.scaledFats}</td>
                                                        </tr>
                                                    ))}

                                                    {/* SMART MACRO SUGGESTIONS UI */}
                                                    {isExpanded && (
                                                        <>
                                                            {/* Expanded Meal Totals Summary */}
                                                            <tr className="bg-gray-100/50 sm:bg-gray-50/30 border-b border-gray-100">
                                                                <td className="p-2 pl-4 sm:pl-12 text-xs sm:text-sm font-bold text-gray-500 text-right uppercase tracking-wider">Current Bundle Total</td>
                                                                <td className="p-2 text-center text-base sm:text-lg font-black text-gray-900">{item.calculatedCalories}</td>
                                                                <td className="p-2 text-center text-base sm:text-lg font-bold text-gray-700">{item.macros.protein}</td>
                                                                <td className="p-2 text-center text-base sm:text-lg font-bold text-gray-700">{item.macros.carbs}</td>
                                                                <td className="p-2 text-center text-base sm:text-lg font-bold text-gray-700">{item.macros.fats}</td>
                                                            </tr>

                                                            <tr>
                                                                <td colSpan="5" className="p-0 border-b border-gray-100 bg-[#f9fafb]">
                                                                    <div className="p-2 sm:p-4">
                                                                        <div className="flex gap-2 sm:gap-4 mb-2 sm:mb-3 border-b border-gray-200">
                                                                            {['Protein', 'Carb', 'Fat'].map(macro => (
                                                                                <button
                                                                                    key={macro}
                                                                                    onClick={() => setActiveBoosterTab(prev => ({ ...prev, [item.uuid]: macro }))}
                                                                                    className={`pb-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider relative ${activeBoosterTab[item.uuid] === macro ? 'text-[#2E7D6B]' : 'text-gray-400 hover:text-gray-600'}`}
                                                                                >
                                                                                    {/* Mobile: Short Text, Desktop: Full Text */}
                                                                                    <span className="sm:hidden">{macro}</span>
                                                                                    <span className="hidden sm:inline">{macro === 'Protein' ? '💪 Add Protein' : macro === 'Carb' ? '🌾 Add Carbs' : '🥑 Add Fats'}</span>

                                                                                    {activeBoosterTab[item.uuid] === macro && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2E7D6B]"></div>}
                                                                                </button>
                                                                            ))}
                                                                        </div>

                                                                        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                                                            {foodDatabase.filter(f => {
                                                                                const tab = activeBoosterTab[item.uuid] || 'Protein';
                                                                                const catMatch = tab === 'Protein' ? f.category === 'Protein Source' : tab === 'Carb' ? f.category === 'Carb Source' : f.category === 'Fat Source';

                                                                                // Apply Diet Filters
                                                                                let dietMatch = true;
                                                                                if (preferences.dietPreference === 'Vegetarian') {
                                                                                    dietMatch = f.type === 'veg' && f.type !== 'egg' && f.type !== 'non-veg';
                                                                                } else if (preferences.dietPreference === 'Eggetarian') {
                                                                                    dietMatch = (f.type === 'veg' || f.type === 'egg') && f.type !== 'non-veg';
                                                                                }

                                                                                return catMatch && dietMatch && !f.isCombo; // Don't suggest combos as boosters
                                                                            }).slice(0, 8).map(booster => (
                                                                                <button
                                                                                    key={booster.id}
                                                                                    onClick={() => handleBoostAdd(slot, item.uuid, booster)}
                                                                                    className="flex-shrink-0 w-32 bg-white border border-gray-200 rounded-lg p-2 text-left hover:border-[#2E7D6B] hover:shadow-md transition-all group/boost"
                                                                                >
                                                                                    <div className="font-bold text-[10px] text-gray-700 truncate mb-1 group-hover/boost:text-[#2E7D6B]">{booster.name}</div>
                                                                                    <div className="text-[9px] text-gray-400">
                                                                                        +{Math.round((booster.calories / (booster.ediblePortion || 100)) * 50)} kcal
                                                                                    </div>
                                                                                    <div className="flex gap-1 mt-1">
                                                                                        {booster.protein > 5 && <span className="text-[8px] bg-blue-50 text-blue-600 px-1 rounded">High Pro</span>}
                                                                                        {booster.fats > 10 && <span className="text-[8px] bg-yellow-50 text-yellow-600 px-1 rounded">Good Fast</span>}
                                                                                    </div>
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}

                                        {/* BEVERAGES */}
                                        {slotBeverages.map(bev => {
                                            const s = bev.slots[slot];
                                            const sizeMult = s.cupSize === 'Small' ? 0.7 : s.cupSize === 'Large' ? 1.5 : 1;
                                            const sugarCals = bev.withSugar ? (s.sugarTabs || 1) * 40 : 0;
                                            const cals = Math.round(bev.calories * sizeMult + sugarCals) * s.quantity;
                                            return (
                                                <tr key={`bev-${bev.id}`} className="border-b border-gray-100 bg-orange-50/10 hover:bg-orange-50/20 transition-colors">
                                                    <td className="p-2 sm:p-3 pl-3 sm:pl-4 sticky left-0 bg-white group-hover:bg-gray-50 z-10 border-r border-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-100 rounded-lg flex items-center justify-center text-xs sm:text-sm shrink-0">🥤</div>
                                                            <div>
                                                                <div className="font-bold text-gray-800 text-[10px] sm:text-xs leading-tight">
                                                                    {bev.name} {bev.withSugar && <span className="text-orange-500 font-black ml-1">w/ {s.sugarTabs} tbsp sugar</span>}
                                                                </div>
                                                                <div className="text-[8px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                                                    {s.quantity}x {s.cupSize} cup{s.quantity > 1 ? 's' : ''}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-2 sm:p-3 text-center font-bold text-gray-700 text-xs sm:text-sm">{cals}</td>
                                                    <td className="p-2 sm:p-3 text-center text-gray-400 text-xs sm:text-sm">{Math.round((bev.protein || 0) * sizeMult * s.quantity) || '-'}</td>
                                                    <td className="p-2 sm:p-3 text-center text-gray-400 text-xs sm:text-sm">{Math.round((bev.carbs || 0) * sizeMult * s.quantity) || '-'}</td>
                                                    <td className="p-2 sm:p-3 text-center text-gray-400 text-xs sm:text-sm">{Math.round((bev.fats || 0) * sizeMult * s.quantity) || '-'}</td>
                                                </tr>
                                            );
                                        })}

                                        {/* FOOTER / TOTALS FOR SLOT */}
                                        <tr className="bg-gray-100/50 border-t border-gray-200 font-bold border-b-4 border-white">
                                            <td className="p-2 sm:p-3 pl-3 sm:pl-4 text-xs sm:text-sm uppercase text-gray-500 font-bold tracking-wider flex justify-between items-center sticky left-0 bg-gray-50 border-r border-gray-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                                <span>Totals</span>
                                                <button onClick={() => setInlineSearch({ active: true, slot, type: 'ADD', query: '' })} className="text-[9px] sm:text-[10px] bg-[#2E7D6B] text-white px-2 py-1 rounded hover:bg-[#256a5b] whitespace-nowrap shadow-sm">
                                                    + Add Items
                                                </button>
                                            </td>
                                            <td className={`p-2 sm:p-3 text-center text-base sm:text-lg ${totalCals > target ? 'text-red-500' : 'text-[#2E7D6B]'}`}>{totalCals}</td>
                                            <td className="p-2 sm:p-3 text-center text-base sm:text-lg text-gray-700 font-bold">{totalP}</td>
                                            <td className="p-2 sm:p-3 text-center text-base sm:text-lg text-gray-700 font-bold">{totalC}</td>
                                            <td className="p-2 sm:p-3 text-center text-base sm:text-lg text-gray-700 font-bold">{totalF}</td>
                                        </tr>
                                    </tbody>
                                );
                            })}
                        </table>

                        {
                            !slots.some(s => plan[currentDay]?.[s]?.length > 0) && (
                                <div className="p-12 text-center text-gray-400 text-xs sm:text-sm">
                                    No meals planned yet. Use the headers above to add items.
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>

            {/* FIXED SEARCH OVERLAY MODAL */}
            {inlineSearch.active && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setInlineSearch(prev => ({ ...prev, active: false }))}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[60vh] animate-scale-up" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <div className="font-bold text-gray-700 text-sm">
                                {inlineSearch.type === 'ADD' ? `Add to ${inlineSearch.slot}`
                                    : inlineSearch.type === 'MEAL' ? 'Swap Meal'
                                        : 'Swap Ingredient'}
                            </div>
                            <button onClick={() => setInlineSearch(prev => ({ ...prev, active: false }))} className="p-1 rounded-full hover:bg-gray-200">
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Input */}
                        <div className="p-4 pb-2">
                            <input
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium outline-none focus:border-[#2E7D6B] focus:ring-1 focus:ring-[#2E7D6B]/10"
                                placeholder="Type to search..."
                                value={inlineSearch.query}
                                onChange={e => setInlineSearch(prev => ({ ...prev, query: e.target.value }))}
                            />
                        </div>

                        {/* Results List */}
                        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-1">
                            {/* Filter Logic: 
                                 - ADD/MEAL: Only Cooked Meals 
                                 - ING: Only Raw Ingredients 
                             */}
                            {foodDatabase.filter(f => {
                                // 1. Context Filtering
                                let contextMatch = true;
                                if (inlineSearch.type === 'ADD' || inlineSearch.type === 'MEAL') {
                                    const slot = inlineSearch.slot;
                                    if (slot === 'snacks') {
                                        // Snacks: Strict category match
                                        contextMatch = f.category === 'Snacks';
                                    } else if (slot === 'breakfast') {
                                        contextMatch = f.category === 'Breakfast';
                                    } else {
                                        // Lunch & Dinner: Match slot name OR 'Main' (excluding Breakfast/Snacks)
                                        contextMatch = (f.category.toLowerCase().includes(slot) || f.category === 'Main') && f.category !== 'Breakfast' && f.category !== 'Snacks';
                                    }
                                    // Ensure we are looking for cooked meals for these slots (mostly)
                                    contextMatch = contextMatch && f.isCooked;
                                } else if (inlineSearch.type === 'ING') {
                                    // Ingredient Swap:
                                    const currentItems = plan[currentDay]?.[inlineSearch.slot] || [];
                                    const meal = currentItems.find(i => i.uuid === inlineSearch.itemUuid);
                                    const ing = meal?.composition?.[inlineSearch.ingIdx];

                                    // Helper to guess category if missing (for legacy/stale plan data)
                                    const getCategory = (item) => {
                                        if (item?.category) return item.category;
                                        if (!item?.name) return null;
                                        const n = item.name.toLowerCase();

                                        // CARBS
                                        if (n.match(/rice|roti|oats|bread|potato|quinoa|dosa|idli|poha|flour|wheat|pasta|corn|millet|upma|semolina|cereal|chapati|phulka|kulcha|naan/)) return 'Carb Source';

                                        // PROTEIN
                                        if (n.match(/chicken|egg|paneer|dal|yogurt|curd|soya|fish|prawn|tofu|whey|chana|rajma|sambar|lentil|gram|besan|turkey|duck|meat|beef|pork|mutton|peas|kidney bean/)) return 'Protein Source';

                                        // FATS
                                        if (n.match(/oil|butter|ghee|seed|nut|almond|walnut|chutney|avocado|cream|mayo|cheese|olive|coconut|peanut/)) return 'Fat Source';

                                        // VEGETABLES
                                        if (n.match(/veg|salad|spinach|broccoli|mushroom|bean|carrot|tomato|onion|cucumber|capsicum|pepper|gourd|okra|brinjal|cabbage|cauliflower|lettuce|mix veg|saute/)) return 'Vegetables';

                                        // LIQUID / OTHERS
                                        if (n.match(/tea|coffee|milk|buttermilk|soup|rasam|water|juice|drink|shak|beverage/)) return 'Liquid';

                                        return null;
                                    };

                                    if (ing) {
                                        const targetCategory = getCategory(ing);
                                        // RELAXED FILTER: 
                                        // 1. Don't enforce type (Veg/Non-Veg) strict match here. 
                                        //    Let global Diet Preference filter handle user restrictions.
                                        // 2. Prioritize Category Matching (e.g., Protein Source -> Protein Source).

                                        if (targetCategory && targetCategory !== 'General') {
                                            // Strong Category Match: Allow Cooked items, and filter out explicit "(Raw)" items
                                            contextMatch = (f.category === targetCategory);
                                        } else {
                                            // Fallback: Default to Cooked items if we don't know the category
                                            contextMatch = f.isCooked;
                                        }

                                        // GLOBAL RAW FILTER for Ingredient Swaps:
                                        // Ensure we don't show items explicitly marked as "(Raw)" unless user searches for them specificially? 
                                        // User asked "no raw ones", so we hide them.
                                        if (f.name.toLowerCase().includes('(raw)')) {
                                            contextMatch = false;
                                        }

                                    } else {
                                        contextMatch = f.isCooked;
                                    }
                                }

                                // GLOBAL: User Preferences Filtering (Diet & Cuisine)
                                // Diet Logic: Updated to handle 'egg' type and defensive spelling
                                const pref = preferences.dietPreference;

                                if (pref === 'Vegetarian') {
                                    // Strictly allow only 'veg'.
                                    contextMatch = contextMatch && f.type === 'veg';
                                    // DOUBLE SAFETY: Explicitly exclude non-veg/egg (though type check covers it)
                                    if (f.type === 'non-veg' || f.type === 'egg') contextMatch = false;

                                } else if (pref === 'Eggetarian' || pref === 'Eggitarian') {
                                    // Allow 'veg' OR 'egg'.
                                    contextMatch = contextMatch && (f.type === 'veg' || f.type === 'egg');
                                    // DOUBLE SAFETY: Explicitly exclude 'non-veg' (Chicken/Fish)
                                    if (f.type === 'non-veg') contextMatch = false;
                                }

                                // Cuisine (if not Mixed/All)
                                if (preferences.cuisineStyle !== 'Mixed' && preferences.cuisineStyle !== 'All') {
                                    contextMatch = contextMatch && (f.region === preferences.cuisineStyle || f.region === 'All' || f.region === 'International');
                                }

                                // 3. Allergy Exclusion
                                if (isAllergic(f)) contextMatch = false;

                                // 2. Query Filtering
                                const queryMatch = f.name.toLowerCase().includes(inlineSearch.query.toLowerCase());

                                return contextMatch && queryMatch;
                            }).slice(0, 20).map(res => (
                                <button
                                    key={res.id}
                                    onClick={() => handleSearchSelect(res)}
                                    className="w-full text-left p-3 rounded-xl hover:bg-[#2E7D6B]/5 border border-transparent hover:border-[#2E7D6B]/30 transition-all group flex justify-between items-center"
                                >
                                    <div>
                                        <div className="font-bold text-gray-800 text-sm group-hover:text-[#2E7D6B]">{res.name}</div>
                                        <div className="text-[10px] text-gray-400 font-medium whitespace-nowrap">{res.calories} kcal • {res.servingSize}</div>
                                    </div>
                                    {inlineSearch.type === 'ADD' && <div className="text-[#2E7D6B] font-bold text-lg">+</div>}
                                </button>
                            ))}

                            {foodDatabase.filter(f => {
                                // Duplicate logic for "No matches" check - simplifying for rendering
                                // Ideally extract to helper, but inline for now to avoid massive refactor
                                let contextMatch = true;
                                if (inlineSearch.type === 'ADD' || inlineSearch.type === 'MEAL') {
                                    const slot = inlineSearch.slot;
                                    if (slot === 'snacks') contextMatch = f.category === 'Snacks';
                                    else if (slot === 'breakfast') contextMatch = f.category === 'Breakfast';
                                    else contextMatch = (f.category.toLowerCase().includes(slot) || f.category === 'Main') && f.category !== 'Breakfast' && f.category !== 'Snacks';

                                    // Preferences Check for "No Matches" logic
                                    if (preferences.dietPreference === 'Vegetarian') contextMatch = contextMatch && f.type === 'veg';
                                    else if (preferences.dietPreference === 'Eggetarian') contextMatch = contextMatch && (f.type === 'veg' || f.type === 'egg');

                                    if (preferences.cuisineStyle !== 'Mixed' && preferences.cuisineStyle !== 'All') {
                                        contextMatch = contextMatch && (f.region === preferences.cuisineStyle || f.region === 'All' || f.region === 'International');
                                    }
                                } else if (inlineSearch.type === 'ING') {
                                    const currentItems = plan[currentDay]?.[inlineSearch.slot] || [];
                                    const meal = currentItems.find(i => i.uuid === inlineSearch.itemUuid);
                                    const ing = meal?.composition?.[inlineSearch.ingIdx];
                                    if (ing) contextMatch = f.type === ing.type && (ing.category && ing.category !== 'General' ? f.category === ing.category : true);
                                }
                                return contextMatch && f.name.toLowerCase().includes(inlineSearch.query.toLowerCase());
                            }).length === 0 && (
                                    <div className="text-center py-8 text-gray-400 text-xs">No matches found for "{inlineSearch.query}" in this category</div>
                                )}
                        </div>
                    </div>
                </div>
            )}

            {/* Info Modal */}
            {infoModalOpen && infoItem && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in text-[#1F2933]">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setInfoModalOpen(false)}></div>
                    <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl relative z-10 transform transition-all animate-slide-up-mobile">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold truncate pr-4">{infoItem.name}</h3>
                            <button onClick={() => setInfoModalOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-400 hover:text-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="mb-6">
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Ingredients / Composition</div>
                            {infoItem.composition && infoItem.composition.length > 0 ? (
                                <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                    {infoItem.composition.map((ing, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-xl">
                                            <span className="text-gray-700 font-medium">{ing.name}</span>
                                            <span className="text-gray-400 text-xs">{(ing.scaledWeight || ing.weight) || ''}g</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-gray-500 italic p-8 bg-gray-50 rounded-2xl text-center">
                                    <div className="text-2xl mb-2">🥗</div>
                                    This is a base ingredient.
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-4 gap-2 border-t border-gray-100 pt-4">
                            <div className="text-center">
                                <div className="text-[8px] text-gray-400 font-bold uppercase">Kcal</div>
                                <div className="text-xs font-bold text-gray-800">{infoItem.calculatedCalories || infoItem.calories}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-[8px] text-gray-400 font-bold uppercase">Prot</div>
                                <div className="text-xs font-bold text-gray-800">
                                    {infoItem.macros ? infoItem.macros.protein : (infoItem.protein || 0)}g
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-[8px] text-gray-400 font-bold uppercase">Carbs</div>
                                <div className="text-xs font-bold text-gray-800">
                                    {infoItem.macros ? infoItem.macros.carbs : (infoItem.carbs || 0)}g
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-[8px] text-gray-400 font-bold uppercase">Fats</div>
                                <div className="text-xs font-bold text-gray-800">
                                    {infoItem.macros ? infoItem.macros.fats : (infoItem.fats || 0)}g
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Save Modal */}
            {saveModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in text-[#1F2933]">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setSaveModalOpen(false)}></div>
                    <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl relative z-10 transform transition-all animate-slide-up-mobile text-center">
                        <div className="w-12 h-12 bg-[#FFD166] rounded-full flex items-center justify-center text-2xl mx-auto mb-4 text-white shadow-lg shadow-[#FFD166]/40">💾</div>
                        <h3 className="text-xl font-bold mb-2">Save Meal Plan</h3>
                        <div className="mb-6 text-left">
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
            {/* Fixed Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-40 flex gap-3">
                <div className="relative flex-1" ref={downloadRef}>
                    <button onClick={() => setDownloadMenuOpen(!downloadMenuOpen)} className="w-full py-3 bg-gray-100 text-gray-700 font-black text-xs sm:text-sm rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2 uppercase tracking-wider">
                        <svg className="w-5 h-5 text-[#2E7D6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth={2} /></svg>
                        Download
                    </button>
                    {downloadMenuOpen && (
                        <div className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-slide-up-mobile">
                            <button onClick={handleDownloadExcel} className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 border-b border-gray-100 transition-all">
                                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center"><svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth={2} /></svg></div>
                                <div className="text-left"><div className="font-bold text-gray-800 text-sm">Excel Sheets</div><div className="text-[10px] text-gray-400 font-bold uppercase">Tracking & Analysis</div></div>
                            </button>
                            <button onClick={handleDownloadPDF} className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-all">
                                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center"><svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" strokeWidth={2} /></svg></div>
                                <div className="text-left"><div className="font-bold text-gray-800 text-sm">PDF Document</div><div className="text-[10px] text-gray-400 font-bold uppercase">Print & Share</div></div>
                            </button>
                        </div>
                    )}
                </div>
                <button onClick={() => setSaveModalOpen(true)} className="flex-1 py-3 bg-[#2E7D6B] text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-[#2E7D6B]/30 hover:bg-[#256a5b] transition-all flex items-center justify-center gap-2 uppercase tracking-wider">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" strokeWidth={2} /></svg>
                    Save Plan
                </button>
            </div>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default MealPlannerPage;