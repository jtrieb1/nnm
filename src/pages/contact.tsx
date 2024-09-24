import React from 'react';

import Layout from '../components/layout';
import CenteredText from '../components/centered';
import { HeadFC } from 'gatsby';

function ContactPage() {
    return (
        <Layout>
            <CenteredText children={["we're always looking for more contributors", "send us your stuff", "", "nonothingmag@gmail.com"]} />
        </Layout>
    );
}

export default ContactPage;

export const Head: HeadFC = () => <title>no nothing magazine | contact</title>
