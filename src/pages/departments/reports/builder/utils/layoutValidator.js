export const validateLayout = (layout) => {
    if (!Array.isArray(layout)) return false;
    return layout.every(comp => comp.type && comp.config);
};