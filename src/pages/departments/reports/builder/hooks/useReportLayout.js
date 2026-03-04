import { useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";

export default function useReportLayout(initial = []) {
    const [layout, setLayout] = useState(initial);

    const addComponent = (component) => {
        const newBlock = {
            id: crypto.randomUUID(),
            type: component.type,
            config: component.config,
        };
        setLayout((prev) => [...prev, newBlock]);
    };

    const removeComponent = (id) => {
        setLayout((prev) => prev.filter((b) => b.id !== id));
    };

    const moveComponent = (activeId, overId) => {
        const oldIndex = layout.findIndex((b) => b.id === activeId);
        const newIndex = layout.findIndex((b) => b.id === overId);

        if (oldIndex !== -1 && newIndex !== -1) {
            setLayout(arrayMove(layout, oldIndex, newIndex));
        }
    };

    const updateComponent = (id, newConfig) => {
        setLayout((prev) =>
            prev.map((block) =>
                block.id === id
                    ? { ...block, config: { ...block.config, ...newConfig } }
                    : block
            )
        );
    };

    return {
        layout,
        addComponent,
        removeComponent,
        moveComponent,
        updateComponent,
        setLayout,
    };
}