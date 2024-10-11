import React from 'react';
import { getIssueData } from '../../util/issue';
import handle_to_link from '../../util/links';
import SegmentHeader from '../layout/SegmentHeader';
import { StaticImage } from 'gatsby-plugin-image';

import "./Contributors.css";

export interface ContributorsProps {
    issueNumber: number;
}

/// Contributors component that displays the contributors for a given issue number
const Contributors: React.FC<ContributorsProps> = ({ issueNumber }) => {
    const [loading, setLoading] = React.useState(true);
    const [contributors, setContributors] = React.useState(Array<{ name: string, handle: string }>());
    
    React.useEffect(() => {
        if (issueNumber === 0) {
            setLoading(false);
            return; // There is no issue 0
        }
        setLoading(true);
        getIssueData(issueNumber).then(data => {
            setContributors(data.contributors);
            setLoading(false);
        });
    }, [issueNumber]);

    return (
        <>
            <h2 id="contributors-header" style={{display: "none"}}>Contributors</h2>
            <div className="contributors" aria-labelledby="contributors-header">
            {loading ? (
                <div className='contributors-loading'>Loading...</div>
            ) : (
                <div className='contributors-container'>
                    <div className='paperbacked-image' style={{overflow: "hidden"}} >
                        <StaticImage
                            src="../../images/paper.jpg"
                            alt="Paper background"
                            layout="fullWidth"
                            imgClassName='paperbacked-image'
                            style={{ opacity: contributors.length > 0 ? 1 : 0 }}
                        />
                    </div>
                    <SegmentHeader headerText="Contributors" dark={true} />
                    <ul>
                        {contributors.map((contributor, index) => (
                            <li key={index}>
                                <a href={handle_to_link(contributor.handle)}>{contributor.name} ({contributor.handle})</a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            </div>
        </>
    );
}

export default Contributors;