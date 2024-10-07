import React from "react";

import Header from "./header"
import Footer from "./footer";

/// Layout component that wraps the header and footer around the main content
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <main className="page">
            <Header />
            <div className="mainContent">
                {children}
            </div>
            <Footer />
        </main>
    )
}

export default Layout