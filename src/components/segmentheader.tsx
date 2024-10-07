import React from 'react';

/// Very simple component that displays a header for a segment
/// Mostly used for consistency in styling
const SegmentHeader: React.FC<{headerText: string}> = ({headerText}) => {
    return (
        <h1 className='segmentHeader' aria-label={headerText}>
            {headerText}
        </h1>
    );
};

export default SegmentHeader;