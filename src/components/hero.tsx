import React from 'react';

interface HeroProps {
    imageUrl: string;
    title: string;
    description: string;
}

const Hero: React.FC<HeroProps> = ({ imageUrl, title, description }) => {
    return (
        <div className="hero">
            <img src={imageUrl} alt="Hero Image" className="hero-image" />
            <div className="hero-content">
                <h1 className="hero-title">{title}</h1>
                <p className="hero-description">{description}</p>
            </div>
        </div>
    );
};

export default Hero;