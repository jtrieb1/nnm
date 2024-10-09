import { StaticImage } from 'gatsby-plugin-image';
import React from 'react';


    const PaperBacked: React.FC<{ text: string }> = ({ text }) => {
        return (
            <div style={{ position: 'relative', padding: '20px', color: '#000', fontFamily:'var(--handwritten-font)', fontSize: "30px" }}>
                <StaticImage
                    src="../images/paper.jpg"
                    alt="Paper background"
                    layout="fullWidth"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, opacity: text.length > 0 ? 1 : 0 }}
                />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    {text}
                </div>
            </div>
        );
    }

    export default PaperBacked;