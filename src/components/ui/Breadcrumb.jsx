import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const Breadcrumb = ({
                        items,
                        showHome = true,
                        separator = <ChevronRight className="w-4 h-4" />,
                        className = ''
                    }) => {
    return (
        <nav className={`flex ${className}`} aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                {showHome && (
                    <>
                        <li className="inline-flex items-center">
                            <Link
                                to="/"
                                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-cyan-600"
                            >
                                <Home className="w-4 h-4 mr-2" />
                                Accueil
                            </Link>
                        </li>
                        {items.length > 0 && (
                            <li>
                                <div className="flex items-center text-gray-400">
                                    {separator}
                                </div>
                            </li>
                        )}
                    </>
                )}

                {items.map((item, index) => (
                    <React.Fragment key={index}>
                        <li>
                            {item.href ? (
                                <Link
                                    to={item.href}
                                    className={`
                    text-sm font-medium
                    ${index === items.length - 1
                                        ? 'text-gray-500 cursor-default'
                                        : 'text-gray-700 hover:text-cyan-600'
                                    }
                  `}
                                >
                                    {item.icon && <span className="mr-2">{item.icon}</span>}
                                    {item.label}
                                </Link>
                            ) : (
                                <span className="text-sm font-medium text-gray-500">
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                                    {item.label}
                </span>
                            )}
                        </li>

                        {index < items.length - 1 && (
                            <li>
                                <div className="flex items-center text-gray-400">
                                    {separator}
                                </div>
                            </li>
                        )}
                    </React.Fragment>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumb;