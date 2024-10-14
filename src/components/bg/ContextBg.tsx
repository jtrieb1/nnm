import { graphql, useStaticQuery } from 'gatsby';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';
import React from 'react';

import "./ContextBg.css";

const ContextBg: React.FC<{clip: boolean}> = ({ clip }) => {

    let imgQuery = useStaticQuery(graphql`
        {
            blueBg: file(relativePath: {eq: "blue_bg.jpg"}) {
                childImageSharp {
                    gatsbyImageData
                }
            }
        }
    `);

    let image = getImage(imgQuery.blueBg);

    const [bgHeight, setBgHeight] = React.useState(0);
    const [bgWidth, setBgWidth] = React.useState(0);

    React.useEffect(() => {

        setBgHeight(document.documentElement.offsetHeight);
        setBgWidth(document.documentElement.offsetWidth);

        window.onresize = () => {
            setBgHeight(document.documentElement.offsetHeight);
            setBgWidth(document.documentElement.offsetWidth);
        };

        return () => {
            window.onresize = null;
        };
    }, []);

    return (
        <>
            <div className='context-bg-image-container' style={{width: `${bgWidth}px`, height: `${bgHeight}px`, overflow: clip ? "hidden" : "visible"}}>
                <GatsbyImage image={image!} alt="Blue Background" objectFit='fill' style={{width: `${bgWidth}px`, height: `${bgHeight * 2}px`}} />
            </div>
        </>
    );
};

export default ContextBg;