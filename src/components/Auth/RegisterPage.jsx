import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, KeyRound, ArrowRight, CheckCircle2 } from 'lucide-react';
import Loader from '../UI/Loader';
import Toast from '../UI/Toast';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [formData, setFormData] = useState({
        name: 'Rohit User',
        mobile: '9876543210',
        otp: '123456'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleVerify = () => {
        if (!formData.name || !formData.mobile) {
            setError('Name and Mobile number are required');
            return;
        }
        if (formData.mobile.length < 10) {
            setError('Please enter a valid mobile number');
            return;
        }
        setError('');
        setLoading(true);

        // Mock sending OTP
        setTimeout(() => {
            setLoading(false);
            setToast({ message: "OTP sent successfully!", type: 'success' });
            setIsOtpSent(true);
        }, 1200);
    };

    const handleRegister = () => {
        if (!formData.otp) {
            setError('OTP is required');
            return;
        }
        if (formData.otp !== '123456') {
            setError('Invalid OTP');
            return;
        }

        setError('');
        setLoading(true);

        // Mock Registration Logic
        setTimeout(() => {
            setLoading(false);
            navigate('/registration-success');
        }, 1500);
    };

    if (loading) return <Loader text={!isOtpSent ? "Generating OTP..." : "Securing your account..."} />;

    const InputField = ({ label, name, value, type = "text", placeholder, icon: Icon, disabled = false, success = false }) => (
        <div className="mb-4">
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide ml-1">{label}</label>
            <div className="relative">
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`w-full pl-12 pr-${success ? '10' : '4'} py-3 rounded-2xl bg-white/60 border border-white/40 focus:bg-white ${success ? 'border-[#3BBF9E]' : 'focus:border-[#2E7D6B] focus:ring-4 focus:ring-[#2E7D6B]/20'} outline-none transition-all font-semibold text-gray-700 placeholder-gray-400 shadow-sm ${disabled ? 'opacity-70 cursor-not-allowed bg-gray-50/50' : ''}`}
                />
                {Icon && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2E7D6B]/60"><Icon size={20} strokeWidth={2.5} /></span>}
                {success && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3BBF9E]"><CheckCircle2 size={18} strokeWidth={3} /></span>}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#43AA95] via-[#A8E6CF] to-[#80D6BA] flex flex-col items-center justify-center p-4 text-[#1F2933] font-sans relative overflow-hidden">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Background elements */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.2, scale: 1 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#2E7D6B] rounded-full mix-blend-multiply filter blur-[80px]"
            ></motion.div>
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.3, scale: 1 }}
                transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-white rounded-full mix-blend-overlay filter blur-[60px]"
            ></motion.div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md bg-white/50 backdrop-blur-2xl p-6 md:p-8 rounded-[40px] shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] border border-white/60 relative z-10"
            >
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-[#2E7D6B] mb-2 tracking-tight">Create Account</h2>
                    <p className="text-sm text-gray-600 font-medium">Join our wellness community</p>
                </div>

                <div className="space-y-2">
                    <motion.div layout>
                        <InputField label="Full Name" name="name" value={formData.name} icon={User} placeholder="e.g. John Doe" disabled={isOtpSent} success={isOtpSent} />
                        <InputField label="Mobile Number" name="mobile" value={formData.mobile} type="tel" icon={Phone} placeholder="10-digit mobile number" disabled={isOtpSent} success={isOtpSent} />
                    </motion.div>

                    <AnimatePresence>
                        {isOtpSent && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, y: -20 }}
                                animate={{ opacity: 1, height: 'auto', y: 0 }}
                                transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
                                className="overflow-hidden mt-2"
                            >
                                <div className="p-4 bg-white/40 rounded-3xl border border-white/60 shadow-inner">
                                    <InputField label="One Time Password" name="otp" value={formData.otp} type="number" icon={KeyRound} placeholder="Enter 6-digit OTP" disabled={true} />
                                    <p className="text-xs text-center text-gray-500 font-medium -mt-1 mb-1">
                                        Test Mode: OTP is pre-filled
                                    </p>
                                    <div className="flex justify-between items-center px-2">
                                        <span className="text-xs text-gray-500 font-medium">Didn't receive?</span>
                                        <button className="text-xs text-[#2E7D6B] font-bold hover:text-[#256a5b] transition-colors decoration-2 hover:underline underline-offset-2">Resend OTP</button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <motion.div layout className="mt-8">
                    {error && (
                        <motion.p
                            initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-xs text-center pb-3 font-bold bg-red-50/50 rounded-lg py-2 mb-3"
                        >
                            {error}
                        </motion.p>
                    )}

                    <motion.button
                        layout
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={!isOtpSent ? handleVerify : handleRegister}
                        className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-2xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-[#2E7D6B] to-[#3BBF9E] hover:from-[#256a5b] hover:to-[#2e9c80] transition-shadow duration-300 focus:outline-none focus:ring-4 focus:ring-[#2E7D6B]/30"
                    >
                        {!isOtpSent ? 'Verify Mobile' : 'Complete Registration'}
                        <ArrowRight size={18} strokeWidth={2.5} />
                    </motion.button>
                </motion.div>

                <div className="text-center pt-6">
                    <p className="text-sm text-gray-600 font-medium">
                        Already have an account?{' '}
                        <button onClick={() => navigate('/login')} className="font-bold text-[#2E7D6B] hover:text-[#256a5b] transition-colors decoration-2 hover:underline underline-offset-4">
                            Login here
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default RegisterPage;
