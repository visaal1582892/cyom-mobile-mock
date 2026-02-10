import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userData } from '../../data/store';

const CommonProfileMenu = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        // Add any clear auth tokens logic here if needed
        navigate('/login');
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/50 shadow-md hover:border-white transition-all"
            >
                <img src={userData.image} alt="Profile" className="w-full h-full object-cover" />
            </button>

            {/* Profile Dropdown */}
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10 cursor-default" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute right-0 top-14 w-48 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 py-2 z-20 animate-fade-in-up text-gray-800">
                        <div className="px-4 py-2 border-b border-gray-100 mb-1">
                            <div className="font-bold text-sm truncate">{userData.name}</div>
                            <div className="text-xs text-gray-500">Premium Member</div>
                        </div>
                        <button onClick={() => { navigate('/profile'); setIsOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-[#2E7D6B]/10 hover:text-[#2E7D6B] text-sm font-medium transition-colors flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            My Profile
                        </button>
                        <button onClick={() => { navigate('/saved-plans'); setIsOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-[#2E7D6B]/10 hover:text-[#2E7D6B] text-sm font-medium transition-colors flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                            Saved Plans
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 hover:bg-red-50 hover:text-red-500 text-sm font-medium transition-colors flex items-center gap-2 text-red-500"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default CommonProfileMenu;
