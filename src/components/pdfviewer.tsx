import React from 'react';
import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

interface PDFViewerProps {
    pdfUrl: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl }) => {
    const [page, setPage] = useState(0);
    const [numPages, setNumPages] = useState(0);
    const [pageWidth, setPageWidth] = useState(800);

    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    return (
        <div className='pdfviewer'>
            <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess} className="pdfDocument">
                <div className='pageSpread'>
                    {page != 0 ? <Page pageNumber={page} className="pdfPage" width={pageWidth} onClick={() => setPage(page - 2)} /> : <></>}
                    {page != numPages ? <Page pageNumber={page + 1} width={pageWidth} onClick={() => setPage(page + 2)} /> : <></>}
                </div>
            </Document>
            <div className='buttonContainer'>
                <button onClick={() => setPage(page - 2)} disabled={page <= 1} className='previousBtn'>
                    Previous
                </button>
                <button onClick={() => setPage(page + 2)} disabled={page + 2 > numPages} className='nextBtn'>
                    Next
                </button>
            </div>
        </div>  
    );
};

export default PDFViewer;