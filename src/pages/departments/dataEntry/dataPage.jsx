import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Plus, Calendar, Search, Download, Edit, Trash2,
    AlertCircle, RefreshCw, ChevronDown, X,
} from 'lucide-react';
import { schemaService } from '../../../services/schemaService.js';
import { dataService } from '../../../services/dataService.js';
import { useToast, ToastContainer } from '../../../components/ui/Toast';
import DataEntryModal from './DataEntryModal';
import Table from '../../../components/ui/Table';
import { getDepartmentDisplayName } from '../reports/builder/utils/departmentMapping.js';
import { resolveDepartmentCode, validateDepartmentCode } from '../reports/builder/utils/departmentUtils.js';
import {
    formatCellValue, formatDateValue, formatMoneyFCFA,
    formatNumberValue,
} from "../reports/builder/utils/tableFormaterUtils.js";
import {getDepartmentById} from "../../../config/departments.js";

export default function Data() {
    const { user }    = useAuth();
    const { deptName } = useParams();
    const navigate    = useNavigate();
    const { toasts, addToast, removeToast } = useToast();

    const [dataList,     setDataList]     = useState([]);
    const [loading,      setLoading]      = useState(true);
    const [schemaLoading,setSchemaLoading]= useState(true);
    const [showModal,    setShowModal]    = useState(false);
    const [editingData,  setEditingData]  = useState(null);
    const [schema,       setSchema]       = useState(null);
    const [error,        setError]        = useState(null);

    // Filtres
    const [search,    setSearch]    = useState('');
    const [dateFrom,  setDateFrom]  = useState(''); // YYYY-MM-DD
    const [dateTo,    setDateTo]    = useState(''); // YYYY-MM-DD ou vide = jour unique
    const [calOpen,   setCalOpen]   = useState(false);
    const [hoverDay,  setHoverDay]  = useState(null);
    const [calYear,   setCalYear]   = useState(new Date().getFullYear());
    const [calMonth,  setCalMonth]  = useState(new Date().getMonth());
    const [sortField, setSortField] = useState('date');
    const [sortDir,   setSortDir]   = useState('desc');
    const departmentId = user?.department?.id ?? user?.department_id;

    // Helpers calendrier
    const toYMD = (d) => d.toISOString().split('T')[0];
    const fromYMD = (s) => { const [y,m,d] = s.split('-').map(Number); return new Date(y, m-1, d); };
    const daysInMonth = (y, m) => new Date(y, m+1, 0).getDate();
    const firstDayOfMonth = (y, m) => new Date(y, m, 1).getDay(); // 0=dim

    const calLabel = () => {
        if (!dateFrom) return 'Date';
        if (!dateTo || dateTo === dateFrom) {
            return fromYMD(dateFrom).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
        }
        const f = fromYMD(dateFrom).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        const t = fromYMD(dateTo).toLocaleDateString('fr-FR',   { day: 'numeric', month: 'short', year: 'numeric' });
        return `${f} → ${t}`;
    };

    const handleCalDay = (ymd) => {
        if (!dateFrom || (dateFrom && dateTo)) {
            // Début d'une nouvelle sélection
            setDateFrom(ymd); setDateTo('');
        } else {
            // Fin de sélection
            if (ymd < dateFrom) { setDateTo(dateFrom); setDateFrom(ymd); }
            else                { setDateTo(ymd); }
            setCalOpen(false); setHoverDay(null);
        }
    };

    const isDayInRange = (ymd) => {
        if (!dateFrom) return false;
        const end = dateTo || hoverDay;
        if (!end) return ymd === dateFrom;
        const [a, b] = dateFrom < end ? [dateFrom, end] : [end, dateFrom];
        return ymd >= a && ymd <= b;
    };
    const isDayStart = (ymd) => ymd === dateFrom;
    const isDayEnd   = (ymd) => {
        const end = dateTo || hoverDay;
        return end && ymd === (dateFrom < end ? end : dateFrom) && ymd !== dateFrom;
    };

    const prevMonth = () => {
        if (calMonth === 0) { setCalMonth(11); setCalYear(y => y-1); }
        else setCalMonth(m => m-1);
    };
    const nextMonth = () => {
        if (calMonth === 11) { setCalMonth(0); setCalYear(y => y+1); }
        else setCalMonth(m => m+1);
    };

    const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
    const DAYS_FR   = ['Lu','Ma','Me','Je','Ve','Sa','Di'];

    const deptCode            = resolveDepartmentCode(deptName, user);
    const departmentDisplayName = getDepartmentDisplayName(deptCode) || deptName || 'Département';

    /* ── Init ── */
    useEffect(() => {
        const init = async () => {
            if (!deptCode) { setError('Impossible de déterminer le département'); setSchemaLoading(false); return; }
            const isValid = await validateDepartmentCode(deptCode);
            if (!isValid)  { setError(`Département "${deptCode}" non trouvé`);   setSchemaLoading(false); return; }
            await loadSchema();
        };
        init();
    }, [deptCode]);

    const loadSchema = async () => {
        setSchemaLoading(true); setError(null);
        try {
            const s = await schemaService.getDepartmentSchema(deptCode);
            if (!s) throw new Error('Schéma non trouvé');
            setSchema(s);
            await loadData();
        } catch (err) {
            setError(err.message || 'Erreur schéma');
            addToast('Erreur lors du chargement du schéma', 'error', 3000);
        } finally { setSchemaLoading(false); }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await dataService.getAll(deptCode);
            setDataList(Array.isArray(data) ? data : data?.data ?? []);
        } catch { addToast('Erreur lors du chargement des données', 'error', 3000); }
        finally  { setLoading(false); }
    };

    /* ── CRUD ── */
    const handleCreate = () => { setEditingData(null); setShowModal(true); };
    const handleEdit   = (row) => { setEditingData(row); setShowModal(true); };

    const handleDelete = async (id) => {
        if (!confirm('Supprimer cette saisie ?')) return;
        try {
            await dataService.delete(deptCode, id);
            addToast('Saisie supprimée', 'success', 2000);
            loadData();
        } catch { addToast('Erreur suppression', 'error', 3000); }
    };

    const handleSaveSuccess = () => { setShowModal(false); loadData(); };

    const handleExport = async () => {
        try {
            const blob = await dataService.exportData(deptCode, {
                dateFrom: dateFrom || undefined,
                dateTo:   dateTo   || undefined,
            });
            const url = window.URL.createObjectURL(blob);
            const a   = document.createElement('a');
            a.href = url;
            a.setAttribute('download', `${deptCode}_${Date.now()}.csv`);
            document.body.appendChild(a); a.click(); a.remove();
            addToast('Export réussi', 'success', 2000);
        } catch { addToast("Erreur export", 'error', 3000); }
    };

    /* ── Données filtrées + triées ── */
    const filteredData = useMemo(() => {
        let rows = [...dataList];
        if (search.trim()) {
            const q = search.toLowerCase();
            rows = rows.filter(item =>
                Object.values(item).some(v => String(v).toLowerCase().includes(q))
            );
        }
        // Si jour unique (pas de dateTo), filtre exact sur dateFrom
        if (dateFrom && !dateTo) {
            rows = rows.filter(item => (item.date || '').slice(0, 10) === dateFrom);
        } else {
            if (dateFrom) rows = rows.filter(item => (item.date || '').slice(0, 10) >= dateFrom);
            if (dateTo)   rows = rows.filter(item => (item.date || '').slice(0, 10) <= dateTo);
        }
        rows.sort((a, b) => {
            const va = a[sortField] ?? '';
            const vb = b[sortField] ?? '';
            const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true });
            return sortDir === 'asc' ? cmp : -cmp;
        });
        return rows;
    }, [dataList, search, dateFrom, dateTo, sortField, sortDir]);

    const hasFilters = search || dateFrom;
    const clearFilters = () => { setSearch(''); setDateFrom(''); setDateTo(''); setHoverDay(null); };

    const department = getDepartmentById(Number(departmentId));

    /* ── Colonnes ── */
    const columns = schema ? [
        {
            key: 'date', header: 'Date', sortable: true,
            render: (value) => (
                <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                    <span className="font-medium text-gray-900 text-sm">{formatDateValue(value)}</span>
                </div>
            ),
        },
        ...schema.fields
            .filter(f => f.type === 'number' && f.key !== 'date')
            .slice(0, 4)
            .map(field => ({
                key: field.key, header: field.label, sortable: true,
                render: (value) => (
                    <span className="text-gray-700 font-medium text-sm tabular-nums">
                        {formatCellValue(value, field.key, field.type)}
                    </span>
                ),
            })),
        {
            key: 'actions', header: '', sortable: false,
            render: (_, row) => (
                <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => handleEdit(row)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(row.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            ),
        },
    ] : [];

    /* ── États ── */
    if (error) return (
        <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center p-6">
            <div className="bg-white border border-red-100 rounded-2xl p-8 max-w-lg w-full">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-red-50 rounded-xl"><AlertCircle className="w-5 h-5 text-red-400" /></div>
                    <h3 className="text-base font-semibold text-gray-900">Erreur de chargement</h3>
                </div>
                <p className="text-sm text-red-700 bg-red-50 rounded-xl p-3 mb-5">{error}</p>
                <div className="flex gap-3">
                    <button onClick={() => { setError(null); setSchemaLoading(true); loadSchema(); }}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5  text-white rounded-xl text-sm font-medium "
                            style={{
                                backgroundColor: department.color,
                                borderBottomColor: department.color,
                            }}
                    >
                        <RefreshCw className="w-3.5 h-3.5" /> Réessayer
                    </button>
                    <button onClick={() => navigate(-1)}
                            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50">
                        Retour
                    </button>
                </div>
            </div>
        </div>
    );

    if (schemaLoading) return (
        <div className="min-h-screen bg-[#f8f9fc] flex flex-col items-center justify-center gap-3">
            <div
                className="w-10 h-10 rounded-full border-[3px] border-blue-100 animate-spin"
                style={{ borderTopColor: department?.color || "#3b82f6" }}
            />
            <p className="text-sm text-gray-400" style={{ color: department?.color || "#6b7280" }}>
                Chargement…
            </p>
        </div>
    );

    if (!schema) return (
        <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center p-6">
            <div className="text-center max-w-sm">
                <div className="p-4 bg-red-50 rounded-2xl inline-block mb-4">
                    <AlertCircle className="w-10 h-10 text-red-300" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">Schéma introuvable</h3>
                <p className="text-xs text-gray-400 mb-5">Code : {deptCode}</p>
                <button onClick={() => { setError(null); setSchemaLoading(true); loadSchema(); }}
                        className="inline-flex items-center gap-2 px-5 py-2.5  text-white rounded-xl text-sm font-medium hover:bg-cyan-700

                        " style={{ color: department.color }}>
                    <RefreshCw className="w-3.5 h-3.5" /> Réessayer
                </button>
            </div>
        </div>
    );

    /* ── Render principal ── */
    return (
        <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest mb-1"
                       style={{ color: department.color }}
                    >
                        {schema.icon} Saisie de données
                    </p>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                        {schema.title || departmentDisplayName}
                    </h1>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {filteredData.length} résultat{filteredData.length > 1 ? 's' : ''}
                        {hasFilters ? ' · filtre actif' : ` · ${dataList.length} saisie${dataList.length > 1 ? 's' : ''} au total`}
                    </p>
                </div>
                <button onClick={handleCreate}
                        className="inline-flex items-center gap-2 px-5 py-2.5  text-white rounded-xl text-sm font-semibold  transition-colors shadow-sm flex-shrink-0"
                        style={{
                            backgroundColor: department.color,
                            borderBottomColor: department.color,
                        }}
                >
                    <Plus className="w-4 h-4" /> Nouvelle saisie
                </button>
            </div>

            {/* ── Barre de contrôle compacte ── */}
            <div className="bg-white rounded-2xl border border-gray-100 p-3 mb-4 flex flex-wrap items-center gap-2">

                {/* Recherche — compacte */}
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300 w-3.5 h-3.5" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Rechercher…"
                        className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2  focus:border-transparent outline-none w-40 transition-all focus:w-56"
                    />
                </div>

                {/* Séparateur */}
                <div className="w-px h-5 bg-gray-200" />

                {/* Calendrier custom — jour unique ou range */}
                <div className="relative">
                    <button
                        onClick={() => setCalOpen(o => !o)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg border transition-colors whitespace-nowrap ${
                            dateFrom
                                ? 'border-cyan-300 bg-cyan-50 text-cyan-700 font-semibold'
                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`

                    }>
                        <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                        {calLabel()}
                        {dateFrom && (
                            <span onClick={e => { e.stopPropagation(); clearFilters(); }}
                                  className="ml-0.5 hover:text-red-500 transition-colors">
                                <X className="w-3 h-3" />
                            </span>
                        )}
                    </button>

                    {calOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => { setCalOpen(false); setHoverDay(null); if (dateFrom && !dateTo) { setDateTo(dateFrom); } }} />
                            <div className="absolute top-full left-0 mt-1.5 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 p-3 w-64 select-none">

                                {/* Nav mois */}
                                <div className="flex items-center justify-between mb-3">
                                    <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
                                        <ChevronDown className="w-3.5 h-3.5 rotate-90" />
                                    </button>
                                    <span className="text-xs font-semibold text-gray-700">
                                        {MONTHS_FR[calMonth]} {calYear}
                                    </span>
                                    <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
                                        <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                                    </button>
                                </div>

                                {/* Jours de la semaine */}
                                <div className="grid grid-cols-7 mb-1">
                                    {DAYS_FR.map(d => (
                                        <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-1">{d}</div>
                                    ))}
                                </div>

                                {/* Cases du mois */}
                                <div className="grid grid-cols-7">
                                    {/* Décalage premier jour (lundi=0) */}
                                    {Array.from({ length: (firstDayOfMonth(calYear, calMonth) + 6) % 7 }).map((_, i) => (
                                        <div key={`e${i}`} />
                                    ))}
                                    {Array.from({ length: daysInMonth(calYear, calMonth) }).map((_, i) => {
                                        const day = i + 1;
                                        const ymd = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                                        const inRange  = isDayInRange(ymd);
                                        const isStart  = isDayStart(ymd);
                                        const isEnd    = isDayEnd(ymd);
                                        const isToday  = ymd === toYMD(new Date());
                                        return (
                                            <button
                                                key={ymd}
                                                onClick={() => handleCalDay(ymd)}
                                                onMouseEnter={() => { if (dateFrom && !dateTo) setHoverDay(ymd); }}
                                                onMouseLeave={() => setHoverDay(null)}
                                                className={`relative h-7 w-full text-[11px] font-medium transition-colors
                                                    ${inRange && !isStart && !isEnd ? 'bg-cyan-50 text-cyan-700 rounded-none' : ''}
                                                    ${isStart ? 'bg-cyan-500 text-white rounded-l-lg' : ''}
                                                    ${isEnd   ? 'bg-cyan-500 text-white rounded-r-lg' : ''}
                                                    ${!inRange ? 'hover:bg-gray-100 rounded-lg text-gray-700' : ''}
                                                    ${isToday && !inRange ? 'font-bold text-cyan-600' : ''}
                                                `}>
                                                {day}
                                                {isToday && !isStart && !isEnd && (
                                                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyan-400" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Footer hint */}
                                <div className="mt-3 pt-2.5 border-t border-gray-50 flex items-center justify-between">
                                    <p className="text-[10px] text-gray-400">
                                        {!dateFrom ? 'Cliquez pour sélectionner' : !dateTo ? 'Cliquez pour définir la fin' : ''}
                                    </p>
                                    {dateFrom && (
                                        <button onClick={() => { setDateFrom(''); setDateTo(''); setHoverDay(null); }}
                                                className="text-[10px] text-red-400 hover:text-red-600 font-medium">
                                            Effacer
                                        </button>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Séparateur */}
                <div className="w-px h-5 bg-gray-200" />

                {/* Tri */}
                <div className="flex items-center gap-1.5">
                    <select
                        value={sortField}
                        onChange={e => setSortField(e.target.value)}
                        className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-gray-600 bg-white">
                        <option value="date">Date</option>
                        {schema.fields.filter(f => f.type === 'number').slice(0, 4).map(f => (
                            <option key={f.key} value={f.key}>{f.label}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
                        className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-500"
                        title={sortDir === 'asc' ? 'Croissant' : 'Décroissant'}>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${sortDir === 'asc' ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Clear filtres */}
                {hasFilters && (
                    <button onClick={clearFilters}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-500 hover:text-red-500 border border-gray-200 rounded-lg hover:border-red-200 hover:bg-red-50 transition-colors">
                        <X className="w-3 h-3" /> Réinitialiser
                    </button>
                )}

                {/* Export */}
                <button onClick={handleExport}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 font-medium transition-colors text-gray-600">
                    <Download className="w-3.5 h-3.5" /> Exporter
                </button>
            </div>

            {/* ── Table ── */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <div className="w-9 h-9 rounded-full border-[3px] border-cyan-100 border-t-cyan-500 animate-spin" />
                        <p className="text-sm text-gray-400">Chargement…</p>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <Calendar className="w-6 h-6 text-gray-200" />
                        </div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">
                            {hasFilters ? 'Aucun résultat' : 'Aucune saisie'}
                        </p>
                        <p className="text-xs text-gray-400 mb-5">
                            {hasFilters ? 'Essayez de modifier les filtres' : 'Commencez par créer une saisie'}
                        </p>
                        {!hasFilters && (
                            <button onClick={handleCreate}
                                    className="inline-flex items-center gap-2 px-5 py-2.5  text-white rounded-xl text-sm font-semibold "
                                    style={{
                                        backgroundColor: department.color,
                                        borderBottomColor: department.color,
                                    }}
                            >
                                <Plus className="w-4 h-4" /> Nouvelle saisie
                            </button>
                        )}
                        {hasFilters && (
                            <button onClick={clearFilters}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50">
                                <X className="w-3.5 h-3.5" /> Effacer les filtres
                            </button>
                        )}
                    </div>
                ) : (
                    <Table columns={columns} data={filteredData} sortable hoverable emptyMessage="Aucune donnée" />
                )}
            </div>

            {/* Modal */}
            {showModal && schema && (
                <DataEntryModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onSuccess={handleSaveSuccess}
                    editingData={editingData}
                    schema={schema}
                    deptCode={deptCode}
                    departmentName={departmentDisplayName}
                />
            )}

            <style>{`
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-up { animation: slide-up 0.3s ease-out forwards; opacity: 0; }
                .tabular-nums     { font-variant-numeric: tabular-nums; }
            `}</style>
        </div>
    );
}