import { StaticImage } from 'gatsby-plugin-image';
import React from 'react';


    const PaperBacked: React.FC<{ text: string }> = ({ text }) => {
        return (
            <div className='paperbacked'>
                <StaticImage
                    src="../images/paper.jpg"
                    alt="Paper background"
                    layout="fullWidth"
                    className='paperbacked-image'
                    style={{ opacity: text.length > 0 ? 1 : 0 }}
                />
                <div className='paperbacked-text'>
                    {text}
                </div>
            </div>
        );
    }

    export default PaperBacked;