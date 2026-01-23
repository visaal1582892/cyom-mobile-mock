import { useNavigate } from 'react-router-dom';
import { userData } from '../data/store';

const MedPlusHome = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
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

            {/* User Greeting */}
            <div className="bg-white p-4 shadow-sm">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full border border-gray-300 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-gray-900 font-medium">Hello {userData.name}</div>
                            <div className="text-gray-500 text-xs">For The Best Site Experience</div>
                        </div>
                    </div>
                    <button className="bg-blue-700 text-white px-6 py-1.5 rounded-full text-sm font-medium">
                        Login
                    </button>
                </div>
            </div>

            {/* Banner */}
            <div className="mt-2 w-full bg-red-600 relative">
                <div className="max-w-7xl mx-auto flex items-center justify-between p-4 bg-gradient-to-r from-red-600 to-red-800 text-white md:p-8 md:justify-center md:gap-20">
                    <div>
                        <div className="text-xs bg-white text-red-600 px-1 inline-block rounded-sm mb-1">MedPlus</div>
                        <div className="text-sm font-light md:text-lg">MedPlus Brand Medicines</div>
                        <div className="text-4xl font-bold md:text-6xl">50-80%</div>
                        <div className="text-lg font-bold md:text-2xl">Discount</div>
                        <div className="text-xs bg-white text-black px-2 py-0.5 rounded-full mt-2 inline-block md:text-sm">Membership at ₹ 99/- per year</div>
                    </div>
                    <div className="relative h-32 w-24 md:h-48 md:w-32">
                        {/* Mocking the person image */}
                        <div className="absolute bottom-0 right-0 h-28 w-20 bg-gray-800 rounded-t-lg opacity-20 md:h-40 md:w-28"></div>
                    </div>
                </div>
            </div>

            {/* Grid Content */}
            <div className="max-w-7xl mx-auto p-4 grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-10 md:p-8">
                {/* Card 1 */}
                <div className="bg-orange-400 p-4 rounded-lg text-white h-40 flex flex-col justify-between relative overflow-hidden transition-transform hover:scale-105 cursor-pointer shadow-sm hover:shadow-md">
                    <div>
                        <div className="text-sm font-medium">Factory Direct</div>
                        <div className="text-xl font-bold">Upto 70% Off</div>
                    </div>
                    {/* Mock Products */}
                    <div className="absolute bottom-[-10px] right-0 flex gap-1">
                        <div className="w-8 h-12 bg-white rounded shadow-sm"></div>
                        <div className="w-8 h-14 bg-blue-900 rounded shadow-sm"></div>
                        <div className="w-10 h-10 bg-purple-700 rounded-full shadow-sm"></div>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="bg-[#4CAF50] p-4 rounded-lg text-white h-40 flex flex-col justify-between relative overflow-hidden transition-transform hover:scale-105 cursor-pointer shadow-sm hover:shadow-md">
                    <div>
                        <div className="text-sm font-medium">Medicines</div>
                        <div className="text-xl font-bold">20% Off</div>
                    </div>
                    <div className="absolute bottom-2 right-2">
                        {/* Pills mock */}
                        <div className="flex gap-1">
                            <div className="w-12 h-6 bg-gray-200 rounded-full opacity-80 border-2 border-dashed border-gray-400"></div>
                        </div>
                    </div>
                </div>

                {/* Card 3 */}
                <div className="bg-[#B71C1C] p-4 rounded-lg text-white h-40 flex flex-col justify-between transition-transform hover:scale-105 cursor-pointer shadow-sm hover:shadow-md">
                    <div>
                        <div className="text-sm font-medium">Diagnostics</div>
                        <div className="text-sm font-medium">Lab & Radiology</div>
                        <div className="text-xl font-bold mt-1">75% Off</div>
                    </div>
                </div>

                {/* Card 4 */}
                <div className="bg-[#1565C0] p-4 rounded-lg text-white h-40 flex flex-col justify-between relative overflow-hidden transition-transform hover:scale-105 cursor-pointer shadow-sm hover:shadow-md">
                    <div>
                        <div className="text-sm font-medium">Doctor Consultation</div>
                        <div className="text-xl font-bold">50% Off</div>
                    </div>
                    <div className="absolute bottom-0 right-0 h-20 w-16 bg-white/20 rounded-tl-full"></div>
                </div>
            </div>

            <div className="px-4 pb-8 md:px-8 max-w-7xl mx-auto w-full">
                <div
                    onClick={() => navigate('/login')}
                    className="bg-primary hover:bg-teal-700 transition-colors w-full p-4 rounded-lg text-white flex items-center justify-between shadow-md cursor-pointer"
                >
                    <div>
                        <div className="text-lg font-bold">Nutrition and Wellness (CYOM)</div>
                        <div className="text-sm opacity-90">Track your meals and nutrition</div>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-secondary" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>

        </div>
    );
};

export default MedPlusHome;
