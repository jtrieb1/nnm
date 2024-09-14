import React from 'react';

import Layout from '../components/layout';
import PDFViewer from '../components/pdfviewer';
import SegmentHeader from '../components/segmentheader';
import BACKEND_URL from '../util/aws';

async function getCount() {
    const response = await fetch(`${BACKEND_URL}/count`);
    const data = await response.json();
    return data.count;
}

function getIssueUrl(issueNumber: number) {
    return `${BACKEND_URL}/issue/${issueNumber}`;
}

const Catalog = () => {
    const [pdfUrl, setPdfUrl] = React.useState('');
    const [loading, setLoading] = React.useState(true);
    const [count, setCount] = React.useState(0);

    React.useEffect(() => {
        getCount().then(issueCount => {
            issueCount ? setCount(issueCount) : setCount(0);
            setPdfUrl(`${BACKEND_URL}/issue/0`);
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
                                            setPdfUrl(getIssueUrl(index));
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