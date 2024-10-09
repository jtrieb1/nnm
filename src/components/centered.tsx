import React from 'react';
import Signature from './signature';
import { StaticImage } from 'gatsby-plugin-image';
import PaperBacked from './paperbacked';

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
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: -2
                }}
            >
                <StaticImage src="../images/blue_bg.jpg" alt="Blue Background" imgStyle={{ width: '100%', height: '100%' }} objectFit='cover' />
            </div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                    width: '80%',
                    padding: '20px',
                    blockSize: '100dvh',
                    marginBottom: "10px",
                    position: 'relative'
                }}
            >
                {children.map((child: any, index: number) => (
                    <PaperBacked text={child} key={index} />
                ))}
                <div style={{margin: "10px"}}>
                    {signed && <Signature />}
                </div>
            </div>
        </div>
    );
};

export default CenteredText;