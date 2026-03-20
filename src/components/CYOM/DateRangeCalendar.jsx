import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Calendar as CalendarIcon } from 'lucide-react';

const DateRangeCalendar = ({ dateRange, onDateRangeChange, availableDates = new Set() }) => {
    // If dateRange has a start date, default the calendar view to that month. Otherwise current month.
    const initialMonth = dateRange?.start ? new Date(dateRange.start) : new Date();
    const [currentMonth, setCurrentMonth] = useState(new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1));
    const [isExpanded, setIsExpanded] = useState(false);

    // Update currentMonth if dateRange.start changes from outside
    useEffect(() => {
        if (dateRange?.start && !isExpanded) {
            const d = new Date(dateRange.start);
            setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1));
        }
    }, [dateRange?.start, isExpanded]);

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(year, month + 1, 1));
    };

    const handleDateClick = (dateStr) => {
        if (!dateRange.start || (dateRange.start && dateRange.end)) {
            onDateRangeChange({ start: dateStr, end: null });
        } else {
            // Set end date, swap if end < start
            if (dateStr < dateRange.start) {
                onDateRangeChange({ start: dateStr, end: dateRange.start });
            } else {
                onDateRangeChange({ start: dateRange.start, end: dateStr });
            }
        }
    };

    const renderDays = () => {
        const days = [];

        // Padding for first week
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="h-10"></div>);
        }

        const todayObj = new Date();
        const todayYMDStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;

        for (let i = 1; i <= daysInMonth; i++) {
            const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            
            let isSelected = false;
            let isInRange = false;
            let isToday = (dStr === todayYMDStr);

            if (dateRange.start && dateRange.end) {
                if (dStr >= dateRange.start && dStr <= dateRange.end) {
                    isInRange = true;
                }
                if (dStr === dateRange.start || dStr === dateRange.end) {
                    isSelected = true;
                }
            } else if (dateRange.start && dStr === dateRange.start) {
                isSelected = true;
            }

            const hasData = availableDates instanceof Set ? availableDates.has(dStr) : (Array.isArray(availableDates) ? availableDates.includes(dStr) : false);

            const isFuture = dStr > todayYMDStr;
            const isSelectable = hasData && !isFuture;

            days.push(
                <button
                    key={dStr}
                    disabled={!isSelectable}
                    onClick={() => handleDateClick(dStr)}
                    className={`h-10 w-full rounded-lg flex flex-col items-center justify-center text-sm relative transition-all
                        ${!isSelectable && !isSelected && !isInRange ? 'bg-transparent text-gray-300 opacity-50 cursor-not-allowed'
                        : isSelected ? 'bg-[#2E7D6B] text-white font-black shadow-md z-10 scale-105' 
                        : isInRange ? 'bg-[#E4F1EC] text-[#2E7D6B] font-bold'
                        : isToday ? 'bg-orange-50 text-orange-600 font-black ring-1 ring-orange-200 hover:bg-orange-100'
                        : 'bg-white text-gray-700 hover:bg-gray-50 cursor-pointer'}`}
                >
                    <span>{i}</span>
                    {hasData && !isSelected && !isInRange && (
                        <div className={`w-1 h-1 rounded-full mt-0.5 absolute bottom-1 ${isToday ? 'bg-orange-600' : 'bg-[#2E7D6B]'}`}></div>
                    )}
                    {hasData && (isSelected || isInRange) && (
                        <div className="w-1 h-1 bg-white rounded-full mt-0.5 absolute bottom-1 opacity-70"></div>
                    )}
                </button>
            );
        }
        return days;
    };

    const handleMonthChange = (e) => {
        setCurrentMonth(new Date(year, parseInt(e.target.value), 1));
    };

    const handleYearChange = (e) => {
        setCurrentMonth(new Date(parseInt(e.target.value), month, 1));
    };

    const formatDisplayRange = () => {
        if (!dateRange.start) return "Select Dates";
        
        // Ensure parsing works properly as local date
        const d1Arr = dateRange.start.split('-');
        const d1Obj = new Date(d1Arr[0], d1Arr[1] - 1, d1Arr[2]);
        const formatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
        
        if (dateRange.start && !dateRange.end) return `${d1Obj.toLocaleDateString('en-US', formatOptions)} - Select end`;
        
        const d2Arr = dateRange.end.split('-');
        const d2Obj = new Date(d2Arr[0], d2Arr[1] - 1, d2Arr[2]);
        
        const d2Options = { month: 'short', day: 'numeric' };
        if (d2Obj.getFullYear() !== d1Obj.getFullYear()) {
            d2Options.year = 'numeric';
        }
        
        // order correctly
        const startStr = dateRange.start <= dateRange.end 
            ? d1Obj.toLocaleDateString('en-US', formatOptions) 
            : d2Obj.toLocaleDateString('en-US', formatOptions);
        const endStr = dateRange.start <= dateRange.end 
            ? d2Obj.toLocaleDateString('en-US', d2Options) 
            : d1Obj.toLocaleDateString('en-US', d2Options);
            
        return `${startStr} to ${endStr}`;
    };

    const currentYear = new Date().getFullYear();
    const yearsToGenerate = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
    const monthsNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    return (
        <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-4 w-full mx-auto">
            {/* Collapsible Header */}
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between group"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[14px] bg-[#E4F1EC] flex items-center justify-center text-[#2E7D6B] group-hover:scale-105 transition-transform">
                        <CalendarIcon size={18} />
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-[9px] uppercase font-black tracking-widest text-gray-400 mb-0.5">Filter by Range</span>
                        <span className="text-[13px] font-bold text-gray-800">{formatDisplayRange()}</span>
                    </div>
                </div>
                <div className="w-8 h-8 flex items-center justify-center text-gray-400 bg-gray-50 rounded-full group-hover:bg-gray-100 transition-colors">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
            </button>

            {/* Expandable Calendar Area */}
            {isExpanded && (
                <div className="mt-5 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex justify-between items-center mb-5 px-1">
                        <button onClick={handlePrevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                            <ChevronLeft size={20} />
                        </button>
                        
                        <div className="flex gap-2">
                            <select 
                                value={month} 
                                onChange={handleMonthChange}
                                className="text-[11px] font-black text-gray-800 uppercase tracking-widest bg-gray-50 px-2 py-1.5 rounded-lg outline-none cursor-pointer border border-transparent hover:border-gray-200"
                            >
                                {monthsNames.map((mName, i) => (
                                    <option key={i} value={i}>{mName.substring(0, 3)}</option>
                                ))}
                            </select>
                            
                            <select 
                                value={year} 
                                onChange={handleYearChange}
                                className="text-[11px] font-black text-[#2E7D6B] tracking-widest bg-[#E4F1EC] px-2 py-1.5 rounded-lg outline-none cursor-pointer border border-transparent hover:border-[#2E7D6B]/30"
                            >
                                {yearsToGenerate.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                        
                        <button onClick={handleNextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1 mb-3">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                            <div key={day} className="text-center text-[9px] font-black uppercase tracking-widest text-gray-400">
                                {day}
                            </div>
                        ))}
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1">
                        {renderDays()}
                    </div>

                    {(dateRange.start || dateRange.end) && (
                        <div className="mt-5 flex justify-between items-center border-t border-gray-50 pt-3">
                            <button 
                                onClick={() => { onDateRangeChange({ start: null, end: null }); }}
                                className="text-xs font-bold text-gray-500 hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            >
                                Clear
                            </button>
                            <button 
                                onClick={() => setIsExpanded(false)}
                                className="text-xs font-bold text-white bg-[#2E7D6B] px-5 py-2 rounded-[10px] hover:bg-[#1d5246] shadow-md shadow-[#2E7D6B]/20 transition-all"
                            >
                                Apply Filter
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DateRangeCalendar;
