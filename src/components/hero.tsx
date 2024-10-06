import { StaticImage } from 'gatsby-plugin-image';
import React from 'react';

interface HeroProps {
    title: string;
    description: string;
}

const Hero: React.FC<HeroProps> = ({ title, description }) => {
    return (
        <div className="hero">
            <StaticImage src={"../images/splash.jpg"} alt="Hero Image" className="hero-image" />
            <div className="hero-content">
                <h1 className="hero-title">{title}</h1>
                <p className="hero-description">{description}</p>
            </div>
        </div>
    );
};

export default Hero;