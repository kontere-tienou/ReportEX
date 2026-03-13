// Data.jsx - Modern UI Design with integrated table formatters
import { useState, useEffect } from 'react';
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
    const [stats, setStats] = useState(null);
    const [schema, setSchema] = useState(null);
    const [error, setError] = useState(null);

    // Resolve department code
    const deptCode = resolveDepartmentCode(deptName, user);
    const departmentDisplayName = getDepartmentDisplayName(deptCode) || deptName || 'Département';

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
            await loadStats();
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

    const loadStats = async () => {
        try {
            const statsData = await dataService.getStats(deptCode);
            setStats(statsData);
        } catch (error) {
            console.error('❌ Error loading stats:', error);
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
            loadStats();
        } catch (error) {
            addToast('Erreur lors de la suppression', 'error', 3000);
        }
    };

    const handleSaveSuccess = () => {
        setShowModal(false);
        loadData();
        loadStats();
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
                <div className="bg-white border border-red-100 rounded-2xl shadow-sm p-8 max-w-2xl w-full">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-red-50 rounded-xl">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">
                                Erreur de chargement
                            </h3>
                            <p className="text-sm text-gray-500">
                                Impossible de charger les données
                            </p>
                        </div>
                    </div>

                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
                        <p className="text-sm text-red-800">{error}</p>
                    </div>

                    <details className="mb-6">
                        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                            Informations de débogage
                        </summary>
                        <pre className="text-xs text-gray-600 mt-2 p-3 bg-gray-50 rounded-lg overflow-auto">
                            {JSON.stringify({
                                deptCode,
                                deptName,
                                userDeptCode: user?.department?.code,
                                userDeptName: user?.department?.name,
                                timestamp: new Date().toISOString()
                            }, null, 2)}
                        </pre>
                    </details>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleRetry}
                            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-medium transition-colors"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Réessayer
                        </button>
                        <button
                            onClick={handleGoBack}
                            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
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
                    <p className="text-sm font-medium text-gray-700">
                        Chargement du formulaire...
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        Département: {deptCode || 'Non défini'}
                    </p>
                </div>
            </div>
        );
    }

    if (!schema) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <div className="p-4 bg-red-50 rounded-2xl inline-block mb-4">
                        <AlertCircle className="w-16 h-16 text-red-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Schéma introuvable
                    </h3>
                    <p className="text-gray-600 mb-1">
                        Impossible de charger le formulaire pour {departmentDisplayName}
                    </p>
                    <p className="text-sm text-gray-400 mb-6">
                        Code département: {deptCode}
                    </p>
                    <button
                        onClick={handleRetry}
                        className="inline-flex items-center px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-medium transition-colors shadow-sm"
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
            <div className="flex items-end justify-between mb-8 pb-6 border-b border-gray-200">
                <div>
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">
                        {schema.icon} Saisie de Données
                    </p>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                        {schema.title || departmentDisplayName}
                    </h1>
                    <p className="text-sm text-gray-400 mt-2">
                        {schema.description || `Gérez vos saisies quotidiennes · ${departmentDisplayName}`}
                    </p>
                </div>

                <button
                    onClick={handleCreate}
                    className="inline-flex items-center px-6 py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 font-medium transition-all shadow-lg hover:shadow-xl"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Nouvelle Saisie
                </button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500 p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                                Total Saisies
                            </span>
                            <div className="p-2 bg-blue-50 rounded-xl">
                                <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">
                            {formatNumberValue(stats.total || 0)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3" />
                            Toutes périodes
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-green-500 p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                                Ce Mois
                            </span>
                            <div className="p-2 bg-green-50 rounded-xl">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">
                            {/*{formatNumberValue(stats.thisMonth || 0)}*/}
                            value={formatNumberValue(stats.today)}
                        </p>
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3" />
                            {Math.round((stats.thisMonth / stats.total) * 100) || 0}% du total
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-purple-500 p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                                Cette Semaine
                            </span>
                            <div className="p-2 bg-purple-50 rounded-xl">
                                <Calendar className="w-5 h-5 text-purple-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">
                            value={formatNumberValue(stats.today)}
                        </p>
                        <p className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            7 derniers jours
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-amber-500 p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                                Aujourd'hui
                            </span>
                            <div className="p-2 bg-amber-50 rounded-xl">
                                <AlertCircle className="w-5 h-5 text-amber-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">
                            value={formatNumberValue(stats.today)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {stats.today > 0 ? "Actif" : "Aucune saisie"}
                        </p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                        Filtres
                    </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-[300px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Rechercher dans les données..."
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    <div className="w-48">
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                        />
                    </div>

                    <button
                        onClick={handleExport}
                        className="inline-flex items-center px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium transition-all"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Exporter
                    </button>

                    {(searchTerm || dateFilter) && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setDateFilter('');
                            }}
                            className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                        >
                            Réinitialiser
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="w-12 h-12 rounded-full border-4 border-cyan-100 border-t-cyan-600 animate-spin mb-4" />
                        <p className="text-sm text-gray-500">Chargement des données...</p>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="p-4 bg-gray-50 rounded-2xl inline-block mb-4">
                            <Calendar className="w-16 h-16 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            Aucune donnée
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                            {searchTerm || dateFilter
                                ? "Aucun résultat ne correspond à vos critères"
                                : `Commencez par créer votre première saisie pour ${departmentDisplayName}`
                            }
                        </p>
                        {!searchTerm && !dateFilter && (
                            <button
                                onClick={handleCreate}
                                className="inline-flex items-center px-6 py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 font-medium transition-all shadow-lg"
                            >
                                <Plus className="w-5 h-5 mr-2" />
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
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-2xl p-4">
                <p className="text-sm text-blue-800">
                    💡 <strong>Astuce:</strong> Saisissez vos données quotidiennes pour {departmentDisplayName}.
                    Les montants sont automatiquement formatés en FCFA et les statistiques se mettent à jour en temps réel.
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
        </div>
    );
}