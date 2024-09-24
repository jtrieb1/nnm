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

const Latest = () => {
    const [pdfUrl, setPdfUrl] = React.useState('');
    const [blurb, setBlurb] = React.useState('');
    const [contributors, setContributors] = React.useState(Array<{ name: string, handle: string }>());
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        getCount().then(count => {
            getIssueData(count).then(data => {
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
                    <h2 className='latest-blurb'>{blurb}</h2>
                    <PDFViewer pdfUrl={pdfUrl} />
                    <ul className='latest-contributors'>
                        {contributors.map((contributor, index) => (
                            <li key={index}><a href={handle_to_link(contributor.name)}>{contributor.name}</a> ({contributor.handle})</li>
                        ))}
                    </ul>
                </div>
            )}
        </Layout>
    );
}

export default Latest;

export const Head: HeadFC = () => <title>no nothing magazine | latest</title>