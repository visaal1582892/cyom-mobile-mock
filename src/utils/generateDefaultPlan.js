import { userData } from '../data/store';
import { foodDatabase } from '../data/foodDatabase';
import { calculateBMR, calculateTDEE, calculateTargetCalories, calculateMealTargets, calculateMacroTargets } from './calculations';
import { getExtendedNutrients } from './nutrientData';

// Derive activity level from the exercise profile stored in userData
const deriveActivityLevel = () => {
    if (userData.exercises === 'No' || !userData.exercises) return 'sedentary';
    const shifts = userData.shifts || {};
    const activeShifts = userData.activeShifts || [];
    const totalHours = activeShifts.reduce((sum, shift) => {
        return sum + (parseFloat(shifts[shift]?.hours || 0) || 0);
    }, 0);
    if (totalHours < 0.5) return 'sedentary';
    if (totalHours < 1) return 'lightly active';
    if (totalHours < 1.75) return 'moderately active';
    return 'very active';
};

// Scale a food item to a given calorie target
const createItemInstance = (baseItem, targetCals) => {
    let baseCals = baseItem.calories;
    if (baseItem.composition?.length) {
        baseCals = baseItem.composition.reduce((a, b) => a + b.calories, 0) || baseCals;
    }
    const ratio = targetCals / (baseCals || 1);
    const servingWeight = baseItem.composition?.length
        ? baseItem.composition.reduce((a, b) => a + (b.weight || 0), 0)
        : (parseInt(String(baseItem.servingSize || '').match(/(\d+)\s*(?:g|ml)/i)?.[1]) || 100);
    const scaledWeight = Math.round(servingWeight * ratio);

    const itemForCalc = { ...baseItem, calculatedCalories: Math.round(targetCals) };
    const extended = getExtendedNutrients(itemForCalc);

    return {
        ...baseItem,
        uuid: Math.random().toString(36).slice(2),
        calculatedCalories: Math.round(targetCals),
        calculatedWeight: scaledWeight,
        macros: {
            protein: Math.round((baseItem.protein || 0) * ratio),
            carbs: Math.round((baseItem.carbs || 0) * ratio),
            fats: Math.round((baseItem.fats || 0) * ratio),
        },
        vitamins: extended.vitamins,
        minerals: extended.minerals,
        composition: baseItem.composition?.map(c => {
            const sCals = Math.round((c.calories || 0) * ratio);
            const subExt = getExtendedNutrients({ ...c, calculatedCalories: sCals });
            return {
                ...c,
                scaledWeight: Math.round((c.weight || 0) * ratio),
                scaledCalories: sCals,
                scaledProtein: Math.round((c.protein || 0) * ratio),
                scaledCarbs: Math.round((c.carbs || 0) * ratio),
                scaledFats: Math.round((c.fats || 0) * ratio),
                scaledVits: subExt.vitamins,
                scaledMins: subExt.minerals,
            };
        }),
    };
};

/**
 * Generates a sensible 1-day default meal plan based on the user's profile
 * and persists it to localStorage. Also sets it as the active plan.
 *
 * @returns {object} The generated plan object (same shape as handleSavePlan uses)
 */
