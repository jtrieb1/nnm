import React from 'react';

import Layout from '../components/layout';
import PDFViewer from '../components/pdfviewer';
import SegmentHeader from '../components/segmentheader';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { getIssueData, getLatestIssueUrl } from '../util/issue';
import getCount from '../util/count';

const Latest = () => {
    const [pdfUrl, setPdfUrl] = React.useState('');
    const [blurb, setBlurb] = React.useState('');
    const [contributors, setContributors] = React.useState(Array<{ name: string, handle: string }>());
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        getCount().then(count => {
            getIssueData(count + 1).then(data => {
                setBlurb(data.blurb);
                setContributors(data.contributors);
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
                    <h2>{blurb}</h2>
                    <PDFViewer pdfUrl={pdfUrl} />
                    <h3>Contributors</h3>
                    <ul>
                        {contributors.map((contributor, index) => (
                            <li key={index}>{contributor.name} ({contributor.handle})</li>
                        ))}
                    </ul>
                </div>
            )}
        </Layout>
    );
}

export default Latest;