
export const foodDatabase = [
    // --- GENERIC RAW INGREDIENTS (FOR SWAPPING) ---
    {
        id: 9001, name: "White Rice (Raw)", subType: "Grain", region: "All",
        calories: 360, protein: 7, carbs: 79, fats: 1, category: "Carb Source", isCooked: false // Rice, Quinoa, Oats = Carbs
    },
    {
        id: 9002, name: "Brown Rice (Raw)", subType: "Grain", region: "All",
        calories: 360, protein: 8, carbs: 76, fats: 3, category: "Carb Source", isCooked: false
    },
    {
        id: 9003, name: "Quinoa (Raw)", subType: "Grain", region: "All",
        calories: 370, protein: 14, carbs: 64, fats: 6, category: "Carb Source", isCooked: false
    },
    {
        id: 9004, name: "Oats (Raw)", subType: "Grain", region: "All",
        calories: 389, protein: 17, carbs: 66, fats: 7, category: "Carb Source", isCooked: false
    },
    {
        id: 9005, name: "Chicken Breast (Raw)", subType: "Protein", region: "All",
        calories: 120, protein: 23, carbs: 0, fats: 2.5, category: "Protein Source", isCooked: false, type: "non-veg"
    },
    {
        id: 9006, name: "Turkey Breast (Raw)", subType: "Protein", region: "All",
        calories: 110, protein: 24, carbs: 0, fats: 1, category: "Protein Source", isCooked: false, type: "non-veg"
    },
    {
        id: 9007, name: "Paneer (Raw)", subType: "Protein", region: "Indian",
        calories: 265, protein: 18, carbs: 1, fats: 20, category: "Protein Source", isCooked: false, type: "veg"
    },
    {
        id: 9008, name: "Tofu (Raw)", subType: "Protein", region: "All",
        calories: 144, protein: 16, carbs: 3, fats: 8, category: "Protein Source", isCooked: false, type: "veg"
    },
    {
        id: 9009, name: "Whole Egg (Raw)", subType: "Protein", region: "All",
        calories: 143, protein: 13, carbs: 1, fats: 9, category: "Protein Source", isCooked: false, type: "egg"
    },
    {
        id: 9010, name: "Egg Whites (Raw)", subType: "Protein", region: "All",
        calories: 52, protein: 11, carbs: 1, fats: 0, category: "Protein Source", isCooked: false, type: "egg"
    },
    // --- MORE ALTERNATIVES (Protein) ---
    { id: 9130, name: "Silken Tofu", subType: "Protein", region: "International", calories: 55, protein: 5, carbs: 1, fats: 3, category: "Protein Source", isCooked: false, type: "veg" },
    { id: 9131, name: "Soya Granules", subType: "Protein", region: "Indian", calories: 330, protein: 52, carbs: 33, fats: 0.5, category: "Protein Source", isCooked: false, type: "veg" },
    { id: 9132, name: "Black Chana (Raw)", subType: "Pulse", region: "Indian", calories: 360, protein: 20, carbs: 60, fats: 5, category: "Protein Source", isCooked: false, type: "veg" },
    { id: 9133, name: "Edamame Beans", subType: "Vegetable", region: "International", calories: 120, protein: 11, carbs: 10, fats: 5, category: "Protein Source", isCooked: true, type: "veg" },

    // --- MORE ALTERNATIVES (Fats) ---
    { id: 9134, name: "Flax Seeds", subType: "Fat", region: "All", calories: 530, protein: 18, carbs: 29, fats: 42, category: "Fat Source", isCooked: false, type: "veg" },
    { id: 9135, name: "Chia Seeds", subType: "Fat", region: "All", calories: 486, protein: 16, carbs: 42, fats: 30, category: "Fat Source", isCooked: false, type: "veg" },
    { id: 9136, name: "Sunflower Seeds", subType: "Fat", region: "All", calories: 580, protein: 20, carbs: 20, fats: 51, category: "Fat Source", isCooked: false, type: "veg" },
    {
        id: 9011, name: "Toor Dal (Raw)", subType: "Pulse", region: "Indian",
        calories: 343, protein: 22, carbs: 63, fats: 1.5, category: "Protein Source", isCooked: false, type: "veg" // Pulses often count as protein in Indian diets
    },
    {
        id: 9012, name: "Moong Dal (Raw)", subType: "Pulse", region: "Indian",
        calories: 348, protein: 24, carbs: 60, fats: 1.2, category: "Protein Source", isCooked: false, type: "veg"
    },
    {
        id: 9013, name: "Potato (Raw)", subType: "Vegetable", region: "All",
        calories: 77, protein: 2, carbs: 17, fats: 0.1, category: "Vegetables", isCooked: false, type: "veg"
    },
    {
        id: 9014, name: "Sweet Potato (Raw)", subType: "Vegetable", region: "All",
        calories: 86, protein: 1.6, carbs: 20, fats: 0.1, category: "Vegetables", isCooked: false, type: "veg"
    },
    {
        id: 9015, name: "Broccoli (Raw)", subType: "Vegetable", region: "All",
        calories: 34, protein: 2.8, carbs: 7, fats: 0.4, category: "Vegetables", isCooked: false, type: "veg"
    },
    {
        id: 9016, name: "Spinach (Raw)", subType: "Vegetable", region: "All",
        calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4, category: "Vegetables", isCooked: false, type: "veg"
    },
    // New Alternatives
    {
        id: 9017, name: "Atta / Whole Wheat Flour", subType: "Grain", region: "Indian",
        calories: 340, protein: 13, carbs: 72, fats: 2.5, category: "Carb Source", isCooked: false, type: "veg"
    },
    {
        id: 9018, name: "Besan (Chickpea Flour)", subType: "Pulse", region: "Indian",
        calories: 387, protein: 22, carbs: 58, fats: 7, category: "Protein Source", isCooked: false, type: "veg"
    },
    {
        id: 9019, name: "Soya Chunks (Raw)", subType: "Protein", region: "All",
        calories: 345, protein: 52, carbs: 33, fats: 0.5, category: "Protein Source", isCooked: false, type: "veg"
    },
    {
        id: 9020, name: "Yogurt / Curd", subType: "Dairy", region: "All",
        calories: 60, protein: 4, carbs: 5, fats: 3, category: "Protein Source", isCooked: false, type: "veg"
    },
    {
        id: 9021, name: "Almonds (Raw)", subType: "Fat", region: "All",
        calories: 579, protein: 21, carbs: 22, fats: 50, category: "Fat Source", isCooked: false, type: "veg"
    },
    {
        id: 9022, name: "Peanut Butter", subType: "Fat", region: "All",
        calories: 588, protein: 25, carbs: 20, fats: 50, category: "Fat Source", isCooked: false, type: "veg"
    },
    {
        id: 9023, name: "Olive Oil", subType: "Fat", region: "All",
        calories: 884, protein: 0, carbs: 0, fats: 100, category: "Fat Source", isCooked: false, type: "veg"
    },
    // --- EXPANDED ALTERNATIVES (Carbs) ---
    { id: 9101, name: "Whole Wheat Pasta (Raw)", subType: "Grain", region: "International", calories: 350, protein: 12, carbs: 70, fats: 2, category: "Carb Source", isCooked: false, type: "veg" },
    { id: 9102, name: "Millet / Ragi (Raw)", subType: "Grain", region: "Indian", calories: 330, protein: 7, carbs: 72, fats: 1, category: "Carb Source", isCooked: false, type: "veg" },
    { id: 9103, name: "Vermicelli / Semiya (Raw)", subType: "Grain", region: "Indian", calories: 360, protein: 10, carbs: 75, fats: 1, category: "Carb Source", isCooked: false, type: "veg" },
    { id: 9104, name: "Dalia / Broken Wheat (Raw)", subType: "Grain", region: "Indian", calories: 340, protein: 11, carbs: 70, fats: 1, category: "Carb Source", isCooked: false, type: "veg" },
    { id: 9105, name: "Corn / Maize (Raw)", subType: "Grain", region: "All", calories: 365, protein: 9, carbs: 74, fats: 4, category: "Carb Source", isCooked: false, type: "veg" },

    // --- EXPANDED ALTERNATIVES (Protein) ---
    { id: 9106, name: "Chickpeas / Chana (Raw)", subType: "Pulse", region: "Indian", calories: 360, protein: 19, carbs: 60, fats: 6, category: "Protein Source", isCooked: false, type: "veg" },
    { id: 9107, name: "Rajma (Raw)", subType: "Pulse", region: "Indian", calories: 330, protein: 24, carbs: 60, fats: 1, category: "Protein Source", isCooked: false, type: "veg" },
    { id: 9108, name: "Fish Fillet (Raw)", subType: "Protein", region: "International", calories: 90, protein: 20, carbs: 0, fats: 1, category: "Protein Source", isCooked: false, type: "non-veg" },
    { id: 9109, name: "Prawns (Raw)", subType: "Protein", region: "International", calories: 85, protein: 20, carbs: 0, fats: 0.5, category: "Protein Source", isCooked: false, type: "non-veg" },
    { id: 9110, name: "Whey Protein Isolate", subType: "Supplement", region: "All", calories: 110, protein: 27, carbs: 1, fats: 0, category: "Protein Source", isCooked: false, type: "veg" },
    { id: 9111, name: "Greek Yogurt", subType: "Dairy", region: "International", calories: 60, protein: 10, carbs: 3, fats: 0, category: "Protein Source", isCooked: false, type: "veg" },

    // --- EXPANDED ALTERNATIVES (Fats) ---
    { id: 9112, name: "Ghee", subType: "Fat", region: "Indian", calories: 900, protein: 0, carbs: 0, fats: 100, category: "Fat Source", isCooked: false, type: "veg" },
    { id: 9113, name: "Coconut Oil", subType: "Fat", region: "All", calories: 860, protein: 0, carbs: 0, fats: 100, category: "Fat Source", isCooked: false, type: "veg" },
    { id: 9114, name: "Cheese Slice", subType: "Fat", region: "All", calories: 300, protein: 18, carbs: 2, fats: 25, category: "Fat Source", isCooked: false, type: "veg" },
    { id: 9115, name: "Avocado (Raw)", subType: "Fat", region: "International", calories: 160, protein: 2, carbs: 8, fats: 15, category: "Fat Source", isCooked: false, type: "veg" },
    { id: 9116, name: "Walnuts (Raw)", subType: "Fat", region: "All", calories: 650, protein: 15, carbs: 14, fats: 65, category: "Fat Source", isCooked: false, type: "veg" },

    // --- EXPANDED ALTERNATIVES (Vegetables) ---
    { id: 9117, name: "Green Beans (Raw)", subType: "Vegetable", region: "All", calories: 31, protein: 1.8, carbs: 7, fats: 0, category: "Vegetables", isCooked: false, type: "veg" },
    { id: 9118, name: "Carrot (Raw)", subType: "Vegetable", region: "All", calories: 41, protein: 0.9, carbs: 10, fats: 0, category: "Vegetables", isCooked: false, type: "veg" },
    { id: 9119, name: "Mushrooms (Raw)", subType: "Vegetable", region: "All", calories: 22, protein: 3, carbs: 3, fats: 0, category: "Vegetables", isCooked: false, type: "veg" },
    { id: 9120, name: "Capsicum (Raw)", subType: "Vegetable", region: "All", calories: 30, protein: 1, carbs: 6, fats: 0, category: "Vegetables", isCooked: false, type: "veg" },
    { id: 9121, name: "Cauliflower (Raw)", subType: "Vegetable", region: "All", calories: 25, protein: 2, carbs: 5, fats: 0, category: "Vegetables", isCooked: false, type: "veg" },

    // --- COOKED VARIANTS (To satisfy 'No Raw' filter) ---
    {
        id: 9201, name: "Cooked Pasta (Whole Wheat)", subType: "Grain", region: "International", calories: 124, protein: 5, carbs: 26, fats: 1, category: "Carb Source", isCooked: true, type: "veg",
        composition: [
            { name: "Whole Wheat Pasta (Raw)", weight: 40, calories: 120, protein: 4.5, carbs: 25, fats: 0.8 },
            { name: "Water & Salt", weight: 60, calories: 4, protein: 0.5, carbs: 1, fats: 0.2 }
        ]
    },
    {
        id: 9202, name: "Boiled Chickpeas / Chana", subType: "Pulse", region: "Indian", calories: 160, protein: 9, carbs: 27, fats: 2.5, category: "Protein Source", isCooked: true, type: "veg",
        composition: [
            { name: "Chickpeas (Raw)", weight: 45, calories: 155, protein: 8.5, carbs: 26, fats: 2.2 },
            { name: "Water & Salt", weight: 55, calories: 5, protein: 0.5, carbs: 1, fats: 0.3 }
        ]
    },
    {
        id: 9203, name: "Rajma Masala / Boiled Rajma", subType: "Pulse", region: "Indian", calories: 140, protein: 9, carbs: 22, fats: 4, category: "Protein Source", isCooked: true, type: "veg",
        composition: [
            { name: "Kidney Beans (Raw)", weight: 40, calories: 130, protein: 8.5, carbs: 21, fats: 0.5 },
            { name: "Gravy / Water", weight: 60, calories: 10, protein: 0.5, carbs: 1, fats: 3.5 }
        ]
    },
    {
        id: 9204, name: "Grilled Fish", subType: "Protein", region: "International", calories: 120, protein: 22, carbs: 0, fats: 4, category: "Protein Source", isCooked: true, type: "non-veg",
        composition: [
            { name: "Fish Fillet", weight: 95, calories: 105, protein: 21, carbs: 0, fats: 1.5 },
            { name: "Oil & Seasoning", weight: 5, calories: 15, protein: 1, carbs: 0, fats: 2.5 }
        ]
    },
    {
        id: 9205, name: "Garlic Prawns", subType: "Protein", region: "International", calories: 110, protein: 21, carbs: 1, fats: 3, category: "Protein Source", isCooked: true, type: "non-veg",
        composition: [
            { name: "Prawns", weight: 90, calories: 80, protein: 20, carbs: 0.2, fats: 0.5 },
            { name: "Garlic & Butter/Oil", weight: 10, calories: 30, protein: 1, carbs: 0.8, fats: 2.5 }
        ]
    },
    {
        id: 9206, name: "Millet Upma / Porridge", subType: "Grain", region: "Indian", calories: 180, protein: 6, carbs: 32, fats: 5, category: "Carb Source", isCooked: true, type: "veg",
        composition: [
            { name: "Millet (Raw)", weight: 45, calories: 145, protein: 5, carbs: 30, fats: 0.5 },
            { name: "Vegetables & Oil", weight: 55, calories: 35, protein: 1, carbs: 2, fats: 4.5 }
        ]
    },
    {
        id: 9207, name: "Quinoa Salad / Bowl", subType: "Grain", region: "International", calories: 140, protein: 5, carbs: 22, fats: 4, category: "Carb Source", isCooked: true, type: "veg",
        composition: [
            { name: "Quinoa (Raw)", weight: 35, calories: 125, protein: 4.5, carbs: 21, fats: 2 },
            { name: "Dressing & Veggies", weight: 65, calories: 15, protein: 0.5, carbs: 1, fats: 2 }
        ]
    },
    {
        id: 9208, name: "Sauteed Vegetables", subType: "Vegetable", region: "All", calories: 80, protein: 2, carbs: 8, fats: 5, category: "Vegetables", isCooked: true, type: "veg",
        composition: [
            { name: "Mixed Vegetables", weight: 90, calories: 35, protein: 2, carbs: 8, fats: 0.2 },
            { name: "Cooking Oil", weight: 10, calories: 45, protein: 0, carbs: 0, fats: 4.8 }
        ]
    },
    {
        id: 9209, name: "Mashed Potato", subType: "Vegetable", region: "International", calories: 110, protein: 2, carbs: 18, fats: 4, category: "Carb Source", isCooked: true, type: "veg",
        composition: [
            { name: "Potato (Boiled)", weight: 85, calories: 75, protein: 1.5, carbs: 17, fats: 0.1 },
            { name: "Butter & Milk", weight: 15, calories: 35, protein: 0.5, carbs: 1, fats: 3.9 }
        ]
    },
    {
        id: 9210, name: "Sweet Potato (Boiled)", subType: "Vegetable", region: "All", calories: 90, protein: 2, carbs: 20, fats: 0, category: "Carb Source", isCooked: true, type: "veg",
        composition: [
            { name: "Sweet Potato", weight: 98, calories: 88, protein: 1.8, carbs: 20, fats: 0.1 },
            { name: "Salt", weight: 2, calories: 2, protein: 0.2, carbs: 0, fats: 0 }
        ]
    },

    // --- BREAKFAST MEALS (LEGACY PRESERVED) ---
    {
        id: 1, name: "Oats Porridge Meal", subType: "Combo Meal", region: "All",
        ediblePortion: 100, type: "veg", calories: 350, protein: 12, carbs: 55, fats: 8,
        category: "Breakfast", servingSize: "1 Bowl", isCooked: true, isCombo: true,
        tags: ["High Fiber", "Vegetarian", "Heart Healthy"],
        composition: [
            { name: "Oats Porridge", weight: 250, calories: 250, protein: 10, carbs: 45, fats: 4, category: "Carb Source", type: "veg" },
            { name: "Almonds/Walnuts", weight: 15, calories: 100, protein: 2, carbs: 10, fats: 4, category: "Fat Source", type: "veg" }
        ]
    },
    {
        id: 2, name: "Vegetable Poha Meal", subType: "Combo Meal", region: "North Indian",
        ediblePortion: 100, type: "veg", calories: 350, protein: 8, carbs: 60, fats: 10,
        category: "Breakfast", servingSize: "1 Plate", isCooked: true, isCombo: true,
        tags: ["Vegetarian", "Light", "Gluten Free"],
        composition: [
            { name: "Vegetable Poha", weight: 200, calories: 300, protein: 6, carbs: 55, fats: 8, category: "Carb Source", type: "veg" },
            { name: "Bhujia/Sev", weight: 10, calories: 50, protein: 2, carbs: 5, fats: 2, category: "Fat Source", type: "veg" }
        ]
    },
    {
        id: 3, name: "Idli Sambar Meal", subType: "Combo Meal", region: "South Indian",
        ediblePortion: 100, type: "veg", calories: 300, protein: 10, carbs: 55, fats: 4,
        category: "Breakfast", servingSize: "1 Plate", isCooked: true, isCombo: true,
        tags: ["Vegetarian", "Fermented", "Gut Health", "Gluten Free"],
        composition: [
            { name: "Idli (3 pcs)", weight: 150, calories: 180, protein: 6, carbs: 36, fats: 0, category: "Carb Source", type: "veg" },
            { name: "Sambar", weight: 150, calories: 80, protein: 3, carbs: 15, fats: 1, category: "Protein Source", type: "veg" },
            { name: "Coconut Chutney", weight: 20, calories: 40, protein: 1, carbs: 4, fats: 3, category: "Fat Source", type: "veg" }
        ]
    },
    {
        id: 4, name: "Masala Dosa Meal", subType: "Combo Meal", region: "South Indian",
        ediblePortion: 100, type: "veg", calories: 400, protein: 10, carbs: 65, fats: 12,
        category: "Breakfast", servingSize: "1 Plate", isCooked: true, isCombo: true,
        composition: [
            { name: "Masala Dosa", weight: 200, calories: 300, protein: 6, carbs: 50, fats: 8, category: "Carb Source", type: "veg" },
            { name: "Sambar", weight: 100, calories: 60, protein: 3, carbs: 10, fats: 1, category: "Protein Source", type: "veg" },
            { name: "Coconut Chutney", weight: 20, calories: 40, protein: 1, carbs: 5, fats: 3, category: "Fat Source", type: "veg" }
        ]
    },
    {
        id: 6, name: "Classic Scrambled Eggs", subType: "Combo Meal", region: "International",
        ediblePortion: 100, type: "non-veg", calories: 350, protein: 20, carbs: 25, fats: 18,
        category: "Breakfast", servingSize: "1 Plate", isCooked: true, isCombo: true,
        tags: ["High Protein", "Low Carb", "Keto Friendly"],
        composition: [
            { name: "Scrambled Eggs (2)", weight: 120, calories: 180, protein: 14, carbs: 2, fats: 14, category: "Protein Source", type: "non-veg" },
            { name: "Buttered Toast", weight: 50, calories: 150, protein: 4, carbs: 20, fats: 4, category: "Carb Source", type: "veg" },
            { name: "Grilled Tomato", weight: 50, calories: 20, protein: 2, carbs: 3, fats: 0, category: "Vegetables", type: "veg" }
        ]
    },
    {
        id: 7, name: "Aloo Paratha Meal", subType: "Combo Meal", region: "North Indian",
        ediblePortion: 100, type: "veg", calories: 400, protein: 10, carbs: 60, fats: 15,
        category: "Breakfast", servingSize: "1 Plate", isCooked: true, isCombo: true,
        composition: [
            { name: "Aloo Paratha", weight: 120, calories: 280, protein: 6, carbs: 45, fats: 10, category: "Carb Source", type: "veg" },
            { name: "Curd/Yogurt", weight: 100, calories: 80, protein: 4, carbs: 10, fats: 3, category: "Protein Source", type: "veg" },
            { name: "Pickle", weight: 15, calories: 40, protein: 0, carbs: 5, fats: 2, category: "Fat Source", type: "veg" }
        ]
    },

    // --- NEW USER MOCK DATA (BREAKFAST - PRIMARY) ---
    {
        id: 101, name: "Steel-cut Oats & Egg Whites", subType: "Combo Meal", region: "International",
        ediblePortion: 100, type: "non-veg", calories: 465, protein: 36, carbs: 52, fats: 13,
        category: "Breakfast", servingSize: "1 Bowl", isCooked: true, isCombo: true,
        composition: [
            { name: "Steel-cut Oats (Cooked)", weight: 220, calories: 250, protein: 8, carbs: 45, fats: 4, category: "Carb Source", type: "veg" },
            { name: "Egg Whites", weight: 200, calories: 100, protein: 22, carbs: 1, fats: 0, category: "Protein Source", type: "non-veg" },
            { name: "Avocado", weight: 50, calories: 80, protein: 1, carbs: 4, fats: 7, category: "Fat Source", type: "veg" },
            { name: "Cooking Oil", weight: 5, calories: 35, protein: 0, carbs: 2, fats: 2, category: "Fat Source", type: "veg" }
        ]
    },
    {
        id: 102, name: "Veg Omelette & Oats", subType: "Combo Meal", region: "International",
        ediblePortion: 100, type: "non-veg", calories: 465, protein: 35, carbs: 50, fats: 13,
        category: "Breakfast", servingSize: "1 Meal", isCooked: true, isCombo: true,
        composition: [
            { name: "Oats (Cooked)", weight: 200, calories: 140, protein: 5, carbs: 25, fats: 2, category: "Carb Source", type: "veg" },
            { name: "Whole Egg & Whites Mix", weight: 170, calories: 150, protein: 20, carbs: 2, fats: 6, category: "Protein Source", type: "non-veg" },
            { name: "Vegetables", weight: 100, calories: 40, protein: 2, carbs: 8, fats: 0, category: "Vegetables", type: "veg" },
            { name: "Cooking Oil", weight: 5, calories: 45, protein: 0, carbs: 0, fats: 5, category: "Fat Source", type: "veg" }
        ]
    },
    {
        id: 103, name: "Whey Oats Bowl", subType: "Combo Meal", region: "International",
        ediblePortion: 100, type: "veg", calories: 465, protein: 35, carbs: 54, fats: 13,
        category: "Breakfast", servingSize: "1 Bowl", isCooked: true, isCombo: true,
        composition: [
            { name: "Oats (Cooked)", weight: 200, calories: 160, protein: 6, carbs: 30, fats: 3, category: "Carb Source", type: "veg" },
            { name: "Whey Protein", weight: 25, calories: 100, protein: 20, carbs: 2, fats: 1, category: "Protein Source", type: "veg" },
            { name: "Almond Butter", weight: 10, calories: 90, protein: 3, carbs: 3, fats: 8, category: "Fat Source", type: "veg" },
            { name: "Apple", weight: 100, calories: 52, protein: 0, carbs: 14, fats: 0, category: "Carb Source", type: "veg" }
        ]
    },
    {
        id: 104, name: "Avocado Toast & Egg Whites", subType: "Combo Meal", region: "International",
        ediblePortion: 100, type: "egg", calories: 465, protein: 35, carbs: 52, fats: 13,
        category: "Breakfast", servingSize: "1 Plate", isCooked: true, isCombo: true,
        composition: [
            { name: "Whole Wheat Bread", weight: 70, calories: 180, protein: 8, carbs: 35, "fats": 2, category: "Carb Source", type: "veg" },
            { name: "Avocado", weight: 70, calories: 115, protein: 1, carbs: 6, fats: 10, category: "Fat Source", type: "veg" },
            { name: "Egg Whites", weight: 200, calories: 100, protein: 22, carbs: 2, fats: 0, category: "Protein Source", type: "non-veg" },
            { name: "Oil (for toast)", weight: 5, calories: 45, protein: 0, carbs: 0, fats: 5, category: "Fat Source", type: "veg" }
        ]
    },
    {
        id: 105, name: "PB Toast & Whey", subType: "Combo Meal", region: "International",
        ediblePortion: 100, type: "veg", calories: 465, protein: 35, carbs: 54, fats: 13,
        category: "Breakfast", servingSize: "1 Meal", isCooked: true, isCombo: true,
        composition: [
            { name: "Whole Wheat Bread", weight: 70, calories: 185, protein: 9, carbs: 35, fats: 2, category: "Carb Source", type: "veg" },
            { name: "Peanut Butter", weight: 20, calories: 120, protein: 5, carbs: 4, fats: 10, category: "Fat Source", type: "veg" },
            { name: "Whey Protein", weight: 25, calories: 100, protein: 20, carbs: 2, fats: 1, category: "Protein Source", type: "veg" },
            { name: "Apple", weight: 100, calories: 50, protein: 1, carbs: 13, fats: 0, category: "Carb Source", type: "veg" }
        ]
    },

    // --- NEW EGG COMBOS (For Eggetarians) ---
    {
        id: 204, name: "Egg Curry with Rice", subType: "Combo Meal", region: "Indian",
        ediblePortion: 100, type: "egg", calories: 450, protein: 18, carbs: 55, fats: 14,
        category: "Lunch", servingSize: "1 Meal", isCooked: true, isCombo: true,
        tags: ["High Protein", "Eggetarian"],
        composition: [
            { name: "Egg Curry (2 Eggs)", weight: 200, calories: 220, protein: 14, carbs: 8, fats: 14, category: "Protein Source", type: "egg" },
            { name: "Steamed Rice", weight: 180, calories: 230, protein: 4, carbs: 47, fats: 0, category: "Carb Source", type: "veg" }
        ]
    },
    {
        id: 205, name: "Egg Bhurji with Roti", subType: "Combo Meal", region: "Indian",
        ediblePortion: 100, type: "egg", calories: 420, protein: 20, carbs: 45, fats: 16,
        category: "Dinner", servingSize: "1 Meal", isCooked: true, isCombo: true,
        tags: ["High Protein", "Quick"],
        composition: [
            { name: "Egg Bhurji (3 Eggs)", weight: 150, calories: 240, protein: 18, carbs: 3, fats: 16, category: "Protein Source", type: "egg" },
            { name: "Roti (2 pcs)", weight: 80, calories: 180, protein: 5, carbs: 42, fats: 0, category: "Carb Source", type: "veg" }
        ]
    },
    {
        id: 206, name: "Egg Fried Rice", subType: "Combo Meal", region: "International",
        ediblePortion: 100, type: "egg", calories: 480, protein: 16, carbs: 60, fats: 18,
        category: "Lunch", servingSize: "1 Bowl", isCooked: true, isCombo: true,
        tags: ["Tasty", "Chinese"],
        composition: [
            { name: "Egg Fried Rice", weight: 350, calories: 480, protein: 16, carbs: 60, fats: 18, category: "Carb Source", type: "egg" }
        ]
    },
    {
        id: 207, name: "Boiled Egg Salad Bowl", subType: "Combo Meal", region: "International",
        ediblePortion: 100, type: "egg", calories: 350, protein: 25, carbs: 15, fats: 20,
        category: "Dinner", servingSize: "1 Bowl", isCooked: true, isCombo: true,
        tags: ["Low Carb", "Keto Friendly"],
        composition: [
            { name: "Boiled Eggs (4)", weight: 200, calories: 300, protein: 24, carbs: 2, fats: 20, category: "Protein Source", type: "egg" },
            { name: "Mixed Green Salad", weight: 150, calories: 50, protein: 1, carbs: 13, fats: 0, category: "Vegetables", type: "veg" }
        ]
    },

    // --- RE-INDEXED OLD CUSTOM COMBOS (1000-series) ---
    {
        id: 1001, name: "Egg Dosa Combo (Legacy)", subType: "Combo Meal", region: "South Indian",
        ediblePortion: 100, type: "egg", calories: 462, protein: 18, carbs: 56, fats: 12,
        category: "Breakfast", servingSize: "1 Meal", isCooked: true, isCombo: true,
        composition: [
            { name: "Plain Dosa/Idli", weight: 120, calories: 250, protein: 6, carbs: 50, fats: 2, category: "Carb Source", type: "veg" },
            { name: "Egg Spread/Omelette", weight: 50, calories: 140, protein: 12, carbs: 1, fats: 9, category: "Protein Source", type: "non-veg" },
            { name: "Black Tea/Coffee", weight: 200, calories: 5, protein: 0, carbs: 1, fats: 0, category: "Liquid", type: "veg" }
        ]
    },

    // --- NEW USER MOCK DATA (LUNCH/DINNER) ---
    {
        id: 201, name: "Chicken Curry Rice Bowl", subType: "Combo Meal", region: "Indian",
        ediblePortion: 100, type: "non-veg", calories: 742, protein: 43, carbs: 75, fats: 14.5,
        category: "Lunch", servingSize: "1 Meal", isCooked: true, isCombo: true,
        tags: ["High Protein", "Spicy", "Fiber Rich"],
        composition: [
            { name: "Chicken Curry (Skinless Breast)", weight: 150, calories: 250, protein: 35, carbs: 5, fats: 8, category: "Protein Source", type: "non-veg" },
            { name: "Brown Rice (Cooked)", weight: 180, calories: 210, protein: 5, carbs: 44, fats: 2, category: "Carb Source", type: "veg" },
            { name: "Avocado", weight: 50, calories: 80, protein: 1, carbs: 4, fats: 4.5, category: "Fat Source", type: "veg" },
            { name: "Low-fat Curd", weight: 120, calories: 70, protein: 5, carbs: 8, fats: 0, category: "Protein Source", type: "veg" },
            { name: "Mixed Salad", weight: 200, calories: 50, protein: 1, carbs: 10, fats: 0, category: "Vegetables", type: "veg" }
        ]
    },
    {
        id: 202, name: "Fish Curry & Mushroom Fry", subType: "Combo Meal", region: "Indian",
        ediblePortion: 100, type: "non-veg", calories: 742, protein: 41.5, carbs: 73, fats: 15,
        category: "Lunch", servingSize: "1 Meal", isCooked: true, isCombo: true,
        composition: [
            { name: "Sardine/Mackerel Curry", weight: 120, calories: 220, protein: 25, carbs: 5, fats: 10, category: "Protein Source", type: "non-veg" },
            { name: "Brown Rice (Cooked)", weight: 175, calories: 200, protein: 4, carbs: 40, fats: 2, category: "Carb Source", type: "veg" },
            { name: "Mushroom Pepper Fry", weight: 120, calories: 80, protein: 4, carbs: 10, fats: 3, category: "Vegetables", type: "veg" },
            { name: "Mixed Salad", weight: 200, calories: 50, protein: 2, carbs: 10, fats: 0, category: "Vegetables", type: "veg" },
            { name: "Rasam", weight: 180, calories: 40, protein: 1, carbs: 5, fats: 0, category: "Liquid", type: "veg" }
        ]
    },
    {
        id: 203, name: "Tomato Garlic Prawns & Broccoli", subType: "Combo Meal", region: "International",
        ediblePortion: 100, type: "non-veg", calories: 742, protein: 42.5, carbs: 75, fats: 14.5,
        category: "Lunch", servingSize: "1 Meal", isCooked: true, isCombo: true,
        composition: [
            { name: "Tomato Garlic Prawns", weight: 170, calories: 220, protein: 30, carbs: 8, fats: 6, category: "Protein Source", type: "non-veg" },
            { name: "Brown Rice (Cooked)", weight: 185, calories: 215, protein: 5, carbs: 42, fats: 2, category: "Carb Source", type: "veg" },
            { name: "Broccoli Stir Fry", weight: 120, calories: 90, protein: 4, carbs: 10, fats: 4, category: "Vegetables", type: "veg" },
            { name: "Mixed Salad", weight: 200, calories: 50, protein: 1, carbs: 10, fats: 0, category: "Vegetables", type: "veg" },
            { name: "Clear Chicken Soup", weight: 200, calories: 60, protein: 3, carbs: 5, fats: 2, category: "Liquid", type: "non-veg" }
        ]
    },

    // --- LEGACY LUNCH PRESERVED (~ID 2000) ---
    {
        id: 2000, name: "Classic Dal Rice Meal", subType: "Combo Meal", region: "North Indian",
        ediblePortion: 100, type: "veg", calories: 450, protein: 18, carbs: 70, fats: 10,
        category: "Lunch", servingSize: "1 Plate", isCooked: true, isCombo: true,
        composition: [
            { name: "Steamed Rice", weight: 200, calories: 260, protein: 6, carbs: 56, fats: 1, category: "Carb Source", type: "veg" },
            { name: "Dal Fry", weight: 150, calories: 150, protein: 10, carbs: 12, fats: 6, category: "Protein Source", type: "veg" },
            { name: "Papad/Salad", weight: 30, calories: 40, protein: 2, carbs: 2, fats: 3, category: "Vegetables", type: "veg" }
        ]
    },
    {
        id: 2001, name: "Roti Paneer Meal", subType: "Combo Meal", region: "North Indian",
        ediblePortion: 100, type: "veg", calories: 500, protein: 22, carbs: 55, fats: 22,
        category: "Dinner", servingSize: "1 Plate", isCooked: true, isCombo: true,
        composition: [
            { name: "Roti (2 pcs)", weight: 80, calories: 240, protein: 8, carbs: 40, fats: 2, category: "Carb Source", type: "veg" },
            { name: "Paneer Butter Masala", weight: 150, calories: 220, protein: 12, carbs: 10, fats: 18, category: "Protein Source", type: "veg" },
            { name: "Green Salad", weight: 50, calories: 40, protein: 2, carbs: 5, fats: 2, category: "Vegetables", type: "veg" }
        ]
    },
    {
        id: 2002, name: "Vegetable Biryani Meal", subType: "Combo Meal", region: "All",
        ediblePortion: 100, type: "veg", calories: 450, protein: 12, carbs: 70, fats: 15,
        category: "Lunch", servingSize: "1 Plate", isCooked: true, isCombo: true,
        composition: [
            { name: "Veg Biryani", weight: 250, calories: 350, protein: 8, carbs: 60, fats: 10, category: "Carb Source", type: "veg" },
            { name: "Raita", weight: 100, calories: 80, protein: 4, carbs: 8, fats: 4, category: "Protein Source", type: "veg" },
            { name: "Salad", weight: 50, calories: 20, protein: 0, carbs: 2, fats: 1, category: "Vegetables", type: "veg" }
        ]
    },
    {
        id: 2003, name: "Curd Rice & Pickle", subType: "Combo Meal", region: "South Indian",
        ediblePortion: 100, type: "veg", calories: 350, protein: 10, carbs: 50, fats: 12,
        category: "Lunch", servingSize: "1 Bowl", isCooked: true, isCombo: true,
        tags: ["Vegetarian", "Probiotic", "Cooling", "Gluten Free"],
        composition: [
            { name: "Curd Rice", weight: 250, calories: 300, protein: 10, carbs: 48, fats: 8 },
            { name: "Pickle/Podi", weight: 20, calories: 50, protein: 0, carbs: 2, fats: 4 }
        ]
    },

    // --- NEW USER MOCK DATA (SNACKS) ---
    {
        id: 301, name: "Greek Yogurt Bowl", subType: "Snack", region: "International",
        ediblePortion: 100, type: "veg", calories: 270, protein: 19, carbs: 32, fats: 6,
        category: "Snacks", servingSize: "1 Bowl", isCooked: false, isCombo: true,
        composition: [
            { name: "Low-fat Greek Yogurt", weight: 200, calories: 140, protein: 16, carbs: 8, fats: 0, category: "Protein Source", type: "veg" },
            { name: "Apple", weight: 120, calories: 65, protein: 0, carbs: 15, fats: 0, category: "Carb Source", type: "veg" },
            { name: "Pumpkin Seeds", weight: 6, calories: 35, protein: 2, carbs: 1, fats: 3, category: "Fat Source", type: "veg" }
        ]
    },
    {
        id: 302, name: "Roasted Chana & Whey", subType: "Snack", region: "Indian",
        ediblePortion: 100, type: "veg", calories: 270, protein: 19, carbs: 32, fats: 6,
        category: "Snacks", servingSize: "1 Meal", isCooked: true, isCombo: true,
        composition: [
            { name: "Roasted Chana", weight: 25, calories: 90, protein: 5, carbs: 15, fats: 2, category: "Carb Source", type: "veg" },
            { name: "Whey Protein (in water)", weight: 12, calories: 45, protein: 10, carbs: 1, fats: 0, category: "Protein Source", type: "veg" },
            { name: "Papaya/Apple", weight: 120, calories: 50, protein: 1, carbs: 12, fats: 0, category: "Carb Source", type: "veg" }
        ]
    },
    {
        id: 303, name: "Paneer & Fruit Bowl", subType: "Snack", region: "Indian",
        ediblePortion: 100, type: "veg", calories: 270, protein: 19, carbs: 32, fats: 6,
        category: "Snacks", servingSize: "1 Bowl", isCooked: false, isCombo: true,
        composition: [
            { name: "Low-fat Paneer", weight: 100, calories: 180, protein: 18, carbs: 2, fats: 4, category: "Protein Source", type: "veg" },
            { name: "Apple", weight: 140, calories: 70, protein: 0, carbs: 18, fats: 0, category: "Carb Source", type: "veg" },
            { name: "Chia Seeds", weight: 5, calories: 20, protein: 1, carbs: 2, fats: 1, category: "Fat Source", type: "veg" }
        ]
    },
    {
        id: 304, name: "Chicken & Fruit Snack", subType: "Snack", region: "International",
        ediblePortion: 100, type: "non-veg", calories: 270, protein: 20, carbs: 32, fats: 6,
        category: "Snacks", servingSize: "1 Plate", isCooked: true, isCombo: true,
        composition: [
            { name: "Chicken Breast (Boiled/Grilled)", weight: 85, calories: 140, protein: 20, carbs: 0, fats: 3, category: "Protein Source", type: "non-veg" },
            { name: "Apple", weight: 150, calories: 80, protein: 0, carbs: 20, fats: 0, category: "Carb Source", type: "veg" },
            { name: "Flaxseed Powder", weight: 6, calories: 30, protein: 1, carbs: 2, fats: 2, category: "Fat Source", type: "veg" }
        ]
    },
    {
        id: 305, name: "Egg White & Toast Snack", subType: "Snack", region: "International",
        ediblePortion: 100, type: "non-veg", calories: 270, protein: 19, carbs: 32, fats: 6,
        category: "Snacks", servingSize: "1 Plate", isCooked: true, isCombo: true,
        composition: [
            { name: "Egg Whites", weight: 130, calories: 65, protein: 14, carbs: 1, fats: 0, category: "Protein Source", type: "non-veg" },
            { name: "Wheat Toast", weight: 30, calories: 80, protein: 3, carbs: 15, fats: 1, category: "Carb Source", type: "veg" },
            { name: "Apple", weight: 100, calories: 50, protein: 0, carbs: 13, fats: 0, category: "Carb Source", type: "veg" }
        ]
    },

    // --- LEGACY SNACKS ---
    {
        id: 1050, name: "Roasted Chana Pack (Legacy)", subType: "Combo Meal", region: "All",
        ediblePortion: 100, type: "veg", calories: 150, protein: 6, carbs: 20, fats: 4,
        category: "Snacks", servingSize: "1 Pack", isCooked: true, isCombo: true,
        composition: [
            { name: "Roasted Chana", weight: 30, calories: 105, protein: 5, carbs: 18, fats: 1.5 },
            { name: "Tea/Coffee", weight: 150, calories: 40, protein: 1, carbs: 4, fats: 2 }
        ]
    },

    // --- NEW USER MOCK DATA (DINNER) ---
    {
        id: 401, name: "Pepper Chicken & Jowar Roti", subType: "Combo Meal", region: "Indian",
        ediblePortion: 100, type: "non-veg", calories: 371, protein: 31, carbs: 53, fats: 11,
        category: "Dinner", servingSize: "1 Meal", isCooked: true, isCombo: true,
        composition: [
            { name: "Pepper Chicken Breast", weight: 90, calories: 130, protein: 20, carbs: 2, fats: 3 },
            { name: "Jowar Roti", weight: 55, calories: 140, protein: 4, carbs: 30, fats: 1 },
            { name: "Low-fat Curd", weight: 100, calories: 50, protein: 3, carbs: 6, fats: 1 },
            { name: "Tofu-Hung Curd Dip", weight: 180, calories: 51, protein: 4, carbs: 5, fats: 2 }
        ]
    },
    {
        id: 402, name: "Prawn Stir Fry & Brown Rice", subType: "Combo Meal", region: "Indian",
        ediblePortion: 100, type: "non-veg", calories: 369, protein: 30, carbs: 54, fats: 10,
        category: "Dinner", servingSize: "1 Meal", isCooked: true, isCombo: true,
        composition: [
            { name: "Prawn Stir Fry", weight: 120, calories: 120, protein: 18, carbs: 4, fats: 3 },
            { name: "Brown Rice (Cooked)", weight: 130, calories: 150, protein: 3, carbs: 30, fats: 1 },
            { name: "Rasam", weight: 150, calories: 30, protein: 1, carbs: 5, fats: 0 },
            { name: "Paneer-Curd Dip", weight: 90, calories: 69, protein: 8, carbs: 4, fats: 3 }
        ]
    },
    {
        id: 403, name: "Fish Pulusu & Phulka", subType: "Combo Meal", region: "Indian",
        ediblePortion: 100, type: "non-veg", calories: 371, protein: 30, carbs: 54, fats: 11,
        category: "Dinner", servingSize: "1 Meal", isCooked: true, isCombo: true,
        composition: [
            { name: "Rohu/Catla Fish Pulusu", weight: 110, calories: 130, protein: 20, carbs: 3, fats: 4 },
            { name: "Wheat Phulka", weight: 70, calories: 160, protein: 5, carbs: 32, fats: 1 },
            { name: "Veg Stir Fry", weight: 100, calories: 50, protein: 2, carbs: 8, fats: 1 },
            { name: "Sprout Salad", weight: 100, calories: 31, protein: 3, carbs: 5, fats: 1 }
        ]
    }
];

