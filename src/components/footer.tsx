import React from "react";

const Footer: React.FC = () => {
    return (
        <footer style={{ bottom: "0", right: "0", backgroundColor: "#f2f2f2", padding: "10px", textAlign: "right", fontSize: "14px", color: "#666" }}>
            &copy; {new Date().getFullYear()} No Nothing Magazine
        </footer>
    );
}

export default Footer;

