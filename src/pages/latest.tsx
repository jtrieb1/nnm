import React from 'react';

import Layout from '../components/layout';
import PDFViewer from '../components/pdfviewer';
import getCount from '../util/aws_get_count';
import getS3Client from '../util/aws';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import SegmentHeader from '../components/segmentheader';

async function getSignedUrlToLatest() {
    const count = await getCount();
    
    const latestIssue = count;
    if (!latestIssue) {
        throw new Error('No issues found');
    }

    // Get the signed URL for the latest issue
    const getParams = {
        Bucket: process.env.AWS_BUCKET_NAME as string,
        Key: `issue-${latestIssue}.pdf`,
    };

    const s3 = await getS3Client();

    const command = new GetObjectCommand(getParams);

    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
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