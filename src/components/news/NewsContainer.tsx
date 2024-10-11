import React from 'react';
import BACKEND_URL from '../../util/aws';
import { GatsbyImage, getImage, StaticImage } from 'gatsby-plugin-image';
import { graphql, useStaticQuery } from 'gatsby';

import "./NewsContainer.css";

/// NewsItem is a component that displays a single news item
/// NewsItem displays an image, title, and description.
const NewsItem: React.FC<{ title: string, description: string, image_url: string, index: number }> = ({ title, description, image_url, index }) => {
    let imgquery = useStaticQuery(graphql`
        {
            tape1: file(relativePath: {eq: "tape1.png"}) {
                childImageSharp {
                    gatsbyImageData
                }
            }
            tape2: file(relativePath: {eq: "tape2.png"}) {
                childImageSharp {
                    gatsbyImageData
                }
            }
            tape3: file(relativePath: {eq: "tape3.png"}) {
                childImageSharp {
                    gatsbyImageData
                }
            }
        }
    `);

    let imageSelection = index % 3 + 1;
    let qchoice = imageSelection === 0 ? imgquery.tape1 : imageSelection === 1 ? imgquery.tape2 : imgquery.tape3;
    let image = getImage(qchoice);

    const [showDescription, setShowDescription] = React.useState(false);

    React.useEffect(() => {
        if (window.matchMedia('(min-width: 768px)').matches) {
            setShowDescription(true);
        } else {
            setShowDescription(false);
        }
    }, [setShowDescription]);

    return (
        <div className="news-item">
            <div className='tape-decoration-container'>
                <GatsbyImage image={image!} alt="tape-decoration" imgClassName='tape-decoration' />
            </div>
            <div className="news-item-underlay">
                <img src={image_url}
                    alt="News Image"
                    className="news-image" />
                <div className="news-content">
                    <h2 className="news-title">{title}</h2>
                    {showDescription && <p className="news-description">{description}</p>}
                </div>
            </div>
        </div>
    );
}

/// NewsAPIResponse is the expected response shape from the news API
type NewsAPIResponse = {
    articles: Array<{ title: string, description: string, image_url: string }>;
}

/// NewsContainer is a component that fetches and displays a list of news items
const NewsContainer: React.FC<{}> = () => {
    let [news, setNews] = React.useState<NewsAPIResponse>({ articles: [] });

    React.useEffect(() => {
        fetch(BACKEND_URL + '/news')
            .then(response => response.json())
            .then(data => setNews(data));
    }, []);

    return (
        <>
        {
            news.articles.length === 0 ?
                null :
                <div className="news-container" role="region" aria-labelledby="news-heading">
                    <div className='news-header-bg-container'>
                        <StaticImage src="../../images/paper.jpg" alt="News Background" className="news-header-bg-image"/>
                    </div>
                    <div className="news-overlay">
                        <div className='news-header-container'>
                            <StaticImage src="../../images/nnmnews.png" alt="News Background" imgClassName="news-header-image" />
                        </div>
                        <h1 id="news-heading" style={{display: "none"}}>News</h1>
                        <div className="news-list">
                            {news.articles.map((newsItem, index) => (
                                <NewsItem key={index} index={index} {...newsItem} />
                            ))}
                        </div>
                    </div>
                    
                </div>
        }
        </>
    )
}

export default NewsContainer;