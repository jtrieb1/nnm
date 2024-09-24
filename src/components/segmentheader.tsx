import React from 'react';

const SegmentHeader: React.FC<{headerText: string}> = ({headerText}) => {
    return (
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', textAlign: 'center', }}>
            {headerText}
        </h1>
    );
};

export default SegmentHeader;