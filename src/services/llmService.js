import { userData, dailyStats, savedPlans } from '../data/store';

const SYSTEM_PROMPT_TEMPLATE = `
You are the "CYOM Nutrition Coach", an expert AI assistant for the "Create Your Own Meal" (CYOM) app.
Your goal is to help users achieve their health goals (Weight Loss, Muscle Gain, Maintenance) using the app's specific logic.

### CORE APP LOGIC (DO NOT HALLUCINATE OUTSIDE THIS):
1.  **Formulas**:
    - BMR (Men): (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5
    - BMR (Women): (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161
    - TDEE = BMR * Activity Multiplier (1.2 to 1.725)
    - Weight Loss Target: TDEE - (TargetLoss_kg * 7700 / Days)
    - **Safety Floor**: Never go below 1200 kcal/day.

2.  **Meal Splitting (Normalized)**:
    - Breakfast: 25% | Morning Snack: 10% | Lunch: 35% | Evening Snack: 10% | Dinner: 20%
    - If a user skips a meal, re-distribute percentages among selected meals only.

3.  **Features**:
    - **Smart Swapping**: Swapping a food adjusts portion size to match calories exactly.
    - **Macro Boosting**: Adding protein/carbs reduces other ingredients to keep calories constant.
    - **Refreshment Planner**: Tea/Coffee/Milk calories are deducted BEFORE food allocation.
    - **Vitamin B Score**: Calculated as average % adherence of Thiamine, Riboflavin, Niacin, B6, Folate, B12 (capped at 100%).

4.  **Micronutrient Targets (ICMR-NIN 2020)**:
    | Nutrient | Male Target | Female Target | Unit |
    | :--- | :--- | :--- | :--- |
    | Vitamin A | 1000 | 840 | mcg |
    | Vitamin C | 80 | 65 | mg |
    | Vitamin D | 600 | 600 | IU |
    | Thiamine (B1)| 1.8 | 1.7 | mg |
    | Riboflavin (B2)| 2.5 | 2.4 | mg |
    | Niacin (B3) | 18 | 14 | mg |
    | Vitamin B6 | 2.4 | 1.9 | mg |
    | Folate (B9) | 300 | 220 | mcg |
    | Vitamin B12 | 2.2 | 2.2 | mcg |
    | Calcium | 1000 | 1000 | mg |
    | Magnesium | 440 | 370 | mg |
    | Iron | 19 | 29 | mg |
    | Zinc | 17 | 13 | mg |
    | Iodine | 150 | 150 | mcg |

### CURRENT USER CONTEXT:
- Name: {{NAME}}
- Stats: {{AGE}} yrs, {{HEIGHT}}cm, {{WEIGHT}}kg, {{GENDER}}
- Goal: {{GOAL}} (derived from interaction)

### YOUR BEHAVIOR:
- Be encouraging but mathematically precise.
- If asked about "How much should I eat?", calculate it using the BMR/TDEE formulas above.
- If asked about the app, explain features like "Smart Swapping", "Refreshment Planner", or "Vitamin B Score".
- Use the **Micronutrient Targets** table to answer questions about vitamins/minerals based on the user's gender ({{GENDER}}).
- Keep responses concise (under 3 sentences unless detailed explanation is requested).
`;

export const generateSystemPrompt = () => {
    // In a real app, 'userData' might come from a dynamic context or API
    // Using the static store data for now.
    let prompt = SYSTEM_PROMPT_TEMPLATE
        .replace('{{NAME}}', userData.name || 'User')
        .replace('{{AGE}}', userData.age || 'Unknown')
        .replace('{{HEIGHT}}', userData.height || 'Unknown')
        .replace('{{WEIGHT}}', userData.weight || 'Unknown')
        .replace('{{GENDER}}', userData.gender || 'Unknown')
        .replace('{{GOAL}}', 'Health & Wellness'); // Default if not set

    return prompt;
};

export const sendMessageToLLM = async (messages, apiKey, provider = 'openai', modelName = 'llama3') => {
    // 1. Mock/Demo Mode (No API Key)
    if (!apiKey && provider !== 'ollama') {
        return new Promise((resolve) => {
            setTimeout(() => {
                const lastMsg = messages[messages.length - 1].content.toLowerCase();
                let reply = "I can help you with your nutrition plan!";

                if (lastMsg.includes('calorie') || lastMsg.includes('eat')) {
                    const bmr = (10 * userData.weight) + (6.25 * userData.height) - (5 * userData.age) + 5;
                    reply = `Based on your stats, your BMR is roughly ${Math.round(bmr)} kcal/day.`;
                } else if (lastMsg.includes('hello') || lastMsg.includes('hi')) {
                    reply = `Hello ${userData.name}! I'm your CYOM Nutrition Coach.`;
                } else {
                    reply = "I'm in 'Demo Mode'. Add an API Key or use Local LLM to chat for real!";
                }

                resolve({ role: 'assistant', content: reply });
            }, 1000);
        });
    }

    try {
        let url = 'https://api.openai.com/v1/chat/completions';
        let headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        };
        let body = {
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: generateSystemPrompt() },
                ...messages
            ],
            temperature: 0.7,
        };

        // 2. Ollama (Local LLM) Support
        if (provider === 'ollama') {
            url = 'http://localhost:11434/api/chat'; // Standard Ollama Endpoint
            headers = { 'Content-Type': 'application/json' }; // No Auth needed usually
            body = {
                model: modelName, // Dynamic Model Name
                messages: [
                    { role: "system", content: generateSystemPrompt() },
                    ...messages
                ],
                stream: false
            };
        }

        console.log("🚀 Sending to LLM:", { url, model: body.model, provider }); // DEBUG LOG

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 minute timeout (Maximum extent)

        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        const text = await response.text();
        console.log("🚀 Raw LLM Response:", text); // DEBUG LOG

        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error("❌ Failed to parse JSON:", e);
            throw new Error(`Invalid JSON response from Ollama: ${text.substring(0, 50)}...`);
        }

        // Check for error in response (but handle specific Ollama errors gracefully below)
        if (data.error && provider !== 'ollama') {
            console.error("❌ API Error Response:", data);
            throw new Error(data.error.message || "LLM Error");
        }

        if (!response.ok) {
            console.error("❌ HTTP Error:", response.status, response.statusText);
            // Don't throw immediately for Ollama, let specific handler catch it
            if (provider !== 'ollama') {
                throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
            }
        }

        // Ollama response structure is slightly different
        if (provider === 'ollama') {
            // Success checking
            if (data.message) return data.message;
            if (data.response) return { role: 'assistant', content: data.response }; // Legacy format

            return { role: 'assistant', content: "Error: No message content in Ollama response." };
        }

        return data.choices?.[0]?.message || { role: 'assistant', content: "Error: No response from OpenAI." };

    } catch (error) {
        console.error("LLM Error:", error);

        if (error.name === 'AbortError') {
            return { role: 'assistant', content: "Error: Request timed out. Your local model is taking too long to respond." };
        }

        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            return { role: 'assistant', content: "Error: Could not connect to Ollama. Is it running? (Run 'ollama serve' in terminal)" };
        }

        const msg = provider === 'ollama'
            ? `Error: ${error.message}`
            : `Error: ${error.message}. Please check your API Key.`;
        return { role: 'assistant', content: msg };
    }
};
