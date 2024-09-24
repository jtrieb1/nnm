import React from 'react';

import Layout from '../components/layout';
import SegmentHeader from '../components/segmentheader';
import CenteredText from '../components/centered';
import { HeadFC } from 'gatsby';

const AboutPage: React.FC = () => {
    return (
        <Layout>
            <SegmentHeader headerText="about us" />
            <CenteredText children={[
                "no nothing magazine is a tiny group of friends based in Orlando, Florida",
                "we're always looking for more contributors, so please send us stuff",
                "we're also always looking for more readers, so check us out, it's free on here"
            ]}>
                
            </CenteredText>
        </Layout>
    );
};

export default AboutPage;

export const Head: HeadFC = () => <title>no nothing magazine | about</title>
