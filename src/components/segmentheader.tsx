import React from 'react';

/// Very simple component that displays a header for a segment
/// Mostly used for consistency in styling
const SegmentHeader: React.FC<{headerText: string, dark: boolean}> = ({headerText, dark}) => {
    return (
        <h1 className='segmentHeader' aria-label={headerText} style={dark ? {color: 'var(--background-color)'} : {color: 'var(--text-color)'}}>
            {headerText}
        </h1>
    );
};

SegmentHeader.defaultProps = {
    dark: false
};

export default SegmentHeader;