import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, KeyRound, ArrowRight } from 'lucide-react';
import Loader from '../UI/Loader';
import Toast from '../UI/Toast';
import { generateDefaultPlan } from '../../utils/generateDefaultPlan';

const LoginPage = () => {
    const navigate = useNavigate();
    const [mobileNumber, setMobileNumber] = useState('9876543210');
    const [showOtp, setShowOtp] = useState(false);
    const [otp, setOtp] = useState('1234');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const handleSendOtp = () => {
        if (mobileNumber.length !== 10) {
            setError('Please enter a valid 10-digit mobile number');
            return;
        }
        setError('');
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setShowOtp(true);
            setToast({ message: `OTP Sent: ${otp}`, type: 'success' });
        }, 1200);
    };

    const handleLogin = () => {
        if (otp !== '1234') {
            setError('Invalid OTP');
            return;
        }
        // Redirect Logic
        setLoading(true);
        setTimeout(() => {
            const savedPlans = JSON.parse(localStorage.getItem('cyom_saved_plans') || '[]');
            if (savedPlans.length === 0) {
                // No plans yet — generate a smart default plan from profile
                generateDefaultPlan();
            }
            navigate('/cyom-home');
        }, 1000);
    };

    if (loading) return <Loader text={showOtp ? "Verifying..." : "Sending OTP..."} />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#43AA95] via-[#A8E6CF] to-[#80D6BA] flex flex-col items-center justify-center p-6 text-[#1F2933] font-sans relative overflow-hidden">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Background elements */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.2, scale: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="absolute top-0 right-0 w-80 h-80 bg-[#2E7D6B] rounded-full mix-blend-multiply filter blur-[80px] translate-x-1/2 -translate-y-1/2"
            ></motion.div>
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.15, scale: 1 }}
                transition={{ duration: 2, ease: "easeInOut", delay: 0.3 }}
                className="absolute bottom-0 left-0 w-80 h-80 bg-[#FFD166] rounded-full mix-blend-multiply filter blur-[80px] -translate-x-1/2 translate-y-1/2"
            ></motion.div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-sm bg-white/50 backdrop-blur-2xl p-8 rounded-[40px] shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] border border-white/60 relative z-10"
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-[#2E7D6B] mb-2">Welcome Back</h2>
                    <p className="text-sm text-gray-600 font-medium">Login to track your wellness journey</p>
                </div>

                <div className="space-y-5">
                    <AnimatePresence mode="wait">
                        {!showOtp ? (
                            <motion.div
                                key="mobile"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide ml-1">Mobile Number</label>
                                <div className="flex bg-white/60 rounded-2xl p-1 shadow-inner border border-white/40 focus-within:ring-4 focus-within:ring-[#2E7D6B]/20 transition-all">
                                    <span className="inline-flex items-center justify-center px-3 rounded-xl text-[#2E7D6B] bg-white/50 shadow-sm mr-2">
                                        <Phone size={18} strokeWidth={2.5} />
                                    </span>
                                    <span className="inline-flex items-center text-gray-600 font-bold text-sm bg-transparent mr-1">
                                        +91
                                    </span>
                                    <input
                                        type="tel"
                                        value={mobileNumber}
                                        onChange={(e) => setMobileNumber(e.target.value)}
                                        className="flex-1 min-w-0 block w-full py-3 pr-4 bg-transparent border-none focus:ring-0 text-gray-800 font-bold placeholder-gray-400 outline-none"
                                        placeholder="10-digit number"
                                        maxLength={10}
                                    />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="otp"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide ml-1">Enter OTP</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/60 border border-white/40 focus:bg-white focus:border-[#2E7D6B] focus:ring-4 focus:ring-[#2E7D6B]/20 outline-none text-center font-bold tracking-[0.5em] text-xl shadow-inner text-[#2E7D6B] transition-all"
                                        placeholder="XXXX"
                                        maxLength={4}
                                    />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2E7D6B]/60">
                                        <KeyRound size={20} strokeWidth={2.5} />
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mt-3 px-2">
                                    <span className="text-xs text-gray-500 font-medium">Didn't receive code?</span>
                                    <button className="text-xs text-[#2E7D6B] font-bold hover:text-[#256a5b] transition-colors decoration-2 hover:underline underline-offset-2">Resend</button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {error && (
                        <motion.p
                            initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-xs text-center pb-2 font-bold"
                        >
                            {error}
                        </motion.p>
                    )}

                    <div className="pt-2">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={!showOtp ? handleSendOtp : handleLogin}
                            className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-2xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-[#2E7D6B] to-[#3BBF9E] hover:from-[#256a5b] hover:to-[#2e9c80] transition-all focus:outline-none focus:ring-4 focus:ring-[#2E7D6B]/30"
                        >
                            {!showOtp ? 'Send OTP' : 'Login'}
                            <ArrowRight size={18} strokeWidth={2.5} />
                        </motion.button>
                    </div>

                    <div className="pt-4 text-center">
                        <p className="text-sm text-gray-600 font-medium">
                            New to CYOM?{' '}
                            <button onClick={() => navigate('/register')} className="font-bold text-[#2E7D6B] hover:text-[#256a5b] transition-colors decoration-2 hover:underline underline-offset-4">
                                Register here
                            </button>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
