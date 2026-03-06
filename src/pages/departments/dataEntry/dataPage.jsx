import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
    Plus,
    Calendar,
    Search,
    Download,
    Edit,
    Trash2,
    TrendingUp,
    AlertCircle,
} from 'lucide-react';
import { schemaService } from './service/schemaService.js';
import { dataService } from './service/dataService';
import { useToast, ToastContainer } from '../../../components/ui/Toast';
import DataEntryModal from './DataEntryModal';
import Table from '../../../components/ui/Table';

export default function Data() {
    const { user } = useAuth();
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

    // Get department code from connected user
    const deptCode = user?.department?.code?.toUpperCase() || 'DEFAULT';
    const departmentName = user?.department?.name || 'Département';

    // Load schema based on user's department
    useEffect(() => {
        loadSchema();
    }, [deptCode]);

    // Load data when schema is ready
    useEffect(() => {
        if (schema) {
            loadData();
            loadStats();
        }
    }, [schema]);

    const loadSchema = async () => {
        setSchemaLoading(true);
        try {
            console.log('Loading schema for department:', deptCode);
            const deptSchema = await schemaService.getDepartmentSchema(deptCode);
            console.log('Schema loaded:', deptSchema);
            setSchema(deptSchema);
        } catch (error) {
            console.error('Error loading schema:', error);
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
            console.error('Error loading data:', error);
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
            console.error('Error loading stats:', error);
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

    // Show loading while schema is loading
    if (schemaLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
            </div>
        );
    }

    if (!schema) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">Erreur de chargement</h3>
                <p className="text-gray-600">Impossible de charger le formulaire pour votre département</p>
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

    // Préparer colonnes table based on schema
    const columns = [
        {
            key: 'date',
            header: 'Date',
            sortable: true,
            render: (value) => (
                <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">
                        {new Date(value).toLocaleDateString('fr-FR')}
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
                    <span className="text-gray-900">
                        {typeof value === 'number' ? value.toLocaleString() : value || '—'}
                    </span>
                ),
            })),
        {
            key: 'actions',
            header: 'Actions',
            sortable: false,
            render: (_, row) => (
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => handleEdit(row)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Modifier"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(row.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Supprimer"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            {/* Header with department icon and title */}
            <div className={`bg-gradient-to-r ${schema.color || 'from-cyan-600 to-blue-600'} rounded-xl p-6 text-white`}>
            <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="text-4xl">{schema.icon || '📊'}</div>
                        <div>
                            <h1 className="text-3xl font-bold">
                                {schema.title || `Données ${departmentName}`}
                            </h1>
                            <p className="text-cyan-100 mt-1">
                                {schema.description || `Gérez vos saisies pour ${departmentName}`}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="inline-flex items-center px-6 py-3 bg-white text-cyan-600 rounded-lg hover:bg-cyan-50 font-medium transition-colors shadow-lg"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Nouvelle Saisie
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Saisies</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {stats.total || 0}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Ce Mois</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {stats.thisMonth || 0}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Cette Semaine</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {stats.thisWeek || 0}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <Calendar className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Aujourd'hui</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {stats.today || 0}
                                </p>
                            </div>
                            <div className="p-3 bg-amber-100 rounded-lg">
                                <AlertCircle className="w-6 h-6 text-amber-600" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-xl border p-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[300px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Rechercher..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>
                    </div>

                    <div className="w-48">
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>

                    <button
                        onClick={handleExport}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
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
                            className="text-sm text-gray-600 hover:text-gray-900"
                        >
                            Réinitialiser
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="text-center py-12">
                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-400 mb-2">
                            Aucune donnée
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Commencez par créer votre première saisie pour {departmentName}
                        </p>
                        <button
                            onClick={handleCreate}
                            className="inline-flex items-center px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-medium transition-colors"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Nouvelle Saisie
                        </button>
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

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                    💡 <strong>Astuce:</strong> Saisissez vos données quotidiennes pour {departmentName}
                </p>
            </div>

            {/* Modal with dynamic fields based on department */}
            {showModal && schema && (
                <DataEntryModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onSuccess={handleSaveSuccess}
                    editingData={editingData}
                    schema={schema}
                    deptCode={deptCode}
                    departmentName={departmentName}
                />
            )}
        </div>
    );
}