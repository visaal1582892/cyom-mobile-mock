# CYOM - Project Documentation

## 1. User Journey Overview
The complete flow from discovering the feature to saving a personalized plan.

**Step 1: Discovery**
*   **Action**: User launches the Medplus App.
*   **Visual**: A prominent "Health & Wellness (CYOM)" tab or card is visible on the home screen.
*   **Goal**: Invited entry into the meal planning ecosystem.

**Step 2: Authentication**
*   **Action**: Secure login via Mobile Number & OTP.
*   **Visual**: Minimalist login screen with clear branding.
*   **Goal**: Ensure secure access to personal health data.

**Step 3: Goal Selection**
*   **Action**: User defines their primary objective (Weight Loss, Maintenance, Muscle Gain).
*   **Visual**: Large, tappable cards with distinct iconography.
*   **Goal**: Dynamic adjustment of Calorie Deficit/Surplus in the calculation engine.

**Step 4: Customization & Biometrics**
*   **Action**: User inputs their physical stats (Height, Weight, Age).
*   **Validation**: System alerts if critical fields are missing or if targets are unsafe (e.g., >3kg/month weight loss).
*   **Goal**: Gather data for BMR/TDEE calculation.

**Step 5: Refreshment Planning**
*   **Action**: User configures their "Beverage Planner" for Tea, Coffee, and **Milk**.
*   **Visual**: Tabbed interface with vessel size options (**Small**, **Medium**, **Large**) and precise **Sugar (tabs/spoons)** input.
*   **Goal**: Calculate liquid calorie load (approx. 30-120 kcal base) to deduct from the daily food budget.

**Step 6: Meal Selection**
*   **Action**: User explicitly selects which meals to plan for (e.g., "Breakfast" + "Lunch" + "Dinner", skipping snacks).
*   **Visual**: Compact grid of tappable meal cards (Breakfast, Morning Snack, Lunch, Evening Snack, Dinner).
*   **Logic**: Only selected meal slots will receive calorie allocations.
*   **Goal**: Define the active slots for dynamic calorie distribution.

**Step 7: Planning & Generation**
*   **Action**: The system generates a balanced plan. User reviews, swaps meals, edits portions.
*   **Visual**: Detailed timeline view with a **Compact Header** showing real-time Energy/Macro targets.
*   **Goal**: Finalize the user's weekly nutrition strategy.

**Step 8: Daily Tracking (Execution)**
*   **Action**: User logs their actual daily intake against the generated plan.
*   **Visual**:
    *   **Header**: **Plan Selector** (switch between "Weight Loss Plan", "Muscle Gain", etc.) replacing the generic Day Selector.
    *   **Day Tabs**: Scrollable horizontal tabs (Day 1, Day 2...) to switch context.
    *   **Meal Slots**: Expandable cards for each meal (Breakfast, Lunch, etc.) with "Add Food" functionality.
*   **Features**:
    *   **Search**: Real-time food database search with "Add" button.
    *   **Auto-Save**: Logs are persisted to local storage immediately.
    *   **Single Entry**: Ensures only one tracking log exists per day to prevent duplicates.
*   **Goal**: Execute the plan and track adherence.

**Step 9: Progress Monitoring (Dashboard)**
*   **Action**: User reviews their long-term progress and nutrient intake.
*   **Visual**:
    *   **Time Filters**: Toggle between **1 Day**, **7 Days**, and **15 Days**.
    *   **Visuals**: Circular progress bars for Macros/Calories and linear bars for Vitamins/Minerals.
*   **Logic**:
    *   **Data Aggregation**: Sums up nutrient data from past logs (backfilling empty days if necessary).
    *   **Micro-Nutrients**: Tracks specific Vitamins (A, B-Complex, C, D) and Minerals (Calcium, Magnesium, Iron, Zinc, Iodine), adhering to ICMR-NIN RDA 2020 standards.
*   **Goal**:  Visualize health impact and ensuring balanced nutrition over time.

## 2. Core Functionalities
The CYOM (Create Your Own Meal) system provides a dynamic, mathematically rigorous logic for generating and customizing meal plans.

