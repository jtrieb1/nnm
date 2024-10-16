import React from 'react';
import { getIssueData } from '../../util/issue';
import { StaticImage } from 'gatsby-plugin-image';

import "./Blurb.css";

export interface BlurbProps {
    issueNumber: number;
}

/// Blurb component that displays the blurb for a given issue number
/// Blurb displays as a dialog panel with a cartoon mascot (Carpet) and a speech bubble
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
    }, []);

    return (
        <div className="blurb">
            {loading ? (
                <p>Loading...</p>
            ) : (
                blurb !== '' &&
                // Blurb should include cartoon mascot
                <div role="dialog" aria-labelledby="blurb-title" aria-describedby="blurb-content">
                    <h2 id="blurb-title" className="sr-only">Blurb for Issue {issueNumber}</h2>
                    <div id="blurb-content">
                        <div className="blurbholder">
                            <div className='dialogpanel'>
                                <StaticImage src={"../../images/carpetface.png"} alt="Carpet" className='carpetface' />
                                <div className='speechbubble'>
                                    <div className="quoteIntro">carpet sez:</div>
                                    <div className="quote">{blurb}</div>
                                </div>    
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Blurb;