import React from 'react';
import { HeadFC } from 'gatsby';

import SegmentHeader from '../components/segmentheader';
import CenteredText from '../components/centered';
import Header from '../components/header';
import Footer from '../components/footer';

const AboutPage: React.FC = () => {
    return (
        <>
        <Header />
            <SegmentHeader headerText="about us" />
            <CenteredText 
                children={[
                    "no nothing magazine is a tiny group of friends based in Orlando, Florida",
                    "we're always looking for more contributors, so please send us stuff",
                    "we're also always looking for more readers, so check us out, it's free on here"
                ]}
                signed={true}
            />
        <Footer />
        </>
    );
};

export default AboutPage;

export const Head: HeadFC = () => <title>no nothing magazine | about</title>
