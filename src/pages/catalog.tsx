import React from 'react';

import Layout from '../components/layout';
import PDFViewer from '../components/pdfviewer';
import SegmentHeader from '../components/segmentheader';
import getCount from '../util/count';
import {getIssueUrl} from '../util/issue';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

const ITEMS_PER_PAGE = 10;

const Catalog = () => {
    const [pdfUrl, setPdfUrl] = React.useState('');
    const [loading, setLoading] = React.useState(true);
    const [count, setCount] = React.useState(0);
    const [currentPage, setCurrentPage] = React.useState(1);

    React.useEffect(() => {
        setLoading(true);
        getCount().then(issueCount => {
            issueCount ? setCount(issueCount) : setCount(0);
            if (issueCount == 0) {
                setLoading(false);
                return;
            }
            const totalPages = Math.ceil(issueCount / ITEMS_PER_PAGE);
            setCurrentPage(totalPages);
            getIssueUrl(issueCount).then(url => {
                setPdfUrl(url);
                setLoading(false);
            });
        });
    }, []);

    const totalPages = Math.ceil(count / ITEMS_PER_PAGE);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const renderPagination = () => (
        <div className='pagination'>
            <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                Previous
            </button>
            {Array.from({ length: totalPages }, (_, index) => (
                <button
                    key={index}
                    onClick={() => handlePageChange(index+1)}
                    disabled={currentPage === index}
                >
                    {index+1}
                </button>
            ))}
            <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                Next
            </button>
        </div>
    );

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
                                {[...Array(count)].slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((_, index) => (
                                    <li key={index} className='issueID'>
                                        <a href="#" onClick={() => {
                                            setLoading(true);
                                            getIssueUrl((currentPage - 1) * ITEMS_PER_PAGE + index + 1).then(url => {
                                                setPdfUrl(url);
                                                setLoading(false);
                                            });
                                        }}>
                                            {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                            {renderPagination()}
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