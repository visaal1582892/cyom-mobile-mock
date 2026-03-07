import React from 'react';
import { Outlet, useNavigate, useLocation, useOutlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const OnboardingLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const outlet = useOutlet();

    // Map paths to step numbers for the progress bar
    const stepMapping = {
        '/onboarding/personal-info': 1,
        '/onboarding/exercise-profile': 2,
        '/onboarding/lifestyle-health': 3,
    };

    const currentStep = stepMapping[location.pathname] || 1;

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="h-[100dvh] bg-gradient-to-b from-[#43AA95] to-[#A8E6CF] flex flex-col font-sans relative overflow-hidden text-white w-full">
            {/* Background Details */}
            <div className="absolute top-0 right-0 w-full h-[50vh] bg-gradient-to-b from-black/5 to-transparent pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 0.2, scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-[#A8E6CF] rounded-full mix-blend-overlay filter blur-[100px]"
            ></motion.div>

            {/* Header with Back Button */}
            <div className="pt-8 px-6 pb-4 relative z-20 flex justify-between items-center">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-1 text-white font-semibold opacity-80 hover:opacity-100 transition-opacity"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back
                </button>
                <div className="text-white font-bold text-sm bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                    Step {currentStep} of 3
                </div>
            </div>

            {/* Progress Bar */}
            <div className="px-6 mb-8 z-20">
                <div className="w-full bg-black/20 h-1.5 rounded-full overflow-hidden backdrop-blur-sm">
                    <motion.div
                        className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentStep / 3) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            {/* Main Content Area via Outlet */}
            <div className="flex-1 w-full max-w-md mx-auto relative z-10 overflow-hidden">
                <AnimatePresence mode="wait">
                    {outlet && React.cloneElement(outlet, { key: location.pathname })}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default OnboardingLayout;
