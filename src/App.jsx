import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import MedPlusHome from './components/MedPlusHome';
import WellnessTab from './components/CYOM/WellnessTab';
import LoginPage from './components/Auth/LoginPage';
import RegisterPage from './components/Auth/RegisterPage';
import GoalSelectionPage from './components/CYOM/GoalSelectionPage';
import MealCreationPage from './components/CYOM/MealCreationPage';
import MealPlannerPage from './components/CYOM/MealPlannerPage';
import SavedPlansPage from './components/CYOM/SavedPlansPage';
import UserProfilePage from './components/CYOM/UserProfilePage';

import CYOMHomePage from './components/CYOM/CYOMHomePage';
import DashboardPage from './components/CYOM/DashboardPage';
import MealTrackerPage from './components/CYOM/MealTrackerPage';
import MealHistoryPage from './components/CYOM/MealHistoryPage';
import ChatBot from './components/CYOM/ChatBot';
import PageLayout from './components/CYOM/PageLayout';

function App() {
  const location = useLocation();
  const isCoomonPage = !['/', '/login', '/register'].includes(location.pathname);

  return (
    <div className="bg-gray-100 min-h-screen w-full">
      <div className="w-full bg-white min-h-screen shadow-sm relative">
        <PageLayout>
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
            <Route path="/cyom-home" element={<CYOMHomePage />} />
            <Route path="/cyom-dashboard" element={<DashboardPage />} />
            <Route path="/meal-tracker" element={<MealTrackerPage />} />
            <Route path="/meal-history" element={<MealHistoryPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PageLayout>
        {isCoomonPage && <ChatBot />}
      </div>
    </div>
  );
}

export default App;
