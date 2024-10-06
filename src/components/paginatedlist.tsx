import React from 'react';
import PageTurnButtons from './pageturnbuttons';

export interface PaginatedListProps {
    currentSelection: number;
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    handlePageChange: (page: number) => void;
    handleItemSelect: (item: number) => void;
}

const PaginatedList: React.FC<PaginatedListProps> = ({ currentSelection, totalItems, itemsPerPage, currentPage, handleItemSelect, handlePageChange}) => {
    return (
        <div className="paginatedList">
            <ul className="itemSelector">
                {[...Array(totalItems)].slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((_, index) => (
                    <li 
                        key={index} 
                        onClick={() => {
                            if ((currentPage - 1) * itemsPerPage + index + 1 !== currentPage) {
                                handleItemSelect((currentPage - 1) * itemsPerPage + index + 1);
                            }
                        }}
                        className={"itemID" + ((currentPage - 1) * itemsPerPage + index + 1 === currentSelection ? ' active' : '')}
                        style={{ pointerEvents: (currentPage - 1) * itemsPerPage + index + 1 === currentSelection ? 'none' : 'auto' }}
                    >
                        {(currentPage - 1) * itemsPerPage + index + 1}
                    </li>
                ))}
            </ul>
            <PageTurnButtons currentPage={currentPage} totalPages={totalItems / itemsPerPage} handlePageChange={handlePageChange} />
        </div>
    );
}

export default PaginatedList;