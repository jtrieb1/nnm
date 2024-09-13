import React from 'react';

import Layout from '../components/layout';
import PDFViewer from '../components/pdfviewer';
import getCount from '../util/aws_get_count';
import SegmentHeader from '../components/segmentheader';
import getIssue from '../util/aws_get_issue';

const Catalog = () => {
    const [pdfUrl, setPdfUrl] = React.useState('');
    const [loading, setLoading] = React.useState(true);
    const [count, setCount] = React.useState(0);

    React.useEffect(() => {
        getCount().then(issueCount => {
            issueCount ? setCount(issueCount) : setCount(0);
            getIssue(0).then(url => {
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
                                            getIssue(index).then(url => {
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