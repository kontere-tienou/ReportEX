import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { reportService, reportAccessService } from "../../../services/api.js";
import { useAuth } from "../../../context/AuthContext";
import { useToast, ToastContainer } from "../../../components/ui/Toast";
import { getTemplateForDepartment } from "../../../config/reportTemplates";
import {
    ArrowLeft,
    Calendar,
    User,
    Eye,
    Edit2,
    Trash2,
    Send,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    FileText,
    MessageSquare,
    Download,
    Printer,
    Lock,
    Shield,
} from "lucide-react";

/**
 * ==========================================
 * REPORT DETAILS - WITH STRICT ACCESS CONTROL
 * ==========================================
 */

const ReportDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toasts, addToast, removeToast } = useToast();

    const [report, setReport] = useState(null);
    const [permissions, setPermissions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [accessDenied, setAccessDenied] = useState(false);
    const [needsAccessRequest, setNeedsAccessRequest] = useState(false);

    // Access request state
    const [showAccessModal, setShowAccessModal] = useState(false);
    const [accessReason, setAccessReason] = useState("");
    const [requestingAccess, setRequestingAccess] = useState(false);

    // Validation modal
    const [showValidateModal, setShowValidateModal] = useState(false);
    const [validationStatus, setValidationStatus] = useState("valide");
    const [validationComments, setValidationComments] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Comments
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");

    // Readers
    const [readers, setReaders] = useState([]);

    // Annotations
    const [annotations, setAnnotations] = useState([]);

    // Check if user can access report
    const checkAccess = (reportData) => {
        if (!reportData || !user) return false;

        const isOwner = reportData.user_id === user.id;
        const isDG = ["DG", "ADMIN"].includes(user?.role?.toUpperCase());
        const sameDept = reportData.department_id === user.department_id;
        const isPublic = reportData.visibility === "public";
        const isDepartment = reportData.visibility === "department";
        const isPrivate = reportData.visibility === "private";

        // Owner and DG can always access
        if (isOwner || isDG) return true;

        // Public reports accessible to all
        if (isPublic) return true;

        // Department reports accessible to same department
        if (isDepartment && sameDept) return true;

        // Private reports - need to request access
        if (isPrivate) {
            // Check if access has been granted (this should be in permissions from backend)
            return false;
        }

        return false;
    };

    // Load report
    const loadReport = async () => {
        try {
            setLoading(true);
            const res = await reportService.getReportDetails(id);

            const reportData = res.data?.report || res.data?.data?.report || null;
            const perms = res.data?.permissions || res.data?.data?.permissions || null;

            // Check if user can access this report
            const canAccess = checkAccess(reportData);

            if (!canAccess && !perms?.canRead) {
                // Check if it's a private report that needs access request
                if (reportData?.visibility === "private") {
                    setNeedsAccessRequest(true);
                    setReport(reportData); // Set minimal report data for display
                    setLoading(false);
                    return;
                } else {
                    // Complete access denied
                    setAccessDenied(true);
                    setLoading(false);
                    return;
                }
            }

            setReport(reportData);
            setPermissions(perms);

            if (reportData?.annotations) {
                setAnnotations(
                    Array.isArray(reportData.annotations) ? reportData.annotations : []
                );
            }
        } catch (error) {
            console.error("Erreur chargement rapport:", error);

            // Handle 403 Forbidden
            if (error.response?.status === 403) {
                const errorData = error.response?.data;

                if (errorData?.needsAccessRequest) {
                    setNeedsAccessRequest(true);
                    // Try to get minimal report info
                    setReport({ id });
                } else {
                    setAccessDenied(true);
                }
                setLoading(false);
                return;
            }

            addToast(
                error.response?.data?.message || "Erreur lors du chargement du rapport",
                "error"
            );
            navigate("/reports");
        } finally {
            setLoading(false);
        }
    };

    const loadComments = async () => {
        try {
            const res = await reportService.getReportComments(id);
            setComments(res.data?.comments || res.data?.data?.comments || []);
        } catch (error) {
            console.error("Erreur chargement commentaires:", error);
        }
    };

    const loadReaders = async () => {
        try {
            const res = await reportService.getReportReaders(id);
            setReaders(res.data?.readers || res.data?.data?.readers || []);
        } catch (error) {
            console.error("Erreur chargement lecteurs:", error);
        }
    };

    const markAsRead = async () => {
        try {
            await reportService.markReportAsRead(id);
        } catch (error) {
            console.error("Erreur marquage lecture:", error);
        }
    };

    useEffect(() => {
        loadReport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    useEffect(() => {
        if (!report?.id || !permissions?.canRead) return;

        markAsRead();
        loadComments();
        loadReaders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [report?.id, permissions?.canRead]);

    // Request access
    const handleRequestAccess = async () => {
        if (!accessReason.trim()) {
            addToast("Veuillez indiquer la raison de votre demande", "warning");
            return;
        }

        setRequestingAccess(true);

        try {
            await reportAccessService.requestAccess(id, accessReason.trim());
            addToast(
                "Demande d'accès envoyée avec succès. Vous serez notifié une fois traitée.",
                "success"
            );
            setShowAccessModal(false);
            setAccessReason("");

            // Redirect back to reports after 2 seconds
            setTimeout(() => {
                navigate("/reports");
            }, 2000);
        } catch (error) {
            addToast(
                error.response?.data?.message || "Erreur lors de la demande d'accès",
                "error"
            );
        } finally {
            setRequestingAccess(false);
        }
    };

    // Submit report
    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            await reportService.submitReport(id);
            addToast("Rapport soumis pour validation", "success");
            await loadReport();
        } catch (error) {
            addToast(
                error.response?.data?.message || "Erreur lors de la soumission",
                "error"
            );
        } finally {
            setSubmitting(false);
        }
    };

    // Validate report
    const handleValidate = async () => {
        if (!validationComments.trim() && validationStatus === "rejete") {
            addToast("Veuillez indiquer la raison du rejet", "warning");
            return;
        }

        try {
            setSubmitting(true);
            await reportService.validateReport(id, {
                status: validationStatus,
                comments: validationComments,
            });

            addToast(
                validationStatus === "valide"
                    ? "Rapport validé avec succès"
                    : "Rapport rejeté",
                validationStatus === "valide" ? "success" : "warning"
            );

            setShowValidateModal(false);
            setValidationComments("");
            setValidationStatus("valide");
            await loadReport();
        } catch (error) {
            addToast(
                error.response?.data?.message || "Erreur lors de la validation",
                "error"
            );
        } finally {
            setSubmitting(false);
        }
    };

    // Delete report
    const handleDelete = async () => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce rapport ?"))
            return;

        try {
            await reportService.deleteReport(id);
            addToast("Rapport supprimé", "success");
            navigate("/reports");
        } catch (error) {
            addToast(
                error.response?.data?.message || "Erreur lors de la suppression",
                "error"
            );
        }
    };

    // Add comment
    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        try {
            await reportService.addReportComment(id, { content: newComment.trim() });
            setNewComment("");
            addToast("Commentaire ajouté", "success");
            await loadComments();
        } catch (error) {
            addToast(
                error.response?.data?.message || "Erreur ajout commentaire",
                "error"
            );
        }
    };

    // Export PDF
    const handleExportPdf = async () => {
        try {
            addToast("Export PDF en cours...", "info");
            // TODO: Implement PDF export
        } catch (error) {
            addToast("Erreur export PDF", "error");
        }
    };

    // Status badge
    const getStatusBadge = (status) => {
        const badges = {
            brouillon: {
                bg: "bg-gray-100",
                text: "text-gray-800",
                icon: Clock,
                label: "Brouillon",
            },
            soumis: {
                bg: "bg-blue-100",
                text: "text-blue-800",
                icon: AlertCircle,
                label: "Soumis",
            },
            valide: {
                bg: "bg-green-100",
                text: "text-green-800",
                icon: CheckCircle,
                label: "Validé",
            },
            rejete: {
                bg: "bg-red-100",
                text: "text-red-800",
                icon: XCircle,
                label: "Rejeté",
            },
        };
        const badge = badges[status] || badges.brouillon;
        const Icon = badge.icon;

        return (
            <span
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${badge.bg} ${badge.text}`}
            >
        <Icon className="w-5 h-5 mr-2" />
                {badge.label}
      </span>
        );
    };

    // Parse report data
    const reportData = useMemo(() => {
        if (!report) return {};
        try {
            if (typeof report.data === "string") {
                return JSON.parse(report.data);
            }
            return report.data || {};
        } catch (e) {
            return { contenu_brut: report.data };
        }
    }, [report]);

    // Get template for display
    const template = useMemo(() => {
        if (!report?.department_code) return null;
        return getTemplateForDepartment(report.department_code);
    }, [report]);

    // Render field value based on type
    const renderFieldValue = (field, value) => {
        if (value === null || value === undefined || value === "") {
            return <span className="text-gray-400">—</span>;
        }

        switch (field.type) {
            case "list":
                if (!Array.isArray(value) || value.length === 0) {
                    return <span className="text-gray-400">Aucun</span>;
                }
                return (
                    <ul className="list-disc list-inside space-y-1">
                        {value.map((item, idx) => (
                            <li key={idx} className="text-gray-900">
                                {item}
                            </li>
                        ))}
                    </ul>
                );

            case "grid":
                if (!Array.isArray(value) || value.length === 0) {
                    return <span className="text-gray-400">Aucune donnée</span>;
                }
                return (
                    <table className="min-w-full border border-gray-200 rounded-lg text-sm">
                        <thead className="bg-gray-50">
                        <tr>
                            {field.columns.map((col) => (
                                <th
                                    key={col.key}
                                    className="px-3 py-2 text-left text-xs font-medium text-gray-600"
                                >
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {value.map((row, idx) => (
                            <tr key={idx}>
                                {field.columns.map((col) => (
                                    <td key={col.key} className="px-3 py-2 text-gray-900">
                                        {row[col.key] || "—"}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                );

            case "number":
                if (field.calculated) {
                    return (
                        <span className="font-semibold text-cyan-700">
              {Number(value).toLocaleString()}
                            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                Calculé
              </span>
            </span>
                    );
                }
                return (
                    <span className="font-medium text-gray-900">
            {Number(value).toLocaleString()}
          </span>
                );

            case "textarea":
                return (
                    <p className="whitespace-pre-wrap text-gray-900 leading-relaxed">
                        {value}
                    </p>
                );

            default:
                return <span className="text-gray-900">{value}</span>;
        }
    };

    // Loading
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
            </div>
        );
    }

    // Access Denied - Need to request access
    if (needsAccessRequest) {
        return (
            <div className="max-w-2xl mx-auto mt-20">
                <ToastContainer toasts={toasts} removeToast={removeToast} />

                <div className="bg-white rounded-xl border p-8 text-center">
                    <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-10 h-10 text-amber-600" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Rapport Privé
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Ce rapport est privé. Vous devez demander l'autorisation à l'auteur
                        ou à la direction pour y accéder.
                    </p>

                    <div className="flex justify-center gap-3">
                        <button
                            onClick={() => setShowAccessModal(true)}
                            className="inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium"
                        >
                            <Lock className="w-5 h-5 mr-2" />
                            Demander l'Accès
                        </button>

                        <button
                            onClick={() => navigate("/reports")}
                            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                        >
                            Retour
                        </button>
                    </div>
                </div>

                {/* Access Request Modal */}
                {showAccessModal && (
                    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl max-w-lg w-full p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                Demander l'Accès au Rapport #{id}
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Raison de votre demande{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={accessReason}
                                        onChange={(e) => setAccessReason(e.target.value)}
                                        placeholder="Expliquez pourquoi vous avez besoin d'accéder à ce rapport..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <p className="text-xs text-blue-800">
                                        💡 Votre demande sera envoyée à l'auteur du rapport et à la
                                        direction. Vous recevrez une notification une fois votre
                                        demande traitée.
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => {
                                        setShowAccessModal(false);
                                        setAccessReason("");
                                    }}
                                    disabled={requestingAccess}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleRequestAccess}
                                    disabled={requestingAccess || !accessReason.trim()}
                                    className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    {requestingAccess ? "Envoi..." : "Envoyer la Demande"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Complete Access Denied
    if (accessDenied) {
        return (
            <div className="max-w-2xl mx-auto mt-20">
                <ToastContainer toasts={toasts} removeToast={removeToast} />

                <div className="bg-white rounded-xl border p-8 text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-10 h-10 text-red-600" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Accès Refusé
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Vous n'avez pas les permissions nécessaires pour consulter ce
                        rapport.
                    </p>

                    <button
                        onClick={() => navigate("/reports")}
                        className="px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-medium"
                    >
                        Retour aux rapports
                    </button>
                </div>
            </div>
        );
    }

    // Report not found
    if (!report) {
        return (
            <div className="max-w-2xl mx-auto mt-20">
                <div className="bg-white rounded-xl border p-8 text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Rapport non trouvé
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Le rapport demandé n'existe pas ou a été supprimé.
                    </p>
                    <button
                        onClick={() => navigate("/reports")}
                        className="px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-medium"
                    >
                        Retour aux rapports
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            {/* Header */}
            <div className="flex items-center justify-between print:hidden">
                <div className="flex items-center space-x-4">
                    <Link
                        to="reports"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Rapport #{report.id}
                        </h1>
                        <p className="text-gray-600 mt-1">{report.department_name}</p>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    {permissions?.canSubmit && (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="inline-flex items-center px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
                        >
                            <Send className="w-4 h-4 mr-2" />
                            Soumettre
                        </button>
                    )}

                    {permissions?.canValidate && (
                        <button
                            onClick={() => setShowValidateModal(true)}
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Valider / Rejeter
                        </button>
                    )}

                    {permissions?.canEdit && (
                        <button
                            onClick={() => navigate(`/reports/${id}/edit`)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Modifier
                        </button>
                    )}

                    {permissions?.canDelete && (
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
                        onClick={() => window.print()}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        title="Imprimer"
                    >
                        <Printer className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Status Banner */}
            <div className="bg-white rounded-xl border p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-16 h-16 rounded-full bg-cyan-100 flex items-center justify-center text-2xl">
                                📊
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {report.department_name}
                                </h2>
                                <p className="text-sm text-gray-600">
                                    Code: {report.department_code}
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
                    {new Date(report.period_start).toLocaleDateString()} -{" "}
                                        {new Date(report.period_end).toLocaleDateString()}
                  </span>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-gray-600 mb-1">Visibilité</p>
                                <div className="flex items-center text-gray-900">
                                    <Eye className="w-4 h-4 mr-2 text-gray-400" />
                                    <span className="font-medium capitalize">
                    {report.visibility}
                  </span>
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
                                    <span className="font-medium">
                    {new Date(report.created_at).toLocaleDateString()}
                  </span>
                                </div>
                            </div>
                        </div>

                        {report.validated_by && (
                            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-sm text-green-800">
                                    <strong>Validé par:</strong> {report.validator_name}
                                    <br />
                                    <strong>Le:</strong>{" "}
                                    {new Date(report.validated_at).toLocaleString()}
                                </p>
                            </div>
                        )}

                        {report.status === "rejete" && report.rejection_reason && (
                            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-800">
                                    <strong>Raison du rejet:</strong>
                                    <br />
                                    {report.rejection_reason}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Report Data with Template */}
                    <div className="bg-white rounded-xl border p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                            Données du Rapport
                        </h3>

                        {template ? (
                            <div className="space-y-6">
                                {template.fields.map((field) => {
                                    const value = reportData[field.key];

                                    return (
                                        <div
                                            key={field.key}
                                            className="border-l-4 border-cyan-500 pl-4"
                                        >
                                            <h4 className="font-semibold text-gray-800 mb-2">
                                                {field.label}
                                                {field.calculated && (
                                                    <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            Auto-calculé
                          </span>
                                                )}
                                            </h4>
                                            <div className="text-sm">{renderFieldValue(field, value)}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            // Fallback if no template
                            <div className="space-y-4">
                                {Object.entries(reportData).map(([key, value]) => (
                                    <div key={key} className="border-l-4 border-gray-300 pl-4">
                                        <h4 className="font-semibold text-gray-800 mb-2 uppercase text-sm">
                                            {String(key).replace(/_/g, " ")}
                                        </h4>
                                        <div className="text-sm text-gray-900 whitespace-pre-wrap">
                                            {typeof value === "object"
                                                ? JSON.stringify(value, null, 2)
                                                : (value ?? "—")}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Annotations (DG only) */}
                    {annotations?.length > 0 && (
                        <div className="bg-white rounded-xl border p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">
                                Annotations (Direction)
                            </h3>

                            <div className="space-y-3">
                                {annotations.map((ann, index) => (
                                    <div
                                        key={ann.id || index}
                                        className={`p-4 rounded-lg border ${
                                            ann.decision === "rejete"
                                                ? "bg-red-50 border-red-200"
                                                : ann.decision === "valide"
                                                    ? "bg-green-50 border-green-200"
                                                    : "bg-yellow-50 border-yellow-200"
                                        }`}
                                    >
                                        <p className="text-sm font-semibold text-gray-800">
                                            {ann.user_name || "Utilisateur"}
                                            {ann.decision && (
                                                <span className="ml-2 text-xs">• {ann.decision}</span>
                                            )}
                                        </p>
                                        <p className="text-sm text-gray-700 italic mt-1">
                                            "{ann.selected_text}"
                                        </p>
                                        {ann.comment && (
                                            <p className="text-sm text-gray-800 mt-2">{ann.comment}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Validation History */}
                    {Array.isArray(report.validations) &&
                        report.validations.length > 0 && (
                            <div className="bg-white rounded-xl border p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                    <MessageSquare className="w-5 h-5 mr-2 text-cyan-600" />
                                    Historique de Validation
                                </h3>

                                <div className="space-y-4">
                                    {report.validations.map((validation, idx) => (
                                        <div
                                            key={idx}
                                            className="border-l-4 border-cyan-500 pl-4 py-2"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="font-semibold text-gray-900">
                                                    {validation.validator_name}
                                                </p>
                                                <span
                                                    className={`text-xs font-medium px-2 py-1 rounded ${
                                                        validation.status === "valide"
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                    }`}
                                                >
                          {validation.status}
                        </span>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                {validation.comments || "—"}
                                            </p>
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
                    {/* Comments */}
                    <div className="bg-white rounded-xl border p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <MessageSquare className="w-5 h-5 mr-2 text-cyan-600" />
                            Commentaires
                        </h3>

                        <div className="space-y-3 max-h-80 overflow-y-auto mb-4">
                            {comments.length === 0 ? (
                                <p className="text-sm text-gray-500">Aucun commentaire</p>
                            ) : (
                                comments.map((c) => (
                                    <div key={c.id} className="p-3 rounded-lg bg-gray-50 border">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-semibold text-gray-900">
                                                {c.user_name || "Utilisateur"}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {new Date(c.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                                            {c.content}
                                        </p>
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
                                Publier
                            </button>
                        </div>
                    </div>

                    {/* Readers */}
                    <div className="bg-white rounded-xl border p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <Eye className="w-5 h-5 mr-2 text-cyan-600" />
                            Lecteurs
                        </h3>

                        {readers.length === 0 ? (
                            <p className="text-sm text-gray-500">Aucune lecture</p>
                        ) : (
                            <div className="space-y-3">
                                {readers.map((r, idx) => (
                                    <div
                                        key={r.id || idx}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {r.full_name || r.user_name}
                                            </p>
                                            <p className="text-xs text-gray-500">{r.department_name}</p>
                                        </div>
                                        <p className="text-xs text-gray-400">
                                            {new Date(r.read_at).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Validation Modal */}
            {showValidateModal && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            Valider le Rapport
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Décision
                                </label>
                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => setValidationStatus("valide")}
                                        className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                                            validationStatus === "valide"
                                                ? "border-green-500 bg-green-50 text-green-900"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                    >
                                        <CheckCircle className="w-5 h-5 mx-auto mb-1" />
                                        <span className="text-sm font-medium">Valider</span>
                                    </button>

                                    <button
                                        onClick={() => setValidationStatus("rejete")}
                                        className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                                            validationStatus === "rejete"
                                                ? "border-red-500 bg-red-50 text-red-900"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                    >
                                        <XCircle className="w-5 h-5 mx-auto mb-1" />
                                        <span className="text-sm font-medium">Rejeter</span>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Commentaires{" "}
                                    {validationStatus === "rejete" && (
                                        <span className="text-red-500">*</span>
                                    )}
                                </label>
                                <textarea
                                    rows={4}
                                    value={validationComments}
                                    onChange={(e) => setValidationComments(e.target.value)}
                                    placeholder={
                                        validationStatus === "valide"
                                            ? "Commentaires optionnels..."
                                            : "Veuillez indiquer la raison du rejet..."
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
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
                                    validationStatus === "valide"
                                        ? "bg-green-600 hover:bg-green-700"
                                        : "bg-red-600 hover:bg-red-700"
                                }`}
                            >
                                {submitting ? "Traitement..." : "Confirmer"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportDetails;