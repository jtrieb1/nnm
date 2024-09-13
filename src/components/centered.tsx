import React from 'react';

const CenteredText: React.FC<{ children: string[] }> = ({ children }) => {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '80vh',
                flexDirection: 'column',
            }}
        >
            {children.map((child: any, index: number) => (
                <div key={index} style={{ textAlign: 'center', margin: '10px' }}>
                    {child}
                </div>
            ))}
        </div>
    );
};

export default CenteredText;