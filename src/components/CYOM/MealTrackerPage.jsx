import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { userData } from '../../data/store';
import SidebarMenu from './SidebarMenu';
import { foodDatabase } from '../../data/foodDatabase';
import { getExtendedNutrients, RDA_TARGETS } from '../../utils/nutrientData';

import CommonProfileMenu from './CommonProfileMenu';

const MealTrackerPage = () => {
    const navigate = useNavigate();

    // --- STATE ---
    const [savedPlans, setSavedPlans] = useState([]);
    const [selectedPlanId, setSelectedPlanId] = useState(null);
    const [activeDay, setActiveDay] = useState(1);
    const location = useLocation();

    // TABS
    const [activeTab, setActiveTab] = useState('input'); // 'input' | 'insights'
    const [activeInsightTab, setActiveInsightTab] = useState('macros'); // 'macros' | 'vitamins' | 'minerals'

    // Plan Selector State
    const [planSelectorOpen, setPlanSelectorOpen] = useState(false);
    const [planSearchQuery, setPlanSearchQuery] = useState('');

    // Tracking States
    const [trackingLogs, setTrackingLogs] = useState({}); // { [planId_day_slot_uuid]: boolean }
    const [extraLogs, setExtraLogs] = useState({}); // { [planId_day_slot]: [ ...items ] }
    const [removedLogs, setRemovedLogs] = useState({}); // { [planId_day_slot_uuid]: boolean }

    const [loading, setLoading] = useState(true);

    // UI State for Theme
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Search Logic
    const [isSearchOpen, setIsSearchOpen] = useState(false); // Kept for logic, but might not use modal anymore
    const [activeSearchSlot, setActiveSearchSlot] = useState(null); // Slot where inline input is active
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [inputWeight, setInputWeight] = useState(''); // Default empty, user types value
    const [selectedFoodItem, setSelectedFoodItem] = useState(null); // Item selected from autocomplete
    const [capturedImages, setCapturedImages] = useState({}); // { [planId_day_slot]: 'data:image/...' }
    const [historySnapshot, setHistorySnapshot] = useState(null); // { breakfast: [], lunch: [], ... }
    const [historyConsumedSet, setHistoryConsumedSet] = useState(null); // Set of item UUIDs consumed in history
    const [historyPlanId, setHistoryPlanId] = useState(null); // The planId from the selected history log
    const [editingExtraItem, setEditingExtraItem] = useState(null); // { slot, item } being edited

    // --- INITIAL LOAD ---
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const historyDate = queryParams.get('date');
        const dayParam = queryParams.get('day');

        const today = new Date().toISOString().split('T')[0];

        // Initial defaults
        let logs = {};
        let extras = {};
        let removed = {};
        let images = {};

        const plans = JSON.parse(localStorage.getItem('cyom_saved_plans') || '[]');
        setSavedPlans(plans);

        if (historyDate) {
            // Loading from HISTORY - use the stored selected log
            const selectedLogStr = localStorage.getItem('cyom_selected_history_log');
            if (selectedLogStr) {
                try {
                    const historyLog = JSON.parse(selectedLogStr);
                    if (historyLog) {
                        if (historyLog.details) {
                            logs = historyLog.details.trackingLogs || {};
                            extras = historyLog.details.extraLogs || {};
                            removed = historyLog.details.removedLogs || {};
                            images = historyLog.details.capturedImages || {};

                            // Improved UUID extraction logic
                            const consumedUuids = new Set();
                            Object.keys(logs).forEach(k => {
                                if (!logs[k]) return;
                                const parts = k.split('_');
                                // The tracking key format is: [planId]_[day]_[slot]_[uuid]
                                // Since planId can have underscores, the slot is the 2nd to last known segment, and uuid is trailing.
                                const slotNames = ['breakfast', 'morningSnack', 'lunch', 'snacks', 'dinner'];
                                const slotIdx = parts.findIndex(p => slotNames.includes(p));
                                if (slotIdx !== -1 && slotIdx < parts.length - 1) {
                                    const uuid = parts.slice(slotIdx + 1).join('_');
                                    if (uuid) consumedUuids.add(String(uuid));
                                }
                            });
                            setHistoryConsumedSet(consumedUuids);
                        }
                        // Priority: Use the planId from the history log
                        const histPlanId = historyLog.planId ?? null;
                        if (histPlanId !== null) {
                            localStorage.setItem('cyom_tracker_active_plan_id', String(histPlanId));
                            setHistoryPlanId(histPlanId);
                        }
                        // Priority for Day: URL Param -> History Log -> Default 1
                        const targetDay = dayParam || historyLog.day || 1;
                        setActiveDay(parseInt(targetDay, 10));
                    }
                } catch (e) {
                    console.error('Error parsing selected history log', e);
                }
            }
        } else {
            if (dayParam) setActiveDay(parseInt(dayParam, 10));

            // NORMAL ENTRY
            const today = new Date().toISOString().split('T')[0];
            const allLogs = JSON.parse(localStorage.getItem('cyom_daily_logs') || '{}');

            if (allLogs[today]) {
                // LOAD FROM SAVED HISTORY (Single Source of Truth)
                const todayLog = allLogs[today];
                if (todayLog.details) {
                    logs = todayLog.details.trackingLogs || {};
                    extras = todayLog.details.extraLogs || {};
                    removed = todayLog.details.removedLogs || {};
                    images = todayLog.details.capturedImages || {};
                }
                if (todayLog.planId) {
                    localStorage.setItem('cyom_tracker_active_plan_id', String(todayLog.planId));
                }
                if (todayLog.day) {
                    // Update activeDay state immediately (will be handled by effect, but good to be explicit for logic flow)
                    // Note: setActiveDay is called below based on logic, but we can preset the logic var
                    // actually setActiveDay is a state setter, so we call it.
                    const savedDay = parseInt(todayLog.day, 10);
                    if (!dayParam) setActiveDay(savedDay);
                }
            } else {
                // NO SAVED LOG FOR TODAY -> Check working copy or start fresh
                const lastTrackedDate = localStorage.getItem('cyom_last_tracked_date');
                if (lastTrackedDate !== today) {
                    localStorage.removeItem('cyom_tracking_logs');
                    localStorage.removeItem('cyom_extra_tracking_items');
                    localStorage.removeItem('cyom_removed_items');
                    localStorage.removeItem('cyom_captured_plates');
                    localStorage.setItem('cyom_last_tracked_date', today);
                } else {
                    logs = JSON.parse(localStorage.getItem('cyom_tracking_logs') || '{}');
                    extras = JSON.parse(localStorage.getItem('cyom_extra_tracking_items') || '{}');
                    removed = JSON.parse(localStorage.getItem('cyom_removed_items') || '{}');
                    images = JSON.parse(localStorage.getItem('cyom_captured_plates') || '{}');
                }
            }
        }

        setTrackingLogs(logs);
        setExtraLogs(extras);
        setRemovedLogs(removed);
        setCapturedImages(images);

        if (historyDate) {
            const selectedLogStr = localStorage.getItem('cyom_selected_history_log');
            if (selectedLogStr) {
                const historyLog = JSON.parse(selectedLogStr);
                if (historyLog?.details?.planSnapshot) {
                    setHistorySnapshot(historyLog.details.planSnapshot);
                }
            }
        } else {
            setHistorySnapshot(null);
            setHistoryPlanId(null);
            setHistoryConsumedSet(null);
        }

        // Find and set active plan (CRITICAL for "seeing the meal")
        if (plans.length > 0) {
            const savedId = localStorage.getItem('cyom_tracker_active_plan_id');
            const targetPlan = plans.find(p => String(p.id) === String(savedId)) || plans[0];
            setSelectedPlanId(targetPlan.id);
        }

        setLoading(false);
    }, [location.search]); // Re-run if query params change


    // --- SEARCH HELPERS ---
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }
        // If we already selected an item, don't show results unless user is typing to change it
        if (selectedFoodItem && searchQuery === selectedFoodItem.name) {
            setSearchResults([]);
            return;
        }

        const lowerQ = searchQuery.toLowerCase();
        const results = foodDatabase.filter(item => {
            // Filter Logic:
            // 1. Must match name/keyword
            // 2. Must be "Cooked", "Combo", or "Directly Eatable" categories
            const matchesSearch = item.name.toLowerCase().includes(lowerQ) ||
                (item.keywords && item.keywords.some(k => k.toLowerCase().includes(lowerQ)));

            if (!matchesSearch) return false;

            const isCookedOrPrepared = item.isCooked || item.isCombo; // combo implies prepared meal
            const isDirectEatable = ['Fruit', 'Curd', 'Dairy', 'Beverage', 'Nut'].includes(item.category) ||
                ['Fruit', 'Nut', 'Dairy'].includes(item.subType);

            return isCookedOrPrepared || isDirectEatable;
        }).slice(0, 8); // Limit results for inline dropdown
        setSearchResults(results);
    }, [searchQuery, selectedFoodItem]);

    const handleOpenInlineInput = (slot) => {
        if (activeSearchSlot === slot) {
            // Close — also clear any edit-in-progress
            setActiveSearchSlot(null);
            setSearchQuery('');
            setInputWeight('');
            setSelectedFoodItem(null);
            setEditingExtraItem(null);
        } else {
            // Open for this slot
            setActiveSearchSlot(slot);
            setSearchQuery('');
            setInputWeight('');
            setSelectedFoodItem(null);
            setEditingExtraItem(null);
        }
    };

    const handleSelectFood = (item) => {
        if (!item) return;
        setSelectedFoodItem(item);
        setSearchQuery(item.name || "");
        setSearchResults([]);

        // Determine Base Weight (Reference)
        // 1. Explicit grams in servingSize
        // 2. Sum of composition weights (if combo)
        // 3. Default 100g
        let refWeight = 100;
        const gMatch = String(item.servingSize || "").match(/(\d+)\s*(?:g|ml)/i);
        if (gMatch) {
            refWeight = parseInt(gMatch[1]);
        } else if (item.composition && item.composition.length > 0) {
            refWeight = item.composition.reduce((a, b) => a + (b.weight || 0), 0) || 100;
        }

        let weightToSet = refWeight;

        // --- SMART WEIGHT LOGIC ---
        // 1. Calculate Remaining Calories for the Active Slot
        if (activeSearchSlot && selectedPlanId) {
            const planItems = getActivePlan()?.plan?.[activeDay]?.[activeSearchSlot] || [];
            const key = `${selectedPlanId}_${activeDay}_${activeSearchSlot}`;
            const extraItems = extraLogs[key] || [];

            // Re-calculate slot stats
            // Target: Sum of all plan items (even deleted ones - based on previous fix)
            const targetCals = planItems.reduce((sum, i) => sum + (i.calculatedCalories || 0), 0);

            // Consumed: Only visible and checked items + extras
            const consumedCals = [...planItems.filter(i => !isRemoved(activeSearchSlot, i.uuid)), ...extraItems]
                .filter(i => isConsumed(activeSearchSlot, i.uuid))
                .reduce((sum, i) => sum + (i.calculatedCalories || 0), 0);

            const remainingCals = targetCals - consumedCals;

            // Determine Base Calories (Prefer composition sum)
            let baseCals = item.calories;
            if (item.composition && item.composition.length > 0) {
                baseCals = item.composition.reduce((a, b) => a + (b.calories || 0), 0) || baseCals;
            }

            // 2. If we are under target, calculate weight needed to fill the gap
            if (remainingCals > 0 && baseCals > 0) {
                // Ratio needed = remaining / baseCals
                const neededRatio = remainingCals / baseCals;
                weightToSet = Math.round(refWeight * neededRatio);
            }
        }

        setInputWeight(String(weightToSet));
    };

    const handleConfirmAdd = () => {
        if (!selectedPlanId || !activeSearchSlot || !selectedFoodItem || !inputWeight) return;

        const weightVal = parseInt(inputWeight) || 100;

        // Determine Reference Weight for Base Values
        let refWeight = 100;
        const gMatch = String(selectedFoodItem.servingSize || "").match(/(\d+)\s*(?:g|ml)/i);
        if (gMatch) {
            refWeight = parseInt(gMatch[1]);
        } else if (selectedFoodItem.composition && selectedFoodItem.composition.length > 0) {
            refWeight = selectedFoodItem.composition.reduce((a, b) => a + (b.weight || 0), 0) || 100;
        }

        // Determine Base Nutrients (Prefer Composition Sum for consistency with Planner)
        let baseCals = selectedFoodItem.calories || 0;
        let baseP = selectedFoodItem.protein || 0;
        let baseC = selectedFoodItem.carbs || 0;
        let baseF = selectedFoodItem.fats || 0;

        if (selectedFoodItem.composition && selectedFoodItem.composition.length > 0) {
            baseCals = selectedFoodItem.composition.reduce((a, b) => a + (b.calories || 0), 0) || baseCals;
            baseP = selectedFoodItem.composition.reduce((a, b) => a + (b.protein || 0), 0) || baseP;
            baseC = selectedFoodItem.composition.reduce((a, b) => a + (b.carbs || 0), 0) || baseC;
            baseF = selectedFoodItem.composition.reduce((a, b) => a + (b.fats || 0), 0) || baseF;
        }

        // Scale Factor
        const ratio = weightVal / refWeight;

        // Create Item with Scaled Values
        const scaledItem = {
            ...selectedFoodItem,
            calculatedCalories: Math.round(baseCals * ratio),
            carbs: Math.round(baseC * ratio),
            protein: Math.round(baseP * ratio),
            fats: Math.round(baseF * ratio),
            calculatedWeight: weightVal // Store as number for consistency
        };

        const key = `${selectedPlanId}_${activeDay}_${activeSearchSlot}`;
        const currentExtras = extraLogs[key] || [];

        if (editingExtraItem) {
            if (editingExtraItem.isPlanItem) {
                // PLAN ITEM EDIT: mark original as removed, add adjusted version as extra
                const oldItem = editingExtraItem.item;
                const oldUuid = oldItem.uuid;

                // 1. Mark original plan item as removed
                const removeKey = `${selectedPlanId}_${activeDay}_${activeSearchSlot}_${oldUuid}`;
                const newRemoved = { ...removedLogs, [removeKey]: true };
                setRemovedLogs(newRemoved);
                localStorage.setItem('cyom_removed_items', JSON.stringify(newRemoved));

                // 2. Add adjusted version as extra (new UUID so it's distinct)
                const newUuid = 'edit_' + oldUuid;
                const adjustedItem = { ...scaledItem, uuid: newUuid, isExtra: true, editedFrom: oldUuid };
                const newExtras = { ...extraLogs, [key]: [...currentExtras, adjustedItem] };
                setExtraLogs(newExtras);
                localStorage.setItem('cyom_extra_tracking_items', JSON.stringify(newExtras));

                // 3. Preserve consumed state: if original was consumed, auto-consume the replacement
                const wasConsumed = !!trackingLogs[removeKey];
                if (wasConsumed) {
                    const newLogKey = `${selectedPlanId}_${activeDay}_${activeSearchSlot}_${newUuid}`;
                    const newLogs = { ...trackingLogs, [newLogKey]: true };
                    delete newLogs[removeKey]; // remove old consumed key
                    setTrackingLogs(newLogs);
                    localStorage.setItem('cyom_tracking_logs', JSON.stringify(newLogs));
                }
            } else {
                // EXTRA ITEM EDIT: replace in-place, keep same UUID
                const oldUuid = editingExtraItem.item.uuid;
                const updatedItem = { ...scaledItem, uuid: oldUuid, isExtra: true };
                const newExtras = {
                    ...extraLogs,
                    [key]: currentExtras.map(i => i.uuid === oldUuid ? updatedItem : i)
                };
                setExtraLogs(newExtras);
                localStorage.setItem('cyom_extra_tracking_items', JSON.stringify(newExtras));
                // Tracking log key stays the same (same UUID), consumed state preserved
            }
            setEditingExtraItem(null);
        } else {
            // ADD MODE: create a new extra item
            const newUuid = 'extra_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            const newItem = { ...scaledItem, uuid: newUuid, isExtra: true };
            const newExtras = { ...extraLogs, [key]: [...currentExtras, newItem] };
            setExtraLogs(newExtras);
            localStorage.setItem('cyom_extra_tracking_items', JSON.stringify(newExtras));

            // Auto-select the new item as consumed
            const logKey = `${selectedPlanId}_${activeDay}_${activeSearchSlot}_${newUuid}`;
            const newLogs = { ...trackingLogs, [logKey]: true };
            setTrackingLogs(newLogs);
            localStorage.setItem('cyom_tracking_logs', JSON.stringify(newLogs));
        }

        // Reset inline input
        setSearchQuery('');
        setInputWeight('');
        setSelectedFoodItem(null);
    };

    const removeItem = (slot, item) => {
        if (!selectedPlanId) return;

        if (item.isExtra) {
            // Remove from extraLogs
            const key = `${selectedPlanId}_${activeDay}_${slot}`;
            const currentExtras = extraLogs[key] || [];
            const newExtras = { ...extraLogs, [key]: currentExtras.filter(i => i.uuid !== item.uuid) };

            setExtraLogs(newExtras);
            localStorage.setItem('cyom_extra_tracking_items', JSON.stringify(newExtras));
        } else {
            // Mark as removed in removedLogs
            const removeKey = `${selectedPlanId}_${activeDay}_${slot}_${item.uuid}`;
            const newRemoved = { ...removedLogs, [removeKey]: true };

            setRemovedLogs(newRemoved);
            localStorage.setItem('cyom_removed_items', JSON.stringify(newRemoved));
        }

        // Also remove from tracking logs if it was checked
        const logKey = `${selectedPlanId}_${activeDay}_${slot}_${item.uuid}`;
        if (trackingLogs[logKey]) {
            const newLogs = { ...trackingLogs };
            delete newLogs[logKey];
            setTrackingLogs(newLogs);
            localStorage.setItem('cyom_tracking_logs', JSON.stringify(newLogs));
        }
    };



    // --- PHOTO CAPTURE ---
    const handleImageUpload = (event, slot) => {
        const file = event.target.files[0];
        if (!file || !selectedPlanId) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const key = `${selectedPlanId}_${activeDay}_${slot}`;
            setCapturedImages(prev => ({
                ...prev,
                [key]: reader.result
            }));
            // Ideally save to localStorage or backend here
            // For now, let's persist to localStorage so it survives refresh
            const storedImages = JSON.parse(localStorage.getItem('cyom_captured_plates') || '{}');
            storedImages[key] = reader.result;
            localStorage.setItem('cyom_captured_plates', JSON.stringify(storedImages));
        };
        reader.readAsDataURL(file);
    };

    const removeCapturedImage = (slot) => {
        if (!selectedPlanId) return;
        const key = `${selectedPlanId}_${activeDay}_${slot}`;
        const newImages = { ...capturedImages };
        delete newImages[key];
        setCapturedImages(newImages);

        const storedImages = JSON.parse(localStorage.getItem('cyom_captured_plates') || '{}');
        delete storedImages[key];
        localStorage.setItem('cyom_captured_plates', JSON.stringify(storedImages));
    };

    const triggerFileInput = (slot) => {
        document.getElementById(`file-input-${slot}`).click();
    };

    // --- HELPERS ---
    const getActivePlan = () => savedPlans.find(p => p.id === selectedPlanId);

    const toggleConsumed = (slot, itemUuid) => {
        if (!selectedPlanId) return;
        const key = `${selectedPlanId}_${activeDay}_${slot}_${itemUuid}`;
        const newLogs = { ...trackingLogs, [key]: !trackingLogs[key] };
        setTrackingLogs(newLogs);
        localStorage.setItem('cyom_tracking_logs', JSON.stringify(newLogs));
    };

    const isConsumed = (slot, itemUuid) => {
        // In history mode: use the pre-built UUID set (avoids planId/day key mismatches)
        if (historySnapshot && historyConsumedSet) {
            return historyConsumedSet.has(itemUuid);
        }
        // In live mode: use the full compound key
        const keyPlanId = historySnapshot ? (historyPlanId ?? selectedPlanId) : selectedPlanId;
        if (!keyPlanId) return false;
        return !!trackingLogs[`${keyPlanId}_${activeDay}_${slot}_${itemUuid}`];
    };

    const isRemoved = (slot, itemUuid) => {
        const keyPlanId = historySnapshot ? (historyPlanId ?? selectedPlanId) : selectedPlanId;
        if (!keyPlanId) return false;
        return !!removedLogs[`${keyPlanId}_${activeDay}_${slot}_${itemUuid}`];
    };

    const calculateStats = () => {
        const plan = getActivePlan();
        if (!plan && !historySnapshot) return null;

        const dayPlan = historySnapshot || plan?.plan?.[activeDay] || {};
        const slots = ['breakfast', 'morningSnack', 'lunch', 'snacks', 'dinner'];

        const userGender = userData.gender || 'Male';
        const rda = RDA_TARGETS[userGender] || RDA_TARGETS.Male;

        let stats = {
            calories: { consumed: 0, total: 0 },
            macros: {
                carbs: { consumed: 0, total: 0 },
                protein: { consumed: 0, total: 0 },
                fats: { consumed: 0, total: 0 }
            },
            vitamins: {
                vitBScore: { consumed: 0, total: 0 }, // Will be calculated
                vitC: { consumed: 0, total: 0 },
                vitA: { consumed: 0, total: 0 },
                vitD: { consumed: 0, total: 0 }
            },
            minerals: {
                calcium: { consumed: 0, total: 0 },
                magnesium: { consumed: 0, total: 0 },
                iron: { consumed: 0, total: 0 },
                zinc: { consumed: 0, total: 0 },
                iodine: { consumed: 0, total: 0 }
            }
        };

        const getItemStats = (rawItem) => {
            return getExtendedNutrients(rawItem);
        };

        // B-Score Accumulators
        let allConsumedItems = [];
        let allPlanItems = [];

        slots.forEach(slot => {
            // Plan Items
            const items = dayPlan[slot] || [];

            items.forEach(rawItem => {
                const item = getItemStats(rawItem);
                const removed = isRemoved(slot, item.uuid);

                // Add to Plan Totals
                allPlanItems.push(item);

                stats.calories.total += (item.calculatedCalories || 0);
                stats.macros.carbs.total += (item.carbs || 0);
                stats.macros.protein.total += (item.protein || 0);
                stats.macros.fats.total += (item.fats || 0);

                Object.keys(stats.vitamins).forEach(k => {
                    if (k === 'vitBScore') return;
                    if (item.vitamins && item.vitamins[k]) stats.vitamins[k].total += item.vitamins[k];
                });
                Object.keys(stats.minerals).forEach(k => {
                    if (item.minerals && item.minerals[k]) stats.minerals[k].total += item.minerals[k];
                });

                // Add to Consumed
                if (!removed && isConsumed(slot, item.uuid)) {
                    allConsumedItems.push(item);

                    stats.calories.consumed += (item.calculatedCalories || 0);
                    stats.macros.carbs.consumed += (item.carbs || 0);
                    stats.macros.protein.consumed += (item.protein || 0);
                    stats.macros.fats.consumed += (item.fats || 0);

                    Object.keys(stats.vitamins).forEach(k => {
                        if (k === 'vitBScore') return;
                        if (item.vitamins && item.vitamins[k]) stats.vitamins[k].consumed += item.vitamins[k];
                    });
                    Object.keys(stats.minerals).forEach(k => {
                        if (item.minerals && item.minerals[k]) stats.minerals[k].consumed += item.minerals[k];
                    });
                }
            });

            // Extra Items
            const extraItems = extraLogs[`${selectedPlanId}_${activeDay}_${slot}`] || [];
            extraItems.forEach(rawItem => {
                const item = getItemStats(rawItem);

                if (isConsumed(slot, item.uuid)) {
                    allConsumedItems.push(item);

                    stats.calories.consumed += (item.calculatedCalories || 0);
                    stats.macros.carbs.consumed += (item.carbs || 0);
                    stats.macros.protein.consumed += (item.protein || 0);
                    stats.macros.fats.consumed += (item.fats || 0);

                    Object.keys(stats.vitamins).forEach(k => {
                        if (k === 'vitBScore') return;
                        if (item.vitamins && item.vitamins[k]) stats.vitamins[k].consumed += item.vitamins[k];
                    });
                    Object.keys(stats.minerals).forEach(k => {
                        if (item.minerals && item.minerals[k]) stats.minerals[k].consumed += item.minerals[k];
                    });
                }
            });
        });

        // Calculate B-Score (Daily)
        const calcBatchBScore = (batchItems) => {
            if (!batchItems || batchItems.length === 0) return 0;

            let totals = { thiamine: 0, riboflavin: 0, niacin: 0, vitB6: 0, folate: 0, vitB12: 0 };
            batchItems.forEach(i => {
                if (i.vitamins) {
                    totals.thiamine += (i.vitamins.thiamine || 0);
                    totals.riboflavin += (i.vitamins.riboflavin || 0);
                    totals.niacin += (i.vitamins.niacin || 0);
                    totals.vitB6 += (i.vitamins.vitB6 || 0);
                    totals.folate += (i.vitamins.folate || 0);
                    totals.vitB12 += (i.vitamins.vitB12 || 0);
                }
            });

            const t = rda.vitamins;
            const score = (
                (Math.min(1, totals.thiamine / t.thiamine.target) +
                    Math.min(1, totals.riboflavin / t.riboflavin.target) +
                    Math.min(1, totals.niacin / t.niacin.target) +
                    Math.min(1, totals.vitB6 / t.vitB6.target) +
                    Math.min(1, totals.folate / t.folate.target) +
                    Math.min(1, totals.vitB12 / t.vitB12.target)) / 6
            ) * 100;

            return Math.round(score);
        };

        stats.vitamins.vitBScore.total = calcBatchBScore(allPlanItems);
        stats.vitamins.vitBScore.consumed = calcBatchBScore(allConsumedItems);

        return stats;
    };

    // --- PERSISTENCE: Save to Daily Logs ---
    useEffect(() => {
        if (loading || !selectedPlanId) return;

        const queryParams = new URLSearchParams(location.search);
        const historyDate = queryParams.get('date');
        // ALLOW auto-save for history, but handle target properly

        const performSave = () => {
            const currentStats = calculateStats();
            if (!currentStats) return;

            // Target Date: History Date OR Today
            const targetDate = historyDate || new Date().toISOString().split('T')[0];
            const allLogs = JSON.parse(localStorage.getItem('cyom_daily_logs') || '{}');

            // Construct the log entry (Preserve existing structure if needed, but here we overwrite mostly)
            const logEntry = {
                date: targetDate,
                planId: selectedPlanId,
                day: activeDay,
                lastUpdated: new Date().toISOString(),
                calories: {
                    consumed: Math.round(currentStats.calories.consumed),
                    total: Math.round(currentStats.calories.total)
                },
                macros: {
                    carbs: { consumed: Math.round(currentStats.macros.carbs.consumed), total: Math.round(currentStats.macros.carbs.total) },
                    protein: { consumed: Math.round(currentStats.macros.protein.consumed), total: Math.round(currentStats.macros.protein.total) },
                    fats: { consumed: Math.round(currentStats.macros.fats.consumed), total: Math.round(currentStats.macros.fats.total) }
                },
                micros: currentStats.vitamins && currentStats.minerals ? {
                    vitamins: Object.fromEntries(Object.entries(currentStats.vitamins).map(([k, v]) => [k, { consumed: v.consumed, total: v.total }])),
                    minerals: Object.fromEntries(Object.entries(currentStats.minerals).map(([k, v]) => [k, { consumed: v.consumed, total: v.total }]))
                } : {},
                details: {
                    trackingLogs,
                    extraLogs,
                    removedLogs,
                    capturedImages,
                    planSnapshot: historySnapshot || getActivePlan()?.plan?.[activeDay] || {}
                }
            };

            // Save to the master log for the specific date
            allLogs[targetDate] = logEntry;
            localStorage.setItem('cyom_daily_logs', JSON.stringify(allLogs));

            // ONLY save to the individual keys for "today's work in progress" if it IS today (not history)
            if (!historyDate) {
                localStorage.setItem('cyom_tracking_logs', JSON.stringify(trackingLogs));
                localStorage.setItem('cyom_extra_tracking_items', JSON.stringify(extraLogs));
                localStorage.setItem('cyom_removed_items', JSON.stringify(removedLogs));
                localStorage.setItem('cyom_captured_plates', JSON.stringify(capturedImages));
            }
        };

        // Auto-save on changes
        performSave();

    }, [trackingLogs, extraLogs, removedLogs, selectedPlanId, activeDay]); // Dependencies that affect calculations

    // --- Manual Save for User Feedback ---
    const handleManualSave = () => {
        // Trigger the save logic (it runs on effect, but this gives feedback)
        // In a real app, this might commit to a backend
        alert("Daily Log Saved Successfully! 📝");
    };

    const stats = calculateStats();
    const currentPlan = getActivePlan();

    const progress = stats ? {
        val: Math.round(stats.calories.consumed),
        total: Math.round(stats.calories.total) || 1,
        percent: Math.min(100, Math.round((stats.calories.consumed / (stats.calories.total || 1)) * 100))
    } : { val: 0, total: 1, percent: 0 };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Tracker...</div>;

    if (savedPlans.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">No Plans Found</h2>
                <p className="text-gray-500 mb-6">You need to create a meal plan before you can track it.</p>
                <button
                    onClick={() => navigate('/meal-creation')}
                    className="px-8 py-3 bg-[#2E7D6B] text-white rounded-xl font-bold hover:bg-[#256a5b] transition-all shadow-lg"
                >
                    Create Diet Plan
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 font-sans text-[#1F2933]">
            {/* --- STICKY HEADER --- */}
            <div className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-30">
                {/* Top Row: Menu + Profile + Stats */}
                <div className="px-3 py-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsMenuOpen(true)} className="p-2 hover:bg-gray-50 rounded-lg text-gray-500 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                            </svg>
                        </button>
                    </div>

                    {/* Compact Stats Summary */}
                    <div className="flex items-center gap-4 sm:gap-6 flex-1 justify-end">
                        {/* Calories */}
                        <div className="text-right">
                            <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Energy</div>
                            <div className="text-sm font-black text-[#2E7D6B] leading-none">
                                {Math.round(stats.calories.consumed)} <span className="text-gray-300 text-xs">/ {Math.round(stats.calories.total)}</span>
                            </div>
                        </div>

                        {/* Macros */}
                        <div className="flex gap-3 sm:gap-6 border-l border-gray-100 pl-3 sm:pl-6">
                            <div className="text-center">
                                <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Prot</div>
                                <div className="text-sm font-bold text-gray-700 leading-none">
                                    <span className={stats.macros.protein.consumed > stats.macros.protein.total ? 'text-red-500' : ''}>{Math.round(stats.macros.protein.consumed)}</span>
                                    <span className="text-gray-300 font-medium text-xs">/{Math.round(stats.macros.protein.total)}</span>
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Carb</div>
                                <div className="text-sm font-bold text-gray-700 leading-none">
                                    <span className={stats.macros.carbs.consumed > stats.macros.carbs.total ? 'text-red-500' : ''}>{Math.round(stats.macros.carbs.consumed)}</span>
                                    <span className="text-gray-300 font-medium text-xs">/{Math.round(stats.macros.carbs.total)}</span>
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Fat</div>
                                <div className="text-sm font-bold text-gray-700 leading-none">
                                    <span className={stats.macros.fats.consumed > stats.macros.fats.total ? 'text-red-500' : ''}>{Math.round(stats.macros.fats.consumed)}</span>
                                    <span className="text-gray-300 font-medium text-xs">/{Math.round(stats.macros.fats.total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Row: Controls (Days & Tabs) */}
                <div className="bg-gray-50 px-3 py-2 flex items-center justify-between border-t border-gray-100">
                    <div className="relative">
                        <button
                            onClick={() => setPlanSelectorOpen(!planSelectorOpen)}
                            className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 transition-all px-3 py-1.5 rounded-lg text-xs font-bold text-gray-700 min-w-[140px] justify-between shadow-sm"
                        >
                            <span className="truncate max-w-[120px]">{currentPlan ? currentPlan.name : 'Select Plan'}</span>
                            <svg className={`w-4 h-4 text-gray-400 transition-transform ${planSelectorOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>

                        {planSelectorOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setPlanSelectorOpen(false)}></div>
                                <div className="absolute left-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-fade-in-up">
                                    <div className="p-2 border-b border-gray-50 bg-gray-50/50">
                                        <div className="relative">
                                            <input
                                                autoFocus
                                                value={planSearchQuery}
                                                onChange={(e) => setPlanSearchQuery(e.target.value)}
                                                placeholder="Search plans..."
                                                className="w-full pl-3 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold outline-none focus:border-[#2E7D6B] focus:ring-1 focus:ring-[#2E7D6B]/20 transition-all placeholder-gray-300 text-gray-700"
                                            />
                                        </div>
                                    </div>
                                    <div className="max-h-[200px] overflow-y-auto custom-scrollbar p-1">
                                        {savedPlans.filter(p => p.name.toLowerCase().includes(planSearchQuery.toLowerCase())).length > 0 ? (
                                            savedPlans.filter(p => p.name.toLowerCase().includes(planSearchQuery.toLowerCase())).map(p => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => {
                                                        setSelectedPlanId(p.id);
                                                        localStorage.setItem('cyom_tracker_active_plan_id', p.id);
                                                        setPlanSelectorOpen(false);
                                                        setPlanSearchQuery('');
                                                    }}
                                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between mb-0.5 ${selectedPlanId === p.id ? 'bg-[#2E7D6B]/10 text-[#2E7D6B]' : 'hover:bg-gray-50 text-gray-600'}`}
                                                >
                                                    <span className="truncate">{p.name}</span>
                                                    {selectedPlanId === p.id && <svg className="w-3 h-3 text-[#2E7D6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                                                </button>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-gray-400 text-xs italic">No plans found</div>
                                        )}
                                    </div>
                                    <div className="p-2 border-t border-gray-50 bg-gray-50/30">
                                        <button onClick={() => navigate('/goal-selection')} className="w-full py-1.5 text-center text-[10px] uppercase font-black text-[#2E7D6B] hover:bg-[#2E7D6B]/5 rounded-lg transition-colors">
                                            + Create Diet Plan
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Segmented Tabs */}
                    <div className="flex bg-gray-200/50 p-0.5 rounded-lg">
                        <button
                            onClick={() => setActiveTab('input')}
                            className={`px-3 py-1 rounded-md text-[10px] sm:text-xs font-bold transition-all ${activeTab === 'input' ? 'bg-white text-[#2E7D6B] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Input Meals
                        </button>
                        <button
                            onClick={() => setActiveTab('insights')}
                            className={`px-3 py-1 rounded-md text-[10px] sm:text-xs font-bold transition-all ${activeTab === 'insights' ? 'bg-white text-[#2E7D6B] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Insights
                        </button>
                    </div>
                </div>
            </div>

            {/* Sidebar Menu */}
            <SidebarMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 relative z-0">
                <div className="w-full max-w-2xl mx-auto mt-4">

                    {activeTab === 'input' && (
                        <div className="mt-4 bg-white/94 backdrop-blur-xl p-4 sm:p-6 rounded-[28px] shadow-2xl border border-white/50 text-[#1F2933] animate-fade-in-up">
                            {/* --- WHITE CARD CONTENT (Old Header Parts + Tracker) --- */}



                            {/* Day Selector */}
                            {currentPlan && (
                                <div className="px-0 pb-0 flex border-b border-gray-100 mb-6 overflow-x-auto no-scrollbar">
                                    {Array.from({ length: currentPlan.duration || 1 }, (_, i) => i + 1).map(day => (
                                        <button
                                            key={day}
                                            onClick={() => setActiveDay(day)}
                                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider relative whitespace-nowrap ${activeDay === day ? 'text-[#2E7D6B]' : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                            Day {day}
                                            {activeDay === day && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2E7D6B] rounded-t-full"></div>}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* --- CHECKLIST --- */}
                            <div className="space-y-8">
                                {['breakfast', 'morningSnack', 'lunch', 'snacks', 'dinner'].map(slot => {
                                    const planItems = historySnapshot ? (historySnapshot[slot] || []) : (currentPlan?.plan?.[activeDay]?.[slot] || []);
                                    const extraItems = extraLogs[`${selectedPlanId}_${activeDay}_${slot}`] || [];
                                    const visiblePlanItems = planItems.filter(item => !isRemoved(slot, item.uuid));
                                    const allItems = [...visiblePlanItems, ...extraItems];

                                    return (
                                        <div key={slot}>
                                            <div className="flex justify-between items-end mb-3">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-sm font-black text-gray-800 uppercase tracking-wide flex items-center gap-2">
                                                        <span className={`w-2 h-6 rounded-full ${slot === 'breakfast' ? 'bg-orange-400' : slot === 'lunch' ? 'bg-yellow-400' : 'bg-indigo-400'}`}></span>
                                                        {slot.replace(/([A-Z])/g, ' $1').trim()}
                                                    </h3>
                                                    {/* PER SLOT CALORIES */}
                                                    <div className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 whitespace-nowrap">
                                                        {(() => {
                                                            // Target: Sum of ALL plan items (even if removed from view)
                                                            const targetCals = planItems.reduce((sum, i) => sum + (i.calculatedCalories || 0), 0);
                                                            // Consumed: Only what is visible and checked
                                                            const consumedCals = allItems.filter(i => isConsumed(slot, i.uuid)).reduce((sum, i) => sum + (i.calculatedCalories || 0), 0);
                                                            return `${Math.round(consumedCals)} / ${Math.round(targetCals)} kcal`;
                                                        })()}
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => triggerFileInput(slot)}
                                                        className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 text-[#2E7D6B] bg-[#2E7D6B]/10 hover:bg-[#2E7D6B] hover:text-white whitespace-nowrap"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        <span className="hidden sm:inline">Capture Plate</span>
                                                    </button>
                                                    <input
                                                        type="file"
                                                        id={`file-input-${slot}`}
                                                        accept="image/*"
                                                        capture="environment"
                                                        className="hidden"
                                                        onChange={(e) => handleImageUpload(e, slot)}
                                                    />

                                                    <button
                                                        onClick={() => handleOpenInlineInput(slot)}
                                                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap ${activeSearchSlot === slot ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'text-[#2E7D6B] bg-[#2E7D6B]/10 hover:bg-[#2E7D6B] hover:text-white'}`}
                                                    >
                                                        {activeSearchSlot === slot ? (
                                                            <>
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                                                Cancel
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                                                                Add Food
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* CAPTURED IMAGE PREVIEW */}
                                            {capturedImages[`${selectedPlanId}_${activeDay}_${slot}`] && (
                                                <div className="mb-3 relative group w-fit">
                                                    <img
                                                        src={capturedImages[`${selectedPlanId}_${activeDay}_${slot}`]}
                                                        alt="Captured Plate"
                                                        className="h-24 w-auto rounded-xl border border-gray-200 shadow-sm object-cover"
                                                    />
                                                    <button
                                                        onClick={() => removeCapturedImage(slot)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            )}

                                            <div className="space-y-3">
                                                {/* INLINE INPUT ROW */}
                                                {activeSearchSlot === slot && (
                                                    <div className="bg-white p-3 rounded-xl border-2 border-[#2E7D6B]/20 shadow-md animate-fade-in flex flex-col gap-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="relative flex-1">
                                                                <input
                                                                    autoFocus
                                                                    type="text"
                                                                    placeholder="Search food to add..."
                                                                    value={searchQuery}
                                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                                    className="w-full pl-9 pr-3 py-2 bg-gray-50 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#2E7D6B]/50 transition-all placeholder-gray-400"
                                                                />
                                                                <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>

                                                                {/* Autocomplete Dropdown */}
                                                                {searchResults.length > 0 && (
                                                                    <div className="absolute left-0 top-full mt-1 w-full bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-48 overflow-y-auto custom-scrollbar">
                                                                        {searchResults.map(item => (
                                                                            <button
                                                                                key={item.id}
                                                                                onClick={() => handleSelectFood(item)}
                                                                                className="w-full text-left px-4 py-2 hover:bg-[#F0FDF9] hover:text-[#2E7D6B] text-sm font-medium transition-colors border-b border-gray-50 last:border-none"
                                                                            >
                                                                                {item.name} <span className="text-xs text-gray-400 ml-1">({item.calories} kcal)</span>
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="flex gap-2">
                                                            <div className="relative flex-1">
                                                                <input
                                                                    type="number"
                                                                    placeholder="Qty (g)"
                                                                    value={inputWeight}
                                                                    onChange={(e) => setInputWeight(e.target.value)}
                                                                    className="w-full pl-3 pr-8 py-2 bg-gray-50 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#2E7D6B]/50 transition-all placeholder-gray-400"
                                                                />
                                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">g</span>
                                                            </div>
                                                            <button
                                                                onClick={handleConfirmAdd}
                                                                disabled={!selectedFoodItem || !inputWeight}
                                                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md ${(!selectedFoodItem || !inputWeight) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#2E7D6B] text-white hover:bg-[#256a5b] hover:shadow-lg hover:-translate-y-0.5'}`}
                                                            >
                                                                {editingExtraItem ? 'Update ✓' : 'ADD +'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {allItems.length === 0 && activeSearchSlot !== slot && (
                                                    <div className="p-4 border-2 border-dashed border-gray-100 rounded-xl text-center text-xs text-gray-400 font-medium italic">
                                                        No items tracked yet
                                                    </div>
                                                )}

                                                {allItems.map((item, idx) => {
                                                    const checked = isConsumed(slot, item.uuid);
                                                    const isExtra = item.isExtra;

                                                    // Format Weight: Ensure it shows as grams if possible
                                                    let displayWeight = item.calculatedWeight;
                                                    // If it's a number, append 'g'. If string "100g", leave it. If "1 Serving", leave it for now but try to prefer grams.
                                                    // From planner we see calculatedWeight is often a number (sum of ingredients).
                                                    if (typeof displayWeight === 'number') {
                                                        displayWeight = `${displayWeight}g`;
                                                    }

                                                    return (
                                                        <div
                                                            key={item.uuid}
                                                            onClick={() => toggleConsumed(slot, item.uuid)}
                                                            className={`group bg-white p-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 cursor-pointer transition-all duration-200 ${checked ? 'opacity-60 bg-gray-50' : 'hover:-translate-y-0.5 hover:shadow-md'}`}
                                                        >
                                                            {/* Checkbox */}
                                                            <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-colors shrink-0 ${checked ? 'bg-[#2E7D6B] border-[#2E7D6B]' : 'border-gray-300 bg-gray-50 group-hover:border-[#2E7D6B]'}`}>
                                                                {checked && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                                                            </div>

                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between">
                                                                    <div className={`text-sm font-bold text-gray-800 leading-tight truncate mr-2 ${checked ? 'text-gray-400' : ''}`}>
                                                                        {item.name}
                                                                    </div>
                                                                    {isExtra && <span className="px-1.5 py-0.5 rounded-md bg-orange-100 text-orange-600 text-[9px] font-bold uppercase tracking-wide shrink-0">Extra</span>}
                                                                </div>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    <span className="text-xs text-gray-400 font-medium bg-gray-50 px-1.5 py-0.5 rounded-md">
                                                                        {Math.round(item.calculatedCalories || 0)} kcal
                                                                    </span>
                                                                    <span className="text-xs text-gray-500 font-bold bg-gray-50 px-1.5 py-0.5 rounded-md">
                                                                        {displayWeight}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Action buttons */}
                                                            <div className="shrink-0 flex items-center gap-1.5">
                                                                {checked && <span className="text-[10px] font-bold text-[#2E7D6B] bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wide">Done</span>}

                                                                {/* Edit button — all items in live mode (plan + extra); reads as edit+replace for plan items) */}
                                                                {!historySnapshot && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setEditingExtraItem({ slot, item, isPlanItem: !isExtra });
                                                                            setActiveSearchSlot(slot);
                                                                            setSearchQuery(item.name);
                                                                            setInputWeight(String(item.calculatedWeight || ''));
                                                                            setSelectedFoodItem(foodDatabase.find(f => f.name === item.name) || null);
                                                                            setSearchResults([]);
                                                                        }}
                                                                        className="p-1.5 text-gray-300 hover:text-[#2E7D6B] rounded-full hover:bg-[#2E7D6B]/10 transition-colors"
                                                                        title="Edit item"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                                    </button>
                                                                )}

                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); removeItem(slot, item); }}
                                                                    className="p-1.5 text-gray-300 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === 'insights' && (
                        <div className="mt-4 bg-white/94 backdrop-blur-xl p-6 rounded-[28px] shadow-2xl border border-white/50 text-[#1F2933] animate-fade-in-up min-h-[500px]">
                            {/* Insight Sub-Tabs */}
                            <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                                {['macros', 'vitamins', 'minerals'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveInsightTab(tab)}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeInsightTab === tab ? 'bg-white text-[#2E7D6B] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {/* --- MACROS TAB --- */}
                            {activeInsightTab === 'macros' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-black text-gray-800 tracking-tight">Macro Split</h3>
                                        <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-lg">Target vs Consumed</span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3 sm:gap-4">
                                        {Object.entries(stats.macros).map(([key, data]) => {
                                            const pct = Math.min(100, Math.round((data.consumed / (data.total || 1)) * 100));
                                            const colorClass = key === 'carbs' ? 'text-blue-500' : key === 'protein' ? 'text-green-500' : 'text-yellow-500';
                                            const bgClass = key === 'carbs' ? 'bg-blue-50' : key === 'protein' ? 'bg-green-50' : 'bg-yellow-50';

                                            return (
                                                <div key={key} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden group hover:shadow-md transition-all">
                                                    <div className={`absolute top-0 w-full h-1 ${bgClass}`}></div>
                                                    <div className="text-[10px] font-black tracking-wider text-gray-400 uppercase mb-2 mt-1">{key}</div>
                                                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 mb-2 flex items-center justify-center">
                                                        <svg className="w-full h-full transform -rotate-90">
                                                            <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-100" />
                                                            <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="6" fill="transparent" className={`${colorClass} transition-all duration-1000 ease-out`} strokeDasharray="100 100" strokeDashoffset={100 - pct} pathLength="100" strokeLinecap="round" />
                                                        </svg>
                                                        <span className="absolute text-xs sm:text-sm font-black text-gray-700">{pct}%</span>
                                                    </div>
                                                    <div className="text-xs sm:text-sm font-bold text-gray-800">{Math.round(data.consumed)}g</div>
                                                    <div className="text-[9px] sm:text-[10px] text-gray-400 font-medium">/ {Math.round(data.total)}g</div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100 flex gap-3 items-start shadow-sm">
                                        <div className="text-xl bg-white w-8 h-8 rounded-full flex items-center justify-center shadow-sm">💪</div>
                                        <div className="flex-1">
                                            <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-1">Pro Tip</h4>
                                            <p className="text-xs text-blue-900/80 leading-relaxed font-medium">
                                                Hitting your <strong>Protein</strong> target is crucial for muscle repair and satiety. You are <span className="font-bold">{Math.round((stats.macros.protein.consumed / (stats.macros.protein.total || 1)) * 100)}%</span> of the way there!
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- VITAMINS TAB --- */}
                            {activeInsightTab === 'vitamins' && (
                                <div className="space-y-6 animate-fade-in">
                                    <h3 className="text-lg font-black text-gray-800 flex justify-between items-center tracking-tight">
                                        Vitamin Intake
                                        <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-1 rounded-lg uppercase font-bold tracking-wide">Planned Targets</span>
                                    </h3>
                                    <div className="grid gap-5">
                                        {['vitBScore', 'vitC', 'vitA', 'vitD'].map((key) => {
                                            const data = stats.vitamins[key] || { consumed: 0, total: 1 };

                                            // Handle B-Score Label from imported RDA_TARGETS (which doesn't have vitBScore key)
                                            // We use a mock object for B-Score label
                                            const userGender = userData.gender || 'Male';
                                            const userRDA = RDA_TARGETS[userGender] || RDA_TARGETS.Male;

                                            let rda = (key === 'vitBScore')
                                                ? { label: 'Vitamin B Cmplx', unit: 'Score' }
                                                : (userRDA.vitamins[key] || { label: key, unit: '' });

                                            const pct = Math.min(100, Math.round((data.consumed / (data.total || 1)) * 100));

                                            return (
                                                <div key={key} className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                                                    <div className="flex justify-between items-end mb-2">
                                                        <div>
                                                            <div className="text-sm font-bold text-gray-700">{rda.label}</div>
                                                            <div className="text-[10px] text-gray-400 font-medium">{pct}% of Plan</div>
                                                        </div>
                                                        <div className="text-xs font-black text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">
                                                            {Math.round(data.consumed)} <span className="text-purple-400 font-medium">/ {Math.round(data.total)} {rda.unit}</span>
                                                        </div>
                                                    </div>
                                                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full transition-all duration-1000 ease-out shadow-sm"
                                                            style={{ width: `${pct}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* --- MINERALS TAB --- */}
                            {activeInsightTab === 'minerals' && (
                                <div className="space-y-6 animate-fade-in">
                                    <h3 className="text-lg font-black text-gray-800 flex justify-between items-center tracking-tight">
                                        Mineral Intake
                                        <span className="text-[10px] bg-teal-50 text-teal-600 px-2 py-1 rounded-lg uppercase font-bold tracking-wide">Planned Targets</span>
                                    </h3>
                                    <div className="grid gap-5">
                                        {['calcium', 'magnesium', 'iron', 'zinc', 'iodine'].map((key) => {
                                            const data = stats.minerals[key] || { consumed: 0, total: 1 };

                                            const userGender = userData.gender || 'Male';
                                            const userRDA = RDA_TARGETS[userGender] || RDA_TARGETS.Male;

                                            const rda = userRDA.minerals[key] || { label: key, target: 100, unit: '' };
                                            const pct = Math.min(100, Math.round((data.consumed / (data.total || 1)) * 100));

                                            return (
                                                <div key={key} className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                                                    <div className="flex justify-between items-end mb-2">
                                                        <div>
                                                            <div className="text-sm font-bold text-gray-700">{rda.label}</div>
                                                            <div className="text-[10px] text-gray-400 font-medium">{pct}% of Plan</div>
                                                        </div>
                                                        <div className="text-xs font-black text-teal-600 bg-teal-50 px-2 py-1 rounded-lg">
                                                            {Math.round(data.consumed)} <span className="text-teal-400 font-medium">/ {Math.round(data.total)} {rda.unit}</span>
                                                        </div>
                                                    </div>
                                                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full transition-all duration-1000 ease-out shadow-sm"
                                                            style={{ width: `${pct}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {/* STICKY FOOTER FOR SAVE BUTTON */}
                    <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl border-t border-gray-100 p-4 pb-8 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                        <button
                            onClick={handleManualSave}
                            className="w-full bg-[#2E7D6B] text-white font-bold text-lg py-4 rounded-2xl shadow-lg hover:bg-[#256a5b] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                            Save Daily Log
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MealTrackerPage;
