import React from 'react';

/// Pagination component that displays buttons to turn pages
/// Generic enough to be used in any pagination context
const PageTurnButtons: React.FC<{ currentPage: number, totalPages: number, handlePageChange: (page: number) => void }> = ({ currentPage, totalPages, handlePageChange }) => {
    return (
        <div className='pagination'>
            <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                {"<"}
            </button>
            <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                {">"}
            </button>
        </div>
    );
};

export default PageTurnButtons;