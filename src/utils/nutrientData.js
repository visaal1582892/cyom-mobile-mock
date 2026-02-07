
// Helper to get extended nutrient data (Vitamins & Minerals) for food items
// Synchronized with MealPlannerPage logic for consistency.

export const getExtendedNutrients = (item) => {
    // 1. Determine Base Calories (Prefer Composition Sum)
    let baseCals = item.calories;
    if (item.composition && item.composition.length > 0) {
        baseCals = item.composition.reduce((a, b) => a + (b.calories || 0), 0) || baseCals;
    }

    // 2. Calculate Ratio (Current Calculated / Base)
    // If calculatedCalories is missing (e.g. searching), assume 100g or 1 serving ratio?
    // For specific instances in Tracker, valid 'calculatedCalories' should exist. 
    // If not (raw DB item), ratio is 1 (per serving/100g).
    const targetCals = item.calculatedCalories || baseCals;
    const ratio = baseCals > 0 ? targetCals / baseCals : 0;
    // NOTE: In Tracker, 'item' might be a raw DB item (ratio=1) OR a scaled item. 
    // If it's a raw item, we want values per THAT item's serving/100g. 
    // If it's a scaled item, we want values scaled. 
    // 'getExtendedNutrients' is called in 'calculateStats' on ALREADY SCALED items (extraItems/planItems).
    // So 'calculatedCalories' should be present.

    // Deterministic mock micro generation based on name hash
    const seedName = item.name || "food";
    const seed = seedName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const rand = (mod) => (seed % mod);

    const isVeg = item.type === 'veg';
    const isNonVeg = item.type === 'non-veg';
    const isDairy = item.subType === 'Dairy';
    const isGrain = item.subType === 'Grain';
    const isFruit = item.category === 'Fruit';
    const isNut = item.subType === 'Nut';
    const isCooked = item.isCooked;

    // Logic copied from MealPlannerPage::createItemInstance
    const mockVits = {
        vitB: parseFloat(((isNonVeg || isGrain ? 1.5 : 0.5) * ratio).toFixed(1)), // B-Complex proxy
        vitC: Math.round((isVeg || isFruit ? 20 : 0) * ratio + rand(10)),
        vitE: Math.round((isGrain || isNut ? 5 : 0.5) * ratio + rand(2)),
        vitK: Math.round((isVeg ? 40 : 2) * ratio + rand(15))
    };

    const mockMins = {
        iron: parseFloat(((isNonVeg ? 3 : 1) * ratio).toFixed(1)),
        calcium: Math.round((isDairy ? 200 : 20) * ratio + rand(30)),
        magnesium: Math.round(50 * ratio + rand(20)),
        zinc: parseFloat((5 * ratio + rand(2) / 10).toFixed(1)),
        phosphorus: Math.round((isNonVeg || isDairy ? 150 : 40) * ratio + rand(20)),
        potassium: Math.round((isVeg || isFruit ? 300 : 100) * ratio + rand(50)),
        sodium: Math.round((isCooked ? 250 : 20) * ratio + rand(10))
    };

    return {
        ...item,
        // Ensure macros exist
        carbs: item.carbs || 0,
        protein: item.protein || 0,
        fats: item.fats || 0,

        // Add Micros
        vitamins: mockVits,
        minerals: mockMins
    };
};

export const RDA_TARGETS = {
    vitamins: {
        vitB: { label: 'Vitamin B', target: 2.4, unit: 'mcg' },
        vitC: { label: 'Vitamin C', target: 90, unit: 'mg' },
        vitE: { label: 'Vitamin E', target: 15, unit: 'mg' },
        vitK: { label: 'Vitamin K', target: 120, unit: 'mcg' },
    },
    minerals: {
        calcium: { label: 'Calcium', target: 1000, unit: 'mg' },
        iron: { label: 'Iron', target: 18, unit: 'mg' },
        phosphorus: { label: 'Phosphorus', target: 700, unit: 'mg' },
        magnesium: { label: 'Magnesium', target: 400, unit: 'mg' },
        potassium: { label: 'Potassium', target: 3500, unit: 'mg' },
        sodium: { label: 'Sodium', target: 2300, unit: 'mg' },
        zinc: { label: 'Zinc', target: 11, unit: 'mg' },
    }
};
