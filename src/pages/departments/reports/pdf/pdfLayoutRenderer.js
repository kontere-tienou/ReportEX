export const renderPdfLayout = (doc, layout) => {
    layout.forEach(comp => {
        doc.text(`${comp.type}`);
    });
};