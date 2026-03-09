import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext.jsx';
import { DndContext, closestCenter, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import {
    Save,
    Download,
    LayoutTemplate,
    Calendar,
    Eye,
    ChevronRight,
    Layers,
    Settings2,
    FileText,
    Sparkles,
    Globe,
    Lock,
    Building2,
} from 'lucide-react';
import BuilderToolbar from './BuilderToolbar';
import DropZone from './DropZone';
import useReportLayout from './hooks/useReportLayout';
import useDragManager from './hooks/useDragManager';
import useSelectedBlock from './hooks/useSelectedBlock';
import { useToast, ToastContainer } from '../../../../components/ui/Toast';
import BlockSettingsPanel from './BlockSettingsPanel';
import { reportService } from "../services/reportApi.js";

/* ─── Visibility pill options ─── */
const VISIBILITY_OPTIONS = [
    { value: 'private', label: 'Privé', Icon: Lock },
    { value: 'department', label: 'Département', Icon: Building2 },
    { value: 'public', label: 'Public', Icon: Globe },
];

const PERIOD_OPTIONS = [
    { value: 'day', label: 'Jour' },
    { value: 'week', label: 'Semaine' },
    { value: 'month', label: 'Mois' },
    { value: 'quarter', label: 'Trimestre' },
    { value: 'year', label: 'Année' },
];

/* ─── Tiny helper components ─── */
function Label({ children, required }) {
    return (
        <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
            {children}
            {required && <span className="text-rose-400 ml-0.5">*</span>}
        </label>
    );
}

function Field({ children }) {
    return <div className="flex flex-col">{children}</div>;
}

function TextInput({ value, onChange, placeholder }) {
    return (
        <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="
                h-9 px-3 text-sm text-slate-800 placeholder:text-slate-300
                bg-white border border-slate-200 rounded-lg shadow-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400
                transition-all duration-150
            "
        />
    );
}

function DateInput({ value, onChange }) {
    return (
        <input
            type="date"
            value={value}
            onChange={onChange}
            className="
                h-9 px-3 text-sm text-slate-700
                bg-white border border-slate-200 rounded-lg shadow-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400
                transition-all duration-150
            "
        />
    );
}

function Select({ value, onChange, options }) {
    return (
        <select
            value={value}
            onChange={onChange}
            className="
                h-9 px-3 text-sm text-slate-700
                bg-white border border-slate-200 rounded-lg shadow-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400
                transition-all duration-150 cursor-pointer
            "
        >
            {options.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
            ))}
        </select>
    );
}

