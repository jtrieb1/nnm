import React from 'react';

import Layout from '../components/layout';
import PDFViewer from '../components/pdfviewer';
import SegmentHeader from '../components/segmentheader';
import getCount from '../util/count';
import {getIssueData, getIssueUrl} from '../util/issue';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { HeadFC } from 'gatsby';
import PaginatedList from '../components/paginatedlist';
import Contributors from '../components/contributors';
import Blurb from '../components/blurb';

const ITEMS_PER_PAGE = 10;

const Catalog = () => {
    const [pdfUrl, setPdfUrl] = React.useState('');
    const [loading, setLoading] = React.useState(true);
    const [count, setCount] = React.useState(0);
    const [currentIssue, setCurrentIssue] = React.useState(0);
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
            setCurrentIssue(issueCount);
            getIssueUrl(issueCount).then(url => {
                setPdfUrl(url);
                setLoading(false);
            });
        });
    }, []);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleIssueSelect = (issueNumber: number) => {
        setLoading(true);
        setCurrentIssue(issueNumber);
        getIssueUrl(issueNumber).then(url => {
            setPdfUrl(url);
            setLoading(false);
        });
    }

    return (
        <Layout>
            <div>
                <SegmentHeader headerText="Catalog" />
                {
                    count > 0 && (
                        <PaginatedList totalItems={count} itemsPerPage={ITEMS_PER_PAGE} currentPage={currentPage} handleItemSelect={handleIssueSelect} handlePageChange={handlePageChange} />
                    )
                }
                <Blurb issueNumber={currentIssue} />
                {
                    loading 
                    ? <p className='catalog-loading'>Loading...</p> 
                    : <div className='catalog-pdfviewer'>
                        <PDFViewer pdfUrl={pdfUrl} />
                        </div>
                }
                <Contributors issueNumber={currentIssue} />
            </div>
        </Layout>
    );
}

export default Catalog;

export const Head: HeadFC = () => <title>no nothing magazine | catalog</title>
