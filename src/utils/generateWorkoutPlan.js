import { exerciseDatabase } from '../data/exerciseDatabase';

/**
 * Shuffles an array in place based on Fisher-Yates algorithm.
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Generates a targeted workout plan based on user preferences.
 * @param {Object} options - Criteria for the workout plan.
 * @param {string} options.workoutPlace - 'Home' or 'Gym'
 * @param {Array<string>} options.equipment - Array of selected equipment (if Home)
 * @param {Array<string>} options.workoutType - Array of preferred categories (e.g. 'Strength Training', 'HIIT')
 * @param {number} options.workoutDuration - Expected duration in hours (e.g. 1)
 * @param {Array<number>} options.workoutDays - Selected days of the week (e.g. [0, 2, 4])
 * @param {string} options.experienceLevel - User's experience ('Beginner', 'Intermediate', 'Advanced')
 * @returns {Object} A map of daily workout routines.
 */
export const generateWorkoutPlan = (options) => {
    const {
        workoutPlace,
        equipment = [],
        workoutType = [],
        workoutDuration = 1, // Default 1 hr
        workoutDays = [],
        experienceLevel = 'Intermediate'
    } = options;

    // 1. Filter Database by Equipment & Location
    let pool = exerciseDatabase.filter(ex => {
        // If at home, only allow 'None' or equipment they explicitly own
        if (workoutPlace === 'Home') {
            return ex.equipment === 'None' || equipment.includes(ex.equipment);
        }
        // If at Gym, assume access to all standard equipment
        return true; 
    });

    // 2. Filter by Workout Type (Category)
    if (workoutType.length > 0) {
        // Map UI naming to Database naming if needed.
        // E.g., 'Strength Training' -> 'Strength'
        const normalizedTypes = workoutType.map(t => t.replace(' Training', ''));
        
        // Only keep exercises matching the selected types, or Yoga/Core as universal additives
        pool = pool.filter(ex => 
            normalizedTypes.includes(ex.category) || 
            ex.category === 'Core' || 
            ex.category === 'Warm-up'
        );
    }

    // 3. Filter/Weight by Difficulty (Experience Level)
    if (experienceLevel === 'Beginner') {
        // Beginners shouldn't typically get 'Advanced' exercises unless forced
        pool = pool.filter(ex => ex.difficulty !== 'Advanced');
    }

    // Ensure we have a valid pool
    if (pool.length === 0) pool = exerciseDatabase; // Fallback to all if filtering was too strict

    // 4. Generate daily plans based on all 7 days
    const generatedPlan = {};
    // Targeting roughly: (Duration in hours * 60 minutes) / (avg exercise time + rest)
    const targetExerciseCount = Math.max(5, Math.ceil(workoutDuration * 8));

    // Get simple flexibility exercises for rest days
    const flexibilityPool = exerciseDatabase.filter(ex => 
        ['Yoga', 'Warm-up'].includes(ex.category) || ex.intensity === 'Time' && ex.difficulty === 'Beginner'
    );
    if (flexibilityPool.length === 0) flexibilityPool.push(exerciseDatabase[0]); // Safe fallback

    [0, 1, 2, 3, 4, 5, 6].forEach(dayId => {
        if (workoutDays.includes(dayId)) {
            // It's a workout day => use the filtered active pool
            let dailySelection = shuffleArray([...pool]).slice(0, targetExerciseCount);
            
            generatedPlan[dayId] = dailySelection.reduce((acc, ex) => {
                acc[ex.id] = {
                    timeInvested: 0, 
                    repsDone: 0,
                    status: 'pending'
                };
                return acc;
            }, {});
        } else {
            // It's a rest day => suggest a few basic flexibility exercises (2-3)
            let restDaySelection = shuffleArray([...flexibilityPool]).slice(0, 3);
            
            generatedPlan[dayId] = restDaySelection.reduce((acc, ex) => {
                acc[ex.id] = {
                    timeInvested: 0, 
                    repsDone: 0,
                    status: 'pending'
                };
                return acc;
            }, {});
        }
    });

    return {
        id: Date.now(),
        name: 'Cyom Routine Workout',
        createdAt: new Date().toISOString(),
        options, // Store the generator options for UI reference later
        plan: generatedPlan
    };
};
