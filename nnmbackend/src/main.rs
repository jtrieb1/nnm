use aws_config::meta::region::RegionProviderChain;
use aws_config::BehaviorVersion;
use aws_sdk_dynamodb::{Client, Error};
use aws_sdk_s3::{types::error::NotFound, Client as S3Client, Error as S3Error};

#[tokio::main]
async fn main() -> Result<(), anyhow::Error> {
    let region_provider = RegionProviderChain::default_provider().or_else("us-east-1");
    let config = aws_config::defaults(BehaviorVersion::latest())
        .region(region_provider)
        .load()
        .await;
    let s3client = S3Client::new(&config);

    let issues = get_issue_count(s3client.clone()).await?;
    println!("{}", issues);
    Ok(())
}

async fn get_issue_count(s3client: S3Client) -> Result<usize, S3Error> {
    let issues = s3client.list_objects_v2().bucket("nonothingissues").send().await?;
    Ok(issues.contents.unwrap().len())
}

async fn get_issue_pdf(issue_number: usize, s3client: S3Client) -> Result<Vec<u8>, S3Error> {
    let issue_key = format!("issue_{:04}.pdf", issue_number);
    let issue = s3client.get_object().bucket("nonothingissues").key(issue_key).send().await?;
    let body = issue.body.collect().await.map_err(|_| S3Error::NotFound(NotFound::builder().message("Issue not found").build()))?;
    Ok(body.to_vec())
}