export const generateDefaultPlan = () => {
    const {
        weight, height, age, gender,
        fitnessGoal, targetWeight, goalDuration,
        allergies = [],
    } = userData;

    // ---- 1. Determine diet preference (default Vegetarian for safety) ----
    const dietPreference = 'Vegetarian';
    const cuisineStyle = 'North Indian';
    const activeSlots = ['breakfast', 'lunch', 'snacks', 'dinner'];
    const eatingWindow = { start: 8, end: 20 };

    // ---- 2. Calorie Math ----
    const activityLevel = deriveActivityLevel();
    const targetWeightLoss = parseFloat(targetWeight) || 0;
    const bmr = calculateBMR(weight, height, age, gender);
    const tdee = calculateTDEE(bmr, activityLevel);
    const targetCalories = calculateTargetCalories(
        weight, height, age, gender, activityLevel, targetWeightLoss, goalDuration
    );
    const targetBodyWeight = weight - targetWeightLoss;
    const mealSplit = calculateMealTargets(targetCalories, activeSlots);
    const macroTargets = calculateMacroTargets(targetCalories, targetBodyWeight);

    // ---- 3. Allergy checker ----
    const allergyMap = {
        'Nuts & Legumes': { keywords: ['nut', 'almond', 'walnut', 'peanut', 'cashew', 'pistachio', 'pulse', 'dal', 'chana', 'rajma', 'bean', 'lentil', 'chickpea', 'pea', 'besan', 'toor', 'moong', 'urad'], subTypes: ['Pulse', 'Nut'] },
        'Seafood': { keywords: ['fish', 'prawn', 'shrimp', 'crab', 'lobster', 'salmon', 'tuna', 'sardine', 'mackerel', 'rohu', 'catla', 'seafood'], subTypes: [] },
        'Grains & Gluten': { keywords: ['wheat', 'oats', 'barley', 'rye', 'bread', 'roti', 'chapati', 'pasta', 'semolina', 'sooji', 'dalia', 'biscuit', 'cookie', 'cake', 'maida', 'corn', 'rice', 'millet', 'quinoa', 'vermicelli'], subTypes: ['Grain'] },
        'Dairy': { keywords: ['milk', 'cheese', 'paneer', 'curd', 'yogurt', 'ghee', 'butter', 'cream', 'whey', 'lassi', 'buttermilk'], subTypes: ['Dairy'] },
        'Eggs': { keywords: ['egg', 'omelette', 'bhurji'], subTypes: [], types: ['egg'] },
        'Soy & Plant Protein': { keywords: ['soy', 'tofu', 'edamame'], subTypes: [] },
        'Pollen': { keywords: ['honey', 'pollen'], subTypes: [] },
        'Seeds & Others': { keywords: ['seed', 'chia', 'flax', 'sunflower', 'pumpkin', 'sesame'], subTypes: [] },
    };

    const isAllergic = (item) => {
        if (!allergies || allergies.length === 0) return false;
        const lowerName = (item.name || '').toLowerCase();
        return allergies.some(allergy => {
            const rules = allergyMap[allergy];
            if (!rules) return false;
            if (rules.keywords.some(k => lowerName.includes(k))) return true;
            if (rules.subTypes.includes(item.subType)) return true;
            if (rules.types && rules.types.includes(item.type)) return true;
            return false;
        });
    };

    // ---- 4. Build 1-day plan ----
    const dayPlan = { breakfast: [], morningSnack: [], lunch: [], snacks: [], dinner: [] };

    activeSlots.forEach(slot => {
        const slotTarget = mealSplit[slot] || 400;

        let pool = foodDatabase.filter(f => {
            if (isAllergic(f)) return false;
            const isCookedAndSlot = f.isCooked && (
                (slot === 'snacks' || slot === 'morningSnack')
                    ? f.category === 'Snacks'
                    : f.category?.toLowerCase().includes(slot)
            );
            if (!isCookedAndSlot) return false;
            // Vegetarian filter
            return f.type === 'veg';
        });

        // Prefer North Indian, fall back to all
        const northIndianPool = pool.filter(f => f.region === 'North Indian' || f.region === 'All' || f.region === 'International');
        if (northIndianPool.length > 0) pool = northIndianPool;

        if (pool.length > 0) {
            const item = pool[Math.floor(Math.random() * pool.length)];
            dayPlan[slot].push(createItemInstance(item, slotTarget));
        }
    });

    const newPlanObj = {
        id: Date.now(),
        name: 'My Default Plan',
        createdAt: new Date().toISOString(),
        duration: 1,
        stats: { bmr, tdee, targetCalories, mealSplit, macroTargets, preferences: { dietPreference, cuisineStyle, allergies, beverageSchedule: [], activeSlots, eatingWindow } },
        preferences: { dietPreference, cuisineStyle, allergies, beverageSchedule: [], activeSlots, eatingWindow },
        plan: { 1: dayPlan },
    };

    // ---- 5. Persist ----
    const existing = JSON.parse(localStorage.getItem('cyom_saved_plans') || '[]');
    localStorage.setItem('cyom_saved_plans', JSON.stringify([newPlanObj, ...existing]));
    localStorage.setItem('cyom_tracker_active_plan_id', String(newPlanObj.id));

    return newPlanObj;
};
