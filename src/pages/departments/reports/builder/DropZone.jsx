import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FileText, Trash2, GripVertical } from 'lucide-react';
import ComponentPreview from './ComponentPreview';

/**
 * ==========================================
 * SORTABLE COMPONENT - Individual draggable item
 * ==========================================
 */
function SortableComponent({ component, onRemove, department, period }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: component.id, // ✅ CRITICAL: Must match the id in SortableContext
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white border border-gray-200 rounded-lg relative group"
        >
            {/* Header with drag handle and delete */}
            <div className="flex items-center justify-between p-3 border-b bg-gray-50">
                <div className="flex items-center space-x-2">
                    {/* Drag Handle - IMPORTANT: listeners here */}
                    <div
                        {...attributes}
                        {...listeners}
                        className="cursor-move p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                        <GripVertical className="w-4 h-4 text-gray-400" />
                    </div>

                    <span className="text-sm font-medium text-gray-700">
            {component.config?.title || component.config?.label || component.name || 'Composant'}
          </span>
                </div>

                <button
                    onClick={() => onRemove(component.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                    title="Supprimer"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* Preview du composant */}
            <div className="p-4">
                <ComponentPreview
                    component={component}
                    department={department}
                    period={period}
                />
            </div>
        </div>
    );
}

/**
 * ==========================================
 * DROP ZONE - Main container
 * ==========================================
 */
export default function DropZone({ components, onRemove, department, period }) {
    if (components.length === 0) {
        return (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 min-h-[600px] flex flex-col items-center justify-center">
                <FileText className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-400 mb-2">
                    Votre rapport est vide
                </h3>
                <p className="text-sm text-gray-500 text-center max-w-md">
                    Cliquez sur les composants de gauche pour les ajouter à votre rapport.
                    Vous pouvez les réorganiser en les glissant-déposant.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6 min-h-[600px]">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                    Aperçu du Rapport
                </h3>
                <span className="text-sm text-gray-500">
          {components.length} composant{components.length > 1 ? 's' : ''}
        </span>
            </div>

            <div className="space-y-4">
                {components.map((component) => (
                    <SortableComponent
                        key={component.id}
                        component={component}
                        onRemove={onRemove}
                        department={department}
                        period={period}
                    />
                ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                    💡 Les données seront calculées automatiquement lors de la génération du PDF
                    en fonction de la période sélectionnée.
                </p>
            </div>
        </div>
    );
}