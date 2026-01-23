import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userData } from '../../data/store';

const UserProfilePage = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Local state for editing form
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({ ...userData });

    // Mock save function
    const handleSave = () => {
        // In a real app, you would update the store/backend here
        // Object.assign(userData, profile); // Simulating update
        setIsEditing(false);
        // Ideally show a toast
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleLogout = () => navigate('/login');

    const InputField = ({ label, name, value, type = "text", placeholder, suffix }) => (
        <div className="relative group">
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide ml-1">{label}</label>
            <div className="relative">
                <input
                    disabled={!isEditing}
                    type={type}
                    name={name}
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className={`w-full px-5 py-4 rounded-2xl border-2 border-transparent outline-none transition-all font-semibold text-gray-700 placeholder-gray-300 shadow-sm
                        ${isEditing
                            ? 'bg-gray-50 focus:bg-white focus:border-[#A8E6CF] focus:ring-0'
                            : 'bg-gray-100/50 text-gray-500 border-gray-100 cursor-not-allowed'}`}
                />
                {suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">{suffix}</span>}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#43AA95] to-[#A8E6CF] font-sans relative overflow-hidden text-white">

            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-full h-[50vh] bg-gradient-to-b from-black/10 to-transparent pointer-events-none"></div>

            {/* Header / Status Bar Area */}
            <div className="pt-6 px-6 flex justify-between items-center relative z-20">
                <div className="flex items-center gap-4">
                    {/* Hamburger Menu */}
                    <button onClick={() => setIsMenuOpen(true)} className="p-2 rounded-full hover:bg-white/20 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                    </button>
                    <div className="text-xl font-bold">My Profile</div>
                </div>

                {/* Back Button */}
                <button onClick={() => navigate(-1)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 backdrop-blur-md transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            </div>

            {/* Sidebar Menu (Drawer) - Duplicated for consistency across pages */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-50 flex">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
                    <div className="relative w-3/4 max-w-xs bg-white h-full shadow-2xl p-6 flex flex-col justify-between animate-slide-in-left">
                        <div>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-[#1F2933]">Menu</h2>
                                <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="space-y-2">
                                <button onClick={() => { navigate('/goal-selection'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-600 font-medium flex items-center gap-3">
                                    <span className="text-lg">🎯</span> Goal Selection
                                </button>
                                <button onClick={() => { navigate('/saved-plans'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-600 font-medium flex items-center gap-3">
                                    <span className="text-lg">📂</span> Saved Plans
                                </button>
                                <button onClick={() => { navigate('/'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-600 font-medium flex items-center gap-3">
                                    <span className="text-lg">🏠</span> Back to Home
                                </button>
                                <button onClick={() => { navigate('/profile'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl bg-[#F0FDF9] text-[#2E7D6B] font-bold flex items-center gap-3">
                                    <span className="text-lg">👤</span> My Profile
                                </button>
                            </div>
                        </div>
                        <div className="text-center text-xs text-gray-400">
                            v1.0.0 CYOM Beta
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto pb-10 custom-scrollbar px-4 pt-6">
                <div className="w-full max-w-2xl mx-auto mt-4">

                    {/* Profile Header Card */}
                    <div className="bg-white/95 backdrop-blur-xl p-6 rounded-[32px] shadow-2xl border border-white/50 text-[#1F2933] relative overflow-hidden mb-6">
                        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-r from-[#2E7D6B]/20 to-[#A8E6CF]/20"></div>

                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center text-3xl mb-4">
                                👤
                            </div>
                            {isEditing ? (
                                <input
                                    name="name"
                                    value={profile.name}
                                    onChange={handleChange}
                                    className="text-2xl font-bold text-center bg-gray-50 border-b-2 border-[#2E7D6B] outline-none"
                                />
                            ) : (
                                <h2 className="text-2xl font-bold">{profile.name}</h2>
                            )}
                            <div className="text-xs font-bold text-[#2E7D6B] uppercase tracking-widest mt-1 bg-[#2E7D6B]/10 px-3 py-1 rounded-full">Premium Member</div>
                        </div>
                    </div>

                    {/* Details Form */}
                    <div className="bg-white/95 backdrop-blur-xl p-6 md:p-8 rounded-[32px] shadow-2xl border border-white/50 space-y-6 text-[#1F2933]">

                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Personal Details</h3>
                            {!isEditing ? (
                                <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-[#F0FDF9] text-[#2E7D6B] rounded-xl text-sm font-bold hover:bg-[#2E7D6B]/10 transition-colors">
                                    Edit Profile
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-100 text-gray-500 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors">
                                        Cancel
                                    </button>
                                    <button onClick={handleSave} className="px-4 py-2 bg-[#2E7D6B] text-white rounded-xl text-sm font-bold hover:bg-[#256a5b] transition-colors shadow-lg shadow-[#2E7D6B]/20">
                                        Save Changes
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <InputField label="Age" name="age" value={profile.age} type="number" />
                            <InputField label="Gender" name="gender" value={profile.gender} />
                            <InputField label="Weight (kg)" name="weight" value={profile.weight} type="number" />
                            <InputField label="Height (cm)" name="height" value={profile.height} type="number" />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide ml-1">Activity Level</label>
                            <select
                                disabled={!isEditing}
                                name="activity"
                                value={profile.activity || 'Lightly Active'}
                                onChange={handleChange}
                                className={`w-full px-5 py-4 rounded-2xl border-2 border-transparent outline-none transition-all font-semibold text-gray-700 shadow-sm appearance-none
                                    ${isEditing
                                        ? 'bg-gray-50 focus:bg-white focus:border-[#A8E6CF]'
                                        : 'bg-gray-100/50 text-gray-500 border-gray-100 cursor-not-allowed'}`}
                            >
                                <option>Sedentary</option>
                                <option>Lightly Active</option>
                                <option>Moderately Active</option>
                                <option>Very Active</option>
                            </select>
                        </div>

                        {/* Danger Zone */}
                        {!isEditing && (
                            <div className="pt-6 border-t border-gray-100 mt-6">
                                <button onClick={handleLogout} className="w-full py-4 rounded-2xl border-2 border-red-50 text-red-500 font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Logout
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;
