import React from 'react';

const Loader = ({ type = 'fullscreen', text = 'Loading...' }) => {
    if (type === 'fullscreen') {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-md animate-fade-in">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-[#A8E6CF] border-t-[#2E7D6B] rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-xl animate-pulse">
                        🥗
                    </div>
                </div>
                <div className="mt-4 text-[#2E7D6B] font-bold text-lg animate-pulse">{text}</div>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center p-4">
            <div className="w-6 h-6 border-2 border-[#A8E6CF] border-t-[#2E7D6B] rounded-full animate-spin"></div>
        </div>
    );
};

export default Loader;
