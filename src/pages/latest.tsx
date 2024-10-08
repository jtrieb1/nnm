import React from 'react';
import { HeadFC } from 'gatsby';

import Blurb from '../components/blurb/Blurb';
import IssueViewer from '../components/issueviewer/IssueViewer';
import SegmentHeader from '../components/layout/SegmentHeader';

import { getLatestIssueUrl } from '../util/issue';
import getCount from '../util/count';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ContextBg from '../components/bg/ContextBg';

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
        <>
            <Header />
            <ContextBg cutoffpx={768} />
            <SegmentHeader headerText="Latest Issue" dark={false} />
            {loading ? (
                <div className='catalog-loading' role="status" aria-live="polite">
                    <div className='spinner' aria-label="Loading"></div>
                </div>
            ) : (
                <div className='catalog-pdfviewer' role="main">
                    <Blurb issueNumber={issueNumber} />
                    <div className='contentSection'>
                        <IssueViewer pdfUrl={pdfUrl} issue={issueNumber} />
                    </div>
                    <Footer />
                </div>
            )}
        </>
    );
}

export default Latest;

export const Head: HeadFC = () => <title>no nothing magazine | latest</title>