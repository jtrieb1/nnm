import React from 'react';
import { getIssueData } from '../util/issue';
import handle_to_link from '../util/links';
import SegmentHeader from './segmentheader';

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
        <div className="contributors">
            {loading ? (
                <div className='contributors-loading'>Loading...</div>
            ) : (
                <>
                    <SegmentHeader headerText="Contributors" />
                    <ul>
                        {contributors.map((contributor, index) => (
                            <li key={index}>
                                <a href={handle_to_link(contributor.handle)}>{contributor.name} ({contributor.handle})</a>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}

export default Contributors;