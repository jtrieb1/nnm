import React from 'react';
import Signature from './Signature';
import PaperBacked from './PaperBacked';

import "./CenteredText.css";

/// CenteredText is a component that displays text in the center of the screen
/// Kind of like the bumper text on Adult Swim, that's the feeling I'm going for
const CenteredText: React.FC<{ children: string[], signed: boolean }> = ({ children, signed }) => {
    
    return (
        <div className='centered-text-container'>
            <div className='centered-child-container'>
                {children.map((child: any, index: number) => (
                    <PaperBacked animated={false} key={index}>
                        {child}
                    </PaperBacked>
                ))}
                <div style={{margin: "10px"}}>
                    {signed && <Signature />}
                </div>
            </div>
        </div>
    );
};

export default CenteredText;