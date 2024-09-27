import React from 'react';
import { HeadFC } from 'gatsby';

import Layout from '../components/layout';
import SegmentHeader from '../components/segmentheader';

import getCount from '../util/count';
import { getIssueData } from '../util/issue';
import handle_to_link from '../util/links';

export interface FeaturedArtistsProps {}

class HandleNameMap {
    map: Map<string, string>;

    constructor() {
        this.map = new Map<string, string>();
    }

    set(handle: string, name: string) {
        let existing = this.map.get(handle);
        if (existing !== undefined && existing !== name) {
            if (existing.length >= name.length) {
                return;
            }
        }
        this.map.set(handle, name);
    }

    get(handle: string): string {
        return this.map.get(handle)!;
    }
}

class HandleCountMap {
    map: Map<string, number>;

    constructor() {
        this.map = new Map<string, number>();
    }

    get(handle: string): number {
        return this.map.get(handle)!;
    }

    increment(handle: string) {
        if (this.map.has(handle)) {
            this.map.set(handle, this.map.get(handle)! + 1);
        } else {
            this.map.set(handle, 1);
        }
    }
}

class HandleRanker {
    handleNameMap: HandleNameMap;
    handleCountMap: HandleCountMap;

    constructor() {
        this.handleNameMap = new HandleNameMap();
        this.handleCountMap = new HandleCountMap();
    }

    addContributor(handle: string, name: string) {
        this.handleNameMap.set(handle, name);
        this.handleCountMap.increment(handle);
    }

    getTopContributors(): Array<{name: string, handle: string}> {
        let sorted = Array.from(this.handleCountMap.map.entries()).sort((a, b) => b[1] - a[1]);
        let top_contributors = [];
        for (let i = 0; i < Math.min(12, sorted.length); i++) {
            top_contributors.push({name: this.handleNameMap.get(sorted[i][0]), handle: sorted[i][0]});
        }
        return top_contributors;
    }
}

async function get_top_contributors(): Promise<Array<{name: string, handle: string}>> {
    let ranker = new HandleRanker();
    
    let cretval = await getCount();
    let allIssueData = await Promise.all(Array.from({length: cretval}, (_, i) => i + 1).map(async (i) => {
        return await getIssueData(i);
    }));

    for (let data of allIssueData) {
        if (data === null) {
            continue;
        }
        data.contributors.forEach((contributor: {name: string, handle: string}) => {
            ranker.addContributor(contributor.handle, contributor.name);
        });
    }

    return ranker.getTopContributors();
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

export const Head: HeadFC = () => <title>no nothing magazine | featured</title>
