import React from 'react';
import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { DocumentCallback } from 'react-pdf/dist/cjs/shared/types';

const PageLoading = () => {
    return (
        <div className='pageLoading'>
            Loading...
        </div>
    );
}

interface PDFViewerProps {
    pdfUrl: string;
}

/// PDFViewer component that displays a PDF document with navigation buttons
/// It also allows the user to click on the document to navigate
/// Unfortunately, loads fairly slowly, need to solve that.
const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl }) => {
    const [page, setPage] = useState(0);
    const [numPages, setNumPages] = useState(0);
    const [pageWidth, setPageWidth] = useState(800);

    React.useEffect(() => {
        window.matchMedia('(min-width: 768px)').matches ? setPageWidth(800) : setPageWidth(400);
    }, []);

    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

    function onDocumentLoadSuccess(document: DocumentCallback) {
        setNumPages(document.numPages);
    }

    return (
        <div role="region" aria-label="PDF Viewer">
        <div className='pdfviewer'>
            <div className="resizer">
                <button onClick={() => setPageWidth(pageWidth - 100)} disabled={pageWidth <= 100} className='resizeBtn'>
                    -
                </button>
                <span style={{padding: "10px"}}>Page Size: {pageWidth}</span>
                <button onClick={() => setPageWidth(pageWidth + 100)} disabled={pageWidth >= 1000} className='resizeBtn'>
                    +
                </button>
            </div>
            <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess} className="pdfDocument">
                <div className='pageSpread'>
                    {page != 0 ? <Page pageNumber={page} className="pdfPage" width={pageWidth} onClick={() => setPage(page - 2)} loading={PageLoading} /> : <></>}
                    {page != numPages ? <Page pageNumber={page + 1} width={pageWidth} onClick={() => setPage(page + 2)} loading={PageLoading} /> : <></>}
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
        </div>
    );
};

export default PDFViewer;