export const userData = {
    name: "Rohit",
    image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=800&q=80",
    mobile: "9876543210",
    age: 28,
    gender: "Male",
    height: 175,
    weight: 75,
    location: "HYDERABAD",
    address: "Lee Pharma, Bhavani Nagar, Balanagar, Hyderabad, ...",

    // Step 1: Personal Info & Goals
    fitnessGoal: 'lose_weight',
    weightManagementType: 'lose', // 'lose', 'maintain', 'gain'
    targetWeight: '5',
    goalDuration: '3 months',

    // Step 2: Health & Medical
    allergies: [],
    healthConditions: [],

    // Step 3: Exercise Profile
    exercises: 'No',
    modalities: ['Strength training', 'Walking'],
    frequency: 3,
    intensity: 'Medium',
    experienceLevel: 'Intermediate',

    // Step 4: Lifestyle & Health
    sleepQuality: 'Good',
    sleepHours: '8',
    waterIntake: '3',
    stressLevel: 'Medium',
    workHours: '8'
};

// Global setter function to mutate the mock data during session
export const updateProfileData = (updates) => {
    Object.assign(userData, updates);
};

export const consumptionHistory = [
    {
        id: 1,
        imageUrl: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        name: "Nasi Ayam Bakar",
        calories: 450,
        weight: "300 g",
        time: "Today"
    }
];

export const dailyStats = {
    calories: {
        current: 280,
        label: "kcal",
        subtext: "from last consumed"
    },
    macros: {
        carbs: { value: "39%", label: "216 g" },
        protein: { value: "56.67%", label: "86 g" },
        fat: { value: "20.1%", label: "20 g" }
    },
    burned: {
        value: 456,
        label: "kcal",
        icon: "🔥"
    },
    steps: {
        value: "5,500",
        label: "steps",
        icon: "👟"
    }
};

export const savedPlans = [
    // Example Plan Structure
    // {
    //     id: 1,
    //     name: "7-Day Weight Loss",
    //     duration: "7 Days",
    //     avgCalories: 1800,
    //     createdAt: "2024-01-23",
    //     planData: { ... } 
    // }
];
