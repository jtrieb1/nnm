import React from 'react';

import CenteredText from '../components/centered';
import { HeadFC } from 'gatsby';
import Footer from '../components/footer';
import Header from '../components/header';
import SegmentHeader from '../components/segmentheader';

function SubscribePage() {
    return (
        <>
            <Header />
            <SegmentHeader headerText="subscribe" />
            <CenteredText children={["you sure about that?", "you don't gotta, it's free", "we appreciate it though"]} signed={false} />
            <Footer />
        </>
    );
}

export default SubscribePage;

export const Head: HeadFC = () => <title>no nothing magazine | subscribe</title>