import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../UI/Loader';
import Toast from '../UI/Toast';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: 'Rohit User',
        mobile: '9876543210',
        age: '25',
        gender: 'Male',
        height: '175',
        weight: '70',
        password: 'password123',
        confirmPassword: 'password123',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = () => {
        // Basic Validation
        if (!formData.name || !formData.mobile || !formData.age || !formData.height || !formData.weight || !formData.password) {
            setError('All fields are required');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setError('');
        setLoading(true);

        // Mock Registration Logic
        setTimeout(() => {
            setLoading(false);
            setToast({ message: "Registration Successful!", type: 'success' });
            setTimeout(() => navigate('/login'), 1500);
        }, 1500);
    };

    if (loading) return <Loader text="Creating your account..." />;

    const InputField = ({ label, name, value, type = "text", placeholder, suffix }) => (
        <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide ml-1">{label}</label>
            <div className="relative">
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 rounded-2xl bg-white/60 border border-white/40 focus:bg-white focus:border-[#2E7D6B] focus:ring-0 outline-none transition-all font-semibold text-gray-700 placeholder-gray-400 shadow-sm"
                />
                {suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">{suffix}</span>}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#43AA95] to-[#A8E6CF] flex flex-col items-center justify-center p-4 text-[#1F2933] font-sans relative overflow-hidden">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            {/* Background Decor */}
            <div className="absolute top-10 left-10 w-64 h-64 bg-[#2E7D6B] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>

            <div className="w-full max-w-md bg-white/40 backdrop-blur-xl p-6 md:p-8 rounded-[40px] shadow-2xl border border-white/50 relative z-10 my-4">
                <h2 className="text-2xl font-bold text-[#2E7D6B] mb-1 text-center">Create Account</h2>
                <p className="text-sm text-gray-600 mb-8 text-center font-medium">Join the wellness journey</p>

                <div className="space-y-4">
                    {/* Name & Mobile */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Full Name" name="name" value={formData.name} />
                        <InputField label="Mobile Number" name="mobile" value={formData.mobile} />
                    </div>

                    {/* Age & Gender */}
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Age" name="age" value={formData.age} type="number" />
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide ml-1">Gender</label>
                            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-3 rounded-2xl bg-white/60 border border-white/40 focus:bg-white focus:border-[#2E7D6B] focus:ring-0 outline-none transition-all font-semibold text-gray-700 shadow-sm cursor-pointer">
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                            </select>
                        </div>
                    </div>

                    {/* Height & Weight */}
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Height (cm)" name="height" value={formData.height} type="number" />
                        <InputField label="Weight (kg)" name="weight" value={formData.weight} type="number" />
                    </div>

                    {/* Passwords */}
                    <InputField label="Password" name="password" value={formData.password} type="password" />
                    <InputField label="Confirm Password" name="confirmPassword" value={formData.confirmPassword} type="password" />

                    {error && <p className="text-red-500 text-xs text-center pt-2 font-bold">{error}</p>}

                    <div className="pt-4">
                        <button
                            onClick={handleRegister}
                            className="w-full py-4 px-4 rounded-2xl shadow-lg text-sm font-bold text-white bg-[#2E7D6B] hover:bg-[#256a5b] transform hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2E7D6B]"
                        >
                            Create Account
                        </button>
                    </div>

                    <div className="text-center pt-2">
                        <p className="text-sm text-gray-600 font-medium">
                            Already have an account?{' '}
                            <button onClick={() => navigate('/login')} className="font-bold text-[#2E7D6B] hover:text-[#256a5b] hover:underline underline-offset-2">
                                Login here
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
