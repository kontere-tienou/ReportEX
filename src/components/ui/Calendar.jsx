import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const Calendar = ({
                      value,
                      onChange,
                      minDate,
                      maxDate,
                      disabledDates = [],
                      className = ''
                  }) => {
    const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date());
    const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);

    const months = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    const daysOfWeek = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];

        // Previous month days
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push({ day: null, isCurrentMonth: false });
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ day: i, isCurrentMonth: true });
        }

        return days;
    };

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const handleDateClick = (day) => {
        if (!day) return;
        const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);

        if (minDate && newDate < new Date(minDate)) return;
        if (maxDate && newDate > new Date(maxDate)) return;
        if (disabledDates.some(d => isSameDay(new Date(d), newDate))) return;

        setSelectedDate(newDate);
        onChange && onChange(newDate);
    };

    const isSameDay = (date1, date2) => {
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    };

    const isToday = (day) => {
        const today = new Date();
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        return isSameDay(today, date);
    };

    const isSelected = (day) => {
        if (!selectedDate || !day) return false;
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        return isSameDay(selectedDate, date);
    };

    const isDisabled = (day) => {
        if (!day) return false;
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);

        if (minDate && date < new Date(minDate)) return true;
        if (maxDate && date > new Date(maxDate)) return true;
        if (disabledDates.some(d => isSameDay(new Date(d), date))) return true;

        return false;
    };

    const days = getDaysInMonth(currentMonth);

    return (
        <div className={`bg-white rounded-lg shadow-lg p-4 w-80 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={handlePrevMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <h3 className="font-semibold text-gray-900">
                    {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>

                <button
                    onClick={handleNextMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {daysOfWeek.map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-gray-600 py-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-1">
                {days.map((dayObj, index) => (
                    <button
                        key={index}
                        onClick={() => handleDateClick(dayObj.day)}
                        disabled={!dayObj.isCurrentMonth || isDisabled(dayObj.day)}
                        className={`
              aspect-square flex items-center justify-center rounded-lg text-sm
              transition-colors
              ${!dayObj.isCurrentMonth ? 'invisible' : ''}
              ${isSelected(dayObj.day) ? 'bg-cyan-600 text-white font-semibold' : ''}
              ${isToday(dayObj.day) && !isSelected(dayObj.day) ? 'bg-cyan-100 text-cyan-900 font-semibold' : ''}
              ${!isSelected(dayObj.day) && !isToday(dayObj.day) && dayObj.isCurrentMonth ? 'hover:bg-gray-100' : ''}
              ${isDisabled(dayObj.day) ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
            `}
                    >
                        {dayObj.day}
                    </button>
                ))}
            </div>
        </div>
    );
};

// DatePicker with Input
export const DatePicker = ({
                               value,
                               onChange,
                               placeholder = 'Sélectionner une date',
                               label,
                               error,
                               disabled = false,
                               ...calendarProps
                           }) => {
    const [isOpen, setIsOpen] = useState(false);

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    };

    const handleChange = (date) => {
        onChange(date);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                </label>
            )}

            <div className="relative">
                <input
                    type="text"
                    value={formatDate(value)}
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    placeholder={placeholder}
                    readOnly
                    disabled={disabled}
                    className={`
            w-full px-3 py-2 pr-10 border rounded-lg cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-cyan-500
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${error ? 'border-red-500' : 'border-gray-300'}
          `}
                />
                <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute z-20 mt-2">
                        <Calendar
                            value={value}
                            onChange={handleChange}
                            {...calendarProps}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default Calendar;