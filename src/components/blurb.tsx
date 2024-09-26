import React from 'react';
import { getIssueData } from '../util/issue';

export interface BlurbProps {
    issueNumber: number;
}

const Blurb: React.FC<BlurbProps> = ({ issueNumber }) => {
    const [loading, setLoading] = React.useState(true);
    const [blurb, setBlurb] = React.useState<string>('');

    React.useEffect(() => {
        if (issueNumber === 0) {
            setLoading(false);
            return; // There is no issue 0
        }
        setLoading(true);
        getIssueData(issueNumber).then(data => {
            setBlurb(data.blurb);
            setLoading(false);
        });
    }, [issueNumber]);

    return (
        <div className="blurb">
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div>{blurb}</div>
            )}
        </div>
    );
}

export default Blurb;