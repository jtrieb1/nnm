import React from 'react';

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