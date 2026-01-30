# CYOM Mobile Mock - Technical Documentation

## 1. User Journey Overview

The complete flow from discovering the feature to saving a personalized plan.

**Step 1: Discovery**
*   **Action**: User launches the Medplus App.
*   **Visual**: A prominent "Health & Wellness (CYOM)" tab or card is visible on the home screen.
*   **Goal**: Invited entry into the meal planning ecosystem.
![Medplus Home Screen](/C:/Users/Medplus/.gemini/antigravity/brain/8af23f45-8474-472b-9c1f-abafff28c8d4/medplus_home_entry_1769758928635.png)

**Step 2: Authentication**
*   **Action**: Secure login via Mobile Number & OTP.
*   **Visual**: Minimalist login screen with clear branding.
*   **Goal**: Ensure secure access to personal health data.
![Secure Login](/C:/Users/Medplus/.gemini/antigravity/brain/8af23f45-8474-472b-9c1f-abafff28c8d4/medplus_login_screen_1769762872345.png)

**Step 3: Goal Selection**
*   **Action**: User defines their primary objective (Weight Loss, Maintenance, Muscle Gain).
*   **Visual**: Large, tappable cards with distinct iconography.
*   **Goal**: dynamic adjustment of Calorie Deficit/Surplus in the calculation engine.
![Goal Selection](/C:/Users/Medplus/.gemini/antigravity/brain/8af23f45-8474-472b-9c1f-abafff28c8d4/cyom_goal_selection_1769762897451.png)

**Step 4: Customization**
*   **Action**: User inputs their physical stats (Height, Weight, Age) and configures their "Beverage Planner".
*   **Visual**: Clean input forms and a visual selector for Tea/Coffee habits.
*   **Goal**: Gather data for BMR/TDEE calculation and beverage calorie deduction.
![Preferences & Beverages](/C:/Users/Medplus/.gemini/antigravity/brain/8af23f45-8474-472b-9c1f-abafff28c8d4/cyom_input_flow_1769759066679.png)

**Step 5: Planning & Saving**
*   **Action**: The system generates a balanced plan. User reviews, swaps meals, edits portions, and finally saves the plan.
*   **Visual**: Detailed timeline view with "Expandable Meals" and a clear "Save Plan" action.
*   **Goal**: Finalize and persist the user's weekly nutrition strategy.
![Plan Review & Save](/C:/Users/Medplus/.gemini/antigravity/brain/8af23f45-8474-472b-9c1f-abafff28c8d4/cyom_planner_save_1769759131159.png)

---

## 2. Core Functionalities

The CYOM (Create Your Own Meal) system provides a dynamic, mathematically rigorous logic for generating and customizing meal plans. The core features currently active in the system are:

### 2.1. Personalized Target Generation
The system does not use static targets. It dynamically calculates daily energy needs based on user inputs (Height, Weight, Age, Gender, Activity Level) effectively customizing the plan for every individual.

### 2.2. Intelligent Plan Generation
Instead of picking static meals, the system:
*   **Filters** available foods based on Diet (Veg/Non-Veg/Egg) and Allergies.
*   **Scales** portion sizes mathematically to hit the exact calorie target for that slot (Breakfast, Lunch, etc.).
*   **Deducts** beverage calories from the daily budget *before* food allocation to ensure the total intake remains accurate.

### 2.3. Smart "Neutral" Swapping
A strict caloric control mechanism that allows users to swap meals without breaking their diet plan.
*   **Behavior**: When a user swaps "Meal A" (400 kcal) for "Meal B", the system essentially asks: *"How much of Meal B equals 400 kcal?"*
*   **Result**: The new meal is auto-scaled to match the exact energy value of the previous meal.

### 2.4. Dynamic Macro Balancing (Ingredient-Level Edit)
This is the most advanced logic in the system, allowing users to edit *parts* of a meal.
*   **Behavior**: If a user increases one ingredient (e.g., *more Rice*), the system detects the calorie surplus.
*   **Reaction**: It automatically calculates how much to *reduce* the other ingredients (e.g., *less Curry*) to maintain the same total calorie count for that meal. This ensures the user satisfies their craving without exceeding their limit.

---

## 3. Internal Formulas & Logic Details

### 3.1. Energy Expenditure (BMR & TDEE)
The baseline for all planning logic is derived using the standard **Mifflin-St Jeor Equation**:

**Step 1: Calculate BMR (Basal Metabolic Rate)**
*   *Men*: `(10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5`
*   *Women*: `(10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161`

**Step 2: Calculate TDEE (Total Daily Energy Expenditure)**
*   `TDEE = BMR × Activity Multiplier`
*   *Multipliers used*:
    *   Sedentary: `1.2`
    *   Light Active: `1.375`
    *   Moderate: `1.55`
    *   Very Active: `1.725`

**Step 3: Determine Calorie Target (Target Body Approach)**
Instead of using a generic deficit, the system calculates the maintenance calories required for the user's *ideal* weight.

