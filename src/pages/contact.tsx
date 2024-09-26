import React from 'react';
import { HeadFC } from 'gatsby';

import Layout from '../components/layout';
import CenteredText from '../components/centered';

function ContactPage() {
    return (
        <Layout>
            <CenteredText children={["we're always looking for more contributors", "send us your stuff", "", "nonothingmag@gmail.com"]} />
        </Layout>
    );
}

export default ContactPage;

export const Head: HeadFC = () => <title>no nothing magazine | contact</title>
