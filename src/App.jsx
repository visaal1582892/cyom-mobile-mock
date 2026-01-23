import { Routes, Route, Navigate } from 'react-router-dom';
import MedPlusHome from './components/MedPlusHome';
import WellnessTab from './components/CYOM/WellnessTab';
import LoginPage from './components/Auth/LoginPage';
import RegisterPage from './components/Auth/RegisterPage';
import GoalSelectionPage from './components/CYOM/GoalSelectionPage';
import MealCreationPage from './components/CYOM/MealCreationPage';
import MealPlannerPage from './components/CYOM/MealPlannerPage';
import SavedPlansPage from './components/CYOM/SavedPlansPage';
import UserProfilePage from './components/CYOM/UserProfilePage';

function App() {
  return (
    <div className="bg-gray-100 min-h-screen w-full">
      <div className="w-full bg-white min-h-screen shadow-sm">
        <Routes>
          <Route path="/" element={<MedPlusHome />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/goal-selection" element={<GoalSelectionPage />} />
          <Route path="/meal-creation" element={<MealCreationPage />} />
          <Route path="/meal-planner" element={<MealPlannerPage />} />
          <Route path="/saved-plans" element={<SavedPlansPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/dashboard" element={<WellnessTab />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
