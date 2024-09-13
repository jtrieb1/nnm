import React from 'react';

interface PDFViewerProps {
    pdfUrl: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl }) => {
    return (
        <div style={{ backgroundColor: '#222831', color: '#EEEEEE', padding: '10px' }}>
            <embed src={pdfUrl} type="application/pdf" width="100%" height="600px" />
        </div>
    );
};

export default PDFViewer;