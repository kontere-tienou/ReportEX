// BuilderToolbarView.jsx
import React from 'react';
import { Search, X, Plus, AlertTriangle, RefreshCw, PackageSearch } from 'lucide-react';
import { iconMap } from '../../constants/iconMapping.js';
import { categories } from '../../constants/categories';
import { getDepartmentDisplayName } from '../utils/departmentMapping';

/* ─── Loading ─── */
const LoadingState = () => (
    <div className="flex-1 flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-[3px] border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-xs font-medium text-slate-400 tracking-wide">Chargement…</p>
        </div>
    </div>
);

/* ─── Error ─── */
const ErrorState = ({ error, departmentCode }) => (
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
                onClick={() => window.location.reload()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
                <RefreshCw className="w-3 h-3" />
                Réessayer
            </button>
        </div>
    </div>
);

/* ─── Empty ─── */
const EmptyState = ({ searchTerm, onClearSearch, departmentName }) => (
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
                className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
            >
                <X className="w-3 h-3" />
                Effacer la recherche
            </button>
        )}
    </div>
);

/* ─── Category pill ─── */
const CategoryButton = ({ category, isActive, count, onClick }) => {
    const Icon = category.icon;
    return (
        <button
            onClick={() => onClick(category.id)}
            title={`${category.label} (${count})`}
            className={`
                inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold
                transition-all duration-150 border
                ${isActive
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200'
                : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'}
            `}
        >
            <Icon className="w-3 h-3 flex-shrink-0" />
            <span>{category.label}</span>
            {count > 0 && (
                <span className={`
                    px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none
                    ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}
                `}>
                    {count}
                </span>
            )}
        </button>
    );
};

/* ─── Component card ─── */
const ComponentButton = ({ component, onClick }) => {
    const Icon = iconMap[component.icon] || iconMap.FileText;

    return (
        <button
            onClick={onClick}
            title={`Ajouter ${component.name}`}
            className="
                group w-full text-left
                flex items-start gap-3 p-3
                bg-white hover:bg-indigo-50/60
                border border-slate-100 hover:border-indigo-200
                rounded-xl shadow-sm hover:shadow-md
                transition-all duration-150 cursor-pointer
            "
        >
            {/* Icon */}
            <div className="
                flex-shrink-0 w-8 h-8 rounded-lg
                bg-slate-50 group-hover:bg-indigo-100
                flex items-center justify-center
                transition-colors duration-150
            ">
                <Icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-700 group-hover:text-indigo-700 truncate transition-colors">
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
                            <span className="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-400 text-[10px] font-mono rounded">
                                {component.fieldKey}
                            </span>
                        )}
                        {component.config?.format && (
                            <span className="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-400 text-[10px] rounded">
                                {component.config.format === 'currency' ? 'FCFA' : component.config.format}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Add indicator */}
            <div className="
                flex-shrink-0 w-5 h-5 rounded-full
                border border-slate-200 group-hover:border-indigo-400 group-hover:bg-indigo-400
                flex items-center justify-center
                transition-all duration-150 opacity-0 group-hover:opacity-100
            ">
                <Plus className="w-3 h-3 text-slate-300 group-hover:text-white transition-colors" />
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
                                   }) => {
    const displayName = departmentName || getDepartmentDisplayName(departmentCode) || departmentCode;

    return (
        <div
            className="flex flex-col h-full"
            style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}
        >
            {/* ── Header ── */}
            <div className="flex-shrink-0 px-1 pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                            Disponibles
                        </p>
                    </div>
                    {!loading && !error && (
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full border border-indigo-100">
                            {availableComponents.length}
                        </span>
                    )}
                </div>
            </div>

            {/* ── Search ── */}
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
                            focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400
                            transition-all duration-150
                        "
                    />
                    {searchTerm && (
                        <button
                            onClick={onClearSearch}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-300 hover:text-slate-500 transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* ── Categories ── */}
            {!loading && !error && (
                <div className="flex-shrink-0 mb-3">
                    <div className="flex flex-wrap gap-1">
                        {categories.map((cat) => (
                            <CategoryButton
                                key={cat.id}
                                category={cat}
                                isActive={activeCategory === cat.id}
                                count={categoryCounts[cat.id === 'all' ? 'total' : cat.id] || 0}
                                onClick={onCategoryChange}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* ── Scrollable list ── */}
            <div className="flex-1 overflow-y-auto min-h-0">
                {loading ? (
                    <LoadingState />
                ) : error ? (
                    <ErrorState error={error} departmentCode={departmentCode} />
                ) : filteredComponents.length === 0 ? (
                    <EmptyState
                        searchTerm={searchTerm}
                        onClearSearch={onClearSearch}
                        departmentName={displayName}
                    />
                ) : (
                    <div className="space-y-1.5 pb-2">
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

            {/* ── Footer stat ── */}
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
                        <span className="text-slate-300">Cliquez pour ajouter</span>
                    </div>
                </div>
            )}
        </div>
    );
};