### 2.1. Personalized Target Generation
The system dynamically calculates daily energy needs based on user inputs (Height, Weight, Age, Gender, Activity Level), customizing the plan for every individual rather than using static templates.

### 2.2. Intelligent Plan Generation
Instead of picking static meals, the system:
*   Filters available foods based on **Diet** (Veg/Eggetarian/Non-Veg) and **Allergies**.
*   Scales portion sizes mathematically to hit the exact calorie target for that slot.
*   **Prioritizes Selected Slots**: Generates food *only* for the meals the user selected in Step 6.

### 2.3. Smart "Neutral" Swapping
A strict caloric control mechanism that allows users to swap meals without breaking their diet plan.
*   **Behavior**: When a user swaps "Meal A" (400 kcal) for "Meal B", the system essentially asks: "How much of Meal B equals 400 kcal?"
*   **Result**: The new meal is auto-scaled to match the exact energy value of the previous meal.

### 2.4. Dynamic Macro Balancing (Ingredient-Level Edit)
Allows users to edit parts of a meal without breaking the calorie limit.
*   **Behavior**: If a user increases one ingredient (e.g., more Rice), the system detects the calorie surplus.
*   **Reaction**: It automatically calculates how much to reduce the other ingredients (e.g., less Curry) to maintain the same total calorie count.

### 2.5. Dynamic Slot Management
The system is no longer bound to a fixed 4-meal structure. It adapts to the user's lifestyle by distributing calories only among the meals they actually eat.

## 3. Internal Formulas & Logic Details

### 3.1. Energy Expenditure (BMR & TDEE)
The baseline for all planning logic is derived using the standard Mifflin-St Jeor Equation:

**Step 1: Calculate BMR (Basal Metabolic Rate)**
*   **Men**: `(10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5`
*   **Women**: `(10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161`

**Step 2: Calculate TDEE (Total Daily Energy Expenditure)**
`TDEE = BMR × Activity Multiplier`
Multipliers used:
*   Sedentary: 1.2
*   Lightly Active: 1.375
*   Moderately Active: 1.55
*   Very Active: 1.725

**Step 3: Determine Calorie Target (Fat Loss Deficit Logic)**
The system calculates the daily energy deficit required to achieve the user's specific weight loss goal within their chosen timeframe.
*   **Calculate Total Deficit Needed**:
    `Total Deficit (kcal) = Target Weight Loss (kg) × 7700`
    *Note: 1kg of body fat ≈ 7700 kcal.*
*   **Calculate Daily Deficit**:
    `Daily Deficit = Total Deficit / Duration (days)`
*   **Final Daily Target**:
    `Target Calories = Current TDEE - Daily Deficit`
    **Safety Floor**: The system enforces a hard limit of **1200 kcal/day** to prevent unsafe starvation diets.

### 3.2. Target Distribution & Splits (Dynamic)
The detailed breakdown of how the daily calorie budget is allocated across meal slots and macronutrients. Unlike fixed templates, the system uses **Normalized Ratios** based on the user's active slots.

**A. Meal Slot Distribution (Normalized Ratios)**
The total daily calories are distributed based on the "weight" of the selected meals.
*   **Breakfast**: 25% (0.25) - Energize start of day
*   **Morning Snack**: 10% (0.10) - Mid-morning boost
*   **Lunch**: 35% (0.35) - Main meal of the day
*   **Evening Snack**: 10% (0.10) - Bridge gap to dinner
*   **Dinner**: 20% (0.20) - Lighter evening meal

**Normalization Logic (Step-by-Step Distribution)**:
The system adapts to the number and type of meals selected by the user. It creates a custom distribution model on the fly:
1.  **Identify Selected Slots**: The system checks which meals the user has enabled (e.g., "Breakfast", "Lunch", "Dinner").
2.  **Sum Base Ratios**: It adds up the "Base Ratios" of only the active slots.
    `Formula: Total_Base_Ratio = Sum(Base_Ratio[slot]) for all selected slots`
3.  **Calculate Normalized Factors**: Each slot's share is recalculated so the total equals 100%.
    `Formula: Normalized_Share[slot] = Base_Ratio[slot] / Total_Base_Ratio`
