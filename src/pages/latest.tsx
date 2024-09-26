import React from 'react';

import Layout from '../components/layout';
import PDFViewer from '../components/pdfviewer';
import SegmentHeader from '../components/segmentheader';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { getIssueData, getLatestIssueUrl } from '../util/issue';
import getCount from '../util/count';
import handle_to_link from '../util/links';
import { HeadFC } from 'gatsby';
import Blurb from '../components/blurb';
import Contributors from '../components/contributors';

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

    return (
        <Layout>
            <SegmentHeader headerText="Latest Issue" />
            {loading ? (
                <div className='catalog-loading'>
                    <div className='spinner'></div>
                </div>
            ) : (
                <div className='catalog-pdfviewer'>
                    <Blurb issueNumber={issueNumber} />
                    <PDFViewer pdfUrl={pdfUrl} />
                    <Contributors issueNumber={issueNumber} />
                </div>
            )}
        </Layout>
    );
}

export default Latest;

export const Head: HeadFC = () => <title>no nothing magazine | latest</title>