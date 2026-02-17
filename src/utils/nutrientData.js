
// Helper to get extended nutrient data (Vitamins & Minerals) for food items
// Synchronized with MealPlannerPage logic for consistency.

export const getExtendedNutrients = (item) => {
    // 1. Determine Base Calories (Prefer Composition Sum)
    let baseCals = item.calories;
    if (item.composition && item.composition.length > 0) {
        baseCals = item.composition.reduce((a, b) => a + (b.calories || 0), 0) || baseCals;
    }

    const targetCals = item.calculatedCalories || baseCals;
    const ratio = baseCals > 0 ? targetCals / baseCals : 0;

    // Deterministic mock micro generation based on name hash
    const seedName = item.name || "food";
    const seed = seedName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const rand = (mod) => (seed % mod);

    const isVeg = item.type === 'veg';
    const isNonVeg = item.type === 'non-veg';
    const isDairy = item.subType === 'Dairy';
    const isGrain = item.subType === 'Grain' || item.category === 'Carb Source';
    const isFruit = item.category === 'Fruit';
    const isNut = item.subType === 'Nut' || item.subType === 'Fat';
    const isPulse = item.subType === 'Pulse' || item.name.includes('Dal') || item.name.includes('Bean');
    const isLeafy = item.name.includes('Spinach') || item.name.includes('Methi');

    // --- MOCK B-VITAMINS (Detailed) ---
    // Sources:
    // Thiamine (B1): Grains, Legumes, Nuts
    // Riboflavin (B2): Dairy, Eggs, Leafy Greens
    // Niacin (B3): Meats, Legumes, Grains
    // B6: Meats, Grains, Nuts, Banana
    // Folate (B9): Leafy Greens, Legumes
    // B12: Animal products only (Meat, Dairy, Eggs)

    const vitB1 = parseFloat(((isGrain || isPulse || isNut ? 0.3 : 0.05) * ratio + (rand(10) / 100)).toFixed(2));
    const vitB2 = parseFloat(((isDairy || isLeafy || isNonVeg ? 0.4 : 0.05) * ratio + (rand(10) / 100)).toFixed(2));
    const vitB3 = parseFloat(((isNonVeg || isPulse || isGrain ? 4 : 0.5) * ratio + rand(2)).toFixed(1));
    const vitB6 = parseFloat(((isNonVeg || isGrain || isNut ? 0.5 : 0.1) * ratio + (rand(20) / 100)).toFixed(2));
    const vitB9 = Math.round((isLeafy || isPulse ? 80 : 10) * ratio + rand(20)); // Folate
    const vitB12 = parseFloat(((isNonVeg || isDairy || item.type === 'egg' ? 1.0 : 0) * ratio + (rand(10) / 100)).toFixed(2));

    const mockVits = {
        // Aggregated B-Complex (Not used directly for checking, but useful for overview if needed)
        // We will calculate the "B-Vitamin Score" in the UI based on these individual values vs Targets.
        thiamine: vitB1,
        riboflavin: vitB2,
        niacin: vitB3,
        vitB6: vitB6,
        folate: vitB9,
        vitB12: vitB12,

        vitC: Math.round((isVeg || isFruit ? 25 : 0) * ratio + rand(15)),
        vitA: Math.round((isLeafy || isNonVeg || isDairy || item.name.includes('Carrot') ? 200 : 10) * ratio + rand(50)),
        vitD: Math.round((isNonVeg || isDairy || item.type === 'egg' ? 40 : 0) * ratio + rand(10)), // IU
    };

    const mockMins = {
        iron: parseFloat(((isNonVeg || isLeafy || isPulse ? 4 : 0.5) * ratio).toFixed(1)),
        calcium: Math.round((isDairy || isLeafy ? 250 : 20) * ratio + rand(30)),
        magnesium: Math.round((isGrain || isNut || isLeafy ? 80 : 10) * ratio + rand(20)),
        zinc: parseFloat(((isNonVeg || isNut || isPulse ? 3 : 0.5) * ratio + rand(10) / 10).toFixed(1)),
        iodine: Math.round((isNonVeg || isDairy ? 40 : 10) * ratio + rand(10)),
    };

    return {
        ...item,
        carbs: item.carbs || 0,
        protein: item.protein || 0,
        fats: item.fats || 0,
        vitamins: mockVits,
        minerals: mockMins
    };
};

// ICMR-NIN RDA 2020 TARGETS
export const RDA_TARGETS = {
    Male: {
        vitamins: {
            thiamine: { label: 'Thiamine', target: 1.8, unit: 'mg' },
            riboflavin: { label: 'Riboflavin', target: 2.5, unit: 'mg' },
            niacin: { label: 'Niacin', target: 18, unit: 'mg' },
            vitB6: { label: 'Vitamin B6', target: 2.4, unit: 'mg' },
            folate: { label: 'Folate', target: 300, unit: 'mcg' },
            vitB12: { label: 'Vitamin B12', target: 2.2, unit: 'mcg' },
            vitC: { label: 'Vitamin C', target: 80, unit: 'mg' },
            vitA: { label: 'Vitamin A', target: 1000, unit: 'mcg' },
            vitD: { label: 'Vitamin D', target: 600, unit: 'IU' }
        },
        minerals: {
            calcium: { label: 'Calcium', target: 1000, unit: 'mg' },
            magnesium: { label: 'Magnesium', target: 440, unit: 'mg' },
            iron: { label: 'Iron', target: 19, unit: 'mg' },
            zinc: { label: 'Zinc', target: 17, unit: 'mg' },
            iodine: { label: 'Iodine', target: 150, unit: 'mcg' }
        }
    },
    Female: {
        vitamins: {
            thiamine: { label: 'Thiamine', target: 1.7, unit: 'mg' },
            riboflavin: { label: 'Riboflavin', target: 2.4, unit: 'mg' },
            niacin: { label: 'Niacin', target: 14, unit: 'mg' },
            vitB6: { label: 'Vitamin B6', target: 1.9, unit: 'mg' },
            folate: { label: 'Folate', target: 220, unit: 'mcg' },
            vitB12: { label: 'Vitamin B12', target: 2.2, unit: 'mcg' },
            vitC: { label: 'Vitamin C', target: 65, unit: 'mg' },
            vitA: { label: 'Vitamin A', target: 840, unit: 'mcg' },
            vitD: { label: 'Vitamin D', target: 600, unit: 'IU' }
        },
        minerals: {
            calcium: { label: 'Calcium', target: 1000, unit: 'mg' },
            magnesium: { label: 'Magnesium', target: 370, unit: 'mg' },
            iron: { label: 'Iron', target: 29, unit: 'mg' },
            zinc: { label: 'Zinc', target: 13, unit: 'mg' },
            iodine: { label: 'Iodine', target: 150, unit: 'mcg' }
        }
    }
};
