// BuilderToolbar.jsx
import React from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useBuilderToolbar } from './hooks/useBuilderToolbar';
import { BuilderToolbarView } from './components/BuildToolBar.jsx';
import { getDepartmentDisplayName } from './utils/departmentMapping.js';

export default function BuilderToolbar({ onAddComponent, departmentCode }) {
    const { user } = useAuth();

    const {
        availableComponents,
        activeCategory,
        searchTerm,
        loading,
        schema,
        error,
        filteredComponents,
        categoryCounts,
        handleCategoryChange,
        handleSearchChange,
        handleClearSearch,
        handleAddComponent,
    } = useBuilderToolbar({
        departmentCode,
        onAddComponent,
        user // Pass user to the hook
    });

    const departmentName = getDepartmentDisplayName(departmentCode);

    return (
        <BuilderToolbarView
            // User auth props
            user={user}
            departmentCode={departmentCode}
            departmentName={departmentName}

            // Component props
            schema={schema}
            availableComponents={availableComponents}
            activeCategory={activeCategory}
            searchTerm={searchTerm}
            loading={loading}
            error={error}
            filteredComponents={filteredComponents}
            categoryCounts={categoryCounts}

            // Handlers
            onCategoryChange={handleCategoryChange}
            onSearchChange={handleSearchChange}
            onClearSearch={handleClearSearch}
            onAddComponent={handleAddComponent}
        />
    );
}