import React from 'react';
import BACKEND_URL from '../util/aws';
import { StaticImage } from 'gatsby-plugin-image';

/// NewsItem is a component that displays a single news item
/// NewsItem displays an image, title, and description.
const NewsItem: React.FC<{ title: string, description: string, image_url: string }> = ({ title, description, image_url }) => {
    return (
        <div className="news-item">
            <img src={image_url}
                alt="News Image"
                className="news-image" />
            <div className="news-content">
                <h2 className="news-title">{title}</h2>
                <p className="news-description">{description}</p>
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
                    <StaticImage src="../images/nnmnews.png" alt="News Background" className="news-image" />
                    <h1 id="news-heading" style={{display: "none"}}>News</h1>
                    <div className="news-list">
                        {news.articles.map((newsItem, index) => (
                            <NewsItem key={index} {...newsItem} />
                        ))}
                    </div>
                </div>
        }
        </>
    )
}

export default NewsContainer;