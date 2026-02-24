import fs from 'fs';

// --- CONFIGURATION ---
const OUTPUT_FILE = 'ai_training/training_data.jsonl';
const NUM_SAMPLES = 500; // Generate 500 examples

// --- CONSTANTS ---
const SYSTEM_PROMPT = "You are the CYOM Nutrition Coach. Your goal is to help users achieve their health goals using the app's specific logic.";

const ACTIVITY_LEVELS = [
    { name: 'Sedentary', multiplier: 1.2 },
    { name: 'Lightly Active', multiplier: 1.375 },
    { name: 'Moderately Active', multiplier: 1.55 },
    { name: 'Very Active', multiplier: 1.725 }
];

const GOALS = ['Weight Loss', 'Maintenance', 'Muscle Gain'];

// --- HELPERS ---
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randPick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// --- FORMULAS ---
const calculateBMR = (weight, height, age, gender) => {
    if (gender === 'Male') {
        return (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
        return (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
};

const calculateTargets = (bmr, activityMultiplier, goal) => {
    const tdee = bmr * activityMultiplier;
    let target = tdee;

    if (goal === 'Weight Loss') target -= 500; // Simplification
    else if (goal === 'Muscle Gain') target += 300;

    target = Math.max(1200, target); // Safety floor

    return { tdee, target };
};


// --- GENERATORS ---

const generateBMRScenario = () => {
    const gender = randPick(['Male', 'Female']);
    const weight = randInt(50, 100);
    const height = randInt(150, 190);
    const age = randInt(18, 60);
    const activity = randPick(ACTIVITY_LEVELS);
    const goal = randPick(GOALS);

    const bmr = calculateBMR(weight, height, age, gender);
    const { tdee, target } = calculateTargets(bmr, activity.multiplier, goal);

    const userMsg = `I am a ${age} year old ${gender.toLowerCase()}, ${height}cm tall and weigh ${weight}kg. My goal is ${goal}. How many calories should I eat?`;

    const assistantMsg = `Based on your stats (${gender}, ${age}yrs, ${height}cm, ${weight}kg), your BMR is calculated as: (10 * ${weight}) + (6.25 * ${height}) - (5 * ${age}) ${gender === 'Male' ? '+ 5' : '- 161'} = ${Math.round(bmr)} kcal/day. assuming a ${activity.name.toLowerCase()} activity multiplier of ${activity.multiplier}, your TDEE is ${Math.round(bmr)} * ${activity.multiplier} = ${Math.round(tdee)} kcal. For ${goal}, your daily target would be around ${Math.round(target)} kcal.`;

    return { messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: userMsg }, { role: "assistant", content: assistantMsg }] };
};

const generateBScoreScenario = () => {
    const userMsg = randPick([
        "What is the Vitamin B Score?",
        "Explain the B-Score.",
        "How is the Vit B Score calculated in the dashboard?",
        "Why is there only one B vitamin bar?"
    ]);

    const assistantMsg = "The Vitamin B Score is a unique metric in the CYOM app. It aggregates your intake of 6 key B-vitamins (Thiamine, Riboflavin, Niacin, B6, Folate, B12). The score is the average percentage adherence to the RDA targets for each of these vitamins, capped at 100%. This gives you a single, simple number to track your overall B-vitamin health.";

    return { messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: userMsg }, { role: "assistant", content: assistantMsg }] };
};

const generateSwapScenario = () => {
    const originalCals = randInt(400, 800);
    const newCals = randInt(200, 400);

    const userMsg = `I want to swap my lunch. It's ${originalCals} calories. What happens if I pick a ${newCals} calorie meal?`;
    const assistantMsg = `With the Smart Swapping feature, if you swap a ${originalCals} kcal meal for a ${newCals} kcal meal, the app will automatically scale up the portion size to match the original ${originalCals} kcal target. This ensures you hit your daily calorie goal exactly, without under-eating.`;

    return { messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: userMsg }, { role: "assistant", content: assistantMsg }] };
};

// --- MAIN ---
const data = [];

// Generate Samples
for (let i = 0; i < NUM_SAMPLES; i++) {
    const type = randPick(['bmr', 'bscore', 'swap']);
    if (type === 'bmr') data.push(generateBMRScenario());
    else if (type === 'bscore') data.push(generateBScoreScenario());
    else if (type === 'swap') data.push(generateSwapScenario());
}

// Write to File
const fileContent = data.map(JSON.stringify).join('\n');
fs.writeFileSync(OUTPUT_FILE, fileContent);

console.log(`Generated ${NUM_SAMPLES} training examples in ${OUTPUT_FILE}`);
