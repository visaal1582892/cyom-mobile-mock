import React from 'react';

// Detailed, Filled SVGs

export const LeafIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22C12 22 12 14 12 14" stroke="#388E3C" strokeWidth="2" strokeLinecap="round" />
        {/* Leaf Left */}
        <path d="M12 14C12 14 4 13 4 7C4 3 9 2 12 5" fill="#81C784" stroke="#388E3C" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M5 7C7 8 10 10 12 14" stroke="#388E3C" strokeWidth="1" strokeLinecap="round" />

        {/* Leaf Right */}
        <path d="M12 14C12 14 20 13 20 7C20 3 15 2 12 5" fill="#A5D6A7" stroke="#388E3C" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M19 7C17 8 14 10 12 14" stroke="#388E3C" strokeWidth="1" strokeLinecap="round" />
    </svg>
);

export const CoffeeBeanIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="14" r="5" fill="#6F4E37" />
        <path d="M8 10C7 12 7.5 16 9 17" stroke="#3E2723" strokeWidth="1.5" strokeLinecap="round" />

        <circle cx="16" cy="14" r="5" fill="#5D4037" />
        <path d="M16 10C15 12 15.5 16 17 17" stroke="#3E2723" strokeWidth="1.5" strokeLinecap="round" />

        <circle cx="12" cy="7" r="5" fill="#795548" />
        <path d="M12 3C11 5 11.5 9 13 10" stroke="#3E2723" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export const MilkIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        {/* Glass Shape filled */}
        <path d="M5 2H19L17.5 22H6.5L5 2Z" fill="#E3F2FD" stroke="#90CAF9" strokeWidth="1.5" linejoin="round" />
        {/* Milk Surface */}
        <path d="M5.5 6H18.5" stroke="#90CAF9" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" />
        {/* Reflections */}
        <path d="M15 10V16" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        <path d="M7 22H17" stroke="#64B5F6" strokeWidth="2" strokeLinecap="round" />
    </svg>
);
