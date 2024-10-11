import React from "react";

import "./Footer.css";

/// Footer component that currently only displays copyright information
const Footer: React.FC = () => {
    return (
        <footer 
            className="footer"
            aria-label="Footer"
        >
            <p role="contentinfo">
            &copy; {new Date().getFullYear()} No Nothing Magazine
            </p>
        </footer>
    );
}

export default Footer;

