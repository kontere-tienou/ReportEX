// BuilderToolbarView.jsx
import React from 'react';
import { Search, X, Plus, AlertTriangle, RefreshCw, PackageSearch } from 'lucide-react';
import { iconMap } from '../../constants/iconMapping.js';
import { categories } from '../../constants/categories';
import { getDepartmentDisplayName } from '../utils/departmentMapping';
import { getDepartmentByCode, getDepartmentByColor } from '../../../../../config/departments.js';

/* ─── Loading with dynamic color ─── */
const LoadingState = ({ color }) => (
    <div className="flex-1 flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
            <div
                className="w-8 h-8 border-[3px] rounded-full animate-spin"
                style={{
                    borderColor: `${color}20`,
                    borderTopColor: color,
                }}
            />
            <p className="text-xs font-medium text-slate-400 tracking-wide">Chargement…</p>
        </div>
    </div>
);

/* ─── Error with dynamic color ─── */
const ErrorState = ({ error, departmentCode, onRetry, color }) => (
    <div className="flex-1 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
                <p className="text-sm font-semibold text-slate-700">Erreur de chargement</p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{error}</p>
                {departmentCode && (
                    <p className="text-xs text-slate-300 mt-1">Dept: {departmentCode}</p>
                )}
            </div>
            <button
                onClick={onRetry}
                className="flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-semibold rounded-lg transition-colors hover:brightness-110"
                style={{ backgroundColor: color }}
            >
                <RefreshCw className="w-3 h-3" />
                Réessayer
            </button>
        </div>
    </div>
);

/* ─── Empty with dynamic color ─── */
const EmptyState = ({ searchTerm, onClearSearch, departmentName, color }) => (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
            <PackageSearch className="w-5 h-5 text-slate-300" />
        </div>
        <div>
            <p className="text-sm font-semibold text-slate-600">Aucun résultat</p>
            <p className="text-xs text-slate-400 mt-1">
                {searchTerm
                    ? `Aucun composant pour "${searchTerm}"`
                    : `Aucun composant disponible pour ${departmentName}`}
            </p>
        </div>
        {searchTerm && (
            <button
                onClick={onClearSearch}
                className="flex items-center gap-1 text-xs font-medium transition-colors hover:brightness-110"
                style={{ color }}
            >
                <X className="w-3 h-3" />
                Effacer la recherche
            </button>
        )}
    </div>
);

/* ─── Category pill with dynamic color ─── */
const CategoryButton = ({ category, isActive, count, onClick, color }) => {
    const Icon = category.icon;
    return (
        <button
            onClick={() => onClick(category.id)}
            title={`${category.label} (${count})`}
            className={`
                inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold
                transition-all duration-150 border
            `}
            style={isActive ? {
                backgroundColor: color,
                borderColor: color,
                boxShadow: `0 1px 2px 0 ${color}40`,
                color: 'white',
            } : {
                backgroundColor: 'white',
                borderColor: '#e2e8f0',
                color: color,
            }}
            onMouseEnter={(e) => {
                if (!isActive) {
                    e.currentTarget.style.borderColor = color;
                    e.currentTarget.style.color = color;
                }
            }}
            onMouseLeave={(e) => {
                if (!isActive) {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.color = '#64748b';
                }
            }}
        >
            <Icon className="w-3 h-3 flex-shrink-0" />
            <span>{category.label}</span>
            {count > 0 && (
                <span
                    className={`
                        px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none
                        ${isActive ? 'bg-white/30 text-white' : 'bg-slate-100 text-slate-500'}
                    `}
                >
                    {count}
                </span>
            )}
        </button>
    );
};

