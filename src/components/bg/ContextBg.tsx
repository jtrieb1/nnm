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
        setBgHeight(window.innerHeight);
        setBgWidth(window.innerWidth);

        window.onresize = () => {
            setBgHeight(window.innerHeight);
            setBgWidth(window.innerWidth);
        };
    }, [setBgHeight, setBgWidth]);

    return (
        <>
            <div className='context-bg-image-container' style={clip ? {overflow: "hidden"} : {}}>
                <GatsbyImage image={image!} alt="Blue Background" objectFit='fill' />
            </div>
        </>
    );
};

export default ContextBg;