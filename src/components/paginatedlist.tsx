import React, { useState, useEffect } from 'react';
import PageTurnButtons from './pageturnbuttons';


export interface PaginatedListProps {
    currentSelection: number;
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    handlePageChange: (page: number) => void;
    handleItemSelect: (item: number) => void;
}

/// PaginatedList component that displays a list of indices with pagination
/// Does not support listing item names at present because it isn't needed in the current use case
/// Component will render a dropdown selector on mobile and a list of items on desktop
const PaginatedList: React.FC<PaginatedListProps> = ({ currentSelection, totalItems, itemsPerPage, currentPage, handleItemSelect, handlePageChange }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const items = [...Array(totalItems)].slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="paginatedList">
            {isMobile ? (
                <select
                    className="itemSelector"
                    value={currentSelection}
                    onChange={(e) => handleItemSelect(Number(e.target.value))}
                >
                    {[...Array(totalItems)].map((_, index) => (
                        <option
                            key={index}
                            value={index + 1}
                        >
                            {index + 1}
                        </option>
                    ))}
                </select>
            ) : (
                <ul className="itemSelector" role="listbox" aria-activedescendant={`item-${currentSelection}`}>
                    {items.map((_, index) => (
                        <li
                            key={index}
                            id={`item-${(currentPage - 1) * itemsPerPage + index + 1}`}
                            onClick={() => {
                                if ((currentPage - 1) * itemsPerPage + index + 1 !== currentSelection) {
                                    handleItemSelect((currentPage - 1) * itemsPerPage + index + 1);
                                }
                            }}
                            className={"itemID" + ((currentPage - 1) * itemsPerPage + index + 1 === currentSelection ? ' active' : '')}
                            style={{ pointerEvents: (currentPage - 1) * itemsPerPage + index + 1 === currentSelection ? 'none' : 'auto' }}
                            role="option"
                            aria-selected={(currentPage - 1) * itemsPerPage + index + 1 === currentSelection}
                        >
                            {(currentPage - 1) * itemsPerPage + index + 1}
                        </li>
                    ))}
                </ul>
            )}
            <PageTurnButtons currentPage={currentPage} totalPages={Math.ceil(totalItems / itemsPerPage)} handlePageChange={handlePageChange} />
        </div>
    );
}

export default PaginatedList;