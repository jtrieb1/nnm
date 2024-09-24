import React from 'react';

import Layout from '../components/layout';
import getCount from '../util/count';
import { getIssueData } from '../util/issue';
import SegmentHeader from '../components/segmentheader';
import handle_to_link from '../util/links';

export interface FeaturedArtistsProps {

}

async function get_top_contributors(): Promise<Array<{name: string, handle: string}>> {
    let hmap = new Map<string, string>();
    let map = new Map<string, number>();
    let cretval = await getCount();
    let allIssueData = await Promise.all(Array.from({length: cretval}, (_, i) => i + 1).map(async (i) => {
        return await getIssueData(i);
    }
    ));
    for (let data of allIssueData) {
        if (data === null) {
            continue;
        }
        data.contributors.forEach((contributor: {name: string, handle: string}) => {
            if (map.has(contributor.handle)) {
                map.set(contributor.handle, map.get(contributor.handle)! + 1);
                if (!hmap.has(contributor.handle)) {
                    hmap.set(contributor.handle, contributor.name);
                }
                if (hmap.get(contributor.handle) !== contributor.name) {
                    // Keep the longest
                    if (contributor.name.length > hmap.get(contributor.handle)!.length) {
                        hmap.set(contributor.handle, contributor.name);
                    }
                }
            } else {
                map.set(contributor.handle, 1);
                hmap.set(contributor.handle, contributor.name);
            }
        });
    }

    let sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
    let top_contributors = [];
    for (let i = 0; i < Math.min(12, sorted.length); i++) {
        top_contributors.push({name: hmap.get(sorted[i][0])!, handle: sorted[i][0]});
    }
    return top_contributors;
}

const FeaturedArtists: React.FC<FeaturedArtistsProps> = () => {
    const [top_contributors, setTopContributors] = React.useState<Array<{name: string, handle: string}>>([]);

    React.useEffect(() => {
        get_top_contributors().then((top_contributors) => {
            setTopContributors(top_contributors);
        });
    }, []);

    return (
        <Layout>
            <div className="container mx-auto">
                <SegmentHeader headerText="Featured Artists" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {
                        top_contributors.length === 0 ? (
                            <div className="bg-white shadow-md rounded-md p-4">
                                <h2 className="text-2xl font-bold" style={{color: "#222831"}}>Loading...</h2>
                            </div>
                        )
                        : top_contributors.map((contributor, index) => (
                        <div key={index} className="bg-white shadow-md rounded-md p-4">
                            <a href={handle_to_link(contributor.handle)} target="_blank" rel="noreferrer" style={{color: "#222831"}}>
                            <h2 className="text-2xl font-bold">{contributor.name}</h2>
                            <p className="text-lg">{contributor.handle}</p>
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
}

export default FeaturedArtists;