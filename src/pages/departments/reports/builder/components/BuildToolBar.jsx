// BuilderToolbarView.jsx
import React from 'react';
import { iconMap } from '../../constants/iconMapping.js';
import { categories } from '../../constants/categories';
import { getDepartmentDisplayName } from '../utils/departmentMapping';

const LoadingState = () => (
    <div className="bg-white rounded-xl border h-full flex items-center justify-center">
        <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Chargement des composants...</p>
        </div>
    </div>
);

const ErrorState = ({ error, departmentCode, user }) => (
    <div className="bg-white rounded-xl border h-full flex items-center justify-center p-4">
        <div className="text-center">
            <div className="text-4xl mb-2">⚠️</div>
            <p className="text-sm text-red-600 mb-2">{error}</p>
            <p className="text-xs text-gray-500">
                Département: {departmentCode || 'Non défini'}
            </p>
            {user && (
                <p className="text-xs text-gray-400 mt-2">
                    Utilisateur: {user.full_name || user.name || user.email}
                </p>
            )}
            <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-cyan-600 text-white text-xs rounded-lg hover:bg-cyan-700 transition-colors"
            >
                Réessayer
            </button>
        </div>
    </div>
);

const EmptyState = ({ searchTerm, onClearSearch, departmentName }) => (
    <div className="text-center py-8">
        <div className="text-4xl mb-2">🔍</div>
        <p className="text-sm text-gray-500">Aucun composant trouvé</p>
        {searchTerm ? (
            <button
                onClick={onClearSearch}
                className="mt-2 text-xs text-cyan-600 hover:underline"
            >
                Effacer la recherche
            </button>
        ) : (
            <p className="text-xs text-gray-400 mt-2">
                Aucun composant disponible pour {departmentName}
            </p>
        )}
    </div>
);

const CategoryButton = ({ category, isActive, count, onClick }) => {
    const Icon = category.icon;

    return (
        <button
            onClick={() => onClick(category.id)}
            className={`px-3 py-1.5 text-xs rounded-full transition-colors flex items-center space-x-1 ${
                isActive
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title={`${category.label} (${count} composants)`}
        >
            <Icon className="w-3 h-3" />
            <span>{category.label}</span>
            {count > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                    isActive
                        ? 'bg-white text-cyan-600'
                        : 'bg-gray-200 text-gray-600'
                }`}>
                    {count}
                </span>
            )}
        </button>
    );
};

const ComponentButton = ({ component, onClick }) => {
    const Icon = iconMap[component.icon] || iconMap.FileText;

    return (
        <button
            onClick={onClick}
            className="w-full bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-cyan-500 hover:shadow-md transition-all group text-left"
            title={`Ajouter ${component.name}`}
        >
            <div className="flex items-start space-x-3">
                <div className="bg-cyan-50 p-2 rounded-lg group-hover:bg-cyan-100 transition-colors flex-shrink-0">
                    <Icon className="w-4 h-4 text-cyan-600" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm group-hover:text-cyan-600 transition-colors">
                        {component.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {component.description}
                    </p>
                    {component.fieldKey && (
                        <p className="text-xs text-gray-400 mt-1">
                            Champ: {component.fieldKey}
                        </p>
                    )}
                    {component.config?.format && (
                        <p className="text-xs text-gray-400 mt-1">
                            Format: {component.config.format === 'currency' ? 'FCFA' : component.config.format}
                        </p>
                    )}
                </div>
            </div>
        </button>
    );
};

const UserInfoBadge = ({ user, departmentCode }) => {
    if (!user) return null;

    const departmentName = getDepartmentDisplayName(departmentCode) || departmentCode;
    const userName = user.full_name || user.name || user.email || 'Utilisateur';

    return (
        <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-lg text-xs">
            <div className="w-6 h-6 rounded-full bg-cyan-100 flex items-center justify-center">
                <span className="text-cyan-700 font-medium">
                    {userName.charAt(0).toUpperCase()}
                </span>
            </div>
            <div className="flex flex-col">
                <span className="font-medium text-gray-700">{userName}</span>
                <span className="text-gray-500">{departmentName}</span>
            </div>
        </div>
    );
};

export const BuilderToolbarView = ({
                                       // User auth props
                                       user,
                                       departmentCode,
                                       departmentName,

                                       // Component props
                                       schema,
                                       availableComponents,
                                       activeCategory,
                                       searchTerm,
                                       loading,
                                       error,
                                       filteredComponents,
                                       categoryCounts,

                                       // Handlers
                                       onCategoryChange,
                                       onSearchChange,
                                       onClearSearch,
                                       onAddComponent,
                                   }) => {
    if (loading) return <LoadingState />;

    if (error) return <ErrorState error={error} departmentCode={departmentCode} user={user} />;

    const displayDepartmentName = departmentName || getDepartmentDisplayName(departmentCode) || departmentCode;

    return (
        <div className="bg-white rounded-xl border h-full flex flex-col">
            {/* Header with User Info */}
            <div className="p-4 border-b flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Composants
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                            {schema?.icon || '📊'} {availableComponents.length} composants disponibles
                        </p>
                    </div>
                    <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full">
                        {availableComponents.length}
                    </span>
                </div>

                {/* User Info */}
                <UserInfoBadge user={user} departmentCode={departmentCode} />
            </div>

            {/* Search */}
            <div className="px-4 py-3 border-b flex-shrink-0">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Rechercher un composant..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
            </div>

            {/* Categories */}
            <div className="px-4 py-2 border-b flex-shrink-0">
                <div className="flex flex-wrap gap-1">
                    {categories.map((category) => (
                        <CategoryButton
                            key={category.id}
                            category={category}
                            isActive={activeCategory === category.id}
                            count={categoryCounts[category.id === 'all' ? 'total' : category.id] || 0}
                            onClick={onCategoryChange}
                        />
                    ))}
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {filteredComponents.length === 0 ? (
                    <EmptyState
                        searchTerm={searchTerm}
                        onClearSearch={onClearSearch}
                        departmentName={displayDepartmentName}
                    />
                ) : (
                    <div className="space-y-2">
                        {filteredComponents.map((component) => (
                            <ComponentButton
                                key={component.id}
                                component={component}
                                onClick={() => onAddComponent(component)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Footer with Stats */}
            <div className="p-3 bg-gray-50 border-t flex-shrink-0">
                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                        <span className="text-gray-600">
                            <strong>{filteredComponents.length}</strong> sur <strong>{availableComponents.length}</strong>
                        </span>
                        {activeCategory !== 'all' && (
                            <span className="text-gray-400">
                                ({categories.find(c => c.id === activeCategory)?.label})
                            </span>
                        )}
                    </div>
                    <p className="text-gray-400 flex items-center space-x-1">
                        <span>👆</span>
                        <span>Cliquez pour ajouter</span>
                    </p>
                </div>
            </div>
        </div>
    );
};