/* ─── Component card with dynamic color ─── */
const ComponentButton = ({ component, onClick, color }) => {
    const Icon = iconMap[component.icon] || iconMap.FileText;

    return (
        <button
            onClick={onClick}
            title={`Ajouter ${component.name}`}
            className="
                group w-full text-left
                flex items-start gap-3 p-3
                bg-white border border-slate-100
                rounded-xl shadow-sm hover:shadow-md
                transition-all duration-150 cursor-pointer
            "
            style={{
                '--hover-bg': `${color}08`,
                '--hover-border': `${color}60`,
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${color}08`;
                e.currentTarget.style.borderColor = `${color}60`;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.borderColor = '#f1f5f9';
            }}
        >
            <div
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${color}10` }}
            >
                <Icon className="w-4 h-4" style={{ color }} />
            </div>

            <div className="flex-1 min-w-0">
                <p
                    className="text-sm font-semibold text-slate-700 truncate group-hover:text-[--hover-text]"
                    style={{ '--hover-text': color }}
                >
                    {component.name}
                </p>
                {component.description && (
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
                        {component.description}
                    </p>
                )}
                {(component.fieldKey || component.config?.format) && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                        {component.fieldKey && (
                            <span className="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-mono rounded">
                                {component.fieldKey}
                            </span>
                        )}
                        {component.config?.format && (
                            <span className="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded">
                                {component.config.format === 'currency' ? 'FCFA' : component.config.format}
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div
                className="
                    flex-shrink-0 w-5 h-5 rounded-full border
                    flex items-center justify-center opacity-0 group-hover:opacity-100
                    transition-all duration-150
                "
                style={{
                    borderColor: `${color}70`,
                    backgroundColor: 'white',
                }}
            >
                <Plus className="w-3 h-3" style={{ color }} />
            </div>
        </button>
    );
};

/* ─── Main export ─── */
export const BuilderToolbarView = ({
                                       departmentCode,
                                       departmentName,
                                       availableComponents,
                                       activeCategory,
                                       searchTerm,
                                       loading,
                                       error,
                                       filteredComponents,
                                       categoryCounts,
                                       onCategoryChange,
                                       onSearchChange,
                                       onClearSearch,
                                       onAddComponent,
                                       onRetry,
                                       // color n'est plus une prop → on la déduit
                                   }) => {
    // ── Récupération dynamique de la couleur ──
    const dept = getDepartmentByCode(departmentCode);
    const color = dept?.color || '#6b7280'; // gris neutre en fallback

    const displayName = departmentName || getDepartmentDisplayName(departmentCode) || departmentCode;

    return (
        <div
            className="flex flex-col h-full"
            style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}
        >
            {/* Header */}
            <div className="flex-shrink-0 px-1 pb-3">
                <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                        Disponibles
                    </p>
                    {!loading && !error && (
                        <span
                            className="px-2 py-0.5 text-xs font-bold rounded-full border"
                            style={{
                                backgroundColor: `${color}12`,
                                color,
                                borderColor: `${color}30`,
                            }}
                        >
                            {availableComponents.length}
                        </span>
                    )}
                </div>
            </div>

            {/* Search */}
            <div className="flex-shrink-0 mb-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 pointer-events-none" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Rechercher…"
                        className="
                            w-full h-9 pl-9 pr-8 text-sm text-slate-700 placeholder:text-slate-300
                            bg-white border border-slate-200 rounded-lg shadow-sm
                            focus:outline-none focus:ring-2 transition-all duration-150
                        "
                        style={{ '--tw-ring-color': `${color}60` }}
                    />
                    {searchTerm && (
                        <button
                            onClick={onClearSearch}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-300 hover:text-slate-500"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Categories */}
            {!loading && !error && (
                <div className="flex-shrink-0 mb-3">
                    <div className="flex flex-wrap gap-1.5">
                        {categories.map((cat) => (
                            <CategoryButton
                                key={cat.id}
                                category={cat}
                                isActive={activeCategory === cat.id}
                                count={categoryCounts[cat.id === 'all' ? 'total' : cat.id] || 0}
                                onClick={onCategoryChange}
                                color={color}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Liste scrollable */}
            <div className="flex-1 overflow-y-auto min-h-0">
                {loading ? (
                    <LoadingState color={color} />
                ) : error ? (
                    <ErrorState
                        error={error}
                        departmentCode={departmentCode}
                        onRetry={onRetry}
                        color={color}
                    />
                ) : filteredComponents.length === 0 ? (
                    <EmptyState
                        searchTerm={searchTerm}
                        onClearSearch={onClearSearch}
                        departmentName={displayName}
                        color={color}
                    />
                ) : (
                    <div className="space-y-1.5 pb-2">
                        {filteredComponents.map((component) => (
                            <ComponentButton
                                key={component.id}
                                component={component}
                                onClick={() => onAddComponent(component)}
                                color={color}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            {!loading && !error && filteredComponents.length > 0 && (
                <div className="flex-shrink-0 pt-3 border-t border-slate-100 mt-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>
                            <span className="font-semibold text-slate-600">{filteredComponents.length}</span>
                            {' '}/ {availableComponents.length}
                            {activeCategory !== 'all' && (
                                <span className="ml-1 text-slate-300">
                                    · {categories.find(c => c.id === activeCategory)?.label}
                                </span>
                            )}
                        </span>
                        <span style={{ color: `${color}90` }}>
                            Cliquez pour ajouter
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};