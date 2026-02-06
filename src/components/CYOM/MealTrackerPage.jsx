import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userData } from '../../data/store';
import { foodDatabase } from '../../data/foodDatabase';

const MealTrackerPage = () => {
    const navigate = useNavigate();

    // --- STATE ---
    const [savedPlans, setSavedPlans] = useState([]);
    const [selectedPlanId, setSelectedPlanId] = useState(null);
    const [activeDay, setActiveDay] = useState(1);

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
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [activeSearchSlot, setActiveSearchSlot] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    // --- INITIAL LOAD ---
    useEffect(() => {
        const plans = JSON.parse(localStorage.getItem('cyom_saved_plans') || '[]');
        const logs = JSON.parse(localStorage.getItem('cyom_tracking_logs') || '{}');
        const extras = JSON.parse(localStorage.getItem('cyom_extra_tracking_items') || '{}');
        const removed = JSON.parse(localStorage.getItem('cyom_removed_items') || '{}');

        setSavedPlans(plans);
        setTrackingLogs(logs);
        setExtraLogs(extras);
        setRemovedLogs(removed);

        if (plans.length > 0) {
            setSelectedPlanId(plans[0].id);
        }
        setLoading(false);
    }, []);

    // --- SEARCH HELPERS ---
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }
        const lowerQ = searchQuery.toLowerCase();
        const results = foodDatabase.filter(item =>
            item.name.toLowerCase().includes(lowerQ) ||
            (item.keywords && item.keywords.some(k => k.toLowerCase().includes(lowerQ)))
        ).slice(0, 15); // Limit results
        setSearchResults(results);
    }, [searchQuery]);

    const handleOpenSearch = (slot) => {
        setActiveSearchSlot(slot);
        setSearchQuery('');
        setSearchResults([]);
        setIsSearchOpen(true);
    };

    const handleAddItem = (item) => {
        if (!selectedPlanId || !activeSearchSlot) return;

        const key = `${selectedPlanId}_${activeDay}_${activeSearchSlot}`;
        const currentExtras = extraLogs[key] || [];

        // Create a tracking-friendly item instance
        const newUuid = 'extra_' + Date.now() + Math.random().toString(36).substr(2, 9);
        const newItem = {
            ...item,
            uuid: newUuid,
            isExtra: true,
            calculatedCalories: item.calories, // Default to 1 serving
            calculatedWeight: item.servingSize || "1 Serving"
        };

        const newExtras = { ...extraLogs, [key]: [...currentExtras, newItem] };

        setExtraLogs(newExtras);
        localStorage.setItem('cyom_extra_tracking_items', JSON.stringify(newExtras));

        // Auto-select the new item!
        const logKey = `${selectedPlanId}_${activeDay}_${activeSearchSlot}_${newUuid}`;
        const newLogs = { ...trackingLogs, [logKey]: true };
        setTrackingLogs(newLogs);
        localStorage.setItem('cyom_tracking_logs', JSON.stringify(newLogs));

        setIsSearchOpen(false);
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

    const calculateProgress = () => {
        const plan = getActivePlan();
        if (!plan) return { val: 0, total: 0, percent: 0 };

        const dayPlan = plan.plan[activeDay] || {};
        const slots = ['breakfast', 'morningSnack', 'lunch', 'snacks', 'dinner'];

        let totalCals = 0;
        let consumedCals = 0;

        slots.forEach(slot => {
            // Plan Items (Filter out removed ones)
            const items = dayPlan[slot] || [];
            items.forEach(item => {
                if (!isRemoved(slot, item.uuid)) {
                    totalCals += item.calculatedCalories;
                    if (isConsumed(slot, item.uuid)) {
                        consumedCals += item.calculatedCalories;
                    }
                }
            });

            // Extra Items
            const extraItems = extraLogs[`${selectedPlanId}_${activeDay}_${slot}`] || [];
            extraItems.forEach(item => {
                totalCals += (item.calculatedCalories || 0);
                if (isConsumed(slot, item.uuid)) {
                    consumedCals += (item.calculatedCalories || 0);
                }
            });
        });

        return {
            val: consumedCals,
            total: totalCals || 1, // Avoid div/0
            percent: Math.round((consumedCals / (totalCals || 1)) * 100)
        };
    };

    const progress = calculateProgress();
    const currentPlan = getActivePlan();

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

            {/* --- SEARCH MODAL --- */}
            {isSearchOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center text-[#1F2933]">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsSearchOpen(false)}></div>
                    <div className="bg-white w-full sm:w-[500px] h-[80vh] sm:h-[600px] rounded-t-[30px] sm:rounded-[30px] shadow-2xl z-10 flex flex-col overflow-hidden animate-slide-in-up">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-black text-xl text-[#2E7D6B]">Add to {activeSearchSlot?.replace(/([A-Z])/g, ' $1').trim()}</h3>
                            <button onClick={() => setIsSearchOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="p-4 bg-white sticky top-0 z-20">
                            <div className="relative">
                                <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="Search for food (e.g. Rice, Chicken)..."
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#2E7D6B]/50 font-bold text-gray-700 placeholder-gray-400 outline-none"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 custom-scrollbar">
                            {searchResults.length === 0 && searchQuery && (
                                <div className="text-center py-10 text-gray-400 font-medium">No results found for "{searchQuery}"</div>
                            )}
                            {searchResults.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => handleAddItem(item)}
                                    className="w-full text-left bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:border-[#2E7D6B] hover:shadow-md transition-all flex justify-between items-center group"
                                >
                                    <div>
                                        <div className="font-bold text-gray-800 group-hover:text-[#2E7D6B]">{item.name}</div>
                                        <div className="text-xs text-gray-400 font-medium">{item.calories} kcal • {item.servingSize || '1 Serving'}</div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-[#2E7D6B] group-hover:bg-[#2E7D6B] group-hover:text-white transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    </div>
                                </button>
                            ))}
                            {!searchQuery && (
                                <div className="text-center py-20 text-gray-400 opacity-50">
                                    <div className="text-4xl mb-2">🔍</div>
                                    <div className="text-sm font-bold">Start typing to search</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

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
            {isMenuOpen && (
                <div className="fixed inset-0 z-50 flex text-[#1F2933]">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
                    <div className="relative w-3/4 max-w-xs bg-white h-full shadow-2xl p-6 flex flex-col justify-between animate-slide-in-left">
                        <div>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-[#1F2933]">Menu</h2>
                                <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="space-y-2">
                                <button onClick={() => { navigate('/cyom-dashboard'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-600 font-medium flex items-center gap-3">
                                    <span className="text-lg">📊</span> Dashboard
                                </button>
                                <button onClick={() => { navigate('/goal-selection'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl bg-[#F0FDF9] text-[#2E7D6B] font-bold flex items-center gap-3">
                                    <span className="text-lg">🎯</span> Goal Selection
                                </button>
                                <button onClick={() => { navigate('/saved-plans'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-600 font-medium flex items-center gap-3">
                                    <span className="text-lg">📂</span> Saved Plans
                                </button>
                                <button onClick={() => { navigate('/'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-600 font-medium flex items-center gap-3">
                                    <span className="text-lg">🏠</span> Back to Home
                                </button>
                            </div>
                        </div>
                        <div className="text-center text-xs text-gray-400">v1.0.0 CYOM Beta</div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto pb-10 custom-scrollbar px-4">
                <div className="w-full max-w-2xl mx-auto mt-4">
                    <div className="mb-4 ml-2 text-white">
                        <h1 className="text-xl font-bold">Today's Intake</h1>
                        <p className="text-xs opacity-80">Track your calories and nutrient goals</p>
                    </div>

                    <div className="mt-4 bg-white/94 backdrop-blur-xl p-4 sm:p-6 rounded-[28px] shadow-2xl border border-white/50 text-[#1F2933]">
                        {/* --- WHITE CARD CONTENT (Old Header Parts + Tracker) --- */}

                        <div className="flex items-center justify-between mb-4">
                            <button onClick={() => navigate('/cyom-dashboard')} className="p-2 -ml-2 text-gray-400 hover:text-gray-600 flex items-center gap-1">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                <span className="text-xs font-bold">Dashboard</span>
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
                                            <h3 className="text-sm font-black text-gray-800 uppercase tracking-wide flex items-center gap-2">
                                                <span className={`w-2 h-6 rounded-full ${slot === 'breakfast' ? 'bg-orange-400' : slot === 'lunch' ? 'bg-yellow-400' : 'bg-indigo-400'}`}></span>
                                                {slot.replace(/([A-Z])/g, ' $1').trim()}
                                            </h3>

                                            <button
                                                onClick={() => handleOpenSearch(slot)}
                                                className="text-xs font-bold text-[#2E7D6B] bg-[#2E7D6B]/10 px-3 py-1.5 rounded-lg hover:bg-[#2E7D6B] hover:text-white transition-colors flex items-center gap-1"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                                                Add Food
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {allItems.length === 0 && (
                                                <div className="p-4 border-2 border-dashed border-gray-100 rounded-xl text-center text-xs text-gray-400 font-medium italic">
                                                    No items tracked yet
                                                </div>
                                            )}

                                            {allItems.map((item, idx) => {
                                                const checked = isConsumed(slot, item.uuid);
                                                const isExtra = item.isExtra;

                                                return (
                                                    <div
                                                        key={item.uuid}
                                                        onClick={() => toggleConsumed(slot, item.uuid)}
                                                        className={`group bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer transition-all duration-200 ${checked ? 'opacity-60 bg-gray-50' : 'hover:-translate-y-0.5 hover:shadow-md'}`}
                                                    >
                                                        {/* Checkbox */}
                                                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors shrink-0 ${checked ? 'bg-[#2E7D6B] border-[#2E7D6B]' : 'border-gray-300 bg-gray-50 group-hover:border-[#2E7D6B]'}`}>
                                                            {checked && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`text-sm font-bold text-gray-800 leading-tight truncate ${checked ? 'line-through text-gray-400' : ''}`}>
                                                                    {item.name}
                                                                </div>
                                                                {isExtra && <span className="px-1.5 py-0.5 rounded-md bg-orange-100 text-orange-600 text-[9px] font-bold uppercase tracking-wide">Extra</span>}
                                                            </div>
                                                            <div className="text-xs text-gray-400 font-medium">
                                                                {item.calculatedCalories} kcal • {item.calculatedWeight}
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
                </div>
            </div>
        </div>
    );
};

export default MealTrackerPage;
