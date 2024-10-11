import ContextBg from "../bg/ContextBg";
import Footer from "./Footer";
import Header from "./Header";
import "./Layout.css";

import React, { ReactNode } from 'react';

const Layout: React.FC<{children: ReactNode[], clipbg: boolean}> = ({ children, clipbg }) => {
    return (
        <div className="layout">
            <Header />
            <ContextBg clip={clipbg} />
            {children}
            <Footer />
        </div>
    );
}

export default Layout;