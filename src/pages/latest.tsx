import React from 'react';

import Layout from '../components/layout';
import PDFViewer from '../components/pdfviewer';
import SegmentHeader from '../components/segmentheader';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import getCount from '../util/count';
import getIssueUrl from '../util/issue';

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
            {loading ? (
                <div className='catalog-loading'>
                    <div className='spinner'></div>
                </div>
            ) : (
                <div className='catalog-pdfviewer'>
                    <PDFViewer pdfUrl={pdfUrl} />
                </div>
            )}
        </Layout>
    );
}

export default Latest;