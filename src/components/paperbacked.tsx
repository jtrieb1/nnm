import { StaticImage } from 'gatsby-plugin-image';
import React from 'react';


    const PaperBacked: React.FC<{ text: string }> = ({ text }) => {
        return (
            <div className='paperbacked'>
                <div className='paperbacked-image' style={{overflow: "hidden"}} >
                    <StaticImage
                        src="../images/paper.jpg"
                        alt="Paper background"
                        layout="fullWidth"
                        imgClassName='paperbacked-image'
                        style={{ opacity: text.length > 0 ? 1 : 0 }}
                    />
                </div>
                <div className='paperbacked-text'>
                    {text}
                </div>
            </div>
        );
    }

    export default PaperBacked;