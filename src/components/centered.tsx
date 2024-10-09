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
        <div className='centered-text-container'>
            <div className='centered-bg-image-container'>
                <StaticImage src="../images/blue_bg.jpg" alt="Blue Background" imgStyle={{ width: '100%', height: '100%' }} objectFit='cover' />
            </div>
            <div className='centered-child-container'>
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