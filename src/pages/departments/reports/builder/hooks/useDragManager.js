/**
 * ==========================================
 * HOOK: useDragManager
 * Gère les événements drag & drop
 * ==========================================
 */

export default function useDragManager(layout, moveComponent) {
    const handleDragEnd = (event) => {
        const { active, over } = event;

        // Si pas de destination, annuler
        if (!over) {
            console.log('❌ No drop target');
            return;
        }

        // Si même élément, rien à faire
        if (active.id === over.id) {
            console.log('ℹ️ Same element, no move needed');
            return;
        }

        console.log('🎯 Moving:', { from: active.id, to: over.id });

        // Déplacer le composant
        moveComponent(active.id, over.id);
    };

    const handleDragCancel = () => {
        console.log('🚫 Drag cancelled');
    };

    return {
        handleDragEnd,
        handleDragCancel,
    };
}