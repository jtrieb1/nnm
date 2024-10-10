import React from 'react';
import { HeadFC } from 'gatsby';

import CenteredText from '../components/decoration/CenteredText';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import SegmentHeader from '../components/layout/SegmentHeader';

function ContactPage() {
    return (
        <>
            <Header />
            <SegmentHeader headerText="contact us" dark={false}/>
            <CenteredText children={["we're always looking for more contributors", "send us your stuff", "", "nonothingmag@gmail.com"]} signed={false}/>
            <Footer />
        </>
    );
}

export default ContactPage;

export const Head: HeadFC = () => <title>no nothing magazine | contact</title>
