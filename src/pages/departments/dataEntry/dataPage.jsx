import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Plus, Calendar, Search, Download, Edit, Trash2,
    TrendingUp, AlertCircle, RefreshCw, Filter,
    ArrowUpRight, FileText, Activity, Clock,
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
    formatNumberValue, isDateValue
} from "../reports/builder/utils/tableFormaterUtils.js";

export default function Data() {
    const { user } = useAuth();
    const { deptName } = useParams();
    const navigate = useNavigate();
    const { toasts, addToast, removeToast } = useToast();

    const [dataList, setDataList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [schemaLoading, setSchemaLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingData, setEditingData] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [schema, setSchema] = useState(null);
    const [error, setError] = useState(null);

    const deptCode = resolveDepartmentCode(deptName, user);
    const departmentDisplayName = getDepartmentDisplayName(deptCode) || deptName || 'Département';

    /* ── Stats ─────────────────────────────────────────────────────── */
    const calculateStats = (data) => {
        const today = new Date().toISOString().split('T')[0];
        const now = new Date();
        const startOfWeek = new Date(now);
        const diff = now.getDay() === 0 ? 6 : now.getDay() - 1;
        startOfWeek.setDate(now.getDate() - diff);
        startOfWeek.setHours(0, 0, 0, 0);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        let total = 0, todayCount = 0, thisWeekCount = 0, thisMonthCount = 0;
        data.forEach(item => {
            total++;
            const d = new Date(item.date);
            if (item.date === today) todayCount++;
            if (d >= startOfWeek) thisWeekCount++;
            if (d >= startOfMonth) thisMonthCount++;
        });
        return { total, today: todayCount, thisWeek: thisWeekCount, thisMonth: thisMonthCount };
    };

    const calculateAmounts = (data) => {
        const today = new Date().toISOString().split('T')[0];
        const now = new Date();
        const startOfWeek = new Date(now);
        const diff = now.getDay() === 0 ? 6 : now.getDay() - 1;
        startOfWeek.setDate(now.getDate() - diff);
        startOfWeek.setHours(0, 0, 0, 0);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        let totalAmount = 0, todayAmount = 0, thisWeekAmount = 0, thisMonthAmount = 0;
        data.forEach(item => {
            Object.entries(item).forEach(([key, value]) => {
                if (typeof value === 'number' &&
                    (key.includes('caisse') || key.includes('montant') || key.includes('total') ||
                        key.includes('ca') || key.includes('prix') || key.includes('cout'))) {
                    totalAmount += value;
                    const d = new Date(item.date);
                    if (item.date === today) todayAmount += value;
                    if (d >= startOfWeek) thisWeekAmount += value;
                    if (d >= startOfMonth) thisMonthAmount += value;
                }
            });
        });
        return { totalAmount, todayAmount, thisWeekAmount, thisMonthAmount };
    };

    const stats   = useMemo(() => calculateStats(dataList), [dataList]);
    const amounts = useMemo(() => calculateAmounts(dataList), [dataList]);

    /* ── Init ──────────────────────────────────────────────────────── */
    useEffect(() => {
        const init = async () => {
            if (!deptCode) { setError('Impossible de déterminer le département'); setSchemaLoading(false); return; }
            const isValid = await validateDepartmentCode(deptCode);
            if (!isValid) { setError(`Département "${deptCode}" non trouvé`); setSchemaLoading(false); return; }
            await loadSchema();
        };
        init();
    }, [deptCode]);

    const loadSchema = async () => {
        setSchemaLoading(true);
        setError(null);
        try {
            const deptSchema = await schemaService.getDepartmentSchema(deptCode);
            if (!deptSchema) throw new Error('Schéma non trouvé');
            setSchema(deptSchema);
            await loadData();
        } catch (err) {
            setError(err.message || 'Erreur lors du chargement du schéma');
            addToast('Erreur lors du chargement du schéma', 'error', 3000);
        } finally {
            setSchemaLoading(false);
        }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await dataService.getAll(deptCode);
            setDataList(data);
        } catch (err) {
            addToast('Erreur lors du chargement des données', 'error', 3000);
        } finally {
            setLoading(false);
        }
    };

    /* ── CRUD ──────────────────────────────────────────────────────── */
    const handleCreate = () => { setEditingData(null); setShowModal(true); };
    const handleEdit   = (data) => { setEditingData(data); setShowModal(true); };

    const handleDelete = async (id) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette saisie ?')) return;
        try {
            await dataService.delete(deptCode, id);
            addToast('Saisie supprimée avec succès', 'success', 2000);
            loadData();
        } catch {
            addToast('Erreur lors de la suppression', 'error', 3000);
        }
    };

    // Après une sauvegarde réussie : recharge ET le dashboard se mettra à jour
    // automatiquement grâce à la Page Visibility API dès que l'utilisateur y reviendra
    const handleSaveSuccess = () => {
        setShowModal(false);
        loadData();
    };

    const handleExport = async () => {
        try {
            const blob = await dataService.exportData(deptCode, { dateFrom: dateFilter || undefined });
            const url  = window.URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href = url;
            a.setAttribute('download', `donnees_${deptCode}_${Date.now()}.csv`);
            document.body.appendChild(a);
            a.click();
            a.remove();
            addToast('Export réussi', 'success', 2000);
        } catch {
            addToast("Erreur lors de l'export", 'error', 3000);
        }
    };

    /* ── États loading / error / no schema ────────────────────────── */
    if (error) return (
        <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center p-6">
            <div className="bg-white border border-red-100 rounded-2xl shadow-sm p-8 max-w-lg w-full">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-red-50 rounded-xl"><AlertCircle className="w-6 h-6 text-red-400" /></div>
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">Erreur de chargement</h3>
                        <p className="text-xs text-gray-400">Impossible de charger les données</p>
                    </div>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-5">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => { setError(null); setSchemaLoading(true); loadSchema(); }}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-600 text-white rounded-xl text-sm font-medium hover:bg-cyan-700 transition-colors">
                        <RefreshCw className="w-3.5 h-3.5" /> Réessayer
                    </button>
                    <button onClick={() => navigate(-1)}
                            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                        Retour
                    </button>
                </div>
            </div>
        </div>
    );

    if (schemaLoading) return (
        <div className="min-h-screen bg-[#f8f9fc] flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full border-[3px] border-cyan-100 border-t-cyan-500 animate-spin" />
            <p className="text-sm text-gray-400">Chargement du formulaire…</p>
        </div>
    );

    if (!schema) return (
        <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center p-6">
            <div className="text-center max-w-sm">
                <div className="p-4 bg-red-50 rounded-2xl inline-block mb-4"><AlertCircle className="w-12 h-12 text-red-300" /></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Schéma introuvable</h3>
                <p className="text-sm text-gray-400 mb-5">Code département: {deptCode}</p>
                <button onClick={() => { setError(null); setSchemaLoading(true); loadSchema(); }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-600 text-white rounded-xl text-sm font-medium hover:bg-cyan-700 transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" /> Réessayer
                </button>
            </div>
        </div>
    );

    /* ── Filtres & colonnes ────────────────────────────────────────── */
    const filteredData = dataList.filter(item => {
        const matchSearch = searchTerm === '' ||
            Object.values(item).some(v => String(v).toLowerCase().includes(searchTerm.toLowerCase()));
        const matchDate = dateFilter === '' || item.date === dateFilter;
        return matchSearch && matchDate;
    });

    const columns = [
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
            .slice(0, 3)
            .map(field => ({
                key: field.key, header: field.label, sortable: true,
                render: (value) => (
                    <span className="text-gray-800 font-medium text-sm tabular-nums">
                        {formatCellValue(value, field.key, field.type)}
                    </span>
                ),
            })),
        {
            key: 'actions', header: '', sortable: false,
            render: (_, row) => (
                <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => handleEdit(row)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Modifier">
                        <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(row.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            ),
        },
    ];

    /* ── Render ────────────────────────────────────────────────────── */
    return (
        <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <p className="text-[10px] font-semibold text-cyan-500 uppercase tracking-widest mb-1.5">
                        {schema.icon} Saisie de données
                    </p>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight leading-tight">
                        {schema.title || departmentDisplayName}
                    </h1>
                    <p className="text-xs text-gray-400 mt-1">
                        {schema.description || `Gérez vos saisies quotidiennes · ${departmentDisplayName}`}
                    </p>
                </div>
                <button onClick={handleCreate}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-600 text-white rounded-xl text-sm font-semibold hover:bg-cyan-700 transition-colors shadow-sm flex-shrink-0">
                    <Plus className="w-4 h-4" /> Nouvelle saisie
                </button>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                {[
                    { label: "Total saisies",   value: stats.total,     sub: "Total général",    color: "blue",   icon: FileText,   subColor: "text-gray-400" },
                    { label: "Ce mois",         value: stats.thisMonth, sub: `${stats.total > 0 ? Math.round((stats.thisMonth / stats.total) * 100) : 0}% du total`, color: "green",  icon: TrendingUp, subColor: "text-emerald-600" },
                    { label: "Cette semaine",   value: stats.thisWeek,  sub: "Depuis lundi",     color: "purple", icon: Activity,   subColor: "text-purple-500" },
                    { label: "Aujourd'hui",     value: stats.today,     sub: stats.today > 0 ? `${stats.today} saisie(s)` : "Aucune saisie", color: "amber", icon: Clock, subColor: "text-amber-500" },
                ].map(({ label, value, sub, color, icon: Icon, subColor }, i) => {
                    const palette = {
                        blue:   { bar: "bg-blue-500",   iconBg: "bg-blue-50",   iconText: "text-blue-600"   },
                        green:  { bar: "bg-emerald-500",iconBg: "bg-emerald-50",iconText: "text-emerald-600" },
                        purple: { bar: "bg-purple-500", iconBg: "bg-purple-50", iconText: "text-purple-600"  },
                        amber:  { bar: "bg-amber-400",  iconBg: "bg-amber-50",  iconText: "text-amber-600"   },
                    };
                    const c = palette[color];
                    return (
                        <div key={label}
                             className="group bg-white rounded-2xl border border-gray-100 p-4 relative overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-slide-up"
                             style={{ animationDelay: `${i * 60}ms` }}>
                            <div className={`absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl ${c.bar}`} />
                            <div className="flex items-start justify-between mb-2 mt-0.5">
                                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{label}</span>
                                <div className={`p-1.5 ${c.iconBg} rounded-lg group-hover:scale-110 transition-transform duration-200`}>
                                    <Icon className={`w-3.5 h-3.5 ${c.iconText}`} />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 tabular-nums tracking-tight mb-1">
                                {formatNumberValue(value || 0)}
                            </p>
                            <p className={`text-[10px] font-medium ${subColor} flex items-center gap-1`}>
                                {color === 'green' && <ArrowUpRight className="w-3 h-3" />}
                                {sub}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Montants (conditionnel) */}
            {amounts.totalAmount > 0 && (
                <div className="grid grid-cols-2 gap-3 mb-5">
                    {[
                        { label: "Montant total", value: formatMoneyFCFA(amounts.totalAmount), sub: "Cumul général",  bar: "bg-indigo-500",  iconBg: "bg-indigo-50",  iconText: "text-indigo-600",  delay: 240 },
                        { label: "Montant mois",  value: formatMoneyFCFA(amounts.thisMonthAmount), sub: "Ce mois-ci", bar: "bg-emerald-500", iconBg: "bg-emerald-50", iconText: "text-emerald-600", delay: 300 },
                    ].map(({ label, value, sub, bar, iconBg, iconText, delay }) => (
                        <div key={label}
                             className="group bg-white rounded-2xl border border-gray-100 p-4 relative overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-slide-up"
                             style={{ animationDelay: `${delay}ms` }}>
                            <div className={`absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl ${bar}`} />
                            <div className="flex items-start justify-between mb-2 mt-0.5">
                                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{label}</span>
                                <div className={`p-1.5 ${iconBg} rounded-lg`}>
                                    <TrendingUp className={`w-3.5 h-3.5 ${iconText}`} />
                                </div>
                            </div>
                            <p className="text-xl font-bold text-gray-900 tabular-nums tracking-tight mb-1">{value}</p>
                            <p className="text-[10px] text-gray-400 font-medium">{sub}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Filtres */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 animate-slide-up" style={{ animationDelay: '360ms' }}>
                <div className="flex items-center gap-2 mb-3">
                    <Filter className="w-3.5 h-3.5 text-gray-300" />
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Filtres</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex-1 min-w-[220px] relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-3.5 h-3.5" />
                        <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                               placeholder="Rechercher…"
                               className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all" />
                    </div>
                    <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
                           className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all w-40" />
                    <button onClick={handleExport}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 font-medium transition-colors text-gray-600">
                        <Download className="w-3.5 h-3.5" /> Exporter
                    </button>
                    {(searchTerm || dateFilter) && (
                        <button onClick={() => { setSearchTerm(''); setDateFilter(''); }}
                                className="text-xs text-cyan-600 hover:text-cyan-700 font-semibold">
                            Réinitialiser
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-fade-in">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-14 gap-3">
                        <div className="w-9 h-9 rounded-full border-[3px] border-cyan-100 border-t-cyan-500 animate-spin" />
                        <p className="text-sm text-gray-400">Chargement…</p>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="text-center py-14">
                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <Calendar className="w-7 h-7 text-gray-200" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-1">Aucune donnée</h3>
                        <p className="text-xs text-gray-400 mb-5">
                            {searchTerm || dateFilter ? "Aucun résultat pour ces filtres" : "Créez votre première saisie"}
                        </p>
                        {!searchTerm && !dateFilter && (
                            <button onClick={handleCreate}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-600 text-white rounded-xl text-sm font-semibold hover:bg-cyan-700 transition-colors">
                                <Plus className="w-4 h-4" /> Nouvelle saisie
                            </button>
                        )}
                    </div>
                ) : (
                    <Table columns={columns} data={filteredData} sortable hoverable emptyMessage="Aucune donnée trouvée" />
                )}
            </div>

            {/* Info banner */}
            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 animate-fade-in">
                <p className="text-xs text-blue-700">
                    <span className="font-semibold">💡 Astuce :</span> Les statistiques reflètent le nombre de saisies par période.
                    Le tableau de bord comptabilité se met à jour automatiquement dès votre retour sur la page.
                    {amounts.totalAmount > 0 && " Les montants sont également calculés automatiquement."}
                </p>
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
                    from { opacity: 0; transform: translateY(10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes fade-in {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                .animate-slide-up { animation: slide-up 0.35s ease-out forwards; opacity: 0; }
                .animate-fade-in  { animation: fade-in 0.4s ease-out; }
                .tabular-nums     { font-variant-numeric: tabular-nums; }
            `}</style>
        </div>
    );
}