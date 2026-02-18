import React, { useState } from 'react';

const Tabs = ({
                  tabs,
                  defaultTab = 0,
                  onChange,
                  variant = 'underline',
                  className = ''
              }) => {
    const [activeTab, setActiveTab] = useState(defaultTab);

    const handleTabChange = (index) => {
        setActiveTab(index);
        onChange && onChange(index);
    };

    const variants = {
        underline: {
            container: 'border-b border-gray-200',
            tab: 'pb-4 px-1 border-b-2 font-medium text-sm transition-colors',
            active: 'border-cyan-600 text-cyan-600',
            inactive: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        },
        pills: {
            container: 'bg-gray-100 p-1 rounded-lg',
            tab: 'px-4 py-2 rounded-md font-medium text-sm transition-colors',
            active: 'bg-white text-cyan-600 shadow',
            inactive: 'text-gray-600 hover:text-gray-900'
        },
        bordered: {
            container: 'border-b border-gray-200',
            tab: 'px-4 py-2 border border-b-0 rounded-t-lg font-medium text-sm transition-colors -mb-px',
            active: 'bg-white border-gray-300 text-cyan-600',
            inactive: 'bg-gray-50 border-transparent text-gray-500 hover:text-gray-700'
        }
    };

    const style = variants[variant];

    return (
        <div className={className}>
            <div className={`flex space-x-8 ${style.container}`}>
                {tabs.map((tab, index) => (
                    <button
                        key={index}
                        onClick={() => handleTabChange(index)}
                        disabled={tab.disabled}
                        className={`
              ${style.tab}
              ${activeTab === index ? style.active : style.inactive}
              ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
                    >
                        {tab.icon && <span className="mr-2">{tab.icon}</span>}
                        {tab.label}
                        {tab.badge && (
                            <span className="ml-2 px-2 py-0.5 bg-gray-200 text-xs rounded-full">
                {tab.badge}
              </span>
                        )}
                    </button>
                ))}
            </div>

            <div className="mt-4">
                {tabs[activeTab]?.content}
            </div>
        </div>
    );
};

export default Tabs;