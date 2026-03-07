import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { userData } from '../data/store';
import Loader from './UI/Loader';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const MedPlusHome = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleCyomClick = () => {
        setLoading(true);
        setTimeout(() => {
            navigate('/login');
        }, 1500);
    };

    if (loading) return <Loader text="Entering Nutrition & Wellness..." />;

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col min-h-screen bg-gray-50"
        >
            {/* Header */}
            <header className="bg-[#D32F2F] text-white p-4 sticky top-0 z-10 shadow-md">
                <div className="max-w-7xl mx-auto w-full">
                    <div className="flex justify-between items-center mb-1">
                        <div className="font-bold text-2xl italic flex items-center">
                            MedPlus<span className="text-white">+</span>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    </div>
                    <div className="flex items-center text-sm">
                        <span>{userData.location}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                    <div className="text-xs truncate opacity-90">{userData.address}</div>
                </div>
            </header>

            <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col flex-1">
                {/* User Greeting */}
                <motion.div variants={itemVariants} className="bg-white p-4 shadow-sm">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full border border-gray-300 flex items-center justify-center bg-gray-50">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-gray-900 font-medium">Hello {userData.name}</div>
                                <div className="text-gray-500 text-xs">For The Best Site Experience</div>
                            </div>
                        </div>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-blue-700 text-white px-6 py-1.5 rounded-full text-sm font-medium shadow-sm">
                            Login
                        </motion.button>
                    </div>
                </motion.div>

                {/* Nutrition Tab (Swapped) */}
                <motion.div variants={itemVariants} className="px-4 py-4 md:px-8 max-w-7xl mx-auto w-full">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCyomClick}
                        className="bg-gradient-to-r from-teal-600 to-[#2E7D6B] hover:from-teal-700 hover:to-[#256a5b] transition-all w-full p-5 rounded-2xl text-white flex items-center justify-between shadow-lg cursor-pointer"
                    >
                        <div>
                            <div className="text-xl font-bold tracking-wide">Nutrition and Wellness (CYOM)</div>
                            <div className="text-sm opacity-90 mt-1 font-medium">Track your meals and nutrition</div>
                        </div>
                        <div className="bg-white/20 p-2 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white drop-shadow-sm" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Grid Content */}
                <motion.div variants={containerVariants} className="max-w-7xl mx-auto p-4 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8 md:p-8 w-full">
                    {/* Card 1 */}
                    <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-gradient-to-br from-orange-400 to-orange-500 p-5 rounded-2xl text-white h-40 flex flex-col justify-between relative overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-shadow">
                        <div className="relative z-10">
                            <div className="text-sm font-medium opacity-90">Factory Direct</div>
                            <div className="text-xl font-bold mt-1">Upto 70% Off</div>
                        </div>
                        {/* Mock Products */}
                        <div className="absolute -bottom-2 -right-2 flex gap-1 opacity-80 mix-blend-overlay">
                            <div className="w-10 h-16 bg-white rounded shadow-sm transform rotate-12"></div>
                            <div className="w-8 h-12 bg-black/20 rounded shadow-sm transform -rotate-6"></div>
                        </div>
                    </motion.div>

                    {/* Card 2 */}
                    <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-gradient-to-br from-[#4CAF50] to-[#388E3C] p-5 rounded-2xl text-white h-40 flex flex-col justify-between relative overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-shadow">
                        <div className="relative z-10">
                            <div className="text-sm font-medium opacity-90">Medicines</div>
                            <div className="text-xl font-bold mt-1">20% Off</div>
                        </div>
                        <div className="absolute bottom-2 right-2 opacity-50">
                            <div className="flex gap-1">
                                <div className="w-14 h-6 bg-white rounded-full border-2 border-dashed border-white/50"></div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 3 */}
                    <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-gradient-to-br from-[#B71C1C] to-[#D32F2F] p-5 rounded-2xl text-white h-40 flex flex-col justify-between relative overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-shadow">
                        <div>
                            <div className="text-sm font-medium opacity-90">Diagnostics</div>
                            <div className="text-sm font-medium opacity-90">Lab & Radiology</div>
                            <div className="text-2xl font-bold mt-2">75% Off</div>
                        </div>
                    </motion.div>

                    {/* Card 4 */}
                    <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-gradient-to-br from-[#1565C0] to-[#1976D2] p-5 rounded-2xl text-white h-40 flex flex-col justify-between relative overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-shadow">
                        <div className="relative z-10">
                            <div className="text-sm font-medium opacity-90">Doctor Consultation</div>
                            <div className="text-xl font-bold mt-1">50% Off</div>
                        </div>
                        <div className="absolute -bottom-4 -right-4 h-24 w-24 bg-white/10 rounded-full blur-sm"></div>
                    </motion.div>
                </motion.div>

                {/* Banner (Swapped) */}
                <motion.div variants={itemVariants} className="mt-2 px-4 pb-8 md:px-8 max-w-7xl mx-auto w-full">
                    <motion.div whileHover={{ scale: 1.01 }} className="rounded-2xl overflow-hidden shadow-lg flex items-center justify-between p-4 bg-gradient-to-r from-red-600 via-red-700 to-red-900 text-white md:p-8 md:justify-center md:gap-24 relative">
                        <div className="relative z-10">
                            <div className="text-[10px] bg-white text-red-700 font-bold px-2 py-0.5 inline-block rounded uppercase tracking-wider mb-2 shadow-sm">MedPlus Advantage</div>
                            <div className="text-sm font-medium opacity-90 md:text-lg">MedPlus Brand Medicines</div>
                            <div className="text-4xl font-extrabold md:text-6xl drop-shadow-md tracking-tight">50-80%</div>
                            <div className="text-lg font-bold md:text-2xl text-red-200">Discount</div>
                            <div className="text-[10px] bg-white/20 backdrop-blur-sm text-white border border-white/30 px-3 py-1 rounded-full mt-3 inline-block font-medium shadow-inner md:text-xs">Membership at ₹ 99/- per year</div>
                        </div>
                        <div className="relative h-28 w-24 md:h-40 md:w-32 z-10">
                            {/* Decorative element replacing image */}
                            <div className="absolute -bottom-4 -right-4 h-32 w-32 bg-white/10 rounded-full blur-2xl"></div>
                            <svg className="w-full h-full text-white/20" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                            </svg>
                        </div>
                    </motion.div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default MedPlusHome;
