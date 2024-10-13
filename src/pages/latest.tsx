import React from 'react';
import { HeadFC } from 'gatsby';

import Blurb from '../components/blurb/Blurb';
import Layout from '../components/layout/Layout';
import IssueViewer from '../components/issueviewer/IssueViewer';
import SegmentHeader from '../components/layout/SegmentHeader';

import { getLatestIssueUrl } from '../util/issue';
import getCount from '../util/count';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

const Latest = () => {
    const [issueNumber, setIssueNumber] = React.useState(0);
    const [pdfUrl, setPdfUrl] = React.useState('');
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        setLoading(true);

        getCount().then(count => {
            setIssueNumber(count);
        });
        getLatestIssueUrl().then(url => {
            setPdfUrl(url);
            setLoading(false);
        });
        
    }, []);

    return (
        <Layout clipbg={false}>
            <SegmentHeader headerText="Latest Issue" dark={false} />
            <div className='catalog-pdfviewer' role="main">
            {loading ? (
                <div className='catalog-loading' role="status" aria-live="polite">
                    <div className='spinner' aria-label="Loading"></div>
                </div>
            ) : (
                <>
                    <Blurb issueNumber={issueNumber} />
                    <div className='contentSection'>
                        <IssueViewer pdfUrl={pdfUrl} issue={issueNumber} />
                    </div>
                </>
            )}
            </div>
        </Layout>
    );
}

export default Latest;

export const Head: HeadFC = () => <title>no nothing magazine | latest</title>