import React from 'react';

import Layout from '../components/layout';
import PDFViewer from '../components/pdfviewer';
import BACKEND_URL from '../util/aws';
import SegmentHeader from '../components/segmentheader';


const Latest = () => {

    return (
        <Layout>
            <SegmentHeader headerText="Latest Issue" />
            <PDFViewer pdfUrl={`${BACKEND_URL}/latest`} />
        </Layout>
    );
}

export default Latest;