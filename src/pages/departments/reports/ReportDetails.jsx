import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { reportService } from '../../../services/api.js';
import { useAuth } from '../../../context/AuthContext';
import { useToast, ToastContainer } from '../../../components/ui/Toast';
import {
    ArrowLeft, Calendar, User, Building2, Eye, Edit2, Trash2,
    Send, CheckCircle, XCircle, Clock, AlertCircle, FileText,
    MessageSquare, Activity, Download, Share2
} from 'lucide-react';

const ReportDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toasts, addToast, removeToast } = useToast();

    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showValidateModal, setShowValidateModal] = useState(false);
    const [validationStatus, setValidationStatus] = useState('valide');
    const [validationComments, setValidationComments] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadReport();
    }, [id]);

    const loadReport = async () => {
        try {
            setLoading(true);
            const res = await reportService.getReportDetails(id);
            setReport(res.data.report);
        } catch (error) {
            console.error('Erreur chargement rapport:', error);
            addToast('Erreur lors du chargement du rapport', 'error');
            navigate('/reports');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            await reportService.submitReport(id);
            addToast('Rapport soumis pour validation', 'success');
            loadReport();
        } catch (error) {
            addToast(error.response?.data?.message || 'Erreur lors de la soumission', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleValidate = async () => {
        if (!validationComments && validationStatus === 'rejete') {
            addToast('Veuillez indiquer la raison du rejet', 'warning');
            return;
        }

        try {
            setSubmitting(true);
            await reportService.validateReport(id, {
                status: validationStatus,
                comments: validationComments
            });
            addToast(
                validationStatus === 'valide' ? 'Rapport validé avec succès' : 'Rapport rejeté',
                validationStatus === 'valide' ? 'success' : 'warning'
            );
            setShowValidateModal(false);
            loadReport();
        } catch (error) {
            addToast(error.response?.data?.message || 'Erreur lors de la validation', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) return;

        try {
            await reportService.deleteReport(id);
            addToast('Rapport supprimé', 'success');
            navigate('/reports');
        } catch (error) {
            addToast('Erreur lors de la suppression', 'error');
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            brouillon: { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock, label: 'Brouillon' },
            soumis: { bg: 'bg-blue-100', text: 'text-blue-800', icon: AlertCircle, label: 'Soumis' },
            valide: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Validé' },
            rejete: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Rejeté' }
        };
        const badge = badges[status] || badges.brouillon;
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${badge.bg} ${badge.text}`}>
        <Icon className="w-5 h-5 mr-2" />
                {badge.label}
      </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
            </div>
        );
    }

    if (!report) {
        return <div>Rapport non trouvé</div>;
    }

    const reportData = typeof report.data === 'string' ? JSON.parse(report.data) : report.data;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link
                        to="/reports"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Détails du Rapport</h1>
                        <p className="text-gray-600 mt-1">Rapport #{report.id}</p>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    {report.permissions?.canSubmit && (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="inline-flex items-center px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
                        >
                            <Send className="w-4 h-4 mr-2" />
                            Soumettre
                        </button>
                    )}

                    {report.permissions?.canValidate && (
                        <button
                            onClick={() => setShowValidateModal(true)}
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Valider/Rejeter
                        </button>
                    )}

                    {report.permissions?.canEdit && (
                        <button
                            onClick={() => navigate(`/reports/${id}/edit`)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Modifier
                        </button>
                    )}

                    {report.permissions?.canDelete && (
                        <button
                            onClick={handleDelete}
                            className="inline-flex items-center px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Supprimer
                        </button>
                    )}

                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Download className="w-5 h-5" />
                    </button>

                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Status Banner */}
            <div className="bg-white rounded-xl border p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-3">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${report.department_color || 'bg-cyan-100'}`}>
                                {report.department_icon || '📊'}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{report.department_name}</h2>
                                <p className="text-sm text-gray-600">Département {report.department_code}</p>
                            </div>
                        </div>
                    </div>
                    {getStatusBadge(report.status)}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Informations générales */}
                    <div className="bg-white rounded-xl border p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <FileText className="w-5 h-5 mr-2 text-cyan-600" />
                            Informations Générales
                        </h3>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Période</p>
                                <div className="flex items-center text-gray-900">
                                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                    <span className="font-medium">
                    {new Date(report.period_start).toLocaleDateString()} - {new Date(report.period_end).toLocaleDateString()}
                  </span>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-gray-600 mb-1">Visibilité</p>
                                <div className="flex items-center text-gray-900">
                                    <Eye className="w-4 h-4 mr-2 text-gray-400" />
                                    <span className="font-medium capitalize">{report.visibility}</span>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-gray-600 mb-1">Créé par</p>
                                <div className="flex items-center text-gray-900">
                                    <User className="w-4 h-4 mr-2 text-gray-400" />
                                    <span className="font-medium">{report.author_name}</span>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-gray-600 mb-1">Créé le</p>
                                <div className="flex items-center text-gray-900">
                                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                    <span className="font-medium">{new Date(report.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        {report.validated_by && (
                            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-sm text-green-800">
                                    <strong>Validé par:</strong> {report.validator_name}
                                    <br />
                                    <strong>Le:</strong> {new Date(report.validated_at).toLocaleString()}
                                </p>
                            </div>
                        )}

                        {report.status === 'rejete' && report.rejection_reason && (
                            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-800">
                                    <strong>Raison du rejet:</strong><br />
                                    {report.rejection_reason}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Données du rapport */}
                    <div className="bg-white rounded-xl border p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Données du Rapport</h3>

                        <div className="space-y-6">
                            {Object.entries(reportData).map(([key, value]) => (
                                <div key={key} className="border-b border-gray-200 pb-4 last:border-0">
                                    <p className="text-sm font-medium text-gray-700 mb-2 capitalize">
                                        {key.replace(/_/g, ' ')}
                                    </p>
                                    <p className="text-gray-900 whitespace-pre-wrap">
                                        {typeof value === 'object' ? JSON.stringify(value, null, 2) : value || '—'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Historique de validation */}
                    {report.validations && report.validations.length > 0 && (
                        <div className="bg-white rounded-xl border p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <MessageSquare className="w-5 h-5 mr-2 text-cyan-600" />
                                Historique de Validation
                            </h3>

                            <div className="space-y-4">
                                {report.validations.map((validation, idx) => (
                                    <div key={idx} className="border-l-4 border-cyan-500 pl-4 py-2">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="font-semibold text-gray-900">{validation.validator_name}</p>
                                            <span className={`text-xs font-medium px-2 py-1 rounded ${
                                                validation.status === 'valide' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                        {validation.status}
                      </span>
                                        </div>
                                        <p className="text-sm text-gray-600">{validation.comments}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(validation.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Actions rapides */}
                    <div className="bg-white rounded-xl border p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Actions Rapides</h3>

                        <div className="space-y-2">
                            <button className="w-full text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors flex items-center">
                                <Download className="w-4 h-4 mr-3 text-gray-600" />
                                <span className="text-sm font-medium">Télécharger PDF</span>
                            </button>

                            <button className="w-full text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors flex items-center">
                                <Share2 className="w-4 h-4 mr-3 text-gray-600" />
                                <span className="text-sm font-medium">Partager</span>
                            </button>

                            <button className="w-full text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors flex items-center">
                                <FileText className="w-4 h-4 mr-3 text-gray-600" />
                                <span className="text-sm font-medium">Dupliquer</span>
                            </button>
                        </div>
                    </div>

                    {/* Activité récente */}
                    {report.activities && report.activities.length > 0 && (
                        <div className="bg-white rounded-xl border p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <Activity className="w-5 h-5 mr-2 text-cyan-600" />
                                Activité Récente
                            </h3>

                            <div className="space-y-3">
                                {report.activities.slice(0, 5).map((activity, idx) => (
                                    <div key={idx} className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2"></div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">{activity.action.replace('_', ' ')}</p>
                                            <p className="text-xs text-gray-600">{activity.user_name}</p>
                                            <p className="text-xs text-gray-400">{new Date(activity.created_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Validation */}
            {showValidateModal && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Valider le Rapport</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Décision
                                </label>
                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => setValidationStatus('valide')}
                                        className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                                            validationStatus === 'valide'
                                                ? 'border-green-500 bg-green-50 text-green-900'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <CheckCircle className="w-5 h-5 mx-auto mb-1" />
                                        <span className="text-sm font-medium">Valider</span>
                                    </button>

                                    <button
                                        onClick={() => setValidationStatus('rejete')}
                                        className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                                            validationStatus === 'rejete'
                                                ? 'border-red-500 bg-red-50 text-red-900'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <XCircle className="w-5 h-5 mx-auto mb-1" />
                                        <span className="text-sm font-medium">Rejeter</span>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Commentaires {validationStatus === 'rejete' && <span className="text-red-500">*</span>}
                                </label>
                                <textarea
                                    rows={4}
                                    value={validationComments}
                                    onChange={(e) => setValidationComments(e.target.value)}
                                    placeholder={
                                        validationStatus === 'valide'
                                            ? 'Commentaires optionnels...'
                                            : 'Veuillez indiquer la raison du rejet...'
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={() => setShowValidateModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleValidate}
                                disabled={submitting}
                                className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 ${
                                    validationStatus === 'valide' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                                }`}
                            >
                                {submitting ? 'Traitement...' : 'Confirmer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportDetails;