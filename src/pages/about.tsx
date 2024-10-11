import React from 'react';
import { HeadFC } from 'gatsby';

import SegmentHeader from '../components/layout/SegmentHeader';
import CenteredText from '../components/decoration/CenteredText';
import Layout from '../components/layout/Layout';

const AboutPage: React.FC = () => {
    return (
        <Layout clipbg={true}>
            <SegmentHeader headerText="about us" dark={false}/>
            <CenteredText 
                children={[
                    "no nothing magazine is a tiny group of friends based in Orlando, Florida", "",
                    "we're always looking for more contributors, so please send us stuff", "",
                    "we're also always looking for more readers, so check us out, it's free on here"
                ]}
                signed={true}
            />
        </Layout>
    );
};

export default AboutPage;

export const Head: HeadFC = () => <title>no nothing magazine | about</title>
