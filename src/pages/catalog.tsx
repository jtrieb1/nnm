import React from 'react';

import Layout from '../components/layout';
import PDFViewer from '../components/pdfviewer';
import SegmentHeader from '../components/segmentheader';
import BACKEND_URL from '../util/aws';
import getCount from '../util/count';
import getIssueUrl from '../util/issue';

const Catalog = () => {
    const [pdfUrl, setPdfUrl] = React.useState('');
    const [loading, setLoading] = React.useState(true);
    const [count, setCount] = React.useState(0);

    React.useEffect(() => {
        setLoading(true);
        getCount().then(issueCount => {
            issueCount ? setCount(issueCount) : setCount(0);
            if (issueCount == 0) {
                setLoading(false);
                return;
            }
            getIssueUrl(issueCount).then(url => {
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
                                {[...Array(count)].slice(1).map((_, index) => (
                                    <li key={index}>
                                        <a href="#" onClick={() => {
                                            setLoading(true);
                                            getIssueUrl(index).then(url => {
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