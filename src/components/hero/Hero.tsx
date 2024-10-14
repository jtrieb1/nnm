import { StaticImage } from 'gatsby-plugin-image';
import React from 'react';

import "./Hero.css";

interface HeroProps {
}

/// Hero image component that displays a title and description over a background image
const Hero: React.FC<HeroProps> = ({ }) => {
    return (
        <div className="hero" role="banner" aria-labelledby="hero-title" aria-describedby="hero-description">
            <StaticImage 
                src={"../../images/altsplash.jpg"} 
                alt="Hero Image" 
                style={{
                    flex: 1,
                    position: "absolute",
                    top: 0,
                    left: 0, 
                    height: "60vh"
                }}
                aspectRatio={3 / 1}
                objectFit='cover'
                formats={['auto', 'webp', 'avif']}
            />
            <div className="hero-content">
                <StaticImage
                    src={"../../images/title.png"}
                    alt="no nothing magazine"
                    className="hero-title-img-container"
                    formats={['auto', 'webp', 'avif']}
                />
            </div>
        </div>
    );
};

export default Hero;