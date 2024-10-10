import React from 'react';

/// Pagination component that displays buttons to turn pages
/// Generic enough to be used in any pagination context
const PageTurnButtons: React.FC<{ currentPage: number, totalPages: number, handlePageChange: (page: number) => void }> = ({ currentPage, totalPages, handlePageChange }) => {
    return (
        <div className='pagination' role="navigation" aria-label="Pagination Navigation">
            <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous Page"
            >
                {"<"}
            </button>
            <span aria-live="polite" aria-atomic="true" style={{display: "none"}}>
                Page {currentPage} of {totalPages}
            </span>
            <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next Page"
            >
                {">"}
            </button>
        </div>
    );
};

export default PageTurnButtons;