// --- DUPLICATED DINNER ITEMS (FOR STRICT FILTERING) ---
// Clones of Lunch items but with category 'Dinner'
const dinnerItems = [
    {
        id: 4001, name: "Tomato Garlic Prawns (Dinner)", subType: "Combo Meal", region: "International",
        ediblePortion: 100, type: "non-veg", calories: 742, protein: 42.5, carbs: 75, fats: 14.5,
        category: "Dinner", servingSize: "1 Meal", isCooked: true, isCombo: true,
        composition: [
            { name: "Tomato Garlic Prawns", weight: 170, calories: 220, protein: 30, carbs: 8, fats: 6 },
            { name: "Brown Rice", weight: 185, calories: 215, protein: 5, carbs: 42, fats: 2 },
            { name: "Broccoli Stir Fry", weight: 120, calories: 90, protein: 4, carbs: 10, fats: 4 },
            { name: "Salad", weight: 200, calories: 50, protein: 1, carbs: 10, fats: 0 }
        ]
    },
    {
        id: 4002, name: "Classic Dal Rice (Dinner)", subType: "Combo Meal", region: "North Indian",
        ediblePortion: 100, type: "veg", calories: 450, protein: 18, carbs: 70, fats: 10,
        category: "Dinner", servingSize: "1 Plate", isCooked: true, isCombo: true,
        composition: [
            { name: "Steamed Rice", weight: 200, calories: 260, protein: 6, carbs: 56, fats: 1 },
            { name: "Dal Fry", weight: 150, calories: 150, protein: 10, carbs: 12, fats: 6 },
            { name: "Salad", weight: 30, calories: 40, protein: 2, carbs: 2, fats: 3 }
        ]
    },
    {
        id: 4003, name: "Veg Biryani (Dinner)", subType: "Combo Meal", region: "All",
        ediblePortion: 100, type: "veg", calories: 450, protein: 12, carbs: 70, fats: 15,
        category: "Dinner", servingSize: "1 Plate", isCooked: true, isCombo: true,
        composition: [
            { name: "Veg Biryani", weight: 250, calories: 350, protein: 8, carbs: 60, fats: 10 },
            { name: "Raita", weight: 100, calories: 80, protein: 4, carbs: 8, fats: 4 }
        ]
    },
    {
        id: 4004, name: "Curd Rice (Dinner)", subType: "Combo Meal", region: "South Indian",
        ediblePortion: 100, type: "veg", calories: 350, protein: 10, carbs: 50, fats: 12,
        category: "Dinner", servingSize: "1 Bowl", isCooked: true, isCombo: true,
        composition: [
            { name: "Curd Rice", weight: 250, calories: 300, protein: 10, carbs: 48, fats: 8 },
            { name: "Pickle", weight: 20, calories: 50, protein: 0, carbs: 2, fats: 4 }
        ]
    },
    {
        id: 4005, name: "Chicken Curry Meal (Dinner)", subType: "Combo Meal", region: "North Indian",
        ediblePortion: 100, type: "non-veg", calories: 500, protein: 25, carbs: 50, fats: 15,
        category: "Dinner", servingSize: "1 Bowl", isCooked: true, isCombo: true,
        composition: [
            { name: "Chicken Curry", weight: 200, calories: 300, protein: 20, carbs: 10, fats: 10 },
            { name: "Roti (2)", weight: 60, calories: 200, protein: 5, carbs: 40, fats: 5 }
        ]
    }
];


