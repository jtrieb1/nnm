import { StaticImage } from 'gatsby-plugin-image';
import React from 'react';

interface HeroProps {
    title: string;
    description: string;
}

/// Hero image component that displays a title and description over a background image
const Hero: React.FC<HeroProps> = ({ title, description }) => {
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
                <h1 id="hero-title" className="hero-title">{title}</h1>
                <p id="hero-description" className="hero-description">{description}</p>
            </div>
        </div>
    );
};

export default Hero;