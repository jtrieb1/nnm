import React from 'react';

/// CenteredText is a component that displays text in the center of the screen
/// Kind of like the bumper text on Adult Swim, that's the feeling I'm going for
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
            <div
                style={
                    {
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'column',
                        width: '80%',
                        maxWidth: '800px',
                        padding: '20px',
                        borderRadius: '10px',
                    }
                }
            >
                {children.map((child: any, index: number) => (
                    <div key={index} style={{ textAlign: 'center', margin: '10px' }}>
                        {child}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CenteredText;