// --- STAPLES FOR FALLBACK GENERATION (Main Course / Breads) ---
// These allow the system to assemble custom meals if no pre-set Combo matches.
const staples = [
    {
        id: 5001, name: "Steamed Rice", subType: "Rice", region: "Indian",
        ediblePortion: 100, type: "veg", calories: 130, protein: 2.7, carbs: 28, fats: 0.3,
        category: "Carb Source", servingSize: "100g", isCooked: true, isCombo: false, // Updated to match usage
        composition: [
            { name: "Raw Rice", weight: 35, calories: 125, protein: 2.5, carbs: 28, fats: 0.2 },
            { name: "Water", weight: 65, calories: 0, protein: 0, carbs: 0, fats: 0 }
        ]
    },
    {
        id: 5002, name: "Brown Rice", subType: "Rice", region: "International",
        ediblePortion: 100, type: "veg", calories: 111, protein: 2.6, carbs: 23, fats: 0.9,
        category: "Carb Source", servingSize: "100g", isCooked: true, isCombo: false,
        composition: [
            { name: "Raw Brown Rice", weight: 35, calories: 105, protein: 2.5, carbs: 22, fats: 0.8 },
            { name: "Water", weight: 65, calories: 6, protein: 0.1, carbs: 1, fats: 0.1 }
        ]
    },
    {
        id: 5003, name: "Roti / Chapati", subType: "Bread", region: "Indian",
        ediblePortion: 100, type: "veg", calories: 297, protein: 10, carbs: 49, fats: 7,
        category: "Carb Source", servingSize: "1 Pc (40g)", isCooked: true, isCombo: false,
        composition: [
            { name: "Whole Wheat Flour", weight: 30, calories: 100, protein: 4, carbs: 22, fats: 0.5 },
            { name: "Water & Kneading", weight: 10, calories: 0, protein: 0, carbs: 0, fats: 0 }
        ]
    },
    {
        id: 5004, name: "Dal Fry", subType: "Curry", region: "Indian",
        ediblePortion: 100, type: "veg", calories: 116, protein: 6, carbs: 12, fats: 5,
        category: "Protein Source", servingSize: "100g", isCooked: true, isCombo: false,
        composition: [
            { name: "Lentils (Dal)", weight: 60, calories: 70, protein: 5, carbs: 12, fats: 0.5 },
            { name: "Onion & Tomato", weight: 25, calories: 15, protein: 0.5, carbs: 3, fats: 0.1 },
            { name: "Ghee / Oil", weight: 10, calories: 80, protein: 0, carbs: 0, fats: 9 },
            { name: "Spices & Garlic", weight: 5, calories: 10, protein: 0.5, carbs: 1, fats: 0.4 }
        ]
    },
    {
        id: 5005, name: "Chicken Curry", subType: "Curry", region: "Indian",
        ediblePortion: 100, type: "non-veg", calories: 140, protein: 15, carbs: 6, fats: 7,
        category: "Protein Source", servingSize: "100g", isCooked: true, isCombo: false,
        composition: [
            { name: "Chicken (Skinless)", weight: 70, calories: 110, protein: 22, carbs: 0, fats: 2.5 },
            { name: "Onion & Tomato", weight: 20, calories: 12, protein: 0.5, carbs: 2.5, fats: 0.1 },
            { name: "Ginger Garlic Paste", weight: 5, calories: 10, protein: 0.5, carbs: 1, fats: 0.4 },
            { name: "Cooking Oil & Spices", weight: 5, calories: 45, protein: 0, carbs: 0, fats: 5 }
        ]
    },
    {
        id: 5006, name: "Paneer Butter Masala", subType: "Curry", region: "Indian",
        ediblePortion: 100, type: "veg", calories: 230, protein: 8, carbs: 10, fats: 18,
        category: "Protein Source", servingSize: "100g", isCooked: true, isCombo: false,
        composition: [
            { name: "Paneer", weight: 60, calories: 160, protein: 11, carbs: 2, fats: 14 },
            { name: "Tomato Puree", weight: 20, calories: 15, protein: 0.5, carbs: 3, fats: 0.1 },
            { name: "Butter/Cream", weight: 15, calories: 90, protein: 0.5, carbs: 1, fats: 10 },
            { name: "Spices", weight: 5, calories: 15, protein: 1, carbs: 2, fats: 1 }
        ]
    },
    {
        id: 5007, name: "Mixed Vegetable Curry", subType: "Curry", region: "Indian",
        ediblePortion: 100, type: "veg", calories: 90, protein: 3, carbs: 8, fats: 5,
        category: "Vegetables", servingSize: "100g", isCooked: true, isCombo: false,
        composition: [
            { name: "Carrot, Peas, Beans", weight: 70, calories: 45, protein: 2, carbs: 9, fats: 0.2 },
            { name: "Potato", weight: 15, calories: 12, protein: 0.3, carbs: 3, fats: 0 },
            { name: "Gravy Base", weight: 10, calories: 20, protein: 0.5, carbs: 3, fats: 1 },
            { name: "Oil", weight: 5, calories: 45, protein: 0, carbs: 0, fats: 5 }
        ]
    },
    {
        id: 5008, name: "Grilled Chicken Breast", subType: "Main", region: "International",
        ediblePortion: 100, type: "non-veg", calories: 165, protein: 31, carbs: 0, fats: 3.6,
        category: "Protein Source", servingSize: "100g", isCooked: true, isCombo: false,
        composition: [
            { name: "Chicken Breast", weight: 95, calories: 155, protein: 30, carbs: 0, fats: 3 },
            { name: "Seasoning & Oil", weight: 5, calories: 10, protein: 1, carbs: 0, fats: 0.6 }
        ]
    },
    {
        id: 5009, name: "Rajma Curry", subType: "Curry", region: "Indian",
        ediblePortion: 100, type: "veg", calories: 120, protein: 6, carbs: 14, fats: 5,
        category: "Protein Source", servingSize: "100g", isCooked: true, isCombo: false,
        composition: [
            { name: "Kidney Beans (Rajma)", weight: 60, calories: 75, protein: 5, carbs: 14, fats: 0.5 },
            { name: "Onion & Tomato Gravy", weight: 30, calories: 20, protein: 0.5, carbs: 4, fats: 0.1 },
            { name: "Ginger Garlic Paste", weight: 5, calories: 10, protein: 0.5, carbs: 1, fats: 0.4 },
            { name: "Oil & Spices", weight: 5, calories: 45, protein: 0, carbs: 0, fats: 5 }
        ]
    },
    {
        id: 5010, name: "Sambar", subType: "Curry", region: "South Indian",
        ediblePortion: 100, type: "veg", calories: 55, protein: 2, carbs: 10, fats: 1,
        category: "Protein Source", servingSize: "1 Bowl", isCooked: true, isCombo: false,
        composition: [
            { name: "Arhar Dal (Lentils)", weight: 30, calories: 35, protein: 2.5, carbs: 6, fats: 0.2 },
            { name: "Mixed Vegetables", weight: 60, calories: 25, protein: 1, carbs: 5, fats: 0.1 },
            { name: "Tamarind & Spices", weight: 10, calories: 15, protein: 0.5, carbs: 3, fats: 0.5 }
        ]
    },
    {
        id: 5011, name: "Coconut Chutney", subType: "Condiment", region: "South Indian",
        ediblePortion: 100, type: "veg", calories: 200, protein: 2, carbs: 6, fats: 18,
        category: "Fat Source", servingSize: "1 Serving", isCooked: false, isCombo: false,
        composition: [
            { name: "Fresh Coconut", weight: 70, calories: 150, protein: 2, carbs: 8, fats: 14 },
            { name: "Roasted Gram", weight: 15, calories: 35, protein: 2, carbs: 6, fats: 1 },
            { name: "Tempering (Oil/Curry Leaves)", weight: 15, calories: 65, protein: 0.5, carbs: 2, fats: 6 }
        ]
    },
    {
        id: 5014, name: "Egg Curry", subType: "Curry", region: "Indian",
        ediblePortion: 100, type: "egg", calories: 110, protein: 7, carbs: 4, fats: 7,
        category: "Protein Source", servingSize: "100g", isCooked: true, isCombo: false,
        composition: [
            { name: "Boiled Egg", weight: 50, calories: 75, protein: 6.5, carbs: 0.6, fats: 5 },
            { name: "Curry Base (Onion/Tomato/Oil)", weight: 50, calories: 35, protein: 0.5, carbs: 3.4, fats: 2 }
        ]
    },
    {
        id: 5015, name: "Egg Bhurji", subType: "Side", region: "Indian",
        ediblePortion: 100, type: "egg", calories: 160, protein: 12, carbs: 2, fats: 11,
        category: "Protein Source", servingSize: "100g", isCooked: true, isCombo: false,
        composition: [
            { name: "Egg", weight: 80, calories: 120, protein: 11, carbs: 1, fats: 8 },
            { name: "Vegetables & Oil", weight: 20, calories: 40, protein: 1, carbs: 1, fats: 3 }
        ]
    },
    {
        id: 5012, name: "Veg Biryani", subType: "Rice", region: "Indian",
        ediblePortion: 100, type: "veg", calories: 140, protein: 3, carbs: 24, fats: 4,
        category: "Carb Source", servingSize: "100g", isCooked: true, isCombo: false,
        composition: [
            { name: "Basmati Rice", weight: 60, calories: 75, protein: 1.5, carbs: 17, fats: 0.1 },
            { name: "Mixed Vegetables", weight: 30, calories: 45, protein: 1.5, carbs: 6, fats: 0.2 },
            { name: "Biryani Spices & Oil", weight: 10, calories: 20, protein: 0, carbs: 1, fats: 3.7 }
        ]
    },
    {
        id: 5013, name: "Mixed Veg Raita", subType: "Side", region: "Indian",
        ediblePortion: 100, type: "veg", calories: 80, protein: 4, carbs: 8, fats: 4,
        category: "Protein Source", servingSize: "100g", isCooked: true, isCombo: false,
        composition: [
            { name: "Yogurt / Curd", weight: 80, calories: 50, protein: 3.5, carbs: 5, fats: 2.5 },
            { name: "Cucumber & Onion", weight: 15, calories: 10, protein: 0.5, carbs: 2, fats: 0 },
            { name: "Spices & Herbs", weight: 5, calories: 20, protein: 0, carbs: 1, fats: 1.5 }
        ]
    },
    {
        id: 5016, name: "Vegetable Poha", subType: "Main", region: "North Indian",
        ediblePortion: 100, type: "veg", calories: 150, protein: 3, carbs: 28, fats: 4,
        category: "Carb Source", servingSize: "100g", isCooked: true, isCombo: false,
        composition: [
            { name: "Poha (Flattened Rice)", weight: 70, calories: 110, protein: 2, carbs: 25, fats: 0.5 },
            { name: "Onion & Peas", weight: 20, calories: 15, protein: 0.5, carbs: 3, fats: 0.1 },
            { name: "Oil & Peanuts", weight: 10, calories: 25, protein: 0.5, carbs: 0, fats: 3.4 }
        ]
    },
    {
        id: 5017, name: "Vegetable Upma", subType: "Main", region: "South Indian",
        ediblePortion: 100, type: "veg", calories: 180, protein: 4, carbs: 30, fats: 5,
        category: "Carb Source", servingSize: "100g", isCooked: true, isCombo: false,
        composition: [
            { name: "Semolina (Sooji)", weight: 60, calories: 130, protein: 3, carbs: 28, fats: 0.5 },
            { name: "Vegetables (Carrot/Peas)", weight: 30, calories: 15, protein: 0.5, carbs: 2, fats: 0.1 },
            { name: "Oil & Tempering", weight: 10, calories: 35, protein: 0.5, carbs: 0, fats: 4.4 }
        ]
    },
    {
        id: 5018, name: "Masala Dosa", subType: "Main", region: "South Indian",
        ediblePortion: 100, type: "veg", calories: 150, protein: 3, carbs: 25, fats: 4,
        category: "Carb Source", servingSize: "100g", isCooked: true, isCombo: false,
        composition: [
            { name: "Dosa Crepe", weight: 60, calories: 90, protein: 2, carbs: 18, fats: 1.5 },
            { name: "Potato Masala Filling", weight: 40, calories: 60, protein: 1, carbs: 7, fats: 2.5 }
        ]
    },
    {
        id: 5019, name: "Aloo Paratha", subType: "Main", region: "North Indian",
        ediblePortion: 100, type: "veg", calories: 235, protein: 5, carbs: 38, fats: 8,
        category: "Carb Source", servingSize: "100g", isCooked: true, isCombo: false,
        composition: [
            { name: "Whole Wheat Dough", weight: 60, calories: 140, protein: 4, carbs: 28, fats: 1 },
            { name: "Potato Filling", weight: 35, calories: 50, protein: 1, carbs: 10, fats: 0.5 },
            { name: "Ghee/Oil", weight: 5, calories: 45, protein: 0, carbs: 0, fats: 6.5 }
        ]
    },
    {
        id: 5020, name: "Steel-cut Oats (Cooked)", subType: "Grain", region: "International",
        ediblePortion: 100, type: "veg", calories: 115, protein: 3.5, carbs: 20, fats: 1.8,
        category: "Carb Source", servingSize: "100g", isCooked: true, isCombo: false,
        composition: [
            { name: "Raw Steel-cut Oats", weight: 30, calories: 110, protein: 3.5, carbs: 20, fats: 1.8 },
            { name: "Water", weight: 70, calories: 5, protein: 0, carbs: 0, fats: 0 }
        ]
    },
    {
        id: 5021, name: "Pepper Chicken Breast", subType: "Main", region: "Indian",
        ediblePortion: 100, type: "non-veg", calories: 145, protein: 22, carbs: 2, fats: 5,
        category: "Protein Source", servingSize: "100g", isCooked: true, isCombo: false,
        composition: [
            { name: "Chicken Breast", weight: 85, calories: 120, protein: 21, carbs: 0, fats: 2.5 },
            { name: "Pepper & Spices", weight: 10, calories: 10, protein: 1, carbs: 2, fats: 0.5 },
            { name: "Oil", weight: 5, calories: 15, protein: 0, carbs: 0, fats: 2 }
        ]
    },
    {
        id: 5022, name: "Jowar Roti", subType: "Bread", region: "Indian",
        ediblePortion: 100, type: "veg", calories: 250, protein: 7, carbs: 54, fats: 2,
        category: "Carb Source", servingSize: "1 Pc", isCooked: true, isCombo: false,
        composition: [
            { name: "Jowar Flour", weight: 70, calories: 240, protein: 7, carbs: 52, fats: 2 },
            { name: "Water", weight: 30, calories: 10, protein: 0, carbs: 2, fats: 0 }
        ]
    },
    {
        id: 5023, name: "Prawn Stir Fry", subType: "Main", region: "International",
        ediblePortion: 100, type: "non-veg", calories: 100, protein: 15, carbs: 3, fats: 3,
        category: "Protein Source", servingSize: "100g", isCooked: true, isCombo: false,
        composition: [
            { name: "Prawns", weight: 80, calories: 70, protein: 14, carbs: 0.2, fats: 0.5 },
            { name: "Vegetables (Capsicum/Onion)", weight: 15, calories: 10, protein: 0.5, carbs: 2, fats: 0 },
            { name: "Oil & Sauces", weight: 5, calories: 20, protein: 0.5, carbs: 0.8, fats: 2.5 }
        ]
    },
    {
        id: 5024, name: "Rohu/Catla Fish Pulusu", subType: "Curry", region: "South Indian",
        ediblePortion: 100, type: "non-veg", calories: 120, protein: 18, carbs: 3, fats: 4,
        category: "Protein Source", servingSize: "100g", isCooked: true, isCombo: false,
        composition: [
            { name: "Fish (Rohu/Catla)", weight: 75, calories: 95, protein: 17, carbs: 0, fats: 2 },
            { name: "Tamarind Gravy", weight: 20, calories: 15, protein: 0.5, carbs: 3, fats: 0.5 },
            { name: "Oil & Spices", weight: 5, calories: 10, protein: 0.5, carbs: 0, fats: 1.5 }
        ]
    },
    {
        id: 5025, name: "Beans Poriyal", subType: "Side", region: "South Indian",
        ediblePortion: 100, type: "veg", calories: 70, protein: 4, carbs: 10, fats: 2,
        category: "Vegetables", servingSize: "100g", isCooked: true, isCombo: false,
        composition: [
            { name: "Green Beans", weight: 85, calories: 40, protein: 3, carbs: 8, fats: 0.2 },
            { name: "Grated Coconut", weight: 10, calories: 20, protein: 0.5, carbs: 1, fats: 1.5 },
            { name: "Oil & Mustard Seeds", weight: 5, calories: 10, protein: 0.5, carbs: 1, fats: 0.3 }
        ]
    },
    {
        id: 5026, name: "Veg Kurma", subType: "Curry", region: "South Indian",
        ediblePortion: 100, type: "veg", calories: 140, protein: 3, carbs: 17, fats: 7,
        category: "Vegetables", servingSize: "100g", isCooked: true, isCombo: false,
        composition: [
            { name: "Mixed Vegetables", weight: 60, calories: 35, protein: 1.5, carbs: 7, fats: 0.2 },
            { name: "Coconut & Poppy Paste", weight: 30, calories: 80, protein: 1, carbs: 8, fats: 5 },
            { name: "Oil & Spices", weight: 10, calories: 25, protein: 0.5, carbs: 2, fats: 1.8 }
        ]
    },
    {
        id: 5027, name: "Mushroom Pepper Fry", subType: "Side", region: "Indian",
        ediblePortion: 100, type: "veg", calories: 65, protein: 3, carbs: 8, fats: 3,
        category: "Vegetables", servingSize: "100g", isCooked: true, isCombo: false,
        composition: [
            { name: "Mushrooms", weight: 80, calories: 25, protein: 2.5, carbs: 4, fats: 0.2 },
            { name: "Onion & Pepper", weight: 15, calories: 15, protein: 0.5, carbs: 4, fats: 0.3 },
            { name: "Oil", weight: 5, calories: 25, protein: 0, carbs: 0, fats: 2.5 }
        ]
    },
    {
        id: 5028, name: "Broccoli Stir Fry", subType: "Side", region: "International",
        ediblePortion: 100, type: "veg", calories: 75, protein: 3, carbs: 8, fats: 4,
        category: "Vegetables", servingSize: "100g", isCooked: true, isCombo: false,
        composition: [
            { name: "Broccoli", weight: 90, calories: 35, protein: 2.5, carbs: 6, fats: 0.4 },
            { name: "Garlic & Olive Oil", weight: 10, calories: 40, protein: 0.5, carbs: 2, fats: 3.6 }
        ]
    },
    {
        id: 5029, name: "Idli", subType: "Main", region: "South Indian",
        ediblePortion: 100, type: "veg", calories: 120, protein: 4, carbs: 24, fats: 0.5,
        category: "Carb Source", servingSize: "1 Pc (50g)", isCooked: true, isCombo: false,
        composition: [
            { name: "Parboiled Rice", weight: 35, calories: 80, protein: 2, carbs: 18, fats: 0.2 },
            { name: "Urad Dal", weight: 15, calories: 40, protein: 2, carbs: 6, fats: 0.3 }
        ]
    },
    {
        id: 5030, name: "Plain Dosa", subType: "Main", region: "South Indian",
        ediblePortion: 100, type: "veg", calories: 165, protein: 4, carbs: 28, fats: 4,
        category: "Carb Source", servingSize: "1 Pc", isCooked: true, isCombo: false,
        composition: [
            { name: "Rice & Urad Dal Batter", weight: 90, calories: 120, protein: 4, carbs: 26, fats: 0.5 },
            { name: "Cooking Oil", weight: 10, calories: 45, protein: 0, carbs: 2, fats: 3.5 }
        ]
    },
    {
        id: 5031, name: "Curd Rice", subType: "Main", region: "South Indian",
        ediblePortion: 100, type: "veg", calories: 120, protein: 4, carbs: 19, fats: 3,
        category: "Carb Source", servingSize: "100g", isCooked: true, isCombo: false,
        composition: [
            { name: "Steamed Rice", weight: 60, calories: 78, protein: 1.6, carbs: 17, fats: 0.2 },
            { name: "Yogurt / Curd", weight: 35, calories: 25, protein: 2, carbs: 2, fats: 1.5 },
            { name: "Tempering (Oil/Mustard)", weight: 5, calories: 17, protein: 0.4, carbs: 0, fats: 1.3 }
        ]
    },
    {
        id: 5032, name: "Rasam", subType: "Curry", region: "South Indian",
        ediblePortion: 100, type: "veg", calories: 25, protein: 0.5, carbs: 3, fats: 1,
        category: "Liquid", servingSize: "1 Bowl", isCooked: true, isCombo: false,
        composition: [
            { name: "Tamarind & Tomato Water", weight: 90, calories: 10, protein: 0.2, carbs: 2, fats: 0.1 },
            { name: "Rasam Spices & Oil", weight: 10, calories: 15, protein: 0.3, carbs: 1, fats: 0.9 }
        ]
    },
    {
        id: 5033, name: "Tofu-Hung Curd Dip", subType: "Condiment", region: "International",
        ediblePortion: 100, type: "veg", calories: 28, protein: 2.2, carbs: 2.8, fats: 1.1,
        category: "Protein Source", servingSize: "1 Serving", isCooked: false, isCombo: false,
        composition: [
            { name: "Hung Curd", weight: 60, calories: 18, protein: 1.2, carbs: 2, fats: 0.6 },
            { name: "Silken Tofu", weight: 40, calories: 10, protein: 1, carbs: 0.8, fats: 0.5 }
        ]
    },
    {
        id: 5034, name: "Paneer-Curd Dip", subType: "Condiment", region: "Indian",
        ediblePortion: 100, type: "veg", calories: 76, protein: 8.8, carbs: 4.4, fats: 3.3,
        category: "Protein Source", servingSize: "1 Serving", isCooked: false, isCombo: false,
        composition: [
            { name: "Yogurt / Curd", weight: 50, calories: 30, protein: 3, carbs: 4, fats: 1 },
            { name: "Mashed Paneer", weight: 50, calories: 46, protein: 5.8, carbs: 0.4, fats: 2.3 }
        ]
    },
    {
        id: 5035, name: "Wheat Phulka", subType: "Bread", region: "Indian",
        ediblePortion: 100, type: "veg", calories: 230, protein: 7, carbs: 46, fats: 1.5,
        category: "Carb Source", servingSize: "1 Pc (35-40g)", isCooked: true, isCombo: false,
        composition: [
            { name: "Whole Wheat Flour", weight: 70, calories: 220, protein: 7, carbs: 45, fats: 1 },
            { name: "Water & Fire (Cooking)", weight: 30, calories: 10, protein: 0, carbs: 1, fats: 0.5 }
        ]
    }
];


