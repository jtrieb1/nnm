pub mod dynamodb;
pub mod s3;
pub mod shopify;

use std::time::Duration;

use anyhow::anyhow;
use aws_sdk_dynamodb::Client as DynamoClient;
use aws_sdk_s3::{presigning::PresigningConfigBuilder, Client as S3Client};
use s3::get_bucket_for_client;

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct NewsItem {
    pub title: String,
    pub description: String,
    pub image_name: String,
    pub image_url: Option<String>
}

pub async fn get_latest_news(dbclient: &DynamoClient, s3client: &S3Client) -> Result<Vec<NewsItem>, anyhow::Error> {
    let bucket = get_bucket_for_client(s3client);
    // Only get the latest 5 news items
    let response = dbclient
        .scan()
        .table_name("nnmNews")
        .filter_expression("attribute_exists(title)")
        .projection_expression("title, description, image_name")
        .limit(5)
        .send()
        .await?;

    let items = response.items.ok_or(anyhow!("Could not retrieve items"))?;
    let mut news_item_results: Vec<Result<NewsItem, anyhow::Error>> = items
        .iter()
        .map(|item| {
            let title = item
                .get("title")
                .ok_or(anyhow!("Title not found"))?
                .as_s().unwrap();
            let description = item
                .get("description")
                .ok_or(anyhow!("Description not found"))?
                .as_s().unwrap();
            let image_name = item
                .get("image_name")
                .ok_or(anyhow!("Image name not found"))?
                .as_s().unwrap();

            Ok::<NewsItem, anyhow::Error>(NewsItem {
                title: title.to_string(),
                description: description.to_string(),
                image_name: image_name.to_string(),
                image_url: None
            })
        })
        .collect();

    let mut news_items = Vec::new();

    for news_item in news_item_results.iter_mut() {
        if let Err(e) = news_item {
            return Err(anyhow!("Error: {}", e));
        } 
        let news_item = news_item.as_mut().unwrap();
        // Get a presigned url
        let conf = PresigningConfigBuilder::default()
        .expires_in(Duration::from_secs(30))
        .build()
        .unwrap();
        let ret = s3client
            .get_object()
            .bucket(bucket)
            .key(news_item.image_name.clone())
            .presigned(conf)
            .await?;
        
        let image_url = ret.uri().to_string();

        news_item.image_url = Some(image_url);
        news_items.push(news_item.clone());
    }

    Ok(news_items)
}