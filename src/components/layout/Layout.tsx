import ContextBg from "../bg/ContextBg";
import Footer from "./Footer";
import Header from "./Header";

import React, { ReactNode } from 'react';

const Layout: React.FC<{children: ReactNode[], clipbg: boolean}> = ({ children, clipbg }) => {
    return (
        <>
            <Header />
            <ContextBg clip={clipbg} />
            {children}
            <Footer />
        </>
    );
}

export default Layout;