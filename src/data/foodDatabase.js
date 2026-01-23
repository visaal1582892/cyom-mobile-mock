export const foodDatabase = [
    // --- BREAKFAST ---
    {
        id: 1, name: "Oats Porridge", subType: "Rolled Oats", form: "Semi-solid", region: "All",
        ediblePortion: 100, type: "veg", calories: 120, protein: 4, carbs: 22, fats: 2,
        category: "Breakfast", servingSize: "1 bowl (200g)", isCooked: true,
        composition: [
            { name: "Raw Oats", weight: 30, calories: 115, protein: 4, carbs: 20, fats: 2 },
            { name: "Skim Milk", weight: 150, calories: 5, protein: 0.5, carbs: 2, fats: 0 }
        ]
    },
    {
        id: 2, name: "Vegetable Poha", subType: "Flattened Rice", form: "Solid", region: "North Indian",
        ediblePortion: 100, type: "veg", calories: 180, protein: 3, carbs: 35, fats: 4,
        category: "Breakfast", servingSize: "1 plate (150g)", isCooked: true,
        composition: [
            { name: "Raw Poha", weight: 50, calories: 170, protein: 3, carbs: 36, fats: 0.5 },
            { name: "Peanuts & Oil", weight: 5, calories: 40, protein: 1, carbs: 1, fats: 4 }
        ]
    },
    {
        id: 3, name: "Idli", subType: "Rice Cake", form: "Solid", region: "South Indian",
        ediblePortion: 100, type: "veg", calories: 60, protein: 2, carbs: 12, fats: 0,
        category: "Breakfast", servingSize: "2 pcs (100g)", isCooked: true,
        composition: [
            { name: "Idli Batter", weight: 40, calories: 60, protein: 2, carbs: 12, fats: 0 }
        ]
    },
    {
        id: 4, name: "Masala Dosa", subType: "Crepe", form: "Solid", region: "South Indian",
        ediblePortion: 100, type: "veg", calories: 250, protein: 4, carbs: 40, fats: 8,
        category: "Breakfast", servingSize: "1 pc (120g)", isCooked: true,
        composition: [
            { name: "Dosa Batter", weight: 80, calories: 130, protein: 3, carbs: 25, fats: 0.5 },
            { name: "Potato Masala", weight: 80, calories: 80, protein: 1, carbs: 15, fats: 3 },
            { name: "Oil/Ghee", weight: 5, calories: 40, protein: 0, carbs: 0, fats: 4.5 }
        ]
    },
    {
        id: 5, name: "Besan Chilla", subType: "Gram Flour Pancake", form: "Solid", region: "North Indian",
        ediblePortion: 100, type: "veg", calories: 200, protein: 10, carbs: 22, fats: 8,
        category: "Breakfast", servingSize: "2 pcs (100g)", isCooked: true,
        composition: [
            { name: "Besan (Gram Flour)", weight: 50, calories: 180, protein: 10, carbs: 20, fats: 3 },
            { name: "Oil", weight: 5, calories: 45, protein: 0, carbs: 0, fats: 5 }
        ]
    },
    {
        id: 6, name: "Scrambled Eggs", subType: "Eggs", form: "Semi-solid", region: "International",
        ediblePortion: 100, type: "non-veg", calories: 180, protein: 12, carbs: 2, fats: 14,
        category: "Breakfast", servingSize: "2 eggs", isCooked: true,
        composition: [
            { name: "Whole Eggs", weight: 100, calories: 140, protein: 12, carbs: 1, fats: 10 },
            { name: "Butter", weight: 5, calories: 40, protein: 0, carbs: 0, fats: 4 }
        ]
    },
    {
        id: 7, name: "Aloo Paratha", subType: "Stuffed Bread", form: "Solid", region: "North Indian",
        ediblePortion: 100, type: "veg", calories: 260, protein: 5, carbs: 35, fats: 10,
        category: "Breakfast", servingSize: "1 pc (100g)", isCooked: true,
        composition: [
            { name: "Wheat Flour", weight: 40, calories: 130, protein: 4, carbs: 28, fats: 0.5 },
            { name: "Potato", weight: 50, calories: 40, protein: 1, carbs: 9, fats: 0 },
            { name: "Ghee/Oil", weight: 8, calories: 70, protein: 0, carbs: 0, fats: 8 }
        ]
    },
    {
        id: 8, name: "Upma", subType: "Semolina", form: "Semi-solid", region: "South Indian",
        ediblePortion: 100, type: "veg", calories: 150, protein: 4, carbs: 25, fats: 4,
        category: "Breakfast", servingSize: "1 bowl (150g)", isCooked: true,
        composition: [
            { name: "Semolina (Rava)", weight: 40, calories: 140, protein: 4, carbs: 30, fats: 0.5 },
            { name: "Vegetables", weight: 30, calories: 15, protein: 0.5, carbs: 3, fats: 0 },
            { name: "Oil", weight: 5, calories: 45, protein: 0, carbs: 0, fats: 5 }
        ]
    },

    // --- MAIN COURSE (LUNCH/DINNER) ---
    {
        id: 20, name: "Steamed Rice", subType: "White Rice", form: "Solid", region: "All",
        ediblePortion: 100, type: "veg", calories: 130, protein: 2.7, carbs: 28, fats: 0.3,
        category: "Main Course", servingSize: "1 bowl (150g)", isCooked: true,
        composition: [
            { name: "Raw Rice", weight: 50, calories: 175, protein: 3.5, carbs: 39, fats: 0.3 }
        ]
    },
    {
        id: 21, name: "Roti (Chapati)", subType: "Wheat Bread", form: "Solid", region: "North Indian",
        ediblePortion: 100, type: "veg", calories: 120, protein: 3.5, carbs: 25, fats: 1,
        category: "Main Course", servingSize: "1 pc (40g)", isCooked: true,
        composition: [
            { name: "Wheat Flour", weight: 35, calories: 115, protein: 3.5, carbs: 24, fats: 0.8 }
        ]
    },
    {
        id: 22, name: "Dal Fry", subType: "Lentils", form: "Semi-solid", region: "North Indian",
        ediblePortion: 100, type: "veg", calories: 140, protein: 7, carbs: 18, fats: 5,
        category: "Main Course", servingSize: "1 bowl (150g)", isCooked: true,
        composition: [
            { name: "Toor Dal", weight: 30, calories: 100, protein: 6, carbs: 18, fats: 0.5 },
            { name: "Ghee/Oil", weight: 5, calories: 45, protein: 0, carbs: 0, fats: 5 }
        ]
    },
    {
        id: 23, name: "Chicken Curry", subType: "Chicken", form: "Semi-solid", region: "All",
        ediblePortion: 100, type: "non-veg", calories: 180, protein: 18, carbs: 5, fats: 10,
        category: "Main Course", servingSize: "1 bowl (200g)", isCooked: true,
        composition: [
            { name: "Chicken", weight: 100, calories: 120, protein: 20, carbs: 0, fats: 2 },
            { name: "Oil/Spices", weight: 10, calories: 90, protein: 0, carbs: 2, fats: 10 }
        ]
    },
    {
        id: 24, name: "Paneer Butter Masala", subType: "Paneer", form: "Semi-solid", region: "North Indian",
        ediblePortion: 100, type: "veg", calories: 280, protein: 10, carbs: 8, fats: 22,
        category: "Main Course", servingSize: "1 bowl (200g)", isCooked: true,
        composition: [
            { name: "Paneer", weight: 60, calories: 160, protein: 11, carbs: 1, fats: 12 },
            { name: "Cream/Butter", weight: 10, calories: 70, protein: 0, carbs: 1, fats: 7 },
            { name: "Gravy Base", weight: 50, calories: 40, protein: 1, carbs: 6, fats: 2 }
        ]
    },
    {
        id: 25, name: "Palak Paneer", subType: "Paneer & Spinach", form: "Semi-solid", region: "North Indian",
        ediblePortion: 100, type: "veg", calories: 180, protein: 9, carbs: 6, fats: 14,
        category: "Main Course", servingSize: "1 bowl (200g)", isCooked: true,
        composition: [
            { name: "Paneer", weight: 50, calories: 130, protein: 9, carbs: 1, fats: 10 },
            { name: "Spinach", weight: 100, calories: 25, protein: 2, carbs: 3, fats: 0.5 },
            { name: "Oil/Cream", weight: 5, calories: 45, protein: 0, carbs: 0, fats: 5 }
        ]
    },
    {
        id: 26, name: "Sambar", subType: "Lentil Stew", form: "Liquid", region: "South Indian",
        ediblePortion: 100, type: "veg", calories: 80, protein: 4, carbs: 12, fats: 2,
        category: "Main Course", servingSize: "1 bowl (200g)", isCooked: true,
        composition: [
            { name: "Toor Dal", weight: 20, calories: 70, protein: 4, carbs: 12, fats: 0.5 },
            { name: "Vegetables", weight: 50, calories: 20, protein: 1, carbs: 4, fats: 0 }
        ]
    },
    {
        id: 27, name: "Vegetable Biryani", subType: "Rice", form: "Solid", region: "All",
        ediblePortion: 100, type: "veg", calories: 160, protein: 3, carbs: 25, fats: 6,
        category: "Main Course", servingSize: "1 plate (250g)", isCooked: true,
        composition: [
            { name: "Rice", weight: 50, calories: 65, protein: 1.5, carbs: 14, fats: 0.1 },
            { name: "Veggies", weight: 50, calories: 20, protein: 1, carbs: 4, fats: 0 },
            { name: "Oil/Spices", weight: 5, calories: 45, protein: 0, carbs: 0, fats: 5 }
        ]
    },
    {
        id: 28, name: "Grilled Fish", subType: "Fish", form: "Solid", region: "International",
        ediblePortion: 100, type: "non-veg", calories: 140, protein: 22, carbs: 0, fats: 5,
        category: "Main Course", servingSize: "1 fillet (150g)", isCooked: true,
        composition: [
            { name: "Fish Fillet", weight: 150, calories: 180, protein: 30, carbs: 0, fats: 6 }
        ]
    },

    // --- SNACKS ---
    {
        id: 50, name: "Roasted Chana", subType: "Chickpeas", form: "Solid", region: "All",
        ediblePortion: 100, type: "veg", calories: 350, protein: 18, carbs: 58, fats: 5,
        category: "Snacks", servingSize: "1 handful (30g)", isCooked: true,
        composition: [
            { name: "Bengal Gram", weight: 30, calories: 105, protein: 5.4, carbs: 18, fats: 1.5 }
        ]
    },
    {
        id: 51, name: "Fruit Salad", subType: "Mixed Fruits", form: "Solid", region: "All",
        ediblePortion: 100, type: "veg", calories: 60, protein: 0.8, carbs: 15, fats: 0.2,
        category: "Snacks", servingSize: "1 bowl (150g)", isCooked: true,
        composition: [
            { name: "Apple", weight: 50, calories: 30, protein: 0.1, carbs: 7, fats: 0 },
            { name: "Papaya", weight: 50, calories: 20, protein: 0.3, carbs: 5, fats: 0 },
            { name: "Banana", weight: 30, calories: 30, protein: 0.4, carbs: 7, fats: 0.1 }
        ]
    },
    {
        id: 52, name: "Green Tea", subType: "Beverage", form: "Liquid", region: "All",
        ediblePortion: 100, type: "veg", calories: 2, protein: 0, carbs: 0, fats: 0,
        category: "Snacks", servingSize: "1 cup", isCooked: true,
        composition: [
            { name: "Tea Leaves", weight: 2, calories: 1, protein: 0, carbs: 0, fats: 0 }
        ]
    },
    {
        id: 53, name: "Boiled Egg", subType: "Egg", form: "Solid", region: "All",
        ediblePortion: 100, type: "non-veg", calories: 155, protein: 13, carbs: 1, fats: 11,
        category: "Snacks", servingSize: "1 egg (50g)", isCooked: true,
        composition: [
            { name: "Egg", weight: 50, calories: 75, protein: 6, carbs: 0.5, fats: 5 }
        ]
    },
    {
        id: 54, name: "Masala Chai", subType: "Beverage", form: "Liquid", region: "Indian",
        ediblePortion: 100, type: "veg", calories: 60, protein: 2, carbs: 8, fats: 2,
        category: "Snacks", servingSize: "1 cup (150ml)", isCooked: true,
        composition: [
            { name: "Milk", weight: 50, calories: 30, protein: 1.6, carbs: 2.5, fats: 1.5 },
            { name: "Sugar", weight: 5, calories: 20, protein: 0, carbs: 5, fats: 0 }
        ]
    }
];
