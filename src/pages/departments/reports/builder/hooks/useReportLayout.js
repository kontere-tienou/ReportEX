import { useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";

/**
 * ==========================================
 * HOOK: useReportLayout - FIXED VERSION
 * ==========================================
 */

export default function useReportLayout(initial = []) {
    const [layout, setLayout] = useState(initial);

    // Ajouter un composant
    const addComponent = (component) => {
        const newBlock = {
            id: crypto.randomUUID(),
            type: component.type,
            name: component.name,
            config: { ...component.config },
        };

        setLayout((prev) => [...prev, newBlock]);
    };

    // Supprimer un composant
    const removeComponent = (componentId) => {
        setLayout((prev) => prev.filter((c) => c.id !== componentId));
    };

    // Déplacer un composant - FIX: Utiliser setLayout avec callback
    const moveComponent = (activeId, overId) => {
        setLayout((prev) => {
            const oldIndex = prev.findIndex((item) => item.id === activeId);
            const newIndex = prev.findIndex((item) => item.id === overId);

            // Vérifier que les indices sont valides
            if (oldIndex === -1 || newIndex === -1) {
                console.warn('⚠️ Invalid drag indices:', { activeId, overId, oldIndex, newIndex });
                return prev;
            }

            // Retourner le nouveau layout avec arrayMove
            return arrayMove(prev, oldIndex, newIndex);
        });
    };

    // Mettre à jour la config d'un composant
    const updateComponent = (componentId, newConfig) => {
        setLayout((prev) =>
            prev.map((c) =>
                c.id === componentId
                    ? { ...c, config: { ...c.config, ...newConfig } }
                    : c
            )
        );
    };

    // Réinitialiser le layout
    const resetLayout = () => {
        setLayout([]);
    };

    // Charger un layout sauvegardé
    const loadLayout = (savedLayout) => {
        setLayout(savedLayout);
    };

    return {
        layout,
        addComponent,
        removeComponent,
        moveComponent,
        updateComponent,
        resetLayout,
        loadLayout,
    };
}