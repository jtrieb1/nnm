import React from 'react';

import CenteredText from '../components/decoration/CenteredText';
import { HeadFC } from 'gatsby';
import Footer from '../components/layout/Footer';
import Header from '../components/layout/Header';
import SegmentHeader from '../components/layout/SegmentHeader';

function SubscribePage() {
    return (
        <>
            <Header />
            <SegmentHeader headerText="subscribe" dark={false}/>
            <CenteredText children={["you sure about that?", "", "you don't gotta, it's free", "", "we appreciate it though"]} signed={false} />
            <Footer />
        </>
    );
}

export default SubscribePage;

export const Head: HeadFC = () => <title>no nothing magazine | subscribe</title>