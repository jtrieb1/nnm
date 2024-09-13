import React from 'react';

import Layout from '../components/layout';
import PDFViewer from '../components/pdfviewer';
import getCount from '../util/aws_get_count';
import getIssue from '../util/aws_get_issue';
import SegmentHeader from '../components/segmentheader';

async function getSignedUrlToLatest() {
    const count = await getCount();
    
    const latestIssue = count;
    if (!latestIssue) {
        throw new Error('No issues found');
    }

    const url = getIssue(latestIssue);
    return url;
}


const Latest = () => {
    const [pdfUrl, setPdfUrl] = React.useState('');

    React.useEffect(() => {
        getSignedUrlToLatest().then(url => setPdfUrl(url));
    }, []);

    return (
        <Layout>
            <SegmentHeader headerText="Latest Issue" />
            {pdfUrl ? <PDFViewer pdfUrl={pdfUrl} /> : <p>Loading...</p>}
        </Layout>
    );
}

export default Latest;