// --- EXPANDED REGIONAL ITEMS FOR STRICT FILTERING ---
const regionalItems = [
    // South Indian Lunch/Dinner
    {
        id: 6001, name: "Sambar Rice & Beans", subType: "Combo Meal", region: "South Indian",
        ediblePortion: 100, type: "veg", calories: 420, protein: 14, carbs: 75, fats: 6,
        category: "Lunch", servingSize: "1 Bowl", isCooked: true, isCombo: true,
        composition: [
            { name: "Sambar Rice", weight: 250, calories: 350, protein: 10, carbs: 65, fats: 4 },
            { name: "Beans Poriyal", weight: 100, calories: 70, protein: 4, carbs: 10, fats: 2 }
        ]
    },
    {
        id: 6002, name: "Chapati & Veg Kurma (South)", subType: "Combo Meal", region: "South Indian",
        ediblePortion: 100, type: "veg", calories: 450, protein: 12, carbs: 65, fats: 15,
        category: "Dinner", servingSize: "1 Plate", isCooked: true, isCombo: true,
        composition: [
            { name: "Chapati (2)", weight: 80, calories: 240, protein: 8, carbs: 40, fats: 4 },
            { name: "Veg Kurma", weight: 150, calories: 210, protein: 4, carbs: 25, fats: 11 }
        ]
    },
    // North Indian Lunch
    {
        id: 6003, name: "Rajma Chawal Meal", subType: "Combo Meal", region: "North Indian",
        ediblePortion: 100, type: "veg", calories: 480, protein: 16, carbs: 80, fats: 10,
        category: "Lunch", servingSize: "1 Bowl", isCooked: true, isCombo: true,
        composition: [
            { name: "Steamed Rice", weight: 200, calories: 260, protein: 6, carbs: 56, fats: 1 },
            { name: "Rajma Curry", weight: 180, calories: 220, protein: 10, carbs: 24, fats: 9 }
        ]
    },
    // International Dinner
    {
        id: 6004, name: "Grilled Fish & Quinoa", subType: "Combo Meal", region: "International",
        ediblePortion: 100, type: "non-veg", calories: 410, protein: 35, carbs: 40, fats: 10,
        category: "Dinner", servingSize: "1 Plate", isCooked: true, isCombo: true,
        composition: [
            { name: "Grilled Fish", weight: 150, calories: 200, protein: 30, carbs: 0, fats: 8 },
            { name: "Quinoa", weight: 150, calories: 180, protein: 5, carbs: 32, fats: 2 },
            { name: "Steamed Veggies", weight: 100, calories: 30, protein: 0, carbs: 8, fats: 0 }
        ]
    }
];

foodDatabase.push(...dinnerItems);
foodDatabase.push(...staples);
foodDatabase.push(...regionalItems);