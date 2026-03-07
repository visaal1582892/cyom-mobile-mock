import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userData } from '../../data/store';
import SidebarMenu from './SidebarMenu';

// Props:
// - showSidebarMenu (boolean, default true): Shows hamburger menu and handles sliding out SidebarMenu
// - showBackButton (boolean, default false): Shows a back button instead of hamburger menu (used on sub-pages)
// - title (string, optional): Replaces the "Welcome Back" section if provided
// - subtitle (string, optional): Displayed above the title if provided

const CommonNavbar = ({
    showSidebarMenu = true,
    showBackButton = false,
    title,
    subtitle
}) => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleLogout = () => {
        navigate('/login');
    };

    return (
        <>
            <div className="pt-6 px-6 pb-2 flex justify-between items-center relative z-20">
                <div className="flex items-center gap-4">

                    {/* Left Action Button (Back or Menu) */}
                    {showBackButton ? (
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 -ml-2 rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm text-white"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    ) : showSidebarMenu ? (
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="p-2 -ml-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all shadow-sm text-white"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                            </svg>
                        </button>
                    ) : (
                        <div className="w-10"></div> // Spacer
                    )}

                    {/* Title Area */}
                    <div>
                        {subtitle ? (
                            <div className="text-xs font-bold text-white/90 uppercase tracking-wider shadow-sm">{subtitle}</div>
                        ) : (
                            <div className="text-xs opacity-80 font-medium text-green-100 uppercase tracking-widest">{title ? 'Customize Routine' : 'Welcome'}</div>
                        )}

                        {title ? (
                            <div className="text-xl font-bold tracking-tight text-white">{title}</div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="text-lg font-bold text-white">{userData.name}!</div>
                                <div className="flex gap-1">
                                    <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[9px] font-bold border border-white/20 text-white">{userData.age} Y</span>
                                    <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[9px] font-bold border border-white/20 text-white uppercase">{userData.gender}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Profile Image & Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/50 shadow-md hover:border-white transition-all flex-shrink-0"
                    >
                        <img src={userData.image} alt="Profile" className="w-full h-full object-cover" />
                    </button>

                    {isProfileOpen && (
                        <>
                            <div className="fixed inset-0 z-30 cursor-default" onClick={() => setIsProfileOpen(false)}></div>
                            <div className="absolute right-0 top-14 w-48 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 py-2 z-40 animate-fade-in-up text-gray-800">
                                <div className="px-4 py-2 border-b border-gray-100 mb-1">
                                    <div className="font-bold text-sm truncate">{userData.name}</div>
                                    <div className="text-xs text-[#2E7D6B] font-bold">Premium Member</div>
                                </div>
                                <button onClick={() => navigate('/onboarding/personal-info')} className="w-full text-left px-4 py-2 hover:bg-[#F0FDF9] hover:text-[#2E7D6B] text-sm font-medium transition-colors flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    My Profile
                                </button>
                                <button onClick={() => navigate('/saved-plans')} className="w-full text-left px-4 py-2 hover:bg-[#F0FDF9] hover:text-[#2E7D6B] text-sm font-medium transition-colors flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                    </svg>
                                    Saved Plans
                                </button>
                                <div className="h-px bg-gray-100 my-1"></div>
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
            </div>

            {showSidebarMenu && (
                <SidebarMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
            )}
        </>
    );
};

export default CommonNavbar;
