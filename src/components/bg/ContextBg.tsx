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

        const bHeight = Math.max(document.documentElement.scrollHeight, document.documentElement.offsetHeight, document.documentElement.clientHeight);
        const bWidth = Math.max(document.documentElement.scrollWidth, document.documentElement.offsetWidth, document.documentElement.clientWidth);

        setBgHeight(bHeight);
        setBgWidth(bWidth);

        window.onresize = () => {
            const bHeight = Math.max(document.documentElement.scrollHeight, document.documentElement.offsetHeight, document.documentElement.clientHeight);
            const bWidth = Math.max(document.documentElement.scrollWidth, document.documentElement.offsetWidth, document.documentElement.clientWidth);

            setBgHeight(bHeight);
            setBgWidth(bWidth);
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