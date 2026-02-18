import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const Accordion = ({
                       items,
                       allowMultiple = false,
                       defaultOpen = [],
                       className = ''
                   }) => {
    const [openItems, setOpenItems] = useState(defaultOpen);

    const toggleItem = (index) => {
        if (allowMultiple) {
            setOpenItems(prev =>
                prev.includes(index)
                    ? prev.filter(i => i !== index)
                    : [...prev, index]
            );
        } else {
            setOpenItems(prev =>
                prev.includes(index) ? [] : [index]
            );
        }
    };

    const isOpen = (index) => openItems.includes(index);

    return (
        <div className={`divide-y divide-gray-200 border border-gray-200 rounded-lg ${className}`}>
            {items.map((item, index) => (
                <div key={index}>
                    <button
                        onClick={() => toggleItem(index)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center space-x-3">
                            {item.icon && <span>{item.icon}</span>}
                            <span className="font-medium text-gray-900">{item.title}</span>
                        </div>
                        <ChevronDown
                            className={`w-5 h-5 text-gray-500 transition-transform ${
                                isOpen(index) ? 'transform rotate-180' : ''
                            }`}
                        />
                    </button>

                    {isOpen(index) && (
                        <div className="p-4 bg-gray-50 border-t border-gray-200">
                            {item.content}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default Accordion;