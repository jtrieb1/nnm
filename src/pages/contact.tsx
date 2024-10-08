import React from 'react';
import { HeadFC } from 'gatsby';

import CenteredText from '../components/centered';
import Header from '../components/header';
import Footer from '../components/footer';
import SegmentHeader from '../components/segmentheader';

function ContactPage() {
    return (
        <>
            <Header />
            <SegmentHeader headerText="contact us" />
            <CenteredText children={["we're always looking for more contributors", "send us your stuff", "", "nonothingmag@gmail.com"]} signed={false}/>
            <Footer />
        </>
    );
}

export default ContactPage;

export const Head: HeadFC = () => <title>no nothing magazine | contact</title>
