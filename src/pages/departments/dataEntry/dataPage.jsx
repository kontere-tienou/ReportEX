// Data.jsx - Modern UI Design with compact animated cards
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Plus,
    Calendar,
    Search,
    Download,
    Edit,
    Trash2,
    TrendingUp,
    AlertCircle,
    RefreshCw,
    Filter,
    ArrowUpRight,
    FileText,
    Activity,
} from 'lucide-react';
import { schemaService } from '../../../services/schemaService.js';
import { dataService } from '../../../services/dataService.js';
import { useToast, ToastContainer } from '../../../components/ui/Toast';
import DataEntryModal from './DataEntryModal';
import Table from '../../../components/ui/Table';
import { getDepartmentDisplayName } from '../reports/builder/utils/departmentMapping.js';
import { resolveDepartmentCode, validateDepartmentCode } from '../reports/builder/utils/departmentUtils.js';
import {
    formatCellValue,
    formatDateValue,
    formatMoneyFCFA,
    formatNumberValue,
    isDateValue
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

    // Resolve department code
    const deptCode = resolveDepartmentCode(deptName, user);
    const departmentDisplayName = getDepartmentDisplayName(deptCode) || deptName || 'Département';

    /**
     * Calcule les statistiques à partir des données
     */
    const calculateStats = (data) => {
        const today = new Date().toISOString().split('T')[0];
        const now = new Date();

        // Début de la semaine (lundi)
        const startOfWeek = new Date(now);
        const dayOfWeek = now.getDay(); // 0 = dimanche, 1 = lundi, ...
        const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Ajustement pour commencer le lundi
        startOfWeek.setDate(now.getDate() - diffToMonday);
        startOfWeek.setHours(0, 0, 0, 0);

        // Début du mois
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Début de l'année
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        let total = 0;
        let todayCount = 0;
        let thisWeekCount = 0;
        let thisMonthCount = 0;
        let thisYearCount = 0;

        data.forEach(item => {
            // Compter le nombre total d'enregistrements (pas la somme des valeurs)
            total++;

            const itemDate = new Date(item.date);

            // Vérifier si c'est aujourd'hui
            if (item.date === today) {
                todayCount++;
            }

            // Vérifier si c'est cette semaine
            if (itemDate >= startOfWeek) {
                thisWeekCount++;
            }

            // Vérifier si c'est ce mois
            if (itemDate >= startOfMonth) {
                thisMonthCount++;
            }

            // Vérifier si c'est cette année
            if (itemDate >= startOfYear) {
                thisYearCount++;
            }
        });

        return {
            total,
            today: todayCount,
            thisWeek: thisWeekCount,
            thisMonth: thisMonthCount,
            thisYear: thisYearCount,
        };
    };

    /**
     * Calcule les montants totaux par période
     */
    const calculateAmounts = (data) => {
        const today = new Date().toISOString().split('T')[0];
        const now = new Date();

        const startOfWeek = new Date(now);
        const dayOfWeek = now.getDay();
        const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startOfWeek.setDate(now.getDate() - diffToMonday);
        startOfWeek.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        let totalAmount = 0;
        let todayAmount = 0;
        let thisWeekAmount = 0;
        let thisMonthAmount = 0;
        let thisYearAmount = 0;

        data.forEach(item => {
            // Chercher les champs de type montant
            Object.entries(item).forEach(([key, value]) => {
                // Identifier les champs qui sont des montants (caisse, montant, total, etc.)
                if (typeof value === 'number' &&
                    (key.includes('caisse') ||
                        key.includes('montant') ||
                        key.includes('total') ||
                        key.includes('ca') ||
                        key.includes('prix') ||
                        key.includes('cout'))) {

                    totalAmount += value;

                    const itemDate = new Date(item.date);

                    if (item.date === today) {
                        todayAmount += value;
                    }

                    if (itemDate >= startOfWeek) {
                        thisWeekAmount += value;
                    }

                    if (itemDate >= startOfMonth) {
                        thisMonthAmount += value;
                    }

                    if (itemDate >= startOfYear) {
                        thisYearAmount += value;
                    }
                }
            });
        });

        return {
            totalAmount,
            todayAmount,
            thisWeekAmount,
            thisMonthAmount,
            thisYearAmount,
        };
    };

    // Statistiques calculées à partir des données
    const stats = useMemo(() => calculateStats(dataList), [dataList]);
    const amounts = useMemo(() => calculateAmounts(dataList), [dataList]);

    // Validate and load schema
    useEffect(() => {
        const initializePage = async () => {
            if (!deptCode) {
                setError('Impossible de déterminer le département');
                setSchemaLoading(false);
                return;
            }
            const isValid = await validateDepartmentCode(deptCode);
            if (!isValid) {
                setError(`Département "${deptCode}" non trouvé dans le système`);
                setSchemaLoading(false);
                return;
            }
            await loadSchema();
        };

        initializePage();
    }, [deptCode]);

    const loadSchema = async () => {
        setSchemaLoading(true);
        setError(null);
        try {
            const deptSchema = await schemaService.getDepartmentSchema(deptCode);
            if (!deptSchema) {
                throw new Error('Schéma non trouvé');
            }
            setSchema(deptSchema);
            await loadData();
        } catch (error) {
            console.error('❌ Error loading schema:', error);
            setError(error.message || 'Erreur lors du chargement du schéma');
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
        } catch (error) {
            console.error('❌ Error loading data:', error);
            addToast('Erreur lors du chargement des données', 'error', 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingData(null);
        setShowModal(true);
    };

    const handleEdit = (data) => {
        setEditingData(data);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette saisie ?')) return;

        try {
            await dataService.delete(deptCode, id);
            addToast('Saisie supprimée avec succès', 'success', 2000);
            loadData();
        } catch (error) {
            addToast('Erreur lors de la suppression', 'error', 3000);
        }
    };

    const handleSaveSuccess = () => {
        setShowModal(false);
        loadData();
    };

    const handleExport = async () => {
        try {
            const blob = await dataService.exportData(deptCode, {
                dateFrom: dateFilter || undefined,
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `donnees_${deptCode}_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            addToast('Export réussi', 'success', 2000);
        } catch (error) {
            addToast('Erreur lors de l\'export', 'error', 3000);
        }
    };

    const handleRetry = () => {
        setError(null);
        setSchemaLoading(true);
        loadSchema();
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    // Show error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white border border-red-100 rounded-2xl shadow-sm p-8 max-w-2xl w-full animate-fade-in">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-red-50 rounded-xl">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Erreur de chargement</h3>
                            <p className="text-sm text-gray-500">Impossible de charger les données</p>
                        </div>
                    </div>

                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
                        <p className="text-sm text-red-800">{error}</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleRetry}
                            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-medium transition-all"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Réessayer
                        </button>
                        <button
                            onClick={handleGoBack}
                            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-all"
                        >
                            Retour
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Show loading while schema is loading
    if (schemaLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-cyan-100 border-t-cyan-600 animate-spin" />
                <div className="text-center">
                    <p className="text-sm font-medium text-gray-700">Chargement du formulaire...</p>
                    <p className="text-xs text-gray-400 mt-1">Département: {deptCode || 'Non défini'}</p>
                </div>
            </div>
        );
    }

    if (!schema) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="text-center max-w-md animate-fade-in">
                    <div className="p-4 bg-red-50 rounded-2xl inline-block mb-4">
                        <AlertCircle className="w-16 h-16 text-red-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Schéma introuvable</h3>
                    <p className="text-gray-600 mb-1">Impossible de charger le formulaire pour {departmentDisplayName}</p>
                    <p className="text-sm text-gray-400 mb-6">Code département: {deptCode}</p>
                    <button
                        onClick={handleRetry}
                        className="inline-flex items-center px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-medium transition-all shadow-sm"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    // Filtrer données
    const filteredData = dataList.filter((item) => {
        const matchSearch =
            searchTerm === '' ||
            Object.values(item).some((val) =>
                String(val).toLowerCase().includes(searchTerm.toLowerCase())
            );
        const matchDate = dateFilter === '' || item.date === dateFilter;
        return matchSearch && matchDate;
    });

    // Préparer colonnes table avec formatters
    const columns = [
        {
            key: 'date',
            header: 'Date',
            sortable: true,
            render: (value) => (
                <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">
                        {formatDateValue(value)}
                    </span>
                </div>
            ),
        },
        ...schema.fields
            .filter((f) => f.type === 'number' && f.key !== 'date')
            .slice(0, 3)
            .map((field) => ({
                key: field.key,
                header: field.label,
                sortable: true,
                render: (value) => (
                    <span className="text-gray-900 font-medium">
                        {formatCellValue(value, field.key, field.type)}
                    </span>
                ),
            })),
        {
            key: 'actions',
            header: 'Actions',
            sortable: false,
            render: (_, row) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleEdit(row)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Modifier"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(row.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            {/* Header */}
            <div className="flex items-end justify-between mb-6 pb-4 border-b border-gray-200">
                <div>
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">
                        {schema.icon} Saisie de Données
                    </p>
                    <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                        {schema.title || departmentDisplayName}
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">
                        {schema.description || `Gérez vos saisies quotidiennes · ${departmentDisplayName}`}
                    </p>
                </div>

                <button
                    onClick={handleCreate}
                    className="inline-flex items-center px-5 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-medium transition-all shadow-sm hover:shadow-md"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Nouvelle Saisie
                </button>
            </div>

            {/* Stats Cards - Compact & Animated */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                {/* Total Saisies */}
                <div className="group bg-white rounded-xl shadow-sm border border-l-4 border-l-blue-500 p-3 hover:shadow-md transition-all duration-300 animate-slide-up" style={{ animationDelay: '0ms' }}>
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                            Total Saisies
                        </span>
                        <div className="p-1.5 bg-blue-50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                            <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-0.5">
                        {formatNumberValue(stats.total || 0)}
                    </p>
                    <p className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Total général
                    </p>
                </div>

                {/* Ce Mois */}
                <div className="group bg-white rounded-xl shadow-sm border border-l-4 border-l-green-500 p-3 hover:shadow-md transition-all duration-300 animate-slide-up" style={{ animationDelay: '100ms' }}>
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                            Ce Mois
                        </span>
                        <div className="p-1.5 bg-green-50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-0.5">
                        {formatNumberValue(stats.thisMonth || 0)}
                    </p>
                    <p className="text-[10px] text-green-600 flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" />
                        {stats.total > 0 ? Math.round((stats.thisMonth / stats.total) * 100) : 0}% du total
                    </p>
                </div>

                {/* Cette Semaine */}
                <div className="group bg-white rounded-xl shadow-sm border border-l-4 border-l-purple-500 p-3 hover:shadow-md transition-all duration-300 animate-slide-up" style={{ animationDelay: '200ms' }}>
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                            Cette Semaine
                        </span>
                        <div className="p-1.5 bg-purple-50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                            <Calendar className="w-4 h-4 text-purple-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-0.5">
                        {formatNumberValue(stats.thisWeek || 0)}
                    </p>
                    <p className="text-[10px] text-purple-600 flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        Depuis lundi
                    </p>
                </div>

                {/* Aujourd'hui */}
                <div className="group bg-white rounded-xl shadow-sm border border-l-4 border-l-amber-500 p-3 hover:shadow-md transition-all duration-300 animate-slide-up" style={{ animationDelay: '300ms' }}>
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                            Aujourd'hui
                        </span>
                        <div className="p-1.5 bg-amber-50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-0.5">
                        {formatNumberValue(stats.today || 0)}
                    </p>
                    <p className="text-[10px] text-amber-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {stats.today > 0 ? `${stats.today} saisie(s)` : "Aucune saisie"}
                    </p>
                </div>
            </div>

            {/* Montants Cards - Optionnel, si vous voulez afficher les montants */}
            {amounts.totalAmount > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                    {/* Total Montants */}
                    <div className="group bg-white rounded-xl shadow-sm border border-l-4 border-l-indigo-500 p-3 hover:shadow-md transition-all duration-300 animate-slide-up" style={{ animationDelay: '400ms' }}>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                                Montant Total
                            </span>
                            <div className="p-1.5 bg-indigo-50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                <TrendingUp className="w-4 h-4 text-indigo-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 mb-0.5">
                            {formatMoneyFCFA(amounts.totalAmount || 0)}
                        </p>
                        <p className="text-[10px] text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Cumul général
                        </p>
                    </div>

                    {/* Montant Ce Mois */}
                    <div className="group bg-white rounded-xl shadow-sm border border-l-4 border-l-emerald-500 p-3 hover:shadow-md transition-all duration-300 animate-slide-up" style={{ animationDelay: '500ms' }}>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                                Montant Mois
                            </span>
                            <div className="p-1.5 bg-emerald-50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                <TrendingUp className="w-4 h-4 text-emerald-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 mb-0.5">
                            {formatMoneyFCFA(amounts.thisMonthAmount || 0)}
                        </p>
                        <p className="text-[10px] text-emerald-600 flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3" />
                            Ce mois-ci
                        </p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border p-3 mb-4 animate-slide-up" style={{ animationDelay: '600ms' }}>
                <div className="flex items-center gap-2 mb-3">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                        Filtres
                    </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex-1 min-w-[250px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Rechercher..."
                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    <div className="w-40">
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                        />
                    </div>

                    <button
                        onClick={handleExport}
                        className="inline-flex items-center px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 font-medium transition-all"
                    >
                        <Download className="w-4 h-4 mr-1.5" />
                        Exporter
                    </button>

                    {(searchTerm || dateFilter) && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setDateFilter('');
                            }}
                            className="text-xs text-cyan-600 hover:text-cyan-700 font-medium"
                        >
                            Réinitialiser
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden animate-fade-in">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-10 h-10 rounded-full border-3 border-cyan-100 border-t-cyan-600 animate-spin mb-3" />
                        <p className="text-sm text-gray-500">Chargement...</p>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="p-3 bg-gray-50 rounded-xl inline-block mb-3">
                            <Calendar className="w-12 h-12 text-gray-300" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 mb-1">
                            Aucune donnée
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            {searchTerm || dateFilter
                                ? "Aucun résultat"
                                : `Créez votre première saisie`
                            }
                        </p>
                        {!searchTerm && !dateFilter && (
                            <button
                                onClick={handleCreate}
                                className="inline-flex items-center px-5 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-medium transition-all shadow-sm"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Nouvelle Saisie
                            </button>
                        )}
                    </div>
                ) : (
                    <Table
                        columns={columns}
                        data={filteredData}
                        sortable={true}
                        hoverable={true}
                        emptyMessage="Aucune donnée trouvée"
                    />
                )}
            </div>

            {/* Info Banner */}
            <div className="mt-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-3 animate-fade-in">
                <p className="text-xs text-blue-800">
                    💡 <strong>Astuce:</strong> Les statistiques montrent le nombre de saisies par période.
                    {amounts.totalAmount > 0 && " Les montants totaux sont également calculés automatiquement."}
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

            {/* CSS Animations */}
            <style>{`
                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                .animate-slide-up {
                    animation: slide-up 0.5s ease-out forwards;
                }

                .animate-fade-in {
                    animation: fade-in 0.5s ease-out;
                }
            `}</style>
        </div>
    );
}