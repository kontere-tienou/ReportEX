// components/PrintHandler.jsx
import React, { useRef, useCallback } from 'react';
import { Printer } from 'lucide-react';

export const PrintHandler = ({
                                 children,
                                 report,
                                 className = ""
                             }) => {
    const printRef = useRef();

    const handlePrint = useCallback(() => {
        // Sauvegarder l'état original
        const originalTitle = document.title;
        document.title = `Rapport_${report?.id || 'document'}`;

        // Créer une iframe pour l'impression
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0px';
        iframe.style.height = '0px';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);

        const printWindow = iframe.contentWindow;
        const printDocument = printWindow.document;

        // Cloner le contenu à imprimer
        const printContent = document.querySelector('.print-area').cloneNode(true);

        // Récupérer tous les styles de la page
        const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
        let stylesHTML = '';
        styles.forEach((style) => {
            if (style.tagName === 'STYLE') {
                stylesHTML += `<style>${style.innerHTML}</style>`;
            } else if (style.tagName === 'LINK') {
                stylesHTML += `<link href="${style.href}" rel="stylesheet">`;
            }
        });

        // Écrire dans l'iframe
        printDocument.open();
        printDocument.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rapport ${report?.id}</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${stylesHTML}
          <style>
            /* Styles spécifiques pour l'impression */
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            
            body {
              margin: 0;
              padding: 0;
              background: white;
              font-family: 'DM Sans', 'Inter', system-ui, sans-serif;
            }
            
            /* Cacher les éléments non imprimables */
            .print\\:hidden,
            .no-print,
            header:not(.print-header),
            button:not(.print-button),
            .btn:not(.print-button),
            .sidebar,
            .side-section,
            .comment-section,
            .filters,
            .modal,
            .popover,
            .action-buttons {
              display: none !important;
            }
            
            /* Afficher la zone d'impression */
            .print-area {
              display: block !important;
              visibility: visible !important;
              margin: 0 auto !important;
              padding: 20mm !important;
              max-width: 210mm !important;
              min-height: 297mm !important;
              background: white !important;
              box-shadow: none !important;
            }
            
            /* Forcer les couleurs */
            .bg-white { background: white !important; }
            .bg-slate-50 { background: #f8fafc !important; }
            .bg-indigo-50 { background: #eef2ff !important; }
            .text-slate-800 { color: #1e293b !important; }
            .text-slate-600 { color: #475569 !important; }
            
            /* Sauts de page intelligents */
            .keep-together {
              page-break-inside: avoid !important;
            }
            
            .page-break-before {
              page-break-before: always !important;
            }
            
            .page-break-after {
              page-break-after: always !important;
            }
            
            /* Tables */
            table {
              page-break-inside: avoid;
              width: 100%;
              border-collapse: collapse;
            }
            
            thead {
              display: table-header-group;
            }
            
            tfoot {
              display: table-footer-group;
            }
            
            tr {
              page-break-inside: avoid;
            }
            
            /* Marges de page */
            @page {
              size: A4;
              margin: 0;
              
              @top-center {
                content: "BATEX-CI - Rapport Officiel";
                font-size: 9pt;
                font-family: 'DM Sans', sans-serif;
                color: #64748b;
              }
              
              @bottom-center {
                content: "Page " counter(page) " sur " counter(pages);
                font-size: 9pt;
                font-family: 'DM Sans', sans-serif;
                color: #64748b;
              }
            }
            
            /* Style du document imprimé */
            .report-document {
              font-family: 'DM Sans', 'Inter', system-ui, sans-serif;
              line-height: 1.5;
            }
            
            .report-header {
              margin-bottom: 2rem;
              padding-bottom: 1rem;
              border-bottom: 2px solid #4f46e5;
            }
            
            .report-title {
              font-size: 1.5rem;
              font-weight: 800;
              color: #1e293b;
              margin: 1rem 0 0.5rem;
            }
            
            .meta-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 1rem;
              margin: 1.5rem 0;
            }
            
            .meta-item {
              display: flex;
              align-items: center;
              gap: 0.5rem;
            }
            
            .signature-section {
              margin-top: 3rem;
              padding-top: 1rem;
              border-top: 1px solid #e2e8f0;
            }
            
            .signature-line {
              display: flex;
              justify-content: space-between;
              gap: 2rem;
              margin-top: 2rem;
            }
            
            .signature {
              flex: 1;
            }
            
            .signature hr {
              margin: 2rem 0 0.5rem;
              border: none;
              border-top: 1px solid #cbd5e1;
            }
            
            @media print {
              body {
                margin: 0;
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-area" style="padding: 20mm; background: white;">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);
        printDocument.close();

        // Attendre le chargement puis imprimer
        printWindow.onload = () => {
            setTimeout(() => {
                printWindow.focus();
                printWindow.print();

                // Nettoyer
                setTimeout(() => {
                    document.body.removeChild(iframe);
                    document.title = originalTitle;
                }, 500);
            }, 100);
        };
    }, [report]);

    return (
        <button
            onClick={handlePrint}
            className={`inline-flex items-center gap-2 h-9 px-3 rounded-lg text-sm font-semibold transition-all duration-150 hover:bg-slate-100 text-slate-600 ${className}`}
        >
            <Printer className="w-4 h-4" />
            Imprimer
        </button>
    );
};

export default PrintHandler;