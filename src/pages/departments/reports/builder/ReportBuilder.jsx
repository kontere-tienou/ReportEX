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
import { reportBuilderApi } from "../services/reportBuilderApi";

export default function ReportBuilder({ onSave, onGenerate }) {
    const { deptName } = useParams();
    const { user } = useAuth();

    const { layout, addComponent, removeComponent, moveComponent } = useReportLayout([]);
    const [activeId, setActiveId] = useState(null);

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

    // Fetch the builder configuration (if needed)
    useEffect(() => {
        const fetchBuilderConfig = async () => {
            try {
                const response = await reportBuilderApi.initializeBuilder();
                console.log('Builder initialized:', response.data);
            } catch (error) {
                console.error("Error initializing builder:", error);
            }
        };

        fetchBuilderConfig();
    }, []);

    const { handleDragEnd } = useDragManager(layout, moveComponent);

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEndWrapper = (event) => {
        handleDragEnd(event);
        setActiveId(null);
    };

    const handleSaveTemplate = async () => {
        const template = {
            ...reportConfig,
            department_id: department.id,
            layout: layout,
        };

        if (onSave) {
            await onSave(template);
        }

        alert('Template sauvegardé !');
    };

    const handleGenerateReport = async () => {
        if (!reportConfig.title || !reportConfig.periodStart || !reportConfig.periodEnd) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }

        const report = {
            ...reportConfig,
            department_id: department.id,
            layout: layout,
        };

        if (onGenerate) {
            await onGenerate(report);
        }

        alert('Rapport en cours de génération...');
    };

    // Loading state while user data loads
    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Générateur de Rapports</h1>
                        <p>Créez des rapports personnalisés pour {department.name}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm opacity-90">Département</div>
                        <div className="text-2xl font-bold">{department.code}</div>
                    </div>
                </div>
            </div>

            {/* Configuration */}
            <div className="bg-white rounded-xl border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-cyan-600" />
                    Configuration du Rapport
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Titre du Rapport <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={reportConfig.title}
                            onChange={(e) => setReportConfig({ ...reportConfig, title: e.target.value })}
                            placeholder="Ex: Rapport Mensuel Janvier 2026"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Type de Période
                        </label>
                        <select
                            value={reportConfig.period}
                            onChange={(e) => setReportConfig({ ...reportConfig, period: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        >
                            <option value="day">Jour</option>
                            <option value="week">Semaine</option>
                            <option value="month">Mois</option>
                            <option value="quarter">Trimestre</option>
                            <option value="year">Année</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            &nbsp;
                        </label>
                        <div className="flex items-center space-x-2">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <span className="text-sm text-gray-600">
                                {reportConfig.period === 'day' && 'Sélectionnez un jour'}
                                {reportConfig.period === 'week' && 'Sélectionnez une semaine'}
                                {reportConfig.period === 'month' && 'Sélectionnez un mois'}
                                {reportConfig.period === 'quarter' && 'Sélectionnez un trimestre'}
                                {reportConfig.period === 'year' && 'Sélectionnez une année'}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date de Début <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={reportConfig.periodStart}
                            onChange={(e) => setReportConfig({ ...reportConfig, periodStart: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date de Fin <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={reportConfig.periodEnd}
                            onChange={(e) => setReportConfig({ ...reportConfig, periodEnd: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                        onClick={handleSaveTemplate}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Sauvegarder Template
                    </button>
                    <button
                        onClick={handleGenerateReport}
                        className="inline-flex items-center px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-medium transition-colors"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Générer PDF
                    </button>
                </div>
            </div>

            {/* Drag & Drop Area */}
            <DndContext
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEndWrapper}
            >
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Toolbar des composants */}
                    <div className="lg:col-span-1">
                        <BuilderToolbar onAddComponent={addComponent} />
                    </div>

                    {/* Zone de dépôt */}
                    <div className="lg:col-span-3">
                        <SortableContext
                            items={layout.map((item) => item.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <DropZone
                                components={layout}
                                onRemove={removeComponent}
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

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                    💡 <strong>Astuce:</strong> Glissez-déposez les composants dans l'ordre souhaité.
                    Les données seront calculées automatiquement lors de la génération du rapport PDF.
                </p>
            </div>
        </div>
    );
}