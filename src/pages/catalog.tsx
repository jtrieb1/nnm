import React from 'react';

import Layout from '../components/layout';
import PDFViewer from '../components/pdfviewer';
import getS3Client from '../util/aws';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import getCount from '../util/aws_get_count';
import SegmentHeader from '../components/segmentheader';

async function getSignedUrlToIssue(issueNumber: number) {
    const s3 = await getS3Client();

    const getParams = {
        region: "us-east-1",
        Bucket: process.env.AWS_BUCKET_NAME as string,
        Key: `issue_${issueNumber}.pdf`,
    };
    const command = new GetObjectCommand(getParams);

    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return url;
}

const Catalog = () => {
    const [pdfUrl, setPdfUrl] = React.useState('');
    const [loading, setLoading] = React.useState(true);
    const [count, setCount] = React.useState(0);

    React.useEffect(() => {
        getCount().then(issueCount => {
            issueCount ? setCount(issueCount) : setCount(0);
            getSignedUrlToIssue(0).then(url => {
                setPdfUrl(url);
                setLoading(false);
            });
        });
    }, []);

    return (
        <Layout>
            <div>
                <div>
                    <SegmentHeader headerText="Catalog" />
                </div>
                {
                    count > 0 && (
                        <div className='issues'>
                            <h2>Issues</h2>
                            <ul>
                                {[...Array(count)].map((_, index) => (
                                    <li key={index}>
                                        <a href="#" onClick={() => {
                                            setLoading(true);
                                            getSignedUrlToIssue(index).then(url => {
                                                setPdfUrl(url);
                                                setLoading(false);
                                            });
                                        }}>
                                            Issue {index}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                    )
                }
                {loading ? <p className='catalog-loading'>Loading...</p> : <div className='catalog-pdfviewer'><PDFViewer pdfUrl={pdfUrl} /></div>}
            </div>
            
        </Layout>
    );
}

export default Catalog;