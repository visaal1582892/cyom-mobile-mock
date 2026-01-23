import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../UI/Loader';
import Toast from '../UI/Toast';

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
        // Redirect to Goal Selection
        setLoading(true);
        setTimeout(() => {
            navigate('/goal-selection');
        }, 1000);
    };

    if (loading) return <Loader text={showOtp ? "Verifying..." : "Sending OTP..."} />;

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#43AA95] to-[#A8E6CF] flex flex-col items-center justify-center p-6 text-[#1F2933] font-sans relative overflow-hidden">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#2E7D6B] rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-x-1/2 -translate-y-1/2 animate-blob"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#FFD166] rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-x-1/2 translate-y-1/2 animate-blob animation-delay-2000"></div>

            <div className="w-full max-w-sm bg-white/40 backdrop-blur-xl p-8 rounded-[40px] shadow-2xl border border-white/50 relative z-10">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-[#2E7D6B] mb-2">Welcome Back</h2>
                    <p className="text-sm text-gray-600 font-medium">Login to track your wellness journey</p>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide ml-1">Mobile Number</label>
                        <div className="flex bg-white/60 rounded-2xl p-1 shadow-inner border border-white/40">
                            <span className="inline-flex items-center px-4 rounded-xl text-[#2E7D6B] font-bold text-sm bg-white/50">
                                +91
                            </span>
                            <input
                                type="text"
                                value={mobileNumber}
                                onChange={(e) => setMobileNumber(e.target.value)}
                                className="flex-1 min-w-0 block w-full px-4 py-3 bg-transparent border-none focus:ring-0 text-gray-800 font-semibold placeholder-gray-400 outline-none"
                                placeholder="Enter mobile number"
                                maxLength={10}
                            />
                        </div>
                    </div>

                    {showOtp && (
                        <div className="animate-fade-in-up">
                            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide ml-1">Enter OTP</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="block w-full px-4 py-3 rounded-2xl bg-white/60 border border-white/40 focus:bg-white focus:border-[#2E7D6B] focus:ring-0 outline-none text-center font-bold tracking-[0.5em] text-xl shadow-inner text-[#2E7D6B]"
                                placeholder="XXXX"
                                maxLength={4}
                            />
                            <div className="flex justify-between items-center mt-3 px-1">
                                <span className="text-xs text-gray-500 font-medium">Didn't receive code?</span>
                                <button className="text-xs text-[#2E7D6B] font-bold hover:underline">Resend</button>
                            </div>
                        </div>
                    )}

                    {error && <p className="text-red-500 text-xs text-center bg-red-50 py-2 rounded-lg font-medium">{error}</p>}

                    {!showOtp ? (
                        <button
                            onClick={handleSendOtp}
                            className="w-full py-4 rounded-2xl shadow-lg text-sm font-bold text-white bg-[#2E7D6B] hover:bg-[#256a5b] transform hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2E7D6B]"
                        >
                            Send OTP
                        </button>
                    ) : (
                        <button
                            onClick={handleLogin}
                            className="w-full py-4 rounded-2xl shadow-lg text-sm font-bold text-white bg-[#2E7D6B] hover:bg-[#256a5b] transform hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2E7D6B]"
                        >
                            Login
                        </button>
                    )}

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-600 font-medium">
                            New to CYOM?{' '}
                            <button onClick={() => navigate('/register')} className="font-bold text-[#2E7D6B] hover:text-[#256a5b] hover:underline underline-offset-2">
                                Register here
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