4.  **Distribute Total Calories**: The daily energy budget is split according to these new shares.
    `Formula: Slot_Target = Total_Daily_Calories × Normalized_Share[slot]`

*Example*: User chooses only **Lunch (0.35)** and **Dinner (0.20)**.
*   Total Base Ratio: 0.35 + 0.20 = 0.55
*   Lunch Target: TotalCalories * (0.35 / 0.55) ≈ 64%
*   Dinner Target: TotalCalories * (0.20 / 0.55) ≈ 36%
*   Result: The user's entire daily budget is intelligently distributed across their chosen meals.

**B. Macronutrient Goals (Nutrient Split)**
The metabolic targets are calculated using a prioritized system:
*   **Protein**: `min( 30% of Calories, 1.5g per kg of Target Weight )`
    *Rationale*: Ensures sufficient protein without over-prescribing (capped at 1.5g/kg).
*   **Fats**: Fixed at 25% of Total Calories.
    *Rationale*: Essential for Hormonal Health.
*   **Carbohydrates**: Fills the Remaining Calorie Budget.
    *Rationale*: Primary Energy Source.

### 3.3. Beverage Deduction Logic
Before assigning food, the system subtracts liquid calories:
`Formula: SlotBudget_Net = SlotBudget_Gross - BeverageCalories`
`Beverage Calculation: BevKcal = (BaseBevKcal × SizeFactor) + (SugarSpoons × 40)`
*   **Size Factors**: Small (0.7x), Medium (1.0x), Large (1.5x).

### 3.4. Smart Ingredient Balancing (Exact Formulas)
This algorithm ensures that when you change one ingredient, the total meal calorie count stays exactly the same by redistributing the difference to other items.

**The "Rice & Curry" Scenario**:
*   Target Limit: 500 kcal
*   Ingredient A (Rice): Originally 250 kcal
*   Ingredient B (Curry): Originally 250 kcal
*   **Action**: User increases Rice to 350 kcal.

**Step-by-Step Mathematical Logic**
1.  **Calculate Remaining Budget**: First, we determine how many calories are left for the rest of the meal after the user's change.
    `Remaining_Budget = Meal_Target - New_Calories(Edited_Item)`
    *Example*: 500 - 350 = 150 kcal (Left for Curry)
2.  **Calculate "Scaling Ratio" for Others**: Next, we calculate how much the other ingredients need to shrink (or grow) to fit into this new budget.
    `Current_Total_Others = Sum(Calories of all unedited items)`
    *Example*: Curry is the only other item, so 250 kcal.
    `Scaling_Ratio = Remaining_Budget / Current_Total_Others`
    *Example*: 150 / 250 = 0.6 (This means other items retain 60% of their original size)
3.  **Apply New Weight to Other Ingredients**: Finally, we apply this ratio to the weight of every other ingredient to get their new portion sizes.
    `New_Weight(Item) = Old_Weight(Item) × Scaling_Ratio`
    *Example (Curry)*: If original weight was 200g: 200g × 0.6 = 120g

**Final Validation**:
*   Rice: 350 kcal
*   Curry: 150 kcal (Original 250 * 0.6)
*   **Total**: 500 kcal (Matches Target exactly)

### 3.5. Smart Macro Booster Suggestions
The system proactively helps users hit their macronutrient sub-targets (Protein/Carb/Fat) without breaking their calorie limit.

**A. Trigger Mechanism**
When a user expands a meal card, they are presented with three "Booster Tabs": Add Protein, Add Carbs, and Add Fats.

**B. Suggestion Intelligence (Filtering Logic)**
The system scans the foodDatabase and intelligently suggests items based on:
*   **Macro Category**:
    *   Protein Tab: Filters for category === 'Protein Source'
    *   Carb Tab: Filters for category === 'Carb Source'
    *   Fat Tab: Filters for category === 'Fat Source'
*   **Dietary Strictness**:
    *   Vegetarian: Strictly removes any 'non-veg' or 'egg' tagged items.
    *   Eggetarian: Allows 'egg' but removes 'non-veg'.
