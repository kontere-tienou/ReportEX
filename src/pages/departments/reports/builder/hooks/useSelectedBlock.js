import { useState } from "react";

export default function useSelectedBlock() {
    const [selectedBlockId, setSelectedBlockId] = useState(null);

    const selectBlock = (id) => {
        setSelectedBlockId(id);
    };

    const clearSelection = () => {
        setSelectedBlockId(null);
    };

    return {
        selectedBlockId,
        selectBlock,
        clearSelection,
    };
}