function VisibilitySelect({ value, onChange }) {
    const current = VISIBILITY_OPTIONS.find(o => o.value === value) || VISIBILITY_OPTIONS[0];
    const { Icon } = current;
    return (
        <div className="relative flex items-center">
            <Icon className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none z-10" />
            <select
                value={value}
                onChange={onChange}
                className="
                    h-9 pl-8 pr-4 text-sm text-slate-700
                    bg-white border border-slate-200 rounded-lg shadow-sm
                    focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400
                    transition-all duration-150 cursor-pointer appearance-none
                "
            >
                {VISIBILITY_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>
        </div>
    );
}

function ActionButton({ onClick, variant = 'secondary', icon: Icon, children, loading }) {
    const base = "inline-flex items-center gap-2 h-9 px-4 text-sm font-semibold rounded-lg transition-all duration-150 select-none";
    const styles = {
        primary: "bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white shadow-sm shadow-indigo-300",
        secondary: "bg-white hover:bg-slate-50 active:scale-95 text-slate-700 border border-slate-200 shadow-sm",
    };
    return (
        <button onClick={onClick} disabled={loading} className={`${base} ${styles[variant]}`}>
            {loading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : Icon && <Icon className="w-4 h-4" />}
            {children}
        </button>
    );
}

function StatBadge({ label, value, accent }) {
    const colors = {
        indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
        slate: 'bg-slate-50 text-slate-600 border-slate-200',
        emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${colors[accent || 'slate']}`}>
            <span className="font-bold">{value}</span>
            <span className="opacity-70">{label}</span>
        </span>
    );
}

/* ─── Main component ─── */
export default function ReportBuilder() {
    const { deptName } = useParams();
    const { user } = useAuth();
    const { toasts, addToast, removeToast } = useToast();

    const {
        layout,
        addComponent,
        removeComponent,
        moveComponent,
        updateComponent,
        loadLayout
    } = useReportLayout([]);

    const { handleDragEnd } = useDragManager(layout, moveComponent);
    const { selectedBlockId, selectBlock, clearSelection } = useSelectedBlock();

    const [activeId, setActiveId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const [reportConfig, setReportConfig] = useState({
        title: '',
        period: 'month',
        periodStart: '',
        periodEnd: '',
        visibility: 'private',
    });

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    const department = {
        id: user?.department_id,
        name: user?.department?.name || deptName || 'Département',
        code: user?.department?.code || deptName?.toUpperCase() || 'DEPT'
    };

    const selectedBlock = layout.find(block => block.id === selectedBlockId);

    const patch = (key, val) => setReportConfig(prev => ({ ...prev, [key]: val }));

    /* Load template */
    useEffect(() => {
        const saved = localStorage.getItem(`report_template_${department.id}`);
        if (!saved) return;
        try {
            const t = JSON.parse(saved);
            if (t.layout && Array.isArray(t.layout)) {
                loadLayout(t.layout);
                addToast('Template chargé', 'info', 2000);
            }
        } catch (e) { /* ignore */ }
    }, [department.id]);

    const handleDragStart = (e) => setActiveId(e.active.id);
    const handleDragEndWrapper = (e) => { handleDragEnd(e); setActiveId(null); };

    const handleAddComponent = (c) => {
        addComponent(c);
        addToast(`"${c.name}" ajouté`, 'success', 2000);
    };

    const handleRemoveComponent = (id) => {
        removeComponent(id);
        addToast('Composant supprimé', 'info', 2000);
        if (selectedBlockId === id) clearSelection();
    };

    const handleUpdateComponent = (id, cfg) => {
        updateComponent(id, cfg);
        addToast('Mis à jour', 'success', 1500);
    };

    const handleSaveTemplate = async () => {
        if (!reportConfig.title) { addToast('Titre requis', 'warning', 3000); return; }
        const t = { ...reportConfig, department_id: department.id, layout, lastModified: new Date().toISOString() };
        try {
            localStorage.setItem(`report_template_${department.id}`, JSON.stringify(t));
            try { await reportService.saveCustomTemplate({ name: reportConfig.title, layout, department_id: department.id }); }
            catch { /* optional */ }
            addToast('Template sauvegardé !', 'success', 3000);
        } catch { addToast('Erreur de sauvegarde', 'error', 3000); }
    };

    const handleGenerateReport = async () => {
        if (!reportConfig.title) { addToast('Titre obligatoire', 'warning', 3000); return; }
        if (!reportConfig.periodStart) { addToast('Date de début obligatoire', 'warning', 3000); return; }
        if (!reportConfig.periodEnd) { addToast('Date de fin obligatoire', 'warning', 3000); return; }
        if (!layout.length) { addToast('Ajoutez au moins un composant', 'warning', 3000); return; }

        const { id: departmentId, code: departmentCode, name: departmentName } = department;
        if (!departmentId) { addToast('Département introuvable', 'error', 3000); return; }

        const payload = {
            title: reportConfig.title,
            period_start: reportConfig.periodStart,
            period_end: reportConfig.periodEnd,
            visibility: reportConfig.visibility,
            data: {
                title: reportConfig.title,
                period: reportConfig.period,
                department_id: departmentId,
                department_code: departmentCode,
                department_name: departmentName,
                user_id: user?.id,
                user_name: user?.full_name || user?.name,
                layout: layout.map(c => ({ ...c, icon: c.icon?.name || 'FileText' })),
                components_count: layout.length,
                summary: {
                    title: reportConfig.title,
                    period: `${reportConfig.periodStart} au ${reportConfig.periodEnd}`,
                    components: layout.length,
                    department: departmentName,
                    author: user?.full_name,
                }
            }
        };

        try {
            setLoading(true);
            addToast('Génération en cours…', 'info', 2000);
            const res = await reportService.create(payload);
            addToast('Rapport créé !', 'success', 3000);
            setReportConfig({ title: '', period: 'month', periodStart: '', periodEnd: '', visibility: 'private' });
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Erreur serveur';
            addToast(msg, 'error', 5000);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : null;

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-sm text-slate-400 font-medium tracking-wide">Chargement…</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="h-screen flex flex-col bg-slate-50 overflow-hidden"
            style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}
        >
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            {/* ── TOP HEADER ── */}
            <header className="flex-shrink-0 bg-white border-b border-slate-100 shadow-sm z-20">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">

                    {/* Row 1 — Brand + actions */}
                    <div className="flex items-center justify-between h-14 gap-4">
                        {/* Brand */}
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm">
                                <FileText className="w-4 h-4 text-white" />
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-sm font-bold text-slate-800 leading-none truncate">
                                    Générateur de Rapports
                                </h1>
                                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                                    {department.name}
                                    <span className="mx-1.5 opacity-40">·</span>
                                    <span className="font-semibold text-indigo-500">{department.code}</span>
                                </p>
                            </div>
                        </div>

                        {/* Right-side actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Visibility */}
                            <div className="hidden sm:block">
                                <VisibilitySelect
                                    value={reportConfig.visibility}
                                    onChange={e => patch('visibility', e.target.value)}
                                />
                            </div>

                            <div className="hidden xs:block w-px h-6 bg-slate-200" />

                            <ActionButton onClick={handleSaveTemplate} icon={Save} variant="secondary">
                                <span className="hidden sm:inline">Template</span>
                            </ActionButton>

                            <ActionButton
                                onClick={handleGenerateReport}
                                icon={loading ? null : Download}
                                variant="primary"
                                loading={loading}
                            >
                                <span className="hidden xs:inline">Générer</span>
                            </ActionButton>
                        </div>
                    </div>

                    {/* Row 2 — Config bar */}
                    <div className="flex flex-wrap items-end gap-3 pb-3 pt-1">
                        {/* Title */}
                        <Field>
                            <Label required>Titre du rapport</Label>
                            <div className="w-60 lg:w-80">
                                <TextInput
                                    value={reportConfig.title}
                                    onChange={e => patch('title', e.target.value)}
                                    placeholder="Rapport Mensuel Janvier 2026"
                                />
                            </div>
                        </Field>

                        <div className="hidden sm:block w-px h-9 bg-slate-100 self-end mb-0" />

                        {/* Period type */}
                        <Field>
                            <Label>Période</Label>
                            <Select
                                value={reportConfig.period}
                                onChange={e => patch('period', e.target.value)}
                                options={PERIOD_OPTIONS}
                            />
                        </Field>

                        {/* Date range */}
                        <div className="flex items-end gap-2">
                            <Field>
                                <Label required>Du</Label>
                                <DateInput value={reportConfig.periodStart} onChange={e => patch('periodStart', e.target.value)} />
                            </Field>
                            <div className="h-9 flex items-center">
                                <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                            </div>
                            <Field>
                                <Label required>Au</Label>
                                <DateInput value={reportConfig.periodEnd} onChange={e => patch('periodEnd', e.target.value)} />
                            </Field>
                        </div>

                        {/* Visibility mobile */}
                        <div className="sm:hidden ml-auto">
                            <Field>
                                <Label>Visibilité</Label>
                                <VisibilitySelect value={reportConfig.visibility} onChange={e => patch('visibility', e.target.value)} />
                            </Field>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── MAIN WORKSPACE ── */}
            <main className="flex-1 overflow-hidden">
                <div className="max-w-screen-2xl mx-auto h-full px-4 sm:px-6 py-4">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEndWrapper}
                    >
                        <div className="flex gap-4 h-full">

                            {/* ── SIDEBAR ── */}
                            <aside
                                className={`
                                    flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden
                                    ${sidebarOpen ? 'w-64 lg:w-72 opacity-100' : 'w-0 opacity-0'}
                                `}
                            >
                                <div className="h-full flex flex-col gap-3 w-64 lg:w-72">
                                    {/* Sidebar header */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Layers className="w-4 h-4 text-indigo-500" />
                                            <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                                                Composants
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => setSidebarOpen(false)}
                                            className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                            title="Masquer"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Toolbar scroll area */}
                                    <div className="flex-1 overflow-y-auto rounded-xl bg-white border border-slate-100 shadow-sm p-3">
                                        <BuilderToolbar
                                            onAddComponent={handleAddComponent}
                                            departmentCode={department.code}
                                        />
                                    </div>
                                </div>
                            </aside>

                            {/* ── DROP ZONE AREA ── */}
                            <div className="flex-1 min-w-0 flex flex-col gap-3 h-full overflow-hidden">
                                {/* Canvas header */}
                                <div className="flex items-center justify-between flex-shrink-0">
                                    <div className="flex items-center gap-2">
                                        {!sidebarOpen && (
                                            <button
                                                onClick={() => setSidebarOpen(true)}
                                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                                            >
                                                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                                                Composants
                                            </button>
                                        )}
                                        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 ml-1">
                                            Canvas
                                        </span>
                                    </div>

                                    {/* Stats row */}
                                    <div className="flex items-center gap-2">
                                        <StatBadge
                                            value={layout.length}
                                            label={layout.length === 1 ? 'bloc' : 'blocs'}
                                            accent={layout.length > 0 ? 'indigo' : 'slate'}
                                        />
                                        {reportConfig.periodStart && (
                                            <StatBadge
                                                value={formatDate(reportConfig.periodStart)}
                                                label={reportConfig.periodEnd ? `→ ${formatDate(reportConfig.periodEnd)}` : ''}
                                                accent="slate"
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Scrollable drop zone */}
                                <div className="flex-1 overflow-y-auto rounded-xl bg-white border border-slate-100 shadow-sm">
                                    <SortableContext
                                        items={layout.map(i => i.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <DropZone
                                            components={layout}
                                            onRemove={handleRemoveComponent}
                                            onSelect={selectBlock}
                                            selectedId={selectedBlockId}
                                            department={department.code}
                                            period={reportConfig.period}
                                        />
                                    </SortableContext>
                                </div>

                                {/* ── FOOTER STATUS BAR ── */}
                                <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 bg-white rounded-xl border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-3 text-xs text-slate-400">
                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${layout.length > 0 ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                                        <span>
                                            {layout.length > 0
                                                ? `${layout.length} composant${layout.length > 1 ? 's' : ''} configuré${layout.length > 1 ? 's' : ''}`
                                                : 'Aucun composant — glissez un bloc depuis le panneau gauche'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-medium">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">Cliquez sur un bloc pour le configurer</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Drag overlay */}
                        <DragOverlay>
                            {activeId && (
                                <div className="bg-white border-2 border-indigo-400 rounded-xl px-4 py-3 shadow-xl shadow-indigo-100/80 rotate-1 scale-105 transition-transform">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                                        <p className="text-sm font-semibold text-slate-700">Déplacement…</p>
                                    </div>
                                </div>
                            )}
                        </DragOverlay>
                    </DndContext>
                </div>
            </main>

            {/* Settings panel overlay */}
            {selectedBlock && (
                <BlockSettingsPanel
                    block={selectedBlock}
                    updateComponent={handleUpdateComponent}
                    onClose={clearSelection}
                />
            )}
        </div>
    );
}