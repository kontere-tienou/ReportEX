import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext.jsx';
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import {
    Save,
    Download,
    Calendar,
    FileText,
} from 'lucide-react';
import BuilderToolbar from './BuilderToolbar';
import DropZone from './DropZone';
import useReportLayout from './hooks/useReportLayout';
import useDragManager from './hooks/useDragManager';
import useSelectedBlock from './hooks/useSelectedBlock';
import { reportBuilderApi } from "../services/reportBuilderApi";
import { useToast, ToastContainer } from '../../../../components/ui/Toast';
import BlockSettingsPanel from './BlockSettingsPanel';

export default function ReportBuilder({ onSave, onGenerate }) {
    const { deptName } = useParams();
    const { user } = useAuth();
    const { toasts, addToast, removeToast } = useToast();

    // Custom hooks
    const { layout, addComponent, removeComponent, moveComponent, updateComponent } = useReportLayout([]);
    const { handleDragEnd } = useDragManager(layout, moveComponent);
    const { selectedBlockId, selectBlock, clearSelection } = useSelectedBlock();

    const [activeId, setActiveId] = useState(null);
    const [loading, setLoading] = useState(false);

    // Configuration du rapport
    const [reportConfig, setReportConfig] = useState({
        title: '',
        period: 'month',
        periodStart: '',
        periodEnd: '',
    });

    // Create department object from user data
    const department = {
        id: user?.department_id,
        name: user?.department?.name || deptName || 'Département',
        code: user?.department?.code || deptName?.toUpperCase() || 'DEPT'
    };

    // Get selected block for settings panel
    const selectedBlock = layout.find(block => block.id === selectedBlockId);

    // Fetch the builder configuration (if needed)
    useEffect(() => {
        const fetchBuilderConfig = async () => {
            setLoading(true);
            try {
                const response = await reportBuilderApi.initializeBuilder();
                console.log('Builder initialized:', response.data);

                // Load saved template if exists
                const savedTemplate = localStorage.getItem(`report_template_${department.id}`);
                if (savedTemplate) {
                    try {
                        const template = JSON.parse(savedTemplate);
                        if (template.layout) {
                            // You might want to set the layout here
                            // setLayout(template.layout);
                            addToast('Template chargé', 'info', 2000);
                        }
                    } catch (e) {
                        console.error('Error loading saved template:', e);
                    }
                }

                addToast('Builder initialisé avec succès', 'success', 2000);
            } catch (error) {
                console.error("Error initializing builder:", error);
                addToast('Erreur lors de l\'initialisation du builder', 'error', 3000);
            } finally {
                setLoading(false);
            }
        };

        fetchBuilderConfig();
    }, []);

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEndWrapper = (event) => {
        handleDragEnd(event);
        setActiveId(null);
    };

    const handleAddComponent = (component) => {
        addComponent(component);
        addToast(`Composant "${component.name}" ajouté`, 'success', 2000);
    };

    const handleRemoveComponent = (componentId) => {
        const component = layout.find(c => c.id === componentId);
        removeComponent(componentId);
        if (component) {
            addToast(`Composant "${component.config?.title || component.name || 'supprimé'}" retiré`, 'info', 2000);
        }
        if (selectedBlockId === componentId) {
            clearSelection();
        }
    };

    const handleUpdateComponent = (id, newConfig) => {
        updateComponent(id, newConfig);
        addToast('Composant mis à jour', 'success', 1500);
    };

    const handleSaveTemplate = async () => {
        if (!reportConfig.title) {
            addToast('Veuillez donner un titre au rapport', 'warning', 3000);
            return;
        }

        const template = {
            ...reportConfig,
            department_id: department.id,
            layout: layout,
            lastModified: new Date().toISOString(),
        };

        try {
            // Save to localStorage as backup
            localStorage.setItem(`report_template_${department.id}`, JSON.stringify(template));

            if (onSave) {
                await onSave(template);
            }
            addToast('Template sauvegardé avec succès !', 'success', 3000);
        } catch (error) {
            console.error('Error saving template:', error);
            addToast('Erreur lors de la sauvegarde du template', 'error', 3000);
        }
    };

    const handleGenerateReport = async () => {
        // Validation
        if (!reportConfig.title) {
            addToast('Le titre du rapport est obligatoire', 'warning', 3000);
            return;
        }

        if (!reportConfig.periodStart) {
            addToast('La date de début est obligatoire', 'warning', 3000);
            return;
        }

        if (!reportConfig.periodEnd) {
            addToast('La date de fin est obligatoire', 'warning', 3000);
            return;
        }

        if (layout.length === 0) {
            addToast('Ajoutez au moins un composant au rapport', 'warning', 3000);
            return;
        }

        const report = {
            ...reportConfig,
            department_id: department.id,
            department_name: department.name,
            layout: layout,
            created_at: new Date().toISOString(),
        };

        try {
            addToast('Rapport en cours de génération...', 'info', 2000);

            if (onGenerate) {
                await onGenerate(report);
            }

            // Simulate generation (you can remove this in production)
            setTimeout(() => {
                addToast('Rapport généré avec succès !', 'success', 3000);
            }, 1500);

        } catch (error) {
            console.error('Error generating report:', error);
            addToast('Erreur lors de la génération du rapport', 'error', 3000);
        }
    };

    // Loading state
    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Toast Container */}
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            {/* Header - Fixed */}
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4 text-white flex-shrink-0">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Générateur de Rapports</h1>
                            <p className="text-sm opacity-90">Créez des rapports personnalisés pour {department.name}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm opacity-90">Département</div>
                            <div className="text-xl font-bold">{department.code}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Configuration - Fixed */}
            <div className="bg-white border-b px-6 py-3 flex-shrink-0">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-wrap items-end gap-3">
                        {/* Titre */}
                        <div className="flex-1 min-w-[250px]">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Titre du Rapport <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={reportConfig.title}
                                onChange={(e) => setReportConfig({ ...reportConfig, title: e.target.value })}
                                placeholder="Ex: Rapport Mensuel Janvier 2026"
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>

                        {/* Type de Période */}
                        <div className="w-28">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Période
                            </label>
                            <select
                                value={reportConfig.period}
                                onChange={(e) => setReportConfig({ ...reportConfig, period: e.target.value })}
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                            >
                                <option value="day">Jour</option>
                                <option value="week">Semaine</option>
                                <option value="month">Mois</option>
                                <option value="quarter">Trimestre</option>
                                <option value="year">Année</option>
                            </select>
                        </div>

                        {/* Date de Début */}
                        <div className="w-36">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Du <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={reportConfig.periodStart}
                                onChange={(e) => setReportConfig({ ...reportConfig, periodStart: e.target.value })}
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>

                        {/* Date de Fin */}
                        <div className="w-36">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Au <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={reportConfig.periodEnd}
                                onChange={(e) => setReportConfig({ ...reportConfig, periodEnd: e.target.value })}
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 ml-auto">
                            <button
                                onClick={handleSaveTemplate}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
                            >
                                <Save className="w-4 h-4 mr-1" />
                                Template
                            </button>
                            <button
                                onClick={handleGenerateReport}
                                className="inline-flex items-center px-3 py-1.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 text-sm font-medium transition-colors"
                            >
                                <Download className="w-4 h-4 mr-1" />
                                Générer
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - Scrollable Area */}
            <div className="flex-1 overflow-hidden px-6 py-4">
                <div className="max-w-7xl mx-auto h-full">
                    <DndContext
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEndWrapper}
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
                            {/* Toolbar des composants - Scrollable */}
                            <div className="lg:col-span-1 h-full overflow-y-auto pr-2">
                                <BuilderToolbar onAddComponent={handleAddComponent} />
                            </div>

                            {/* Zone de dépôt - Scrollable */}
                            <div className="lg:col-span-3 h-full overflow-y-auto pr-2">
                                <SortableContext
                                    items={layout.map((item) => item.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <DropZone
                                        components={layout}
                                        onRemove={handleRemoveComponent}
                                        onSelect={selectBlock}
                                        selectedId={selectedBlockId}
                                        department={department}
                                        period={reportConfig.period}
                                    />
                                </SortableContext>
                            </div>
                        </div>

                        <DragOverlay>
                            {activeId && (
                                <div className="bg-white border-2 border-cyan-500 rounded-lg p-4 shadow-2xl">
                                    <p className="font-medium text-gray-900">Composant en déplacement...</p>
                                </div>
                            )}
                        </DragOverlay>
                    </DndContext>
                </div>
            </div>

            {/* Settings Panel (overlay) */}
            {selectedBlock && (
                <BlockSettingsPanel
                    block={selectedBlock}
                    updateComponent={handleUpdateComponent}
                    onClose={clearSelection}
                />
            )}

            {/* Footer - Fixed */}
            <div className="bg-white border-t px-6 py-3 flex-shrink-0">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-600">
                                {layout.length} composant{layout.length > 1 ? 's' : ''} dans le rapport
                            </span>
                            <span className="text-gray-300">|</span>
                            <span className="text-gray-600">
                                Période: {reportConfig.periodStart ? new Date(reportConfig.periodStart).toLocaleDateString() : 'Non définie'}
                                {reportConfig.periodEnd && ` - ${new Date(reportConfig.periodEnd).toLocaleDateString()}`}
                            </span>
                        </div>
                        <div className="text-blue-600">
                            💡 Cliquez sur un composant pour le configurer
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}