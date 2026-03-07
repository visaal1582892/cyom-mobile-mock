import React, { useState, useRef, useEffect } from 'react';

const MultiSelectDropdown = ({ options, selected, onChange, placeholder = "Select..." }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOptions = options.filter(opt => {
        const val = typeof opt === 'object' ? opt.id : opt;
        return selected.includes(val);
    });

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-[46px] bg-gray-50 border-2 border-transparent focus-within:border-[#2E7D6B] rounded-xl px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
            >
                <div className="flex flex-nowrap gap-1.5 flex-1 items-center overflow-hidden pr-2">
                    {selectedOptions.length === 0 ? (
                        <span className="text-gray-400 text-xs font-bold pl-1">{placeholder}</span>
                    ) : (
                        <>
                            {selectedOptions.slice(0, 2).map(opt => {
                                const val = typeof opt === 'object' ? opt.id : opt;
                                const label = typeof opt === 'object' ? opt.label : opt;
                                return (
                                    <span key={val} className="bg-[#2E7D6B]/10 text-[#2E7D6B] px-2.5 py-1 rounded-md text-[10px] font-bold whitespace-nowrap">
                                        {label}
                                    </span>
                                );
                            })}
                            {selectedOptions.length > 2 && (
                                <span className="text-gray-400 font-black text-lg leading-none transform -translate-y-1 ml-1">...</span>
                            )}
                        </>
                    )}
                </div>
                <svg className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 p-2 max-h-60 overflow-y-auto custom-scrollbar">
                    {options.map(opt => {
                        const val = typeof opt === 'object' ? opt.id : opt;
                        const label = typeof opt === 'object' ? opt.label : opt;
                        const isSelected = selected.includes(val);
                        return (
                            <div
                                key={val}
                                onClick={(e) => { e.stopPropagation(); onChange(val); }}
                                className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer rounded-xl transition-colors"
                            >
                                <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-[#2E7D6B] border-transparent' : 'bg-white border-2 border-gray-200'}`}>
                                    {isSelected && (
                                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                <span className="text-sm font-bold text-gray-700">{label}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MultiSelectDropdown;
