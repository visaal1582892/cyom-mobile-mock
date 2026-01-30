export const calculateBMR = (weight, height, age, gender) => {
    // Mifflin-St Jeor Equation
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    if (gender.toLowerCase() === 'male') {
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
    const multiplier = multipliers[activityLevel.toLowerCase()] || 1.2;
    return Math.round(bmr * multiplier);
};

export const calculateTargetCalories = (currentWeight, height, age, gender, activityLevel, targetWeightLossKG) => {
    // 1. Determine Target Weight
    const targetWeight = currentWeight - targetWeightLossKG;

    // 2. Calculate BMR for the Target Weight
    // reuse local function if possible, or copy logic. Since calculateBMR is in scope, we call it.
    const targetBMR = calculateBMR(targetWeight, height, age, gender);

    // 3. Calculate TDEE for Target Weight (This is the new Target Intake)
    const targetTDEE = calculateTDEE(targetBMR, activityLevel);

    return targetTDEE;
};

export const calculateMealTargets = (totalCalories) => {
    // Breakdown: 25% Breakfast, 40% Lunch, 15% Snacks, 20% Dinner
    return {
        breakfast: Math.round(totalCalories * 0.25),
        lunch: Math.round(totalCalories * 0.40),
        snacks: Math.round(totalCalories * 0.15),
        dinner: Math.round(totalCalories * 0.20)
    };
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