1.  **Calculate Target Weight**: `TargetWeight = CurrentWeight - TargetLoss`
2.  **Calculate Target BMR**: Recalculate BMR using the `TargetWeight` (and user's same Height/Age/Gender).
3.  **Calculate Target TDEE**: multiply Target BMR by the Activity Multiplier.
4.  **Final Target**: `Target Calories = Target TDEE`

*This approach ensures the user is eating for the body they *want*, which naturally creates a sustainable deficit.*

### 3.2. Target Distribution & Splits
The detailed breakdown of how the daily calorie budget is allocated across meal slots and macronutrients.

**A. Meal Slot Distribution (Caloric Split)**
The total daily calories are distributed to prioritize fueling during active hours:
*   **Breakfast**: 25%
*   **Lunch**: 40%
*   **Snacks**: 15%
*   **Dinner**: 20%

**B. Macronutrient Goals (Nutrient Split)**
The metabolic targets are calculated using a prioritized system:
*   **Protein**: `min( 30% of Calories, 1.5g per kg of Target Weight )`
    *   *Rationale*: Ensures sufficient protein without over-prescribing (capped at 1.5g/kg).
*   **Fats**: Fixed at **25%** of Total Calories.
*   **Carbohydrates**: Fills the **Remaining Calorie Budget**.

**C. Unified Distribution Table**
| Dimension | Category | Target Percentage | Notes |
| :--- | :--- | :--- | :--- |
| **Meal Slot** | Breakfast | **25%** | Energize start of day |
| | Lunch | **40%** | Main meal of the day |
| | Snacks | **15%** | Bridge gap to dinner |
| | Dinner | **20%** | Lighter evening meal |
| **Macro** | Protein | **Variable** | Min(30%, 1.5g/kg) |
| | Fats | **25%** | Hormonal Health |
| | Carbs | **Remainder** | Primary Energy Source |

### 3.3. Beverage Deduction Logic
Before assigning food, the system subtracts liquid calories:
*   **Formula**: `SlotBudget_Net = SlotBudget_Gross - BeverageCalories`
*   **Beverage Calculation**:
    `BevKcal = (BaseBevKcal × SizeFactor) + (SugarSpoons × 40)`
    *   *Size Factors*: Small (0.7x), Medium (1.0x), Large (1.5x).

### 3.4. Smart Ingredient Balancing (Exact Formulas)

This algorithm ensures that when you change one ingredient, the total meal calorie count stays exactly the same by redistributing the difference to other items.

**The "Rice & Curry" Scenario**:
*   **Target Limit**: 500 kcal
*   **Ingredient A (Rice)**: Originally 250 kcal
*   **Ingredient B (Curry)**: Originally 250 kcal
*   **Action**: User increases **Rice** to **350 kcal**.

#### Step-by-Step Mathematical Logic

**1. Calculate Remaining Budget**
First, we determine how many calories are left for the rest of the meal after the user's change.
*   `Remaining_Budget = Meal_Target - New_Calories(Edited_Item)`
*   *Example*: `500 - 350 = 150 kcal` (Left for Curry)

**2. Calculate "Scaling Ratio" for Others**
Next, we calculate how much the *other* ingredients need to shrink (or grow) to fit into this new budget.
*   `Current_Total_Others = Sum(Calories of all unedited items)`
*   *Example*: Curry is the only other item, so `250 kcal`.
*   `Scaling_Ratio = Remaining_Budget / Current_Total_Others`
*   *Example*: `150 / 250 = 0.6` (This means other items retain 60% of their original size)

**3. Apply New Weight to Other Ingredients**
Finally, we apply this ratio to the weight of every other ingredient to get their new portion sizes.
*   `New_Weight(Item) = Old_Weight(Item) × Scaling_Ratio`
*   *Example (Curry)*: If original weight was **200g**:
    *   `New_Weight = 200g × 0.6 = 120g`

**Final Validation**:
*   **Rice**: 350 kcal
*   **Curry**: 150 kcal (Original 250 * 0.6)
*   **Total**: 500 kcal (Matches Target exactly)

### 3.5. Smart Macro Booster Suggestions
The system proactively helps users hit their macronutrient sub-targets (Protein/Carb/Fat) without breaking their calorie limit.

**A. Trigger Mechanism**
When a user expands a meal card, they are presented with three "Booster Tabs": **Add Protein**, **Add Carbs**, and **Add Fats**.

**B. Suggestion Intelligence (Filtering Logic)**
The system scans the `foodDatabase` and intelligently suggests items based on:
1.  **Macro Category**:
    *   *Protein Tab*: Filters for `category === 'Protein Source'`
    *   *Carb Tab*: Filters for `category === 'Carb Source'`
    *   *Fat Tab*: Filters for `category === 'Fat Source'`
2.  **Dietary Strictness**:
    *   *Vegetarian*: Strictly removes any 'non-veg' or 'egg' tagged items.
    *   *Eggetarian*: Allows 'egg' but removes 'non-veg'.
3.  **Simplicity**: Excludes complex "Combo Meals" to ensure only single ingredients (like *Whey Protein*, *Peanut Butter*, *Boiled Eggs*) are added as boosters.

**C. "Zero-Calorie" Integration**
When a user clicks a suggestion (e.g., adding **Whey Protein** to oatmeal):
*   The system **DOES NOT** simply add the calories on top (which would exceed the limit).
*   Instead, it uses the **Smart Balancing Algorithm** (Section 2.4) to *reverse-calculate* the room needed.
*   **Result**: It slightly reduces the *Oats* portion to fit the *Whey Protein*, resulting in a meal with **Higher Protein** but **Same Total Calories**.

---

## 4. Plan Management & Export

### 4.1. Saving Plans
The system allows users to store their generated plans for future reference.
*   **Action**: Clicking "Save Plan" opens a modal to name the current configuration.
*   **Storage**: Plans are saved to the user's local profile (mocked in `store.js`) with a custom name (e.g., "Muscle Gain Week 1").
*   **Retrieval**: Saved plans can be re-loaded to instantly populate the daily schedule without re-generating from scratch.

### 4.2. Export Options
Users can take their plans offline or share them using the "Download" menu.
*   **PDF Document**: Generates a clean, printable document suitable for sticking on a fridge or sharing with a trainer.
*   **Excel Sheet**: providing a raw data view for users who want to perform their own tracking or analysis in a spreadsheet.
