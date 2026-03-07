import React from 'react';
import { motion } from 'framer-motion';

const Loader = ({ type = 'fullscreen', text = 'Loading...' }) => {

    const GifAnimation = () => (
        <div className="relative w-52 h-52 flex items-center justify-center mt-4">
            {/* Background Glow */}
            <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.9, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-gradient-to-tr from-[#A8E6CF]/30 to-[#FFD166]/30 rounded-full blur-2xl"
            />

            <motion.img
                src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExdGJkeXZzdHd5OGhpcTF6M2puM3NtNnhzaHUyeGsyNmVmYWhsbjg3MiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/k5gCYqpdDZEEpW5Lyz/giphy.gif"
                alt="Loading animation"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_25px_rgba(46,125,107,0.6)] rounded-full"
            />
        </div>
    );

    if (type === 'fullscreen') {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-xl p-8"
            >
                <GifAnimation />

                {/* Animated text with bouncing dots */}
                <div className="flex flex-col items-center mt-8">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-[#2E7D6B] font-extrabold text-xl tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-[#2E7D6B] to-[#43AA95] text-center"
                    >
                        {text}
                    </motion.div>
                    <div className="flex gap-1.5 mt-3">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                animate={{ y: [0, -6, 0], scale: [1, 1.2, 1], backgroundColor: ['#A8E6CF', '#2E7D6B', '#A8E6CF'] }}
                                transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                    ease: "easeInOut"
                                }}
                                className="w-2.5 h-2.5 rounded-full shadow-sm"
                            />
                        ))}
                    </div>
                </div>
            </motion.div>
        );
    }

    // Small inline loader
    return (
        <div className="flex justify-center items-center p-4">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-3 border-[#A8E6CF] border-t-[#2E7D6B] rounded-full shadow-sm"
            />
        </div>
    );
};

export default Loader;