*   **Simplicity**: Excludes complex "Combo Meals" to ensure only single ingredients (like Whey Protein, Peanut Butter, Boiled Eggs) are added as boosters.

**C. "Zero-Calorie" Integration**
When a user clicks a suggestion (e.g., adding Whey Protein to oatmeal):
*   The system DOES NOT simply add the calories on top (which would exceed the limit).
*   Instead, it uses the **Smart Balancing Algorithm (Section 3.4)** to reverse-calculate the room needed.
*   **Result**: It slightly reduces the Oats portion to fit the Whey Protein, resulting in a meal with Higher Protein but Same Total Calories.

### 3.6. Micronutrient Targets (ICMR-NIN 2020)
The system tracks specific vitamins and minerals against the standards set by the *Indian Council of Medical Research - National Institute of Nutrition (2020)*.

**A. Vitamin B Complex Scoring**
To simplify the display of multiple B-vitamins, the system calculates a single "Vitamin B Score".
*   **Logic**: It calculates the percentage adherence for each B-vitamin (Thiamine, Riboflavin, Niacin, B6, Folate, B12), capped at 100%.
*   **Formula**: `Score = Average( %Met_B1, %Met_B2, ... %Met_B12 )`
*   **Goal**: Provides a holistic view of B-vitamin intake without cluttering the UI.

**B. RDA Reference Tables**
The daily targets vary dynamically based on the user's gender.

**Vitamins**
| Nutrient | Male Target | Female Target | Unit |
| :--- | :--- | :--- | :--- |
| **Vitamin A** | 1000 | 840 | mcg |
| **Vitamin C** | 80 | 65 | mg |
| **Vitamin D** | 600 | 600 | IU |
| **Thiamine (B1)** | 1.8 | 1.7 | mg |
| **Riboflavin (B2)** | 2.5 | 2.4 | mg |
| **Niacin (B3)** | 18 | 14 | mg |
| **Vitamin B6** | 2.4 | 1.9 | mg |
| **Folate (B9)** | 300 | 220 | mcg |
| **Vitamin B12** | 2.2 | 2.2 | mcg |

**Minerals**
| Nutrient | Male Target | Female Target | Unit |
| :--- | :--- | :--- | :--- |
| **Calcium** | 1000 | 1000 | mg |
| **Magnesium** | 440 | 370 | mg |
| **Iron** | 19 | 29 | mg |
| **Zinc** | 17 | 13 | mg |
| **Iodine** | 150 | 150 | mcg |

## 4. System Feedback & User Messages
The system provides clear feedback for inputs and interactions.

### 4.1. Validation Alerts
| Situation | Trigger | Message |
| :--- | :--- | :--- |
| **Missing Fields** | Clicking "Next" with empty stats | `alert("Please fill in all fields.")` |
| **Unsafe Weight Loss** | Target loss > Max allowed (e.g., >3kg/mo) | `alert("For [Duration], maximum weight loss allowed is [Max]kg.")` |

### 4.2. UI Indicators
*   **Header**: Shows Current / Target values (e.g., "Protein 45 / 120g").
*   **Red Text**: Indicates a value (Calories or Macros) has exceeded the daily or meal limit.
*   **Input Borders**: Turn red when invalid data is entered.

## 5. Plan Management & Export

### 5.1. Saving Plans
The system allows users to store their generated plans for future reference.
*   **Action**: Clicking "Save Plan" opens a modal to name the current configuration.
*   **Storage**: Plans are saved to the user's local profile (mocked in store.js) with a custom name (e.g., "Muscle Gain Week 1").
*   **Retrieval**: Saved plans can be re-loaded to instantly populate the daily schedule without re-generating from scratch.

### 5.2. Export Options
Users can take their plans offline or share them using the "Download" menu.
*   **PDF Document**: Generates a clean, printable document suitable for sticking on a fridge or sharing with a trainer.
*   **Excel Sheet**: providing a raw data view for users who want to perform their own tracking or analysis in a spreadsheet.

## 6. Functional Capabilities

