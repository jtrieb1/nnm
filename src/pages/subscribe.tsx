import React from 'react';

import CenteredText from '../components/decoration/CenteredText';
import { HeadFC } from 'gatsby';
import SegmentHeader from '../components/layout/SegmentHeader';
import Layout from '../components/layout/Layout';

function SubscribePage() {
    return (
        <Layout clipbg>
            <SegmentHeader headerText="subscribe" dark={false}/>
            <CenteredText children={["you sure about that?", "", "you don't gotta, it's free", "", "we appreciate it though"]} signed={false} />
        </Layout>
    );
}

export default SubscribePage;

export const Head: HeadFC = () => <title>no nothing magazine | subscribe</title>