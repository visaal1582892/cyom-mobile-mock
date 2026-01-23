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

export const calculateTargetCalories = (tdee, targetWeightLossKG, bmr) => {
    // Calculate Monthly Deficit required: (Target KG * 7700 kcal/kg)
    // Daily Deficit = Monthly Total / 30
    const totalDeficit = targetWeightLossKG * 7700;
    const dailyDeficit = totalDeficit / 30;

    let target = tdee - dailyDeficit;

    // Constraint: Never eat below BMR
    if (target < bmr) {
        target = bmr;
    }

    return Math.round(target);
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

export const calculateMacroTargets = (calories) => {
    // Breakdown: 45% Carbs, 30% Protein, 25% Fat
    // 1g Carb = 4kcal, 1g Protein = 4kcal, 1g Fat = 9kcal
    return {
        carbs: Math.round((calories * 0.45) / 4),
        protein: Math.round((calories * 0.30) / 4),
        fats: Math.round((calories * 0.25) / 9)
    };
};
