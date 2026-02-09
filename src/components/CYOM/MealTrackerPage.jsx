import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userData } from '../../data/store';
import SidebarMenu from './SidebarMenu';
import { foodDatabase } from '../../data/foodDatabase';
import { getExtendedNutrients, RDA_TARGETS } from '../../utils/nutrientData';

const MealTrackerPage = () => {
    const navigate = useNavigate();

    // --- STATE ---
    const [savedPlans, setSavedPlans] = useState([]);
    const [selectedPlanId, setSelectedPlanId] = useState(null);
    const [activeDay, setActiveDay] = useState(1);

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
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Search Logic
    const [isSearchOpen, setIsSearchOpen] = useState(false); // Kept for logic, but might not use modal anymore
    const [activeSearchSlot, setActiveSearchSlot] = useState(null); // Slot where inline input is active
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [inputWeight, setInputWeight] = useState(''); // Default empty, user types value
    const [selectedFoodItem, setSelectedFoodItem] = useState(null); // Item selected from autocomplete
    const [capturedImages, setCapturedImages] = useState({}); // { [planId_day_slot]: 'data:image/...' }

    // --- INITIAL LOAD ---
    useEffect(() => {
        const plans = JSON.parse(localStorage.getItem('cyom_saved_plans') || '[]');
        const logs = JSON.parse(localStorage.getItem('cyom_tracking_logs') || '{}');
        const extras = JSON.parse(localStorage.getItem('cyom_extra_tracking_items') || '{}');
        const removed = JSON.parse(localStorage.getItem('cyom_removed_items') || '{}');

        setSavedPlans(plans);
        setTrackingLogs(logs);
        setExtraLogs(extras);
        setExtraLogs(extras);
        setRemovedLogs(removed);

        const images = JSON.parse(localStorage.getItem('cyom_captured_plates') || '{}');
        setCapturedImages(images);

        if (plans.length > 0) {
            const savedId = localStorage.getItem('cyom_tracker_active_plan_id');
            // ID is number, localStorage is string. Compare as strings.
            const targetPlan = plans.find(p => String(p.id) === String(savedId)) || plans[0];
            setSelectedPlanId(targetPlan.id);
        }
        setLoading(false);
    }, []);

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
        // If already open for this slot, close it? Or just reset?
        if (activeSearchSlot === slot) {
            // Close
            setActiveSearchSlot(null);
            setSearchQuery('');
            setInputWeight('');
            setSelectedFoodItem(null);
        } else {
            // Open for this slot
            setActiveSearchSlot(slot);
            setSearchQuery('');
            setInputWeight('');
            setSelectedFoodItem(null);
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

        const newUuid = 'extra_' + Date.now() + Math.random().toString(36).substr(2, 9);
        const newItem = {
            ...scaledItem,
            uuid: newUuid,
            isExtra: true
        };

        const newExtras = { ...extraLogs, [key]: [...currentExtras, newItem] };

        setExtraLogs(newExtras);
        localStorage.setItem('cyom_extra_tracking_items', JSON.stringify(newExtras));

        // Auto-select
        const logKey = `${selectedPlanId}_${activeDay}_${activeSearchSlot}_${newUuid}`;
        const newLogs = { ...trackingLogs, [logKey]: true };
        setTrackingLogs(newLogs);
        localStorage.setItem('cyom_tracking_logs', JSON.stringify(newLogs));

        // Reset
        setSearchQuery('');
        setInputWeight('');
        setSelectedFoodItem(null);
        // Keep slot open for more adding? Or close? Let's keep open for rapid entry.
        // setActiveSearchSlot(null); 
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

    const handleLogout = () => {
        navigate('/login');
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
        if (!selectedPlanId) return false;
        return !!trackingLogs[`${selectedPlanId}_${activeDay}_${slot}_${itemUuid}`];
    };

    const isRemoved = (slot, itemUuid) => {
        if (!selectedPlanId) return false;
        return !!removedLogs[`${selectedPlanId}_${activeDay}_${slot}_${itemUuid}`];
    };

    const calculateStats = () => {
        const plan = getActivePlan();
        if (!plan) return null;

        const dayPlan = plan.plan[activeDay] || {};
        const slots = ['breakfast', 'morningSnack', 'lunch', 'snacks', 'dinner'];

        let stats = {
            calories: { consumed: 0, total: 0 },
            macros: {
                carbs: { consumed: 0, total: 0 },
                protein: { consumed: 0, total: 0 },
                fats: { consumed: 0, total: 0 }
            },
            vitamins: {
                vitB: { consumed: 0, total: 0 },
                vitC: { consumed: 0, total: 0 },
                vitE: { consumed: 0, total: 0 },
                vitK: { consumed: 0, total: 0 }
            },
            minerals: {
                calcium: { consumed: 0, total: 0 },
                iron: { consumed: 0, total: 0 },
                phosphorus: { consumed: 0, total: 0 },
                magnesium: { consumed: 0, total: 0 },
                potassium: { consumed: 0, total: 0 },
                sodium: { consumed: 0, total: 0 },
                zinc: { consumed: 0, total: 0 }
            }
        };

        const getItemStats = (rawItem) => {
            // Need to ensure nutrients exist
            const enriched = getExtendedNutrients(rawItem);
            return enriched;
        };

        slots.forEach(slot => {
            // Plan Items
            const items = dayPlan[slot] || [];

            // Iterate all plan items for Target calculation, regardless of 'removed' status
            items.forEach(rawItem => {
                const item = getItemStats(rawItem);
                const removed = isRemoved(slot, item.uuid);

                // Always add to Total (Target)
                stats.calories.total += (item.calculatedCalories || 0);
                stats.macros.carbs.total += (item.carbs || 0);
                stats.macros.protein.total += (item.protein || 0);
                stats.macros.fats.total += (item.fats || 0);

                Object.keys(stats.vitamins).forEach(k => {
                    if (item.vitamins && item.vitamins[k]) stats.vitamins[k].total += item.vitamins[k];
                });
                Object.keys(stats.minerals).forEach(k => {
                    if (item.minerals && item.minerals[k]) stats.minerals[k].total += item.minerals[k];
                });

                // Only add to Consumed if NOT removed AND is checked
                if (!removed && isConsumed(slot, item.uuid)) {
                    stats.calories.consumed += (item.calculatedCalories || 0);
                    stats.macros.carbs.consumed += (item.carbs || 0);
                    stats.macros.protein.consumed += (item.protein || 0);
                    stats.macros.fats.consumed += (item.fats || 0);

                    Object.keys(stats.vitamins).forEach(k => {
                        if (item.vitamins && item.vitamins[k]) stats.vitamins[k].consumed += item.vitamins[k];
                    });
                    Object.keys(stats.minerals).forEach(k => {
                        if (item.minerals && item.minerals[k]) stats.minerals[k].consumed += item.minerals[k];
                    });
                }
            });

            // Extra Items (Only affect CONSUMED, not PLAN TOTAL targets)
            const extraItems = extraLogs[`${selectedPlanId}_${activeDay}_${slot}`] || [];
            extraItems.forEach(rawItem => {
                const item = getItemStats(rawItem);

                if (isConsumed(slot, item.uuid)) {
                    stats.calories.consumed += (item.calculatedCalories || 0);
                    stats.macros.carbs.consumed += (item.carbs || 0);
                    stats.macros.protein.consumed += (item.protein || 0);
                    stats.macros.fats.consumed += (item.fats || 0);

                    Object.keys(stats.vitamins).forEach(k => {
                        if (item.vitamins && item.vitamins[k]) stats.vitamins[k].consumed += item.vitamins[k];
                    });
                    Object.keys(stats.minerals).forEach(k => {
                        if (item.minerals && item.minerals[k]) stats.minerals[k].consumed += item.minerals[k];
                    });
                }
            });
        });

        return stats;
    };

    const stats = calculateStats();
    const currentPlan = getActivePlan();

    const progress = stats ? {
        val: Math.round(stats.calories.consumed),
        total: Math.round(stats.calories.total) || 1,
        percent: Math.min(100, Math.round((stats.calories.consumed / (stats.calories.total || 1)) * 100))
    } : { val: 0, total: 1, percent: 0 };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-[#2E7D6B] font-bold">Loading Tracker...</div>;

    if (savedPlans.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">No Plans Found</h2>
                <p className="text-gray-500 mb-6">You need to create a meal plan before you can track it.</p>
                <button
                    onClick={() => navigate('/goal-selection')}
                    className="px-8 py-3 bg-[#2E7D6B] text-white rounded-xl font-bold hover:bg-[#256a5b] transition-all shadow-lg"
                >
                    Create Plan
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#43AA95] to-[#A8E6CF] font-sans relative overflow-hidden text-white">

            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-full h-[50vh] bg-gradient-to-b from-black/10 to-transparent pointer-events-none"></div>

            <div className="absolute top-0 right-0 w-full h-[50vh] bg-gradient-to-b from-black/10 to-transparent pointer-events-none"></div>

            {/* Header / Status Bar Area */}
            <div className="pt-6 px-6 flex justify-between items-center relative z-20">
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsMenuOpen(true)} className="p-2 rounded-full hover:bg-white/20 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                    </button>
                    <div>
                        <div className="text-xs opacity-80 font-medium text-green-100">Welcome</div>
                        <div className="flex items-center gap-2">
                            <div className="text-lg font-bold">{userData.name}! </div>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/50 shadow-md hover:border-white transition-all"
                    >
                        <img src={userData.image} alt="Profile" className="w-full h-full object-cover" />
                    </button>

                    {isProfileOpen && (
                        <>
                            <div className="fixed inset-0 z-10 cursor-default" onClick={() => setIsProfileOpen(false)}></div>
                            <div className="absolute right-0 top-14 w-48 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 py-2 z-20 animate-fade-in-up text-gray-800">
                                <div className="px-4 py-2 border-b border-gray-100 mb-1">
                                    <div className="font-bold text-sm truncate">{userData.name}</div>
                                    <div className="text-xs text-gray-500">Premium Member</div>
                                </div>
                                <button onClick={() => navigate('/profile')} className="w-full text-left px-4 py-2 hover:bg-[#2E7D6B]/10 hover:text-[#2E7D6B] text-sm font-medium transition-colors flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    My Profile
                                </button>
                                <button onClick={() => navigate('/saved-plans')} className="w-full text-left px-4 py-2 hover:bg-[#2E7D6B]/10 hover:text-[#2E7D6B] text-sm font-medium transition-colors flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                    </svg>
                                    Saved Plans
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 hover:bg-red-50 hover:text-red-500 text-sm font-medium transition-colors flex items-center gap-2 text-red-500"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Logout
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
            {/* Sidebar Menu */}
            <SidebarMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto pb-10 custom-scrollbar px-4">
                <div className="w-full max-w-2xl mx-auto mt-4">
                    <div className="mb-6 ml-2 text-white flex justify-between items-end">
                        <div>
                            <h1 className="text-xl font-bold">Today's Intake</h1>
                            <p className="text-xs opacity-80">Track your calories and nutrient goals</p>
                        </div>
                        {/* MAIN TABS */}
                        <div className="flex bg-white/20 backdrop-blur-md rounded-xl p-1 gap-1">
                            <button
                                onClick={() => setActiveTab('input')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'input' ? 'bg-white text-[#2E7D6B] shadow-sm' : 'text-white hover:bg-white/10'}`}
                            >
                                Input Meals
                            </button>
                            <button
                                onClick={() => setActiveTab('insights')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'insights' ? 'bg-white text-[#2E7D6B] shadow-sm' : 'text-white hover:bg-white/10'}`}
                            >
                                Insights
                            </button>
                        </div>
                    </div>

                    {activeTab === 'input' && (
                        <div className="mt-4 bg-white/94 backdrop-blur-xl p-4 sm:p-6 rounded-[28px] shadow-2xl border border-white/50 text-[#1F2933] animate-fade-in-up">
                            {/* --- WHITE CARD CONTENT (Old Header Parts + Tracker) --- */}

                            <div className="flex items-center justify-between mb-4">
                                <button onClick={() => navigate('/cyom-home')} className="p-2 -ml-2 text-gray-400 hover:text-gray-600 flex items-center gap-1">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                    <span className="text-xs font-bold">Home</span>
                                </button>
                                {/* Plan Selector */}
                                {/* Plan Selector (Searchable Dropdown) */}
                                <div className="relative z-30">
                                    <button
                                        onClick={() => setPlanSelectorOpen(!planSelectorOpen)}
                                        className="flex items-center gap-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all px-4 py-2 rounded-xl text-xs font-bold text-gray-700 min-w-[140px] justify-between"
                                    >
                                        <span className="truncate max-w-[120px]">{currentPlan ? currentPlan.name : 'Select Plan'}</span>
                                        <svg className={`w-4 h-4 text-gray-400 transition-transform ${planSelectorOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </button>

                                    {planSelectorOpen && (
                                        <>
                                            <div className="fixed inset-0 z-30" onClick={() => setPlanSelectorOpen(false)}></div>
                                            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 z-40 overflow-hidden animate-fade-in-up">
                                                <div className="p-3 border-b border-gray-50 bg-gray-50/50">
                                                    <div className="relative">
                                                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                                        <input
                                                            autoFocus
                                                            value={planSearchQuery}
                                                            onChange={(e) => setPlanSearchQuery(e.target.value)}
                                                            placeholder="Search plans..."
                                                            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#2E7D6B] focus:ring-1 focus:ring-[#2E7D6B]/20 transition-all placeholder-gray-300 text-gray-700"
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
                                                                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between mb-0.5 ${selectedPlanId === p.id ? 'bg-[#2E7D6B]/10 text-[#2E7D6B]' : 'hover:bg-gray-50 text-gray-600'}`}
                                                            >
                                                                <span className="truncate">{p.name}</span>
                                                                {selectedPlanId === p.id && <svg className="w-4 h-4 text-[#2E7D6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                                                            </button>
                                                        ))
                                                    ) : (
                                                        <div className="p-4 text-center text-gray-400 text-xs italic">No plans found</div>
                                                    )}
                                                </div>
                                                <div className="p-2 border-t border-gray-50 bg-gray-50/30">
                                                    <button onClick={() => navigate('/goal-selection')} className="w-full py-2 text-center text-[10px] uppercase font-black text-[#2E7D6B] hover:bg-[#2E7D6B]/5 rounded-lg transition-colors">
                                                        + Create New Plan
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

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

                            {/* --- PROGRESS BAR --- */}
                            <div className="bg-gray-50 p-4 rounded-2xl shadow-inner border border-gray-100 mb-8">
                                <div className="flex justify-between items-end mb-2">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Calories</div>
                                    <div className="text-xl font-black text-[#2E7D6B]">{progress.val}<span className="text-sm font-bold text-gray-300"> / {progress.total}</span></div>
                                </div>
                                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-[#2E7D6B] to-[#43AA95] transition-all duration-500 rounded-full"
                                        style={{ width: `${progress.percent}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* --- CHECKLIST --- */}
                            <div className="space-y-8">
                                {['breakfast', 'morningSnack', 'lunch', 'snacks', 'dinner'].map(slot => {
                                    const planItems = currentPlan?.plan?.[activeDay]?.[slot] || [];
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
                                                    <div className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
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
                                                        className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 text-[#2E7D6B] bg-[#2E7D6B]/10 hover:bg-[#2E7D6B] hover:text-white"
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
                                                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${activeSearchSlot === slot ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'text-[#2E7D6B] bg-[#2E7D6B]/10 hover:bg-[#2E7D6B] hover:text-white'}`}
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
                                                                ADD +
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

                                                            {/* Delete for ALL Items */}
                                                            <div className="shrink-0 flex items-center gap-2">
                                                                {checked && <span className="text-[10px] font-bold text-[#2E7D6B] bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wide">Done</span>}

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
                                        {/* Show B, C, E, K explicitly to match Planner */}
                                        {['vitB', 'vitC', 'vitE', 'vitK'].map((key) => {
                                            const data = stats.vitamins[key] || { consumed: 0, total: 1 };
                                            const rda = RDA_TARGETS.vitamins[key] || { label: key, target: 100, unit: '' };
                                            // Ensure we use the RDA target as the "Total" if the plan doesn't specify one, 
                                            // but 'stats' uses plan sums. If plan is empty, default to 1 to avoid div/0.
                                            // Actually stats.vitamins total comes from the plan item sums. 

                                            const pct = Math.min(100, Math.round((data.consumed / (data.total || 1)) * 100));

                                            return (
                                                <div key={key} className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                                                    <div className="flex justify-between items-end mb-2">
                                                        <div>
                                                            <div className="text-sm font-bold text-gray-700">{rda.label}</div>
                                                            <div className="text-[10px] text-gray-400 font-medium">{pct}% of Goal</div>
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
                                        {/* Show all minerals explicitly to match Planner */}
                                        {['calcium', 'iron', 'phosphorus', 'magnesium', 'potassium', 'sodium', 'zinc'].map((key) => {
                                            const data = stats.minerals[key] || { consumed: 0, total: 1 };
                                            const rda = RDA_TARGETS.minerals[key] || { label: key, target: 100, unit: '' };
                                            const pct = Math.min(100, Math.round((data.consumed / (data.total || 1)) * 100));

                                            return (
                                                <div key={key} className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                                                    <div className="flex justify-between items-end mb-2">
                                                        <div>
                                                            <div className="text-sm font-bold text-gray-700">{rda.label}</div>
                                                            <div className="text-[10px] text-gray-400 font-medium">{pct}% of Goal</div>
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
                </div>
            </div>
        </div>
    );
};

export default MealTrackerPage;
