export const calculateBMR = (weight, height, age, gender) => {
    // Mifflin-St Jeor Equation
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    if ((gender || 'male').toLowerCase() === 'male') {
        bmr += 5;
    } else {
        bmr -= 161;
    }
    return Math.round(bmr);
};

export const calculateTDEE = (bmr, activityLevel) => {
    const multipliers = {
        'sedentary': 1.2,
        'lightly active': 1.375,
        'moderately active': 1.55,
        'very active': 1.725
    };
    const multiplier = multipliers[(activityLevel || 'sedentary').toLowerCase()] || 1.2;
    return Math.round(bmr * multiplier);
};

export const calculateTargetCalories = (currentWeight, height, age, gender, activityLevel, targetWeightLossKG, goalDuration) => {
    // 1. Calculate Current BMR & TDEE (Maintenance for current body)
    const currentBMR = calculateBMR(currentWeight, height, age, gender);
    const currentTDEE = calculateTDEE(currentBMR, activityLevel);

    // If no weight loss needed, return maintenance
    if (!targetWeightLossKG || targetWeightLossKG <= 0) return currentTDEE;

    // 2. Determine Duration in Days
    let days = 30; // Default to 1 Month
    if (goalDuration) {
        if (goalDuration.includes('1 Month')) days = 30;
        else if (goalDuration.includes('3 Months')) days = 90;
        else if (goalDuration.includes('6 Months')) days = 180;
    }

    // 3. Calculate Total Calorie Deficit Required
    // Approx 7700 kcal per kg of fat loss
    const totalDeficit = targetWeightLossKG * 7700;

    // 4. Calculate Daily Deficit
    const dailyDeficit = Math.round(totalDeficit / days);

    // 5. Calculate Target
    let target = currentTDEE - dailyDeficit;

    // 6. Safety Floor
    // Ensure we don't drop below a safe minimum (e.g., 1200 kcal or BMR-500)
    // Using 1200 as a hard safe floor for this mock.
    if (target < 1200) target = 1200;

    return Math.round(target);
};

export const calculateMealTargets = (totalCalories, selectedSlots = ['breakfast', 'lunch', 'snacks', 'dinner']) => {
    // Base ratios (Standard 5-meal split approx)
    const baseRatios = {
        breakfast: 0.25,
        morningSnack: 0.10,
        lunch: 0.35,
        snacks: 0.10, // Evening Snacks
        dinner: 0.20
    };

    // 1. Filter ratios for selected slots
    let activeRatios = {};
    let totalRatio = 0;

    selectedSlots.forEach(slot => {
        if (baseRatios[slot] !== undefined) {
            activeRatios[slot] = baseRatios[slot];
            totalRatio += baseRatios[slot];
        }
    });

    // If no valid slots (shouldn't happen), default to breakfast
    if (totalRatio === 0) {
        activeRatios = { breakfast: 1 };
        totalRatio = 1;
    }

    // 2. Distribute Total Calories based on normalized ratios
    const targets = {};
    Object.keys(activeRatios).forEach(slot => {
        targets[slot] = Math.round(totalCalories * (activeRatios[slot] / totalRatio));
    });

    return targets;
};

export const calculateMacroTargets = (calories, weightInKg) => {
    // 1. Protein: Min(30% of Calories, 1.5g per kg body weight)
    const proteinFromCals = (calories * 0.30) / 4;
    const proteinFromWeight = 1.5 * weightInKg;
    const proteinTarget = Math.round(Math.min(proteinFromCals, proteinFromWeight));

    // 2. Fats: Fixed at 25% of Total Calories (Standard healthy baseline)
    const fatTarget = Math.round((calories * 0.25) / 9);

    // 3. Carbs: Remainder of the calorie budget
    const usedCals = (proteinTarget * 4) + (fatTarget * 9);
    const remainingCals = Math.max(0, calories - usedCals);
    const carbTarget = Math.round(remainingCals / 4);

    return {
        carbs: carbTarget,
        protein: proteinTarget,
        fats: fatTarget
    };
};