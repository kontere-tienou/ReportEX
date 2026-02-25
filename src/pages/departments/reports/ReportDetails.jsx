import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { reportService } from '../../../services/api.js';
import { useAuth } from '../../../context/AuthContext';
import { useToast, ToastContainer } from '../../../components/ui/Toast';
import {
    ArrowLeft, Calendar, User, Eye, Edit2, Trash2,
    Send, CheckCircle, XCircle, Clock, AlertCircle, FileText,
    MessageSquare, Activity, Download, Share2, Printer
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

    // NEW: commentaires / lecteurs / annotations
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [commentsLoading, setCommentsLoading] = useState(false);

    const [readers, setReaders] = useState([]);
    const [readersLoading, setReadersLoading] = useState(false);

    const [annotations, setAnnotations] = useState([]);
    const [selectedText, setSelectedText] = useState('');
    const [selectionRange, setSelectionRange] = useState(null);
    const [annotationComment, setAnnotationComment] = useState('');
    const [showAnnotationBox, setShowAnnotationBox] = useState(false);

    const roleLower = (user?.role || '').toLowerCase();
    const canAnnotate = ['dg', 'direction', 'admin', 'validateur'].includes(roleLower);

    useEffect(() => {
        loadReport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    useEffect(() => {
        if (!report?.id) return;
        markAsRead();
        loadComments();
        loadReaders();
        setAnnotations(Array.isArray(report.annotations) ? report.annotations : []);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [report?.id]);

    const loadReport = async () => {
        try {
            setLoading(true);
            const res = await reportService.getReportDetails(id);
            setReport(res.data?.report || null);
        } catch (error) {
            console.error('Erreur chargement rapport:', error);
            addToast(error.response?.data?.message || 'Erreur lors du chargement du rapport', 'error');
            navigate('/reports');
        } finally {
            setLoading(false);
        }
    };

    const loadComments = async () => {
        try {
            setCommentsLoading(true);
            const res = await reportService.getReportComments(id);
            setComments(res.data?.comments || []);
        } catch (error) {
            console.error('Erreur chargement commentaires:', error);
        } finally {
            setCommentsLoading(false);
        }
    };

    const loadReaders = async () => {
        try {
            setReadersLoading(true);
            const res = await reportService.getReportReaders(id);
            setReaders(res.data?.readers || []);
        } catch (error) {
            console.error('Erreur chargement lecteurs:', error);
        } finally {
            setReadersLoading(false);
        }
    };

    const markAsRead = async () => {
        try {
            await reportService.markReportAsRead(id);
        } catch (error) {
            console.error('Erreur marquage lecture:', error);
        }
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            await reportService.submitReport(id);
            addToast('Rapport soumis pour validation', 'success');
            await loadReport();
        } catch (error) {
            addToast(error.response?.data?.message || 'Erreur lors de la soumission', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleValidate = async () => {
        if (!validationComments.trim() && validationStatus === 'rejete') {
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
                validationStatus === 'valide'
                    ? 'Rapport validé avec succès'
                    : 'Rapport rejeté',
                validationStatus === 'valide' ? 'success' : 'warning'
            );

            setShowValidateModal(false);
            setValidationComments('');
            setValidationStatus('valide');
            await loadReport();
        } catch (error) {
            addToast(error.response?.data?.message || 'Erreur lors de la validation', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) return;

        try {
            await reportService.deleteReport(id);
            addToast('Rapport supprimé', 'success');
            navigate('/reports');
        } catch (error) {
            addToast(error.response?.data?.message || 'Erreur lors de la suppression', 'error');
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        try {
            await reportService.addReportComment(id, { content: newComment.trim() });
            setNewComment('');
            addToast('Commentaire ajouté', 'success');
            await loadComments();
        } catch (error) {
            addToast(error.response?.data?.message || 'Erreur ajout commentaire', 'error');
        }
    };

    const handleTextSelection = () => {
        if (!canAnnotate) return;

        const selection = window.getSelection();
        const text = selection?.toString()?.trim();

        if (!text) {
            setShowAnnotationBox(false);
            return;
        }

        setSelectedText(text);
        setSelectionRange({
            text,
            anchorOffset: selection.anchorOffset,
            focusOffset: selection.focusOffset,
        });
        setShowAnnotationBox(true);
    };

    const handleAddAnnotation = async (decision = null) => {
        if (!selectedText.trim()) return;

        try {
            await reportService.addReportAnnotation(id, {
                selected_text: selectedText,
                comment: annotationComment.trim() || null,
                decision, // null | 'valide' | 'rejete'
                range_meta: selectionRange,
            });

            addToast('Annotation enregistrée', 'success');
            setSelectedText('');
            setAnnotationComment('');
            setSelectionRange(null);
            setShowAnnotationBox(false);
            await loadReport();
        } catch (error) {
            addToast(error.response?.data?.message || 'Erreur annotation', 'error');
        }
    };

    const handleExportPdf = async () => {
        try {
            const res = await reportService.exportReportPdf(id);
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `rapport-${id}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
            addToast('Erreur export PDF', 'error');
        }
    };

    const handlePrint = () => {
        window.print();
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

    // Parse report.data sécurisé
    const reportData = useMemo(() => {
        if (!report) return {};
        try {
            if (typeof report.data === 'string') {
                return JSON.parse(report.data);
            }
            return report.data || {};
        } catch (e) {
            return { contenu_brut: report.data };
        }
    }, [report]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
            </div>
        );
    }

    if (!report) {
        return <div className="p-6">Rapport non trouvé</div>;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            {/* Header */}
            <div className="flex items-center justify-between print:hidden">
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
                            Valider / Rejeter
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

                    <button
                        onClick={handleExportPdf}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        title="Exporter PDF"
                    >
                        <Download className="w-5 h-5" />
                    </button>

                    <button
                        onClick={handlePrint}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        title="Imprimer"
                    >
                        <Printer className="w-5 h-5" />
                    </button>

                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50" title="Partager">
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
                                <h2 className="text-xl font-bold text-gray-900">{report.department_name || 'Département'}</h2>
                                <p className="text-sm text-gray-600">
                                    Département {report.department_code || '-'}
                                </p>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Période</p>
                                <div className="flex items-center text-gray-900">
                                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                    <span className="font-medium">
                                        {report.period_start ? new Date(report.period_start).toLocaleDateString() : '-'} - {report.period_end ? new Date(report.period_end).toLocaleDateString() : '-'}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-gray-600 mb-1">Visibilité</p>
                                <div className="flex items-center text-gray-900">
                                    <Eye className="w-4 h-4 mr-2 text-gray-400" />
                                    <span className="font-medium capitalize">{report.visibility || '-'}</span>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-gray-600 mb-1">Créé par</p>
                                <div className="flex items-center text-gray-900">
                                    <User className="w-4 h-4 mr-2 text-gray-400" />
                                    <span className="font-medium">{report.author_name || '-'}</span>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-gray-600 mb-1">Créé le</p>
                                <div className="flex items-center text-gray-900">
                                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                    <span className="font-medium">
                                        {report.created_at ? new Date(report.created_at).toLocaleDateString() : '-'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {report.validated_by && (
                            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-sm text-green-800">
                                    <strong>Validé par:</strong> {report.validator_name || '-'}
                                    <br />
                                    <strong>Le:</strong> {report.validated_at ? new Date(report.validated_at).toLocaleString() : '-'}
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

                    {/* Aperçu papier */}
                    <div className="bg-gray-100 rounded-xl border p-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Aperçu du Rapport (papier)</h3>

                        <div className="flex justify-center">
                            <div
                                className="bg-white shadow-xl border w-full max-w-4xl min-h-[900px] p-10 print:shadow-none print:border-0"
                                onMouseUp={handleTextSelection}
                            >
                                <div className="border-b pb-4 mb-6">
                                    <h2 className="text-2xl font-bold text-center text-gray-900">
                                        RAPPORT DÉPARTEMENTAL
                                    </h2>
                                    <p className="text-center text-sm text-gray-500 mt-1">
                                        Rapport #{report.id} — {report.department_name} ({report.department_code})
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-8">
                                    <p>
                                        <span className="font-semibold">Période :</span>{' '}
                                        {report.period_start ? new Date(report.period_start).toLocaleDateString() : '-'} - {report.period_end ? new Date(report.period_end).toLocaleDateString() : '-'}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Auteur :</span> {report.author_name || '-'}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Statut :</span> {report.status || '-'}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Visibilité :</span> {report.visibility || '-'}
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    {Object.entries(reportData || {}).map(([key, value]) => (
                                        <div key={key}>
                                            <h4 className="font-bold text-gray-800 mb-2 uppercase tracking-wide text-sm">
                                                {String(key).replace(/_/g, ' ')}
                                            </h4>
                                            <div className="text-gray-900 whitespace-pre-wrap leading-7 border-l-4 border-gray-200 pl-4">
                                                {typeof value === 'object'
                                                    ? JSON.stringify(value, null, 2)
                                                    : (value ?? '—')}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {annotations?.length > 0 && (
                                    <div className="mt-10 pt-6 border-t">
                                        <h4 className="font-bold text-gray-900 mb-4">Annotations</h4>
                                        <div className="space-y-3">
                                            {annotations.map((ann, index) => (
                                                <div
                                                    key={ann.id || index}
                                                    className={`p-3 rounded-lg border ${
                                                        ann.decision === 'rejete'
                                                            ? 'bg-red-50 border-red-200'
                                                            : ann.decision === 'valide'
                                                                ? 'bg-green-50 border-green-200'
                                                                : 'bg-yellow-50 border-yellow-200'
                                                    }`}
                                                >
                                                    <p className="text-sm font-semibold text-gray-800">
                                                        {ann.user_name || 'Utilisateur'} {ann.decision ? `• ${ann.decision}` : ''}
                                                    </p>
                                                    <p className="text-sm text-gray-700 italic mt-1">
                                                        “{ann.selected_text}”
                                                    </p>
                                                    {ann.comment && (
                                                        <p className="text-sm text-gray-800 mt-2">{ann.comment}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {showAnnotationBox && canAnnotate && (
                            <div className="mt-4 p-4 bg-white border rounded-lg shadow-sm">
                                <p className="text-sm font-medium text-gray-700 mb-2">Texte sélectionné :</p>
                                <p className="text-sm italic text-gray-900 bg-gray-50 p-2 rounded border">
                                    "{selectedText}"
                                </p>

                                <textarea
                                    rows={3}
                                    value={annotationComment}
                                    onChange={(e) => setAnnotationComment(e.target.value)}
                                    placeholder="Commentaire / consigne sur ce passage..."
                                    className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                                />

                                <div className="flex flex-wrap gap-2 mt-3">
                                    <button
                                        onClick={() => handleAddAnnotation(null)}
                                        className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm"
                                    >
                                        Ajouter commentaire
                                    </button>
                                    <button
                                        onClick={() => handleAddAnnotation('valide')}
                                        className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm"
                                    >
                                        Marquer “Valide”
                                    </button>
                                    <button
                                        onClick={() => handleAddAnnotation('rejete')}
                                        className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm"
                                    >
                                        Marquer “Rejeté”
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowAnnotationBox(false);
                                            setSelectedText('');
                                            setAnnotationComment('');
                                        }}
                                        className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm"
                                    >
                                        Annuler
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Historique de validation */}
                    {Array.isArray(report.validations) && report.validations.length > 0 && (
                        <div className="bg-white rounded-xl border p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <MessageSquare className="w-5 h-5 mr-2 text-cyan-600" />
                                Historique de Validation
                            </h3>

                            <div className="space-y-4">
                                {report.validations.map((validation, idx) => (
                                    <div key={idx} className="border-l-4 border-cyan-500 pl-4 py-2">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="font-semibold text-gray-900">{validation.validator_name || '-'}</p>
                                            <span
                                                className={`text-xs font-medium px-2 py-1 rounded ${
                                                    validation.status === 'valide'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}
                                            >
                                                {validation.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">{validation.comments || '-'}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {validation.created_at ? new Date(validation.created_at).toLocaleString() : '-'}
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
                            <button
                                onClick={handleExportPdf}
                                className="w-full text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors flex items-center"
                            >
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

                    {/* Commentaires */}
                    <div className="bg-white rounded-xl border p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <MessageSquare className="w-5 h-5 mr-2 text-cyan-600" />
                            Commentaires
                        </h3>

                        <div className="space-y-3 max-h-80 overflow-y-auto mb-4">
                            {commentsLoading ? (
                                <p className="text-sm text-gray-500">Chargement...</p>
                            ) : comments.length === 0 ? (
                                <p className="text-sm text-gray-500">Aucun commentaire</p>
                            ) : (
                                comments.map((c) => (
                                    <div key={c.id} className="p-3 rounded-lg bg-gray-50 border">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-semibold text-gray-900">{c.user_name || 'Utilisateur'}</p>
                                            <p className="text-xs text-gray-400">
                                                {c.created_at ? new Date(c.created_at).toLocaleString() : ''}
                                            </p>
                                        </div>
                                        <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{c.content}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="space-y-2">
                            <textarea
                                rows={3}
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Ajouter un commentaire..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                            />
                            <button
                                onClick={handleAddComment}
                                className="w-full px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
                            >
                                Publier commentaire
                            </button>
                        </div>
                    </div>

                    {/* Lecteurs */}
                    <div className="bg-white rounded-xl border p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <Eye className="w-5 h-5 mr-2 text-cyan-600" />
                            Lecteurs du rapport
                        </h3>

                        {readersLoading ? (
                            <p className="text-sm text-gray-500">Chargement...</p>
                        ) : readers.length === 0 ? (
                            <p className="text-sm text-gray-500">Aucune lecture enregistrée</p>
                        ) : (
                            <div className="space-y-3">
                                {readers.map((r, idx) => (
                                    <div
                                        key={r.id || `${r.user_id}-${r.read_at || idx}`}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{r.full_name || r.user_name || '-'}</p>
                                            <p className="text-xs text-gray-500">{r.department_name || '-'}</p>
                                        </div>
                                        <p className="text-xs text-gray-400">
                                            {r.read_at ? new Date(r.read_at).toLocaleString() : '-'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Activité récente */}
                    {Array.isArray(report.activities) && report.activities.length > 0 && (
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
                                            <p className="text-sm font-medium text-gray-900">
                                                {String(activity.action || '').replace('_', ' ')}
                                            </p>
                                            <p className="text-xs text-gray-600">{activity.user_name || '-'}</p>
                                            <p className="text-xs text-gray-400">
                                                {activity.created_at ? new Date(activity.created_at).toLocaleString() : '-'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Validation */}
            {showValidateModal && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 print:hidden">
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
                                    validationStatus === 'valide'
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-red-600 hover:bg-red-700'
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