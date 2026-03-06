import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import {
    ArrowLeft,
    Download,
    Printer,
    Share2,
    CheckCircle,
    XCircle,
    MessageSquare,
    Eye,
    Lock,
    Send,
    AlertCircle,
    FileText,
    Calendar,
    User,
    Building2,
    Clock,
    Edit,
    Trash2,
} from 'lucide-react';
import {reportAccessService, reportService} from "./services/reportApi.js";
import {ToastContainer, useToast} from "../../../components/ui/index.js";
import { branding } from '../../../config/brandingConstant.js';


export default function ReportDetails() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const printRef = useRef();
    const { toasts, addToast, removeToast } = useToast();

    const [report, setReport] = useState(null);
    const [permissions, setPermissions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [validationData, setValidationData] = useState({
        status: '',
        comments: '',
    });
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [showAccessRequestModal, setShowAccessRequestModal] = useState(false);
    const [accessReason, setAccessReason] = useState('');

    const isDG = ['DG'].includes(user?.role?.toUpperCase());

    // Load report
    useEffect(() => {
        loadReport();
        loadComments();
    }, [id]);

    const loadReport = async () => {
        setLoading(true);
        try {
            // Change this: remove the full URL path
            const response = await reportService.getById(id);
            const data = response.data.data || response.data;
            setReport(data.report);
            setPermissions(data.permissions);
        } catch (error) {
            console.error('Error loading report:', error);
            if (error.response?.status === 403) {
                // Pas d'accès
                setPermissions({ canRead: false, needsAccessRequest: true });
            }
        } finally {
            setLoading(false);
        }
    };

    const loadComments = async () => {
        try {
            // Change this: just pass the ID
            const response = await reportService.getComments(id);
            setComments(response.data.comments || []);
        } catch (error) {
            console.error('Error loading comments:', error);
        }
    };

    // Actions
    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        try {
            // Change this: just pass the ID and the comment data
            await reportService.addComment(id, {
                content: newComment,
            });
            setNewComment('');
            loadComments();
        } catch (error) {
            console.error('Error adding comment:', error);
            addToast('Error adding comment:', 'error', 2000);
        }
    };

    const handleValidate = async (status) => {
        setValidationData({ ...validationData, status });
        setShowValidationModal(true);
    };

    const submitValidation = async () => {
        try {
            // Change this: just pass the ID and validation data
            await reportService.validate(id, validationData);
            setShowValidationModal(false);
            loadReport();
            addToast(
                validationData.status === 'valide'
                    ? 'Rapport validé avec succès'
                    : 'Rapport rejeté','error', 2000
            );
        } catch (error) {
            console.error('Error validating:', error);
            addToast('Erreur lors de la validation', 'error' , 2000);
        }
    };

    const handleRequestAccess = async () => {
        if (!accessReason.trim()) {

            addToast('Veuillez expliquer pourquoi vous demandez l\'accès', 'error', 2000);
            return;
        }

        try {
            // Change this: use the correct service
            await reportAccessService.requestAccess(id, accessReason);
            setShowAccessRequestModal(false);
            addToast('Demande d\'accès envoyée avec succès', 'succes', 2000);
        } catch (error) {
            console.error('Error requesting access:', error);
        }
    };

    const handleDownloadPdf = async () => {
        try {
            // Change this: just pass the ID
            const response = await reportService.exportPdf(id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `rapport_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading PDF:', error);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDelete = async () => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) return;

        try {
            // Change this: just pass the ID
            await reportService.delete(id);
            navigate(-1);
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
            </div>
        );
    }

    // Pas d'accès
    if (permissions && !permissions.canRead) {
        return (
            <div className="max-w-2xl mx-auto mt-12">
                <ToastContainer toasts={toasts} removeToast={removeToast} />
                <div className="bg-white rounded-xl border-2 border-amber-200 p-8 text-center">
                    <Lock className="w-16 h-16 text-amber-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Accès Restreint
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Ce rapport est privé. Vous devez demander l'accès pour le consulter.
                    </p>

                    {permissions.needsAccessRequest && (
                        <button
                            onClick={() => setShowAccessRequestModal(true)}
                            className="inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                        >
                            <Lock className="w-5 h-5 mr-2" />
                            Demander l'Accès
                        </button>
                    )}
                </div>

                {/* Modal Request Access */}
                {showAccessRequestModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl max-w-lg w-full p-6">
                            <h3 className="text-xl font-bold mb-4">Demander l'Accès</h3>
                            <textarea
                                value={accessReason}
                                onChange={(e) => setAccessReason(e.target.value)}
                                rows={4}
                                placeholder="Expliquez pourquoi vous avez besoin d'accéder à ce rapport..."
                                className="w-full border rounded-lg p-3 mb-4"
                            />
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowAccessRequestModal(false)}
                                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleRequestAccess}
                                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                                >
                                    Envoyer la Demande
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (!report) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">Rapport non trouvé</h2>
            </div>
        );
    }

    const statusColors = {
        brouillon: 'bg-gray-100 text-gray-700',
        soumis: 'bg-blue-100 text-blue-700',
        valide: 'bg-green-100 text-green-700',
        rejete: 'bg-red-100 text-red-700',
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Actions - No print */}
            <div className="bg-white border-b top-0 z-40 print:hidden">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">
                                    Rapport #{report.id}
                                </h1>
                                <p className="text-sm text-gray-600">
                                    {report.department_name} • {report.author_name}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            {/* Status Badge */}
                            <span
                                className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                    statusColors[report.status]
                                }`}
                            >
                                {report.status?.charAt(0).toUpperCase() + report.status?.slice(1)}
                            </span>

                            {/* Actions */}
                            <button
                                onClick={handleDownloadPdf}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Télécharger PDF"
                            >
                                <Download className="w-5 h-5" />
                            </button>

                            <button
                                onClick={handlePrint}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Imprimer"
                            >
                                <Printer className="w-5 h-5" />
                            </button>

                            {permissions?.canEdit && (
                                <button
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Modifier"
                                >
                                    <Edit className="w-5 h-5" />
                                </button>
                            )}

                            {permissions?.canDelete && (
                                <button
                                    onClick={handleDelete}
                                    className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                                    title="Supprimer"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Validation Actions - DG Only */}
                    {permissions?.canValidate && report.status === 'soumis' && (
                        <div className="mt-4 flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-blue-600" />
                            <p className="flex-1 text-sm text-blue-900 font-medium">
                                Ce rapport est en attente de validation
                            </p>
                            <button
                                onClick={() => handleValidate('valide')}
                                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Valider
                            </button>
                            <button
                                onClick={() => handleValidate('rejete')}
                                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                            >
                                <XCircle className="w-4 h-4 mr-2" />
                                Rejeter
                            </button>
                        </div>
                    )}

                    {/* Rejection Reason */}
                    {report.status === 'rejete' && report.rejection_reason && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm font-semibold text-red-900 mb-1">
                                Raison du rejet:
                            </p>
                            <p className="text-sm text-red-700">{report.rejection_reason}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* A4 Preview - Col 2/3 */}
                    <div className="lg:col-span-2">
                        <div
                            ref={printRef}
                            className="bg-white shadow-2xl"
                            style={{
                                width: '210mm',
                                minHeight: '297mm',
                                margin: '0 auto',
                                padding: '20mm',
                            }}
                        >
                            {/* HEADER - Logo + Info */}
                            <div className="border-b-4 border-cyan-600 pb-6 mb-6">
                                <div className="flex items-start justify-between">
                                    {/* Logo */}
                                    <div className="flex-1">
                                        <div className="text-cyan-600 font-bold text-3xl mb-2">
                                            <img src={branding.logo} alt="BATEX-CI Logo" className="w-66 h-16" />
                                        </div>
                                        <p className="text-sm text-gray-600">

                                            Bakary CISSE Textile | Commerce et Industrie
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Bamako, Mali
                                        </p>
                                    </div>

                                    {/* Document Info */}
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500 mb-1">
                                            RAPPORT N° {report.id}
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            {new Date().toLocaleDateString('fr-FR', {
                                                day: '2-digit',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* TITLE */}
                            <div className="mb-8">
                                <h1 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                                    RAPPORT DE PRODUCTION
                                </h1>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center">
                                        <Building2 className="w-4 h-4 mr-2 text-gray-500" />
                                        <span className="font-semibold">Département:</span>
                                        <span className="ml-2">{report.department_name}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <User className="w-4 h-4 mr-2 text-gray-500" />
                                        <span className="font-semibold">Auteur:</span>
                                        <span className="ml-2">{report.author_name}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                                        <span className="font-semibold">Période:</span>
                                        <span className="ml-2">
                      {new Date(report.period_start).toLocaleDateString()} -{' '}
                                            {new Date(report.period_end).toLocaleDateString()}
                    </span>
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="w-4 h-4 mr-2 text-gray-500" />
                                        <span className="font-semibold">Statut:</span>
                                        <span
                                            className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold ${
                                                statusColors[report.status]
                                            }`}
                                        >
                      {report.status}
                    </span>
                                    </div>
                                </div>
                            </div>

                            {/* CONTENT */}
                            <div className="mb-8">
                                <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b">
                                    Données de Production
                                </h2>

                                {/* Render report data */}
                                <div className="prose max-w-none">
                                    {typeof report.data === 'object' ? (
                                        <div className="space-y-4">
                                            {Object.entries(report.data).map(([key, value]) => (
                                                <div key={key} className="flex justify-between py-2 border-b">
                                                      <span className="font-medium text-gray-700">
                                                        {key.replace(/_/g, ' ').toUpperCase()}:
                                                      </span>
                                                        <span className="text-gray-900">
                                                        {typeof value === 'object'
                                                            ? JSON.stringify(value)
                                                            : value}
                                                      </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-700">{report.data}</p>
                                    )}
                                </div>
                            </div>

                            {/* SIGNATURES */}
                            <div className="mt-12 pt-8 border-t">
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <p className="text-sm font-semibold mb-8">Établi par:</p>
                                        <div className="border-t border-gray-400 pt-2">
                                            <p className="text-sm">{report.author_name}</p>
                                            <p className="text-xs text-gray-600">
                                                {new Date(report.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold mb-8">Approuvé par:</p>
                                        <div className="border-t border-gray-400 pt-2">
                                            {report.validator_name ? (
                                                <>
                                                    <p className="text-sm">{report.validator_name}</p>
                                                    <p className="text-xs text-gray-600">
                                                        {new Date(report.validated_at).toLocaleDateString()}
                                                    </p>
                                                </>
                                            ) : (
                                                <p className="text-sm text-gray-400">En attente</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* FOOTER */}
                            <div className="mt-8 pt-4 border-t text-center text-xs text-gray-500">
                                <p>BATEX-CI • Société de Textile et Confection</p>
                                <p>Bamako, Mali • Tel: +223 20 21 35 55 | 20 21 38 58</p>
                                <p>Capital social : 1 500 000 000 FCFA</p>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Comments & Info - Col 1/3 */}
                    <div className="lg:col-span-1 print:hidden">
                        <div className="space-y-6">
                            {/* Info Card */}
                            <div className="bg-white rounded-xl border p-6">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                                    <FileText className="w-5 h-5 mr-2 text-cyan-600" />
                                    Informations
                                </h3>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <span className="text-gray-600">Visibilité:</span>
                                        <span className="ml-2 font-medium capitalize">
                      {report.visibility}
                    </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Créé le:</span>
                                        <span className="ml-2 font-medium">
                      {new Date(report.created_at).toLocaleDateString()}
                    </span>
                                    </div>
                                    {report.submitted_at && (
                                        <div>
                                            <span className="text-gray-600">Soumis le:</span>
                                            <span className="ml-2 font-medium">
                        {new Date(report.submitted_at).toLocaleDateString()}
                      </span>
                                        </div>
                                    )}
                                    {report.validated_at && (
                                        <div>
                                            <span className="text-gray-600">Validé le:</span>
                                            <span className="ml-2 font-medium">
                        {new Date(report.validated_at).toLocaleDateString()}
                      </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Comments */}
                            <div className="bg-white rounded-xl border p-6">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                                    <MessageSquare className="w-5 h-5 mr-2 text-cyan-600" />
                                    Commentaires ({comments.length})
                                </h3>

                                {/* Comment List */}
                                <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                                    {comments.length === 0 ? (
                                        <p className="text-sm text-gray-500 text-center py-4">
                                            Aucun commentaire
                                        </p>
                                    ) : (
                                        comments.map((comment) => (
                                            <div key={comment.id} className="border-b pb-3">
                                                <div className="flex items-start space-x-2">
                                                    <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-700 font-semibold text-sm">
                                                        {comment.user_name?.charAt(0)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {comment.user_name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {new Date(comment.created_at).toLocaleString()}
                                                        </p>
                                                        <p className="text-sm text-gray-700 mt-1">
                                                            {comment.content || comment.comment}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Add Comment */}
                                {permissions?.canRead && (
                                    <div className="space-y-2">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Ajouter un commentaire..."
                        rows={3}
                        className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-cyan-500"
                    />
                                        <button
                                            onClick={handleAddComment}
                                            disabled={!newComment.trim()}
                                            className="w-full inline-flex items-center justify-center px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Send className="w-4 h-4 mr-2" />
                                            Envoyer
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Validation Modal */}
            {showValidationModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6">
                        <h3 className="text-xl font-bold mb-4">
                            {validationData.status === 'valide' ? 'Valider' : 'Rejeter'} le Rapport
                        </h3>

                        <textarea
                            value={validationData.comments}
                            onChange={(e) =>
                                setValidationData({ ...validationData, comments: e.target.value })
                            }
                            rows={4}
                            placeholder={
                                validationData.status === 'valide'
                                    ? 'Commentaires (optionnel)'
                                    : 'Raison du rejet (requis)'
                            }
                            className="w-full border rounded-lg p-3 mb-4"
                            required={validationData.status === 'rejete'}
                        />

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowValidationModal(false)}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={submitValidation}
                                disabled={
                                    validationData.status === 'rejete' && !validationData.comments.trim()
                                }
                                className={`px-4 py-2 text-white rounded-lg ${
                                    validationData.status === 'valide'
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-red-600 hover:bg-red-700'
                                } disabled:opacity-50`}
                            >
                                {validationData.status === 'valide' ? 'Valider' : 'Rejeter'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Print Styles */}
            <style jsx>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
        </div>
    );
}