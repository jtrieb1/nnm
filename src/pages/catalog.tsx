import React from 'react';

import Layout from '../components/layout';
import PDFViewer from '../components/pdfviewer';
import SegmentHeader from '../components/segmentheader';
import getCount from '../util/count';
import {getIssueUrl} from '../util/issue';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

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
            getIssueUrl(issueCount + 1).then(url => {
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
                            <ul className='issueSelector'>
                                {[...Array(count)].map((_, index) => (
                                    <li key={index} className='issueID'>
                                        <a href="#" onClick={() => {
                                            setLoading(true);
                                            getIssueUrl(index + 1).then(url => {
                                                setPdfUrl(url);
                                                setLoading(false);
                                            });
                                        }}>
                                            {index + 1}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                    )
                }
                {
                    loading 
                    ? <p className='catalog-loading'>Loading...</p> 
                    : <div className='catalog-pdfviewer'>
                        <PDFViewer pdfUrl={pdfUrl} />
                        </div>
                }

            </div>
            
        </Layout>
    );
}

export default Catalog;