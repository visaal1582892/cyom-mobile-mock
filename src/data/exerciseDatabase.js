export const MOCK_DAILY_EXERCISES = [
    { 
        id: '1', 
        name: 'Jumping Jacks', 
        type: 'Warm-up', 
        baseTime: 30, // 30 seconds for easier testing/flow 
        targetRepsPerMin: 40, 
        caloriesPerMin: 8,
        imageUrl: 'https://cdn-icons-png.flaticon.com/512/8144/8144383.png' // Placeholder for Jumping Jacks
    },
    { 
        id: '2', 
        name: 'Push-ups', 
        type: 'Strength', 
        baseTime: 45, 
        targetRepsPerMin: 15, 
        caloriesPerMin: 6,
        imageUrl: 'https://cdn-icons-png.flaticon.com/512/2548/2548540.png'
    },
    { 
        id: '3', 
        name: 'Squats', 
        type: 'Strength', 
        baseTime: 60, 
        targetRepsPerMin: 20, 
        caloriesPerMin: 7,
        imageUrl: 'https://cdn-icons-png.flaticon.com/512/3048/3048386.png'
    },
    { 
        id: '4', 
        name: 'Plank', 
        type: 'Core', 
        baseTime: 60, 
        targetRepsPerMin: 0, 
        caloriesPerMin: 5,
        imageUrl: 'https://cdn-icons-png.flaticon.com/512/3043/3043254.png' // 0 reps = static hold
    },
    { 
        id: '5', 
        name: 'Burpees', 
        type: 'HIIT', 
        baseTime: 45, 
        targetRepsPerMin: 10, 
        caloriesPerMin: 12,
        imageUrl: 'https://cdn-icons-png.flaticon.com/512/2936/2936886.png'
    },
];
