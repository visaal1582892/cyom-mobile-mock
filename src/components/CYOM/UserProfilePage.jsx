import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userData } from '../../data/store';
import SidebarMenu from './SidebarMenu';

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
        <div className="flex flex-col min-h-screen bg-gray-50 font-sans text-[#1F2933]">
            {/* --- STICKY HEADER --- */}
            <div className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-30 flex justify-between items-center px-4 py-3">
                <button onClick={() => setIsMenuOpen(true)} className="p-2 hover:bg-gray-50 rounded-lg text-gray-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                </button>
                <div className="text-lg font-bold text-gray-800">My Profile</div>
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Sidebar Menu */}
            <SidebarMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto pb-10 custom-scrollbar px-4 pt-4">
                <div className="w-full max-w-2xl mx-auto space-y-4">

                    {/* Profile Header Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-r from-[#2E7D6B]/10 to-[#A8E6CF]/10"></div>
                        <div className="relative z-10">
                            <div className="w-20 h-20 mx-auto rounded-full p-1 bg-white shadow-md mb-3">
                                <img src={userData.image} alt="Profile" className="w-full h-full rounded-full object-cover" />
                            </div>
                            {isEditing ? (
                                <input
                                    name="name"
                                    value={profile.name}
                                    onChange={handleChange}
                                    className="text-xl font-bold text-center bg-gray-50 border-b-2 border-[#2E7D6B] outline-none w-full max-w-[200px]"
                                />
                            ) : (
                                <h2 className="text-xl font-bold text-gray-800">{profile.name}</h2>
                            )}
                            <div className="text-[10px] font-black text-[#2E7D6B] uppercase tracking-widest mt-1 bg-[#2E7D6B]/5 px-3 py-1 rounded-full inline-block">Premium Member</div>
                        </div>
                    </div>

                    {/* Details Form */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">

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

                        {/* Links/Actions */}
                        <div className="pt-6 border-t border-gray-100 mt-6 space-y-3">
                            <button onClick={() => navigate('/meal-history')} className="w-full py-4 rounded-2xl border-2 border-[#2E7D6B]/10 text-[#2E7D6B] font-bold hover:bg-[#2E7D6B]/5 transition-colors flex items-center justify-center gap-2">
                                <span className="text-xl">📜</span> View Meal History
                            </button>
                            {!isEditing && (
                                <button onClick={handleLogout} className="w-full py-4 rounded-2xl border-2 border-red-50 text-red-500 font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Logout
                                </button>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;
