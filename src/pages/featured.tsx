import React from 'react';
import { HeadFC } from 'gatsby';

import SegmentHeader from '../components/segmentheader';

import getCount from '../util/count';
import { getIssueData } from '../util/issue';
import handle_to_link from '../util/links';
import Footer from '../components/footer';
import Header from '../components/header';
import ContextBg from '../components/contextbg';
import PaperBacked from '../components/paperbacked';

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
    const [textCentered, setTextCentered] = React.useState(false);

    React.useEffect(() => {
        if (window.matchMedia('(max-width: 768px)').matches) {
            setTextCentered(true);
        }

        window.onresize = () => {
            if (window.matchMedia('(max-width: 768px)').matches) {
                setTextCentered(true);
            } else {
                setTextCentered(false);
            }
        }
        
        get_top_contributors().then((top_contributors) => {
            setTopContributors(top_contributors);
        });
    }, []);

    return (
        <>
            <Header />
            <div className="container mx-auto" style={{flex: 1, height: "100%", minHeight: "85vh"}}>
                <ContextBg cutoffpx={768} />
                <SegmentHeader headerText="Featured Artists" dark={false}/>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" style={{flex: 1}}>
                    {
                        top_contributors.length === 0 ? (
                            <PaperBacked animated={false}>
                                <></>
                                <h2 className="text-2xl font-bold" style={{color: "#222831"}}>Loading...</h2>
                            </PaperBacked>
                        )
                        : top_contributors.map((contributor, index) => (
                        <PaperBacked key={index} animated={true}>
                            <></>
                            <a href={handle_to_link(contributor.handle)} target="_blank" rel="noreferrer" aria-label={`Visit ${contributor.name}'s profile`} className="featured-link" style={textCentered ? {display: "flex", flexDirection: "row"} : {}}>
                                <h2 className="text-2xl font-bold">{contributor.name}</h2>
                                {
                                    textCentered ?
                                    <p className='text-lg' style={{marginLeft: "20px"}}>{contributor.handle}</p> :
                                    <p className='text-lg'>{contributor.handle}</p>
                                }
                            </a>
                        </PaperBacked>
                        
                    ))}
                </div>
            </div>
            <Footer />
        </>
    );
}

export default FeaturedArtists;

export const Head: HeadFC = () => <title>no nothing magazine | featured</title>
