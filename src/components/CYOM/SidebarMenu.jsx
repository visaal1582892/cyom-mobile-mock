import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SidebarMenu = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const location = useLocation();

    if (!isOpen) return null;

    const isActive = (path) => location.pathname === path;
    const getButtonClass = (path) => isActive(path)
        ? "w-full text-left px-4 py-3 rounded-xl bg-[#F0FDF9] text-[#2E7D6B] font-bold flex items-center gap-3"
        : "w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-600 font-medium flex items-center gap-3";

    return (
        <div className="fixed inset-0 z-50 flex text-[#1F2933]">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-3/4 max-w-xs bg-white h-full shadow-2xl p-6 flex flex-col justify-between animate-slide-in-left">
                <div>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-[#1F2933]">Menu</h2>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="space-y-2">
                        <button onClick={() => { navigate('/cyom-home'); onClose(); }} className={getButtonClass('/cyom-home')}>
                            <span className="text-lg">🏠</span> Home
                        </button>
                        <button onClick={() => { navigate('/cyom-dashboard'); onClose(); }} className={getButtonClass('/cyom-dashboard')}>
                            <span className="text-lg">📊</span> Dashboard
                        </button>
                        <button onClick={() => { navigate('/meal-tracker'); onClose(); }} className={getButtonClass('/meal-tracker')}>
                            <span className="text-lg">🍽️</span> Meal Tracker
                        </button>
                        <button onClick={() => { navigate('/meal-history'); onClose(); }} className={getButtonClass('/meal-history')}>
                            <span className="text-lg">📜</span> Meal History
                        </button>
                        <button onClick={() => { navigate('/meal-creation'); onClose(); }} className={getButtonClass('/meal-creation')}>
                            <span className="text-lg">🍱</span> Create Diet Plan
                        </button>
                        <button onClick={() => { navigate('/saved-plans'); onClose(); }} className={getButtonClass('/saved-plans')}>
                            <span className="text-lg">📂</span> Saved Plans
                        </button>
                        <div className="my-2 border-t border-gray-100"></div>
                        <button onClick={() => { navigate('/'); onClose(); }} className={getButtonClass('/')}>
                            <span className="text-lg">🏥</span> Medplus Home
                        </button>
                    </div>
                </div>
                <div className="text-center text-xs text-gray-400">v1.0.0 CYOM Beta</div>
            </div>
        </div>
    );
};

export default SidebarMenu;
