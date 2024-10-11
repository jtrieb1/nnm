import React from 'react';
import { HeadFC } from 'gatsby';

import Blurb from '../components/blurb/Blurb';
import PaginatedList from '../components/issueviewer/PaginatedList';
import IssueViewer from '../components/issueviewer/IssueViewer';
import SegmentHeader from '../components/layout/SegmentHeader';

import getCount from '../util/count';
import { getIssueUrl } from '../util/issue';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ContextBg from '../components/bg/ContextBg';

const ITEMS_PER_PAGE = 10;

const Catalog = () => {
    const [pdfUrl, setPdfUrl] = React.useState('');
    const [loading, setLoading] = React.useState(true);
    const [count, setCount] = React.useState(0);
    const [currentIssue, setCurrentIssue] = React.useState(0);
    const [currentPage, setCurrentPage] = React.useState(1);

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
            handleIssueSelect(issueCount);
        });
    }, []);

    // Here (and similarly in latest), we can't use Layout directly
    // because when the PDF finishes rendering it changes the size of
    // the page, which causes the footer to move up. This is a limitation
    // of the PDF viewer library we're using. Instead, we put the header 
    // and footer in directly so they rerender properly.
    return (
        <>
            <Header />
            <div style={{flex: 1, height: "100%"}}>
                <ContextBg clip={false} />
                <SegmentHeader headerText="Catalog" dark={false}/>
                {
                    count > 0 && <PaginatedList currentSelection={currentIssue} totalItems={count} itemsPerPage={ITEMS_PER_PAGE} currentPage={currentPage} handleItemSelect={handleIssueSelect} handlePageChange={handlePageChange} />
                }
                {
                    loading 
                    ? <p className='catalog-loading'>Loading...</p> 
                    : <div className='catalog-pdfviewer'>
                        <Blurb issueNumber={currentIssue} />
                        <div className='contentSection'>
                            <IssueViewer pdfUrl={pdfUrl} issue={currentIssue}/>
                        </div>
                        <Footer />
                      </div>
                }
            </div>
        </>
    );
}

export default Catalog;

export const Head: HeadFC = () => <title>no nothing magazine | catalog</title>
