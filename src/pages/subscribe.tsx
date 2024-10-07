import React from 'react';

import Layout from '../components/layout';
import CenteredText from '../components/centered';
import { HeadFC } from 'gatsby';

function SubscribePage() {
    return (
        <Layout>
            <CenteredText children={["you sure about that?", "you don't gotta, it's free", "we appreciate it though"]} />
        </Layout>
    );
}

export default SubscribePage;

export const Head: HeadFC = () => <title>no nothing magazine | subscribe</title>