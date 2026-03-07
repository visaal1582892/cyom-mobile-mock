import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';

const RegistrationSuccessPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#43AA95] to-[#A8E6CF] flex flex-col items-center justify-center p-4 text-[#1F2933] font-sans relative overflow-hidden">
            {/* Background Decor */}
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 0.2, scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute top-10 right-10 w-72 h-72 bg-[#2E7D6B] rounded-full mix-blend-multiply filter blur-3xl"
            ></motion.div>
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 0.2, scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                className="absolute bottom-10 left-10 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-30"
            ></motion.div>

            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
                className="w-full max-w-md bg-white/40 backdrop-blur-xl p-8 md:p-10 rounded-[40px] shadow-2xl border border-white/50 relative z-10 flex flex-col items-center text-center my-4"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
                >
                    <CheckCircle className="w-24 h-24 text-[#2E7D6B] mb-6 drop-shadow-md" strokeWidth={1.5} />
                </motion.div>

                <h2 className="text-3xl font-extrabold text-[#2E7D6B] mb-2 tracking-tight">Welcome Aboard!</h2>
                <p className="text-md text-gray-700 mb-10 font-medium leading-relaxed">
                    Your account has been created successfully. Let's get to know you better to personalize your wellness journey.
                </p>

                <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/onboarding/personal-info')}
                    className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl shadow-xl text-base font-bold text-white bg-gradient-to-r from-[#2E7D6B] to-[#3BBF9E] hover:from-[#256a5b] hover:to-[#2e9c80] transition-all focus:outline-none focus:ring-4 focus:ring-[#2E7D6B]/30"
                >
                    Build Your Profile
                    <ArrowRight className="w-5 h-5" />
                </motion.button>
            </motion.div>
        </div>
    );
};

export default RegistrationSuccessPage;
