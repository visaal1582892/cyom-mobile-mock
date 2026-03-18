import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import MedPlusHome from './components/MedPlusHome';
import WellnessTab from './components/CYOM/WellnessTab';
import LoginPage from './components/Auth/LoginPage';
import RegisterPage from './components/Auth/RegisterPage';
import RegistrationSuccessPage from './components/Auth/RegistrationSuccessPage';
import MealCreationPage from './components/CYOM/MealCreationPage';
import MealPlannerPage from './components/CYOM/MealPlannerPage';
import SavedPlansPage from './components/CYOM/SavedPlansPage';
import UserProfilePage from './components/CYOM/UserProfilePage';
import CreateWorkoutPlanPage from './components/CYOM/CreateWorkoutPlanPage';
import CreatePlanFlowPage from './components/CYOM/CreatePlanFlowPage';

import CYOMHomePage from './components/CYOM/CYOMHomePage';
import DashboardPage from './components/CYOM/DashboardPage';
import OnboardingLayout from './components/Onboarding/OnboardingLayout';
import PersonalInfoStep from './components/Onboarding/PersonalInfoStep';
import ExerciseProfileStep from './components/Onboarding/ExerciseProfileStep';
import LifestyleHealthStep from './components/Onboarding/LifestyleHealthStep';
import MealTrackerPage from './components/CYOM/MealTrackerPage';
import WorkoutTrackerPage from './components/CYOM/WorkoutTrackerPage';
import ActiveWorkoutPage from './components/CYOM/ActiveWorkoutPage';
import WorkoutPlayerPage from './components/CYOM/WorkoutPlayerPage';
import WorkoutHistoryPage from './components/CYOM/WorkoutHistoryPage';
import MealHistoryPage from './components/CYOM/MealHistoryPage';
import ChatBot from './components/CYOM/ChatBot';
import PageLayout from './components/CYOM/PageLayout';

function App() {
  const location = useLocation();
  const isCoomonPage = !['/', '/login', '/register', '/registration-success'].includes(location.pathname) && !location.pathname.startsWith('/onboarding');

  return (
    <div className="bg-gray-100 min-h-screen w-full">
      <div className="w-full bg-white min-h-screen shadow-sm relative">
        <PageLayout>
          <Routes>
            <Route path="/" element={<MedPlusHome />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/registration-success" element={<RegistrationSuccessPage />} />
            <Route path="/meal-creation" element={<MealCreationPage />} />
            <Route path="/meal-planner" element={<MealPlannerPage />} />
            <Route path="/saved-plans" element={<SavedPlansPage />} />
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/workout-creation" element={<CreateWorkoutPlanPage />} />
            <Route path="/create-plan" element={<CreatePlanFlowPage />} />
            <Route path="/onboarding" element={<OnboardingLayout />}>
              <Route index element={<Navigate to="personal-info" replace />} />
              <Route path="personal-info" element={<PersonalInfoStep />} />
              <Route path="exercise-profile" element={<ExerciseProfileStep />} />
              <Route path="lifestyle-health" element={<LifestyleHealthStep />} />
            </Route>
            <Route path="/dashboard" element={<WellnessTab />} />
            <Route path="/cyom-home" element={<CYOMHomePage />} />
            <Route path="/cyom-dashboard" element={<DashboardPage />} />
            <Route path="/meal-tracker" element={<MealTrackerPage />} />
            <Route path="/workout-tracker" element={<WorkoutTrackerPage />} />
            <Route path="/active-workout" element={<ActiveWorkoutPage />} />
            <Route path="/workout-player" element={<WorkoutPlayerPage />} />
            <Route path="/workout-history" element={<WorkoutHistoryPage />} />
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
