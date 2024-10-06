import React from 'react';

const SegmentHeader: React.FC<{headerText: string}> = ({headerText}) => {
    return (
        <h1 className='segmentHeader'>
            {headerText}
        </h1>
    );
};

export default SegmentHeader;