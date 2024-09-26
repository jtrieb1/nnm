import React from 'react';
import PageTurnButtons from './pageturnbuttons';

export interface PaginatedListProps {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    handlePageChange: (page: number) => void;
    handleItemSelect: (item: number) => void;
}

const PaginatedList: React.FC<PaginatedListProps> = ({ totalItems, itemsPerPage, currentPage, handleItemSelect, handlePageChange}) => {
    return (
        <div className="paginatedList">
            <ul className="itemSelector">
                {[...Array(totalItems)].slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((_, index) => (
                    <li key={index} className="itemID">
                        <a href="#" onClick={() => handleItemSelect((currentPage - 1) * itemsPerPage + index + 1)}>
                            {(currentPage - 1) * itemsPerPage + index + 1}
                        </a>
                    </li>
                ))}
            </ul>
            <PageTurnButtons currentPage={currentPage} totalPages={totalItems / itemsPerPage} handlePageChange={handlePageChange} />
        </div>
    );
}

export default PaginatedList;