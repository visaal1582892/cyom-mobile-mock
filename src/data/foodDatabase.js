
export const foodDatabase = [
    // --- GENERIC RAW INGREDIENTS (FOR SWAPPING) ---
    {
        id: 9001, name: "White Rice (Raw)", subType: "Grain", region: "All",
        calories: 360, protein: 7, carbs: 79, fats: 1, category: "Generic", isCooked: false
    },
    {
        id: 9002, name: "Brown Rice (Raw)", subType: "Grain", region: "All",
        calories: 360, protein: 8, carbs: 76, fats: 3, category: "Generic", isCooked: false
    },
    {
        id: 9003, name: "Quinoa (Raw)", subType: "Grain", region: "All",
        calories: 370, protein: 14, carbs: 64, fats: 6, category: "Generic", isCooked: false
    },
    {
        id: 9004, name: "Oats (Raw)", subType: "Grain", region: "All",
        calories: 389, protein: 17, carbs: 66, fats: 7, category: "Generic", isCooked: false
    },
    {
        id: 9005, name: "Chicken Breast (Raw)", subType: "Protein", region: "All",
        calories: 120, protein: 23, carbs: 0, fats: 2.5, category: "Generic", isCooked: false
    },
    {
        id: 9006, name: "Turkey Breast (Raw)", subType: "Protein", region: "All",
        calories: 110, protein: 24, carbs: 0, fats: 1, category: "Generic", isCooked: false
    },
    {
        id: 9007, name: "Paneer (Raw)", subType: "Protein", region: "Indian",
        calories: 265, protein: 18, carbs: 1, fats: 20, category: "Generic", isCooked: false
    },
    {
        id: 9008, name: "Tofu (Raw)", subType: "Protein", region: "All",
        calories: 144, protein: 16, carbs: 3, fats: 8, category: "Generic", isCooked: false
    },
    {
        id: 9009, name: "Whole Egg (Raw)", subType: "Protein", region: "All",
        calories: 143, protein: 13, carbs: 1, fats: 9, category: "Generic", isCooked: false
    },
    {
        id: 9010, name: "Egg Whites (Raw)", subType: "Protein", region: "All",
        calories: 52, protein: 11, carbs: 1, fats: 0, category: "Generic", isCooked: false
    },
    {
        id: 9011, name: "Toor Dal (Raw)", subType: "Pulse", region: "Indian",
        calories: 343, protein: 22, carbs: 63, fats: 1.5, category: "Generic", isCooked: false
    },
    {
        id: 9012, name: "Moong Dal (Raw)", subType: "Pulse", region: "Indian",
        calories: 348, protein: 24, carbs: 60, fats: 1.2, category: "Generic", isCooked: false
    },
    {
        id: 9013, name: "Potato (Raw)", subType: "Vegetable", region: "All",
        calories: 77, protein: 2, carbs: 17, fats: 0.1, category: "Generic", isCooked: false
    },
    {
        id: 9014, name: "Sweet Potato (Raw)", subType: "Vegetable", region: "All",
        calories: 86, protein: 1.6, carbs: 20, fats: 0.1, category: "Generic", isCooked: false
    },
    {
        id: 9015, name: "Broccoli (Raw)", subType: "Vegetable", region: "All",
        calories: 34, protein: 2.8, carbs: 7, fats: 0.4, category: "Generic", isCooked: false
    },
    {
        id: 9016, name: "Spinach (Raw)", subType: "Vegetable", region: "All",
        calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4, category: "Generic", isCooked: false
    },

    // --- BREAKFAST MEALS (LEGACY PRESERVED) ---
    {
        id: 1, name: "Oats Porridge Meal", subType: "Combo Meal", region: "All",
        ediblePortion: 100, type: "veg", calories: 350, protein: 12, carbs: 55, fats: 8,
        category: "Breakfast", servingSize: "1 Bowl", isCooked: true, isCombo: true,
        tags: ["High Fiber", "Vegetarian", "Heart Healthy"],
        composition: [
            { name: "Oats Porridge", weight: 250, calories: 250, protein: 10, carbs: 45, fats: 4 },
            { name: "Almonds/Walnuts", weight: 15, calories: 100, protein: 2, carbs: 10, fats: 4 }
        ]
    },
    {
        id: 2, name: "Vegetable Poha Meal", subType: "Combo Meal", region: "North Indian",
        ediblePortion: 100, type: "veg", calories: 350, protein: 8, carbs: 60, fats: 10,
        category: "Breakfast", servingSize: "1 Plate", isCooked: true, isCombo: true,
        tags: ["Vegetarian", "Light", "Gluten Free"],
        composition: [
            { name: "Vegetable Poha", weight: 200, calories: 300, protein: 6, carbs: 55, fats: 8 },
            { name: "Bhujia/Sev", weight: 10, calories: 50, protein: 2, carbs: 5, fats: 2 }
        ]
    },
    {
        id: 3, name: "Idli Sambar Meal", subType: "Combo Meal", region: "South Indian",
        ediblePortion: 100, type: "veg", calories: 300, protein: 10, carbs: 55, fats: 4,
        category: "Breakfast", servingSize: "1 Plate", isCooked: true, isCombo: true,
        tags: ["Vegetarian", "Fermented", "Gut Health", "Gluten Free"],
        composition: [
            { name: "Idli (3 pcs)", weight: 150, calories: 180, protein: 6, carbs: 36, fats: 0 },
            { name: "Sambar", weight: 150, calories: 80, protein: 3, carbs: 15, fats: 1 },
            { name: "Coconut Chutney", weight: 20, calories: 40, protein: 1, carbs: 4, fats: 3 }
        ]
    },
    {
        id: 4, name: "Masala Dosa Meal", subType: "Combo Meal", region: "South Indian",
        ediblePortion: 100, type: "veg", calories: 400, protein: 10, carbs: 65, fats: 12,
        category: "Breakfast", servingSize: "1 Plate", isCooked: true, isCombo: true,
        composition: [
            { name: "Masala Dosa", weight: 200, calories: 300, protein: 6, carbs: 50, fats: 8 },
            { name: "Sambar", weight: 100, calories: 60, protein: 3, carbs: 10, fats: 1 },
            { name: "Coconut Chutney", weight: 20, calories: 40, protein: 1, carbs: 5, fats: 3 }
        ]
    },
    {
        id: 6, name: "Classic Scrambled Eggs", subType: "Combo Meal", region: "International",
        ediblePortion: 100, type: "non-veg", calories: 350, protein: 20, carbs: 25, fats: 18,
        category: "Breakfast", servingSize: "1 Plate", isCooked: true, isCombo: true,
        tags: ["High Protein", "Low Carb", "Keto Friendly"],
        composition: [
            { name: "Scrambled Eggs (2)", weight: 120, calories: 180, protein: 14, carbs: 2, fats: 14 },
            { name: "Buttered Toast", weight: 50, calories: 150, protein: 4, carbs: 20, fats: 4 },
            { name: "Grilled Tomato", weight: 50, calories: 20, protein: 2, carbs: 3, fats: 0 }
        ]
    },
    {
        id: 7, name: "Aloo Paratha Meal", subType: "Combo Meal", region: "North Indian",
        ediblePortion: 100, type: "veg", calories: 400, protein: 10, carbs: 60, fats: 15,
        category: "Breakfast", servingSize: "1 Plate", isCooked: true, isCombo: true,
        composition: [
            { name: "Aloo Paratha", weight: 120, calories: 280, protein: 6, carbs: 45, fats: 10 },
            { name: "Curd/Yogurt", weight: 100, calories: 80, protein: 4, carbs: 10, fats: 3 },
            { name: "Pickle", weight: 15, calories: 40, protein: 0, carbs: 5, fats: 2 }
        ]
    },

    // --- NEW USER MOCK DATA (BREAKFAST - PRIMARY) ---
    {
        id: 101, name: "Steel-cut Oats & Egg Whites", subType: "Combo Meal", region: "International",
        ediblePortion: 100, type: "non-veg", calories: 465, protein: 36, carbs: 52, fats: 13,
        category: "Breakfast", servingSize: "1 Bowl", isCooked: true, isCombo: true,
        composition: [
            { name: "Steel-cut Oats (Cooked)", weight: 220, calories: 250, protein: 8, carbs: 45, fats: 4 },
            { name: "Egg Whites", weight: 200, calories: 100, protein: 22, carbs: 1, fats: 0 },
            { name: "Avocado", weight: 50, calories: 80, protein: 1, carbs: 4, fats: 7 },
            { name: "Cooking Oil", weight: 5, calories: 35, protein: 0, carbs: 2, fats: 2 }
        ]
    },
    {
        id: 102, name: "Veg Omelette & Oats", subType: "Combo Meal", region: "International",
        ediblePortion: 100, type: "non-veg", calories: 465, protein: 35, carbs: 50, fats: 13,
        category: "Breakfast", servingSize: "1 Meal", isCooked: true, isCombo: true,
        composition: [
            { name: "Oats (Cooked)", weight: 200, calories: 140, protein: 5, carbs: 25, fats: 2 },
            { name: "Whole Egg & Whites Mix", weight: 170, calories: 150, protein: 20, carbs: 2, fats: 6 },
            { name: "Vegetables", weight: 100, calories: 40, protein: 2, carbs: 8, fats: 0 },
            { name: "Cooking Oil", weight: 5, calories: 45, protein: 0, carbs: 0, fats: 5 }
        ]
    },
    {
        id: 103, name: "Whey Oats Bowl", subType: "Combo Meal", region: "International",
        ediblePortion: 100, type: "veg", calories: 465, protein: 35, carbs: 54, fats: 13,
        category: "Breakfast", servingSize: "1 Bowl", isCooked: true, isCombo: true,
        composition: [
            { name: "Oats (Cooked)", weight: 200, calories: 160, protein: 6, carbs: 30, fats: 3 },
            { name: "Whey Protein", weight: 25, calories: 100, protein: 20, carbs: 2, fats: 1 },
            { name: "Almond Butter", weight: 10, calories: 90, protein: 3, carbs: 3, fats: 8 },
            { name: "Apple", weight: 100, calories: 52, protein: 0, carbs: 14, fats: 0 }
        ]
    },
    {
        id: 104, name: "Avocado Toast & Egg Whites", subType: "Combo Meal", region: "International",
        ediblePortion: 100, type: "non-veg", calories: 465, protein: 35, carbs: 52, fats: 13,
        category: "Breakfast", servingSize: "1 Plate", isCooked: true, isCombo: true,
        composition: [
            { name: "Whole Wheat Bread", weight: 70, calories: 180, protein: 8, carbs: 35, "fats": 2 },
            { name: "Avocado", weight: 70, calories: 115, protein: 1, carbs: 6, fats: 10 },
            { name: "Egg Whites", weight: 200, calories: 100, protein: 22, carbs: 2, fats: 0 },
            { name: "Oil (for toast)", weight: 5, calories: 45, protein: 0, carbs: 0, fats: 5 }
        ]
    },
    {
        id: 105, name: "PB Toast & Whey", subType: "Combo Meal", region: "International",
        ediblePortion: 100, type: "veg", calories: 465, protein: 35, carbs: 54, fats: 13,
        category: "Breakfast", servingSize: "1 Meal", isCooked: true, isCombo: true,
        composition: [
            { name: "Whole Wheat Bread", weight: 70, calories: 185, protein: 9, carbs: 35, fats: 2 },
            { name: "Peanut Butter", weight: 20, calories: 120, protein: 5, carbs: 4, fats: 10 },
            { name: "Whey Protein", weight: 25, calories: 100, protein: 20, carbs: 2, fats: 1 },
            { name: "Apple", weight: 100, calories: 50, protein: 1, carbs: 13, fats: 0 }
        ]
    },

    // --- RE-INDEXED OLD CUSTOM COMBOS (1000-series) ---
    {
        id: 1001, name: "Egg Dosa Combo (Legacy)", subType: "Combo Meal", region: "South Indian",
        ediblePortion: 100, type: "non-veg", calories: 462, protein: 18, carbs: 56, fats: 12,
        category: "Breakfast", servingSize: "1 Meal", isCooked: true, isCombo: true,
        composition: [
            { name: "Plain Dosa/Idli", weight: 120, calories: 250, protein: 6, carbs: 50, fats: 2 },
            { name: "Egg Spread/Omelette", weight: 50, calories: 140, protein: 12, carbs: 1, fats: 9 },
            { name: "Black Tea/Coffee", weight: 200, calories: 5, protein: 0, carbs: 1, fats: 0 }
        ]
    },

    // --- NEW USER MOCK DATA (LUNCH/DINNER) ---
    {
        id: 201, name: "Chicken Curry Rice Bowl", subType: "Combo Meal", region: "Indian",
        ediblePortion: 100, type: "non-veg", calories: 742, protein: 43, carbs: 75, fats: 14.5,
        category: "Lunch", servingSize: "1 Meal", isCooked: true, isCombo: true,
        tags: ["High Protein", "Spicy", "Fiber Rich"],
        composition: [
            { name: "Chicken Curry (Skinless Breast)", weight: 150, calories: 250, protein: 35, carbs: 5, fats: 8 },
            { name: "Brown Rice (Cooked)", weight: 180, calories: 210, protein: 5, carbs: 44, fats: 2 },
            { name: "Avocado", weight: 50, calories: 80, protein: 1, carbs: 4, fats: 4.5 },
            { name: "Low-fat Curd", weight: 120, calories: 70, protein: 5, carbs: 8, fats: 0 },
            { name: "Mixed Salad", weight: 200, calories: 50, protein: 1, carbs: 10, fats: 0 }
        ]
    },
    {
        id: 202, name: "Fish Curry & Mushroom Fry", subType: "Combo Meal", region: "Indian",
        ediblePortion: 100, type: "non-veg", calories: 742, protein: 41.5, carbs: 73, fats: 15,
        category: "Lunch", servingSize: "1 Meal", isCooked: true, isCombo: true,
        composition: [
            { name: "Sardine/Mackerel Curry", weight: 120, calories: 220, protein: 25, carbs: 5, fats: 10 },
            { name: "Brown Rice (Cooked)", weight: 175, calories: 200, protein: 4, carbs: 40, fats: 2 },
            { name: "Mushroom Pepper Fry", weight: 120, calories: 80, protein: 4, carbs: 10, fats: 3 },
            { name: "Mixed Salad", weight: 200, calories: 50, protein: 2, carbs: 10, fats: 0 },
            { name: "Rasam", weight: 180, calories: 40, protein: 1, carbs: 5, fats: 0 }
        ]
    },
    {
        id: 203, name: "Tomato Garlic Prawns & Broccoli", subType: "Combo Meal", region: "International",
        ediblePortion: 100, type: "non-veg", calories: 742, protein: 42.5, carbs: 75, fats: 14.5,
        category: "Lunch", servingSize: "1 Meal", isCooked: true, isCombo: true,
        composition: [
            { name: "Tomato Garlic Prawns", weight: 170, calories: 220, protein: 30, carbs: 8, fats: 6 },
            { name: "Brown Rice (Cooked)", weight: 185, calories: 215, protein: 5, carbs: 42, fats: 2 },
            { name: "Broccoli Stir Fry", weight: 120, calories: 90, protein: 4, carbs: 10, fats: 4 },
            { name: "Mixed Salad", weight: 200, calories: 50, protein: 1, carbs: 10, fats: 0 },
            { name: "Clear Chicken Soup", weight: 200, calories: 60, protein: 3, carbs: 5, fats: 2 }
        ]
    },

    // --- LEGACY LUNCH PRESERVED (~ID 2000) ---
    {
        id: 2000, name: "Classic Dal Rice Meal", subType: "Combo Meal", region: "North Indian",
        ediblePortion: 100, type: "veg", calories: 450, protein: 18, carbs: 70, fats: 10,
        category: "Lunch", servingSize: "1 Plate", isCooked: true, isCombo: true,
        composition: [
            { name: "Steamed Rice", weight: 200, calories: 260, protein: 6, carbs: 56, fats: 1 },
            { name: "Dal Fry", weight: 150, calories: 150, protein: 10, carbs: 12, fats: 6 },
            { name: "Papad/Salad", weight: 30, calories: 40, protein: 2, carbs: 2, fats: 3 }
        ]
    },
    {
        id: 2001, name: "Roti Paneer Meal", subType: "Combo Meal", region: "North Indian",
        ediblePortion: 100, type: "veg", calories: 500, protein: 22, carbs: 55, fats: 22,
        category: "Dinner", servingSize: "1 Plate", isCooked: true, isCombo: true,
        composition: [
            { name: "Roti (2 pcs)", weight: 80, calories: 240, protein: 8, carbs: 40, fats: 2 },
            { name: "Paneer Butter Masala", weight: 150, calories: 220, protein: 12, carbs: 10, fats: 18 },
            { name: "Green Salad", weight: 50, calories: 40, protein: 2, carbs: 5, fats: 2 }
        ]
    },
    {
        id: 2002, name: "Vegetable Biryani Meal", subType: "Combo Meal", region: "All",
        ediblePortion: 100, type: "veg", calories: 450, protein: 12, carbs: 70, fats: 15,
        category: "Lunch", servingSize: "1 Plate", isCooked: true, isCombo: true,
        composition: [
            { name: "Veg Biryani", weight: 250, calories: 350, protein: 8, carbs: 60, fats: 10 },
            { name: "Raita", weight: 100, calories: 80, protein: 4, carbs: 8, fats: 4 },
            { name: "Salad", weight: 50, calories: 20, protein: 0, carbs: 2, fats: 1 }
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
            { name: "Low-fat Greek Yogurt", weight: 200, calories: 140, protein: 16, carbs: 8, fats: 0 },
            { name: "Apple", weight: 120, calories: 65, protein: 0, carbs: 15, fats: 0 },
            { name: "Pumpkin Seeds", weight: 6, calories: 35, protein: 2, carbs: 1, fats: 3 }
        ]
    },
    {
        id: 302, name: "Roasted Chana & Whey", subType: "Snack", region: "Indian",
        ediblePortion: 100, type: "veg", calories: 270, protein: 19, carbs: 32, fats: 6,
        category: "Snacks", servingSize: "1 Meal", isCooked: true, isCombo: true,
        composition: [
            { name: "Roasted Chana", weight: 25, calories: 90, protein: 5, carbs: 15, fats: 2 },
            { name: "Whey Protein (in water)", weight: 12, calories: 45, protein: 10, carbs: 1, fats: 0 },
            { name: "Papaya/Apple", weight: 120, calories: 50, protein: 1, carbs: 12, fats: 0 }
        ]
    },
    {
        id: 303, name: "Paneer & Fruit Bowl", subType: "Snack", region: "Indian",
        ediblePortion: 100, type: "veg", calories: 270, protein: 19, carbs: 32, fats: 6,
        category: "Snacks", servingSize: "1 Bowl", isCooked: false, isCombo: true,
        composition: [
            { name: "Low-fat Paneer", weight: 100, calories: 180, protein: 18, carbs: 2, fats: 4 },
            { name: "Apple", weight: 140, calories: 70, protein: 0, carbs: 18, fats: 0 },
            { name: "Chia Seeds", weight: 5, calories: 20, protein: 1, carbs: 2, fats: 1 }
        ]
    },
    {
        id: 304, name: "Chicken & Fruit Snack", subType: "Snack", region: "International",
        ediblePortion: 100, type: "non-veg", calories: 270, protein: 20, carbs: 32, fats: 6,
        category: "Snacks", servingSize: "1 Plate", isCooked: true, isCombo: true,
        composition: [
            { name: "Chicken Breast (Boiled/Grilled)", weight: 85, calories: 140, protein: 20, carbs: 0, fats: 3 },
            { name: "Apple", weight: 150, calories: 80, protein: 0, carbs: 20, fats: 0 },
            { name: "Flaxseed Powder", weight: 6, calories: 30, protein: 1, carbs: 2, fats: 2 }
        ]
    },
    {
        id: 305, name: "Egg White & Toast Snack", subType: "Snack", region: "International",
        ediblePortion: 100, type: "non-veg", calories: 270, protein: 19, carbs: 32, fats: 6,
        category: "Snacks", servingSize: "1 Plate", isCooked: true, isCombo: true,
        composition: [
            { name: "Egg Whites", weight: 130, calories: 65, protein: 14, carbs: 1, fats: 0 },
            { name: "Wheat Toast", weight: 30, calories: 80, protein: 3, carbs: 15, fats: 1 },
            { name: "Apple", weight: 100, calories: 50, protein: 0, carbs: 13, fats: 0 }
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
        category: "Main Course", servingSize: "100g", isCooked: true, isCombo: false,
        composition: []
    },
    {
        id: 5002, name: "Brown Rice", subType: "Rice", region: "International",
        ediblePortion: 100, type: "veg", calories: 111, protein: 2.6, carbs: 23, fats: 0.9,
        category: "Main Course", servingSize: "100g", isCooked: true, isCombo: false,
        composition: []
    },
    {
        id: 5003, name: "Roti / Chapati", subType: "Bread", region: "Indian",
        ediblePortion: 100, type: "veg", calories: 297, protein: 10, carbs: 49, fats: 7,
        category: "Breads", servingSize: "1 Pc (40g)", isCooked: true, isCombo: false,
        composition: []
    },
    {
        id: 5004, name: "Dal Fry", subType: "Curry", region: "Indian",
        ediblePortion: 100, type: "veg", calories: 116, protein: 6, carbs: 12, fats: 5,
        category: "Main Course", servingSize: "100g", isCooked: true, isCombo: false,
        composition: []
    },
    {
        id: 5005, name: "Chicken Curry", subType: "Curry", region: "Indian",
        ediblePortion: 100, type: "non-veg", calories: 140, protein: 15, carbs: 6, fats: 7,
        category: "Main Course", servingSize: "100g", isCooked: true, isCombo: false,
        composition: []
    },
    {
        id: 5006, name: "Paneer Butter Masala", subType: "Curry", region: "Indian",
        ediblePortion: 100, type: "veg", calories: 230, protein: 8, carbs: 10, fats: 18,
        category: "Main Course", servingSize: "100g", isCooked: true, isCombo: false,
        composition: []
    },
    {
        id: 5007, name: "Mixed Vegetable Curry", subType: "Curry", region: "Indian",
        ediblePortion: 100, type: "veg", calories: 90, protein: 3, carbs: 8, fats: 5,
        category: "Main Course", servingSize: "100g", isCooked: true, isCombo: false,
        composition: []
    },
    {
        id: 5008, name: "Grilled Chicken Breast", subType: "Main", region: "International",
        ediblePortion: 100, type: "non-veg", calories: 165, protein: 31, carbs: 0, fats: 3.6,
        category: "Main Course", servingSize: "100g", isCooked: true, isCombo: false,
        composition: []
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