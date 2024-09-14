import React from 'react';

import Layout from '../components/layout';
import PDFViewer from '../components/pdfviewer';
import BACKEND_URL from '../util/aws';
import SegmentHeader from '../components/segmentheader';

async function getCount() {
    const response = await fetch(`${BACKEND_URL}/count`);
    const data = await response.text();
    return Number(data);
}

async function getIssueUrl(issueNumber: number) {
    const response = await fetch(`${BACKEND_URL}/issue/${issueNumber}`);
    // Returns a signed URL to the PDF
    return response.text();
}

const Latest = () => {
    const [pdfUrl, setPdfUrl] = React.useState('');
    const [loading, setLoading] = React.useState(true);
    const [count, setCount] = React.useState(0);

    React.useEffect(() => {
        getCount().then(issueCount => {
            issueCount ? setCount(issueCount) : setCount(0);
            getIssueUrl(issueCount).then(url => {
                setPdfUrl(url);
                setLoading(false);
            });
        });
    }, []);

    return (
        <Layout>
            <SegmentHeader headerText="Latest Issue" />
            {loading ? <p className='catalog-loading'>Loading...</p> : <div className='catalog-pdfviewer'><PDFViewer pdfUrl={pdfUrl} /></div>}
        </Layout>
    );
}

export default Latest;