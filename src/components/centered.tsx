import React from 'react';
import Signature from './signature';

/// CenteredText is a component that displays text in the center of the screen
/// Kind of like the bumper text on Adult Swim, that's the feeling I'm going for
const CenteredText: React.FC<{ children: string[], signed: boolean }> = ({ children, signed }) => {
    // Adding role and aria attributes for accessibility
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (containerRef.current) {
            containerRef.current.setAttribute('role', 'main');
            containerRef.current.setAttribute('aria-live', 'polite');
        }
    }, []);
    
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
                        padding: '20px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(0,0,0, 0.3)',
                        blockSize: '100dvh',
                        boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
                        marginBottom: "10px"
                    }
                }
            >
                {children.map((child: any, index: number) => (
                    <div key={index} style={{ textAlign: 'center', margin: '10px' }}>
                        {child}
                    </div>
                ))}
            {signed && <Signature />}
            </div>
        </div>
    );
};

export default CenteredText;