### 6.1. Meal Planner
The core engine for generating personalized nutrition plans.
*   **Personalised Plan Generation**: Creates a full weekly meal plan based on the user's BMR, TDEE, and specific goal (Weight Loss/Gain).
*   **Smart Ingredient Swapping**: Allows users to swap ingredients within a meal while automatically adjusting portions of other items to maintain the exact calorie count.
*   **Export Options**: Users can download their plan as a PDF for printing or an Excel sheet for detailed data analysis.

### 6.2. Meal Tracking
A real-time logging system to track daily adherence.
*   **Plan Switching**: Users can toggle between different saved plans (e.g., "Muscle Gain" vs "Maintenance") directly from the tracker header.
*   **Day Navigation**: Horizontal day tabs allow users to plan ahead or backfill logs for previous days within the plan duration.
*   **Smart Search & Log**: A comprehensive food database search that allows adding custom items or "Extras" outside the generated plan.
*   **Real-time Updates**: As food is logged, the daily progress bars (Protein, Carbs, Fats) update instantly to show remaining budgets.

### 6.3. Meal History & Persistence
A chronological record of the user's nutritional journey.
*   **Chronological Logging**: Every saved day is permanently stored in the history log, accessible by date.
*   **Context Switching**: Clicking on a past history entry reloads that specific day's state into the Tracker, allowing users to review exactly what they ate.
*   **Data Persistence**: All data is stored locally, ensuring that logs are saved even if the app is closed or offline.

### 6.4. Dashboard & Analytics
The central hub for long-term progress monitoring.
*   **Trend Analysis**: Users can view their calorie and macro intake trends over the last 7 or 15 days to identify patterns.
*   **Micro-Nutrient Monitoring**: Detailed tracking of essential vitamins (A, C, D, and **Vitamin B Score**) and minerals (Calcium, Magnesium, Iron, Zinc, Iodine), highlighting strict deficiencies or surpluses.
*   **Intelligent Backfilling**: The system visualizes trends even for days with missing data by projecting expected values based on the user's plan, identifying adherence gaps.

## 7. App Navigation (Sidebar)
The application features a comprehensive sidebar for quick access to key modules:
*   **CYOM Home**: Central hub.
*   **Dashboard**: Progress monitoring and analytics.
*   **Meal Tracker**: Daily food logging (Added in latest update).
*   **Meal History**: Review past logs.
*   **Goal Selection**: Start a new plan.
*   **Saved Plans**: Access library of user plans.
*   **MedPlus Home**: Quick link back to the main app (positioned at bottom).

## 8. AI Model Fine-Tuning (Instructions)
To train a custom "CYOM Nutrition Coach" AI that understands the specific logic formulas and B-Score calculations without hallucinating.

### 8.1. Files Prepared
*   `ai_training/generate_synthetic_data.js`: A Node.js script to create thousands of valid training examples.
*   `ai_training/training_data.jsonl`: The output dataset (will be generated by the script).
*   `ai_training/finetune_cyom_model.ipynb`: A Jupyter Notebook optimized for Google Colab (Free Tier).

### 8.2. How to Train (for Free)
0.  **Generate Data**: Run `node ai_training/generate_synthetic_data.js` to create a fresh `training_data.jsonl`.
1.  **Open Google Colab**: Go to [colab.research.google.com](https://colab.research.google.com).
2.  **Upload Notebook**: Click "Upload" and select `ai_training/finetune_cyom_model.ipynb`.
3.  **Enable GPU**: Go to `Runtime` > `Change runtime type` > Select **T4 GPU**.
4.  **Upload Data**:
    *   Click the "Folder" icon on the left sidebar.
    *   Drag and drop `ai_training/training_data.jsonl` into the file area.
5.  **Run All**: Click `Runtime` > `Run all`.
6.  **Download Model**:
    *   Once finished, a `model.gguf` file will be generated.
    *   **Setup**: Install [Ollama](https://ollama.com/), run `ollama create cyom-coach -f Modelfile` (using the GGUF).
    *   **In App**: Open the ChatBot, click standard "Settings" icon, switch Provider to **"Local (Ollama)"**, and chat!
