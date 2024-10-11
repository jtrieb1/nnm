import React from 'react';
import { HeadFC } from 'gatsby';

import CenteredText from '../components/decoration/CenteredText';
import SegmentHeader from '../components/layout/SegmentHeader';
import Layout from '../components/layout/Layout';

function ContactPage() {
    return (
        <Layout clipbg>
            <SegmentHeader headerText="contact us" dark={false}/>
            <CenteredText children={["we're always looking for more contributors", "send us your stuff", "", "nonothingmag@gmail.com"]} signed={false}/>
        </Layout>
    );
}

export default ContactPage;

export const Head: HeadFC = () => <title>no nothing magazine | contact</title>
