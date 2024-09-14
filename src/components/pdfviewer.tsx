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
                <div className='pageSpread'>
                    <Page pageNumber={page} />
                    <Page pageNumber={page + 1} />
                </div>
            </Document>

            <p className='pageCount'>
                Page {page}
            </p>

            <div className='buttonContainer'>
                <button onClick={() => setPage(page - 2)} disabled={page <= 2} className='previousBtn'>
                    Previous
                </button>
                <button onClick={() => setPage(page + 2)} className='nextBtn'>
                    Next
                </button>
            </div>
        </div>
    );
};

export default PDFViewer;