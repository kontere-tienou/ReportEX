import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
    ArrowLeft, Download, Printer, CheckCircle, XCircle,
    MessageSquare, Lock, Send, AlertCircle, FileText,
    Calendar, User, Building2, Clock, Edit, Trash2, Globe, Eye,
} from 'lucide-react';
import { reportAccessService, reportService } from '../../../services/reportApi.js';
import {Alert, Popover, ToastContainer, useToast} from '../../../components/ui/index.js';
import { branding } from '../../../config/brandingConstant.js';
import CustomReportRenderer from "./builder/customReportRender.jsx";

/* ─── Helpers ─── */
const fmtDate = (d) => d
    ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d))
    : '—';

const fmtDateLong = (d) => d
    ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(d))
    : '—';

const fmtDateTime = (d) => d
    ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d))
    : '—';

/* ─── Status config ─── */
const STATUS = {
    brouillon: { label: 'Brouillon', bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
    soumis:    { label: 'Soumis',    bg: 'bg-blue-50',   text: 'text-blue-600',  dot: 'bg-blue-400'  },
    valide:    { label: 'Validé',    bg: 'bg-emerald-50',text: 'text-emerald-600',dot: 'bg-emerald-400'},
    rejete:    { label: 'Rejeté',   bg: 'bg-rose-50',   text: 'text-rose-600',  dot: 'bg-rose-400'  },
};

function StatusBadge({ status, size = 'sm' }) {
    const s = STATUS[status] || STATUS.brouillon;
    const px = size === 'lg' ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1 text-xs';
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${px} ${s.bg} ${s.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {s.label}
        </span>
    );
}

/* ─── Shared UI ─── */
function Modal({ title, onClose, children, footer }) {
    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-800">{title}</h3>
                </div>
                <div className="px-6 py-4">{children}</div>
                {footer && <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">{footer}</div>}
            </div>
        </div>
    );
}

function Btn({ onClick, variant = 'ghost', icon: Icon, children, disabled, danger }) {
    const base = "inline-flex items-center gap-2 h-9 px-3 rounded-lg text-sm font-semibold transition-all duration-150 select-none disabled:opacity-40 disabled:cursor-not-allowed";
    const variants = {
        ghost:   "hover:bg-slate-100 text-slate-600",
        outline: "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm",
        primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm",
        danger:  "hover:bg-rose-50 text-rose-500",
        success: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm",
        reject:  "bg-rose-600 hover:bg-rose-700 text-white shadow-sm",
    };
    return (
        <button onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]}`}>
            {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
            {children}
        </button>
    );
}

function Textarea({ value, onChange, placeholder, rows = 3 }) {
    return (
        <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className="w-full px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-300 bg-white border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 transition-all"
        />
    );
}

function SideSection({ icon: Icon, title, children }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-50 flex items-center gap-2">
                <Icon className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <h3 className="text-sm font-bold text-slate-700">{title}</h3>
            </div>
            <div className="px-5 py-4">{children}</div>
        </div>
    );
}

function MetaRow({ label, value }) {
    return (
        <div className="flex justify-between items-start gap-4 py-2 border-b border-slate-50 last:border-0">
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">{label}</span>
            <span className="text-xs text-slate-700 font-semibold text-right">{value}</span>
        </div>
    );
}

/* ─── Loading ─── */
function LoadingScreen() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-[3px] border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-sm text-slate-400 font-medium">Chargement du rapport…</p>
            </div>
        </div>
    );
}

/* ─── Access denied ─── */
function AccessDenied({ onRequest, onBack }) {
    const [show, setShow] = useState(false);
    const [reason, setReason] = useState('');
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-10 max-w-md w-full text-center">
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-7 h-7 text-amber-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Accès restreint</h2>
                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                    Ce rapport est privé. Soumettez une demande d'accès pour le consulter.
                </p>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => setShow(true)}
                        className="w-full h-10 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors"
                    >
                        Demander l'accès
                    </button>
                    <button
                        onClick={onBack}
                        className="w-full h-10 text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors"
                    >
                        Retour
                    </button>
                </div>
            </div>

            {show && (
                <Modal
                    title="Demande d'accès"
                    onClose={() => setShow(false)}
                    footer={<>
                        <Btn variant="outline" onClick={() => setShow(false)}>Annuler</Btn>
                        <Btn variant="primary" onClick={() => { onRequest(reason); setShow(false); }} disabled={!reason.trim()}>
                            Envoyer
                        </Btn>
                    </>}
                >
                    <p className="text-sm text-slate-500 mb-3">Expliquez pourquoi vous avez besoin d'accéder à ce rapport.</p>
                    <Textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Motif de la demande…" rows={4} />
                </Modal>
            )}
        </div>
    );
}

/* ─── Comment ─── */
function Comment({ comment }) {
    const initials = (comment.user_name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    return (
        <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                {initials}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xs font-semibold text-slate-700">{comment.user_name}</span>
                    <span className="text-[10px] text-slate-300">{fmtDateTime(comment.created_at)}</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{comment.content || comment.comment}</p>
            </div>
        </div>
    );
}

/* ─── Main ─── */
export default function ReportDetails() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toasts, addToast, removeToast } = useToast();

    const [report, setReport] = useState(null);
    const [permissions, setPermissions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [validationData, setValidationData] = useState({ status: '', comments: '' });
    const [showValidationModal, setShowValidationModal] = useState(false);

    useEffect(() => {
        let mounted = true;
        loadReport(mounted);
        return () => { mounted = false; };
    }, [id]);

    const loadComments = async (reportId = id, mounted = true) => {
        try {
            const res = await reportService.getComments(reportId);
            const c = res.data?.data?.comments || res.data?.comments || [];
            if (mounted) setComments(c);
            return c;
        } catch { if (mounted) setComments([]); return []; }
    };

    const loadReport = async (mounted = true) => {
        setLoading(true);
        try {
            const res = await reportService.getById(id);
            const payload = res.data?.data || res.data || {};
            if (!mounted) return;
            setReport(payload.report || null);
            setPermissions(payload.permissions || null);
            if (payload.permissions?.canRead) {
                await Promise.all([
                    loadComments(id, mounted),
                    reportService.markAsRead(id).catch(() => null),
                ]);
            }
        } catch (err) {
            if (!mounted) return;
            if (err.response?.status === 403) {
                const extra = err.response?.data?.data || err.response?.data?.details || {};
                setReport(null);
                setPermissions({ canRead: false, needsAccessRequest: extra.needsAccessRequest ?? true });
            } else {
                setReport(null);
                addToast(err.response?.data?.message || 'Erreur de chargement', 'error', 2500);
            }
        } finally {
            if (mounted) setLoading(false);
        }
    };

    const reportPayload =
        typeof report?.data === 'string'
            ? (() => {
                try {
                    return JSON.parse(report.data);
                } catch {
                    return {};
                }
            })()
            : (report?.data || {});

    const customLayout =
        reportPayload?.renderedLayout ||
        reportPayload?.layout ||
        [];

    const hasCustomLayout =
        Array.isArray(customLayout) && customLayout.length > 0;

// Snapshot si on a déjà les données calculées
    const isSnapshotLayout =
        Array.isArray(reportPayload?.renderedLayout) &&
        reportPayload.renderedLayout.length > 0;


    const handleAddComment = async () => {
        const content = newComment.trim();
        if (!content) return;
        try {
            const res = await reportService.addComment(id, { content });
            const created = res.data?.data?.comment || res.data?.comment;
            setNewComment('');
            created ? setComments(p => [...p, created]) : await loadComments();
            addToast('Commentaire ajouté', 'success', 2000);
        } catch (err) {
            addToast(err.response?.data?.message || 'Erreur', 'error', 2500);
        }
    };

    const handleValidate = (status) => {
        setValidationData({ status, comments: '' });
        setShowValidationModal(true);
    };

    const submitValidation = async () => {
        try {
            await reportService.validate(id, validationData);
            setShowValidationModal(false);
            await loadReport();
            addToast(validationData.status === 'valide' ? 'Rapport validé !' : 'Rapport rejeté', validationData.status === 'valide' ? 'success' : 'error', 2000);
            setValidationData({ status: '', comments: '' });
        } catch (err) {
            addToast(err.response?.data?.message || 'Erreur de validation', 'error', 2500);
        }
    };

    const handleRequestAccess = async (reason) => {
        try {
            await reportAccessService.requestAccess(id, reason);
            addToast("Demande envoyée avec succès", 'success', 2000);
        } catch (err) {
            addToast(err.response?.data?.message || "Erreur d'envoi", 'error', 2500);
        }
    };

    const handleDownloadPdf = async () => {
        try {
            const res = await reportService.exportPdf(id);

            const blob = new Blob([res.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.setAttribute("download", `rapport_${id}.pdf`);
            document.body.appendChild(a);
            a.click();
            a.remove();

            window.URL.revokeObjectURL(url);
        } catch (err) {
            let message = "Erreur de téléchargement";

            try {
                if (err.response?.data instanceof Blob) {
                    const text = await err.response.data.text();
                    const parsed = JSON.parse(text);
                    message = parsed?.message || message;
                } else {
                    message = err.response?.data?.message || err.message || message;
                }
            } catch {
                message = err.response?.data?.message || err.message || message;
            }

            addToast(message, "error", 2500);
        }
    };
    const handleDelete = async () => {
        try {
            await reportService.delete(id);
            addToast('Rapport supprimé', 'success', 1500);
            navigate(-1);
        } catch (err) {
            addToast(err.response?.data?.message || 'Erreur de suppression', 'error', 2500);
        }
    };

    /* ─── Render guards ─── */
    if (loading) return <><ToastContainer toasts={toasts} removeToast={removeToast} /><LoadingScreen /></>;

    if (permissions && !permissions.canRead) {
        return (
            <>
                <ToastContainer toasts={toasts} removeToast={removeToast} />
                <AccessDenied onRequest={handleRequestAccess} onBack={() => navigate(-1)} />
            </>
        );
    }

    if (!report) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
                <ToastContainer toasts={toasts} removeToast={removeToast} />
                <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-rose-400" />
                </div>
                <p className="text-slate-600 font-semibold">Rapport introuvable</p>
                <button onClick={() => navigate(-1)} className="text-sm text-indigo-500 hover:underline">Retour</button>
            </div>
        );
    }

    const isValidation = validationData.status === 'valide';

    return (
        <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'DM Sans','Inter',system-ui,sans-serif" }}>
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            {/* ── TOP BAR ── */}
            <header className=" top-0 z-40 bg-white border-b border-slate-100 shadow-sm print:hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-14 gap-3">
                        {/* Left */}
                        <div className="flex items-center gap-3 min-w-0">
                            <Btn variant="ghost" icon={ArrowLeft} onClick={() => navigate(-1)} />
                            <div className="w-px h-5 bg-slate-100" />
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-bold text-slate-800 truncate">
                                        {report.title || `Rapport #${report.id}`}
                                    </span>
                                    <StatusBadge status={report.status} />
                                </div>
                                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                                    {report.department_name}
                                    <span className="mx-1.5 opacity-40">·</span>
                                    {report.author_name}
                                </p>
                            </div>
                        </div>

                        {/* Right actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                            <Btn variant="ghost" icon={Download} onClick={handleDownloadPdf} title="Télécharger PDF" />
                            <Btn variant="ghost" icon={Printer} onClick={() => window.print()} title="Imprimer" />
                            {permissions?.canEdit && <Btn variant="ghost" icon={Edit} title="Modifier" />}
                            {permissions?.canDelete && (
                                <Popover
                                    position="bottom-right"
                                    on="click"
                                    trigger={
                                        <div>
                                            <Btn variant="danger" icon={Trash2} title="Supprimer" />
                                        </div>
                                    }
                                    content={
                                        <div className="w-72 space-y-3">
                                            <Alert variant="warning" title="Confirmation">
                                                Cette action supprimera définitivement ce rapport.
                                            </Alert>

                                            <div className="flex justify-end gap-2">
                                                <Btn variant="outline">
                                                    Annuler
                                                </Btn>
                                                <Btn variant="reject" icon={Trash2} onClick={handleDelete}>
                                                    Supprimer
                                                </Btn>
                                            </div>
                                        </div>
                                    }
                                />
                            )}
                        </div>
                    </div>

                    {/* Validation banner */}
                    {permissions?.canValidate && report.status === 'soumis' && (
                        <div className="flex items-center gap-3 px-4 py-2.5 mb-2 bg-blue-50 border border-blue-100 rounded-xl text-sm">
                            <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <p className="flex-1 text-blue-700 font-medium text-xs">Ce rapport est en attente de validation</p>
                            <Btn variant="success" icon={CheckCircle} onClick={() => handleValidate('valide')}>Valider</Btn>
                            <Btn variant="reject" icon={XCircle} onClick={() => handleValidate('rejete')}>Rejeter</Btn>
                        </div>
                    )}

                    {/* Rejection reason */}
                    {report.status === 'rejete' && report.rejection_reason && (
                        <div className="flex items-start gap-3 px-4 py-2.5 mb-2 bg-rose-50 border border-rose-100 rounded-xl">
                            <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-semibold text-rose-700">Motif du rejet</p>
                                <p className="text-xs text-rose-600 mt-0.5">{report.rejection_reason}</p>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* ── BODY ── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ── PRINT DOCUMENT ── */}
                    <div className="lg:col-span-2">
                        <div
                            className="bg-white shadow-sm rounded-2xl border border-slate-100 print-area overflow-hidden"
                            style={{ width: '100%', minHeight: '297mm', padding: '20mm', boxSizing: 'border-box' }}
                        >
                            {/* Doc header */}
                            <div className="pb-6 mb-6 border-b-2 border-indigo-600">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <img src={branding.logo} alt="Logo" className="h-12 w-auto mb-2" />
                                        <p className="text-xs text-slate-500">Bakary CISSE Textile | Commerce et Industrie</p>
                                        <p className="text-xs text-slate-400">Bamako, Mali</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Rapport N°{report.id}</p>
                                        <p className="text-xs text-slate-600 font-semibold mt-0.5">{fmtDateLong(new Date())}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Title block */}
                            <div className="mb-8 text-center">
                                <h1 className="text-xl font-extrabold text-slate-800 tracking-tight mb-1">
                                    {report.title || 'RAPPORT DE PRODUCTION'}
                                </h1>
                                <p className="text-xs text-slate-400">
                                    {fmtDate(report.period_start)} — {fmtDate(report.period_end)}
                                </p>
                            </div>

                            {/* Meta grid */}
                            <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-8 text-sm">
                                {[
                                    [Building2, 'Département', report.department_name],
                                    [User,       'Auteur',      report.author_name],
                                    [Calendar,   'Période',     `${fmtDate(report.period_start)} → ${fmtDate(report.period_end)}`],
                                    [Clock,      'Statut',      <StatusBadge status={report.status} />],
                                ].map(([Icon, label, val], i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <Icon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                        <span className="text-slate-500 text-xs">{label} :</span>
                                        <span className="text-slate-800 text-xs font-semibold">{val}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Data section */}
                            <div className="mb-8">
                                <h2 className="text-sm font-bold text-slate-700 mb-4 pb-2 border-b border-slate-100 uppercase tracking-widest">
                                    Données
                                </h2>

                                {hasCustomLayout ? (
                                    <CustomReportRenderer
                                        layout={customLayout}
                                        mode={isSnapshotLayout ? 'snapshot' : 'processed'}
                                        data={reportPayload?.sourceData || reportPayload}
                                    />
                                ) : typeof report.data === 'object' && report.data !== null ? (
                                    <div className="divide-y divide-slate-50">
                                        {Object.entries(report.data).map(([key, value]) => (
                                            <div key={key} className="flex justify-between items-start gap-6 py-2.5">
                                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                                                    {key.replace(/_/g, ' ')}
                                                </span>
                                                                            <span className="text-xs text-slate-800 text-right break-all font-medium">
                                                    {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-700">{report.data}</p>
                                )}
                            </div>

                            {/* Signatures */}
                            <div className="mt-12 pt-6 border-t border-slate-100 grid grid-cols-2 gap-12">
                                {[
                                    ['Établi par', report.author_name, report.created_at],
                                    ['Approuvé par', report.validator_name, report.validated_at],
                                ].map(([role, name, date], i) => (
                                    <div key={i}>
                                        <p className="text-xs font-semibold text-slate-500 mb-8">{role} :</p>
                                        <div className="border-t border-slate-300 pt-2">
                                            <p className="text-sm font-semibold text-slate-700">{name || <span className="text-slate-300 italic">En attente</span>}</p>
                                            {date && <p className="text-xs text-slate-400 mt-0.5">{fmtDate(date)}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Doc footer */}
                            <div className="mt-8 pt-4 border-t border-slate-100 text-center space-y-0.5">
                                <p className="text-[10px] text-slate-400">BATEX-CI • Société de Textile et Confection</p>
                                <p className="text-[10px] text-slate-400">Bamako, Mali • Tél : +223 20 21 35 55</p>
                                <p className="text-[10px] text-slate-400">Capital social : 1 500 000 000 FCFA</p>
                            </div>
                        </div>
                    </div>

                    {/* ── SIDEBAR ── */}
                    <div className="lg:col-span-1 print:hidden space-y-4">

                        {/* Info card */}
                        <SideSection icon={FileText} title="Informations">
                            <div className="space-y-0">
                                <MetaRow label="Visibilité" value={
                                    <span className="flex items-center gap-1">
                                        <Globe className="w-3 h-3" />
                                        <span className="capitalize">{report.visibility}</span>
                                    </span>
                                } />
                                <MetaRow label="Créé le" value={fmtDate(report.created_at)} />
                                {report.submitted_at && <MetaRow label="Soumis le" value={fmtDate(report.submitted_at)} />}
                                {report.validated_at && <MetaRow label="Validé le" value={fmtDate(report.validated_at)} />}
                                {report.validator_name && <MetaRow label="Validé par" value={report.validator_name} />}
                            </div>
                        </SideSection>

                        {/* Comments card */}
                        <SideSection icon={MessageSquare} title={`Commentaires (${comments.length})`}>
                            {/* List */}
                            <div className="space-y-4 max-h-80 overflow-y-auto mb-4 pr-1">
                                {comments.length === 0 ? (
                                    <div className="flex flex-col items-center gap-2 py-6 text-center">
                                        <MessageSquare className="w-6 h-6 text-slate-200" />
                                        <p className="text-xs text-slate-300">Aucun commentaire</p>
                                    </div>
                                ) : (
                                    comments.map(c => <Comment key={c.id} comment={c} />)
                                )}
                            </div>

                            {/* Input */}
                            {permissions?.canRead && (
                                <div className="space-y-2 pt-3 border-t border-slate-50">
                                    <Textarea
                                        value={newComment}
                                        onChange={e => setNewComment(e.target.value)}
                                        placeholder="Ajouter un commentaire…"
                                        rows={3}
                                    />
                                    <button
                                        onClick={handleAddComment}
                                        disabled={!newComment.trim()}
                                        className="w-full h-9 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <Send className="w-3.5 h-3.5" />
                                        Envoyer
                                    </button>
                                </div>
                            )}
                        </SideSection>
                    </div>
                </div>
            </div>

            {/* ── VALIDATION MODAL ── */}
            {showValidationModal && (
                <Modal
                    title={isValidation ? 'Valider le rapport' : 'Rejeter le rapport'}
                    onClose={() => setShowValidationModal(false)}
                    footer={<>
                        <Btn variant="outline" onClick={() => { setShowValidationModal(false); setValidationData({ status: '', comments: '' }); }}>
                            Annuler
                        </Btn>
                        <Btn
                            variant={isValidation ? 'success' : 'reject'}
                            onClick={submitValidation}
                            disabled={!isValidation && !validationData.comments.trim()}
                        >
                            {isValidation ? 'Confirmer la validation' : 'Confirmer le rejet'}
                        </Btn>
                    </>}
                >
                    <p className="text-sm text-slate-500 mb-3">
                        {isValidation
                            ? 'Vous pouvez ajouter un commentaire optionnel.'
                            : 'Veuillez indiquer la raison du rejet (obligatoire).'}
                    </p>
                    <Textarea
                        value={validationData.comments}
                        onChange={e => setValidationData(p => ({ ...p, comments: e.target.value }))}
                        placeholder={isValidation ? 'Commentaires (optionnel)…' : 'Raison du rejet…'}
                        rows={4}
                    />
                </Modal>
            )}

            <style>{`
                @page { size: A4 portrait; margin: 0; }
                @media print {
                    html, body { margin: 0 !important; padding: 0 !important; background: white !important; }
                    body * { visibility: hidden !important; }
                    .print-area, .print-area * { visibility: visible !important; }
                    .print-area {
                        position: absolute !important; top: 0 !important; left: 0 !important;
                        width: 210mm !important; min-height: 297mm !important;
                        margin: 0 !important; padding: 20mm !important;
                        box-shadow: none !important; border: none !important; border-radius: 0 !important;
                    }
                    .print\\:hidden { display: none !important; }
                }
            `}</style>
        </div>
    );
}