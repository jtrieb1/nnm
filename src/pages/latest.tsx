import React from 'react';
import { HeadFC } from 'gatsby';

import Blurb from '../components/blurb';
import Contributors from '../components/contributors';
import PDFViewer from '../components/pdfviewer';
import SegmentHeader from '../components/segmentheader';

import { getIssueData, getLatestIssueUrl } from '../util/issue';
import getCount from '../util/count';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import Header from '../components/header';
import Footer from '../components/footer';

const Latest = () => {
    const [issueNumber, setIssueNumber] = React.useState(0);
    const [pdfUrl, setPdfUrl] = React.useState('');
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        getCount().then(count => {
            getIssueData(count).then(data => {
                setIssueNumber(count);
            });
        });
        getLatestIssueUrl().then(url => {
            setPdfUrl(url);
            setLoading(false);
        });
        
    }, []);

    // Here (and similarly in catalog), we can't use Layout directly
    // because when the PDF finishes rendering it changes the size of
    // the page, which causes the footer to move up. This is a limitation
    // of the PDF viewer library we're using. Instead, we put the header 
    // and footer in directly so they rerender properly.
    return (
        <>
            <Header />
            <SegmentHeader headerText="Latest Issue" />
            {loading ? (
                <div className='catalog-loading' role="status" aria-live="polite">
                    <div className='spinner' aria-label="Loading"></div>
                </div>
            ) : (
                <div className='catalog-pdfviewer' role="main">
                    <Blurb issueNumber={issueNumber} />
                    <div className='contentSection'>
                        <PDFViewer pdfUrl={pdfUrl} />
                        <Contributors issueNumber={issueNumber} />
                    </div>
                    <Footer />
                </div>
            )}
        </>
    );
}

export default Latest;

export const Head: HeadFC = () => <title>no nothing magazine | latest</title>