export const serializeLayout = (layout) => {
    return JSON.stringify(layout);
};

export const deserializeLayout = (layoutString) => {
    return JSON.parse(layoutString);
};