import { arrayMove } from '@dnd-kit/sortable';

export default function useDragManager(layout, setLayout) {
    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = layout.findIndex(i => i.id === active.id);
            const newIndex = layout.findIndex(i => i.id === over.id);
            setLayout(arrayMove(layout, oldIndex, newIndex));
        }
    };

    return { handleDragEnd };
}