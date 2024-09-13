import React from 'react';

import Layout from '../components/layout';
import CenteredText from '../components/centered';

function SubscribePage() {
    return (
        <Layout>
            <CenteredText children={["you sure about that?", "you don't gotta, it's free", "we appreciate it though"]} />
        </Layout>
    );
}

export default SubscribePage;