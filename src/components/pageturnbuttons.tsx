import React from 'react';

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