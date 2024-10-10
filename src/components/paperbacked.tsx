import { StaticImage } from 'gatsby-plugin-image';
import React, { ReactNode } from 'react';


    const PaperBacked: React.FC<{ animated: boolean, children: ReactNode[] }> = ({ animated, children }) => {
        return (
            <div className={animated ? "paperbacked-animated" : "paperbacked"}>
                <div className='paperbacked-image' style={{overflow: "hidden"}} >
                    <StaticImage
                        src="../images/paper.jpg"
                        alt="Paper background"
                        layout="fullWidth"
                        imgClassName='paperbacked-image'
                        style={{ opacity: children.length > 0 ? 1 : 0 }}
                    />
                </div>
                <div className='paperbacked-text'>
                    {children}
                </div>
            </div>
        );
    }

    export default PaperBacked;