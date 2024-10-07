import React from "react";

/// Footer component that currently only displays copyright information
const Footer: React.FC = () => {
    return (
        <footer 
            style={{ 
            position: "relative", 
            bottom: "0", 
            width: "100%", 
            backgroundColor: "#f2f2f2", 
            padding: "10px", 
            textAlign: "right", 
            fontSize: "14px", 
            color: "#666" 
            }}
            aria-label="Footer"
        >
            <p role="contentinfo">
            &copy; {new Date().getFullYear()} No Nothing Magazine
            </p>
        </footer>
    );
}

export default Footer;

