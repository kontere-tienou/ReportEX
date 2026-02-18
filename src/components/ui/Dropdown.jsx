import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';

const Dropdown = ({
                      options,
                      value,
                      onChange,
                      placeholder = 'Sélectionner...',
                      label,
                      error,
                      disabled = false,
                      searchable = false,
                      multiple = false,
                      className = ''
                  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = searchable
        ? options.filter(option =>
            option.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : options;

    const handleSelect = (option) => {
        if (multiple) {
            const newValue = value?.includes(option.value)
                ? value.filter(v => v !== option.value)
                : [...(value || []), option.value];
            onChange(newValue);
        } else {
            onChange(option.value);
            setIsOpen(false);
        }
    };

    const isSelected = (optionValue) => {
        return multiple
            ? value?.includes(optionValue)
            : value === optionValue;
    };

    const getDisplayValue = () => {
        if (multiple) {
            if (!value || value.length === 0) return placeholder;
            return `${value.length} sélectionné${value.length > 1 ? 's' : ''}`;
        }
        const selected = options.find(opt => opt.value === value);
        return selected ? selected.label : placeholder;
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                </label>
            )}

            {/* Trigger */}
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`
          w-full flex items-center justify-between px-3 py-2 border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-cyan-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${isOpen ? 'ring-2 ring-cyan-500' : ''}
        `}
            >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {getDisplayValue()}
        </span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {searchable && (
                        <div className="p-2 border-b border-gray-200">
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    )}

                    <div className="py-1">
                        {filteredOptions.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-gray-500 text-center">
                                Aucun résultat
                            </div>
                        ) : (
                            filteredOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleSelect(option)}
                                    className={`
                    w-full flex items-center justify-between px-3 py-2 text-left text-sm
                    hover:bg-gray-100 transition-colors
                    ${isSelected(option.value) ? 'bg-cyan-50 text-cyan-900' : 'text-gray-900'}
                  `}
                                >
                                    <span>{option.label}</span>
                                    {isSelected(option.value) && (
                                        <Check className="w-4 h-4 text-cyan-600" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}

            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};

export default Dropdown;