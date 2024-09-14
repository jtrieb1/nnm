import React from 'react';
import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

interface PDFViewerProps {
    pdfUrl: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl }) => {
    const [page, setPage] = useState(1);

    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

    return (
        <div className='pdfviewer'>
            <Document file={pdfUrl}>
                <Page pageNumber={page} />
            </Document>

            <p className='pageCount'>
                Page {page}
            </p>

            <button onClick={() => setPage(page - 1)} disabled={page <= 1} className='previousBtn'>
                Previous
            </button>
            <button onClick={() => setPage(page + 1)} className='nextBtn'>
                Next
            </button>
        </div>
    );
};

export default PDFViewer;