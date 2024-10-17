/// This module provides utility functions for interacting with AWS S3.
///
/// The functions include creating an S3 client, retrieving the latest issue count,
/// generating signed URLs for accessing issues, and determining the appropriate S3 bucket
/// based on the client's region.
///
/// # Functions
///
/// - `get_s3_client`: Creates and returns an S3 client configured with the appropriate region.
/// - `get_issue_count`: Retrieves the count of issues available in the S3 bucket.
/// - `get_bucket_for_client`: Determines the appropriate S3 bucket based on the client's region.
/// - `get_signed_url_for_latest_issue`: Generates a signed URL for the latest issue available in the S3 bucket.
/// - `get_signed_url_for_issue`: Generates a signed URL for a specific issue based on the issue number.
///
/// # Example
///
/// ```
/// use nnmbackend::utils::s3::{get_s3_client, get_signed_url_for_latest_issue};
///
/// #[tokio::main]
/// async fn main() {
///     let s3client = get_s3_client().await;
///     match get_signed_url_for_latest_issue(&s3client).await {
///         Ok(url) => println!("Signed URL: {}", url),
///         Err(e) => eprintln!("Error generating signed URL: {}", e),
///     }
/// }
/// ```
///
/// # Errors
///
/// These functions return various errors related to S3 operations, such as `S3Error::NotFound`
/// if the specified bucket or object is not found, or other errors related to AWS SDK operations.

use std::time::Duration;

use aws_config::{meta::region::RegionProviderChain, BehaviorVersion};
use aws_sdk_s3::Client as S3Client;
use aws_sdk_s3::{presigning::PresigningConfigBuilder, types::error::NotFound, Error as S3Error};

pub async fn get_s3_client() -> S3Client {
    let region_provider = RegionProviderChain::default_provider().or_else("us-east-1");
    let config = aws_config::defaults(BehaviorVersion::latest())
        .region(region_provider)
        .load()
        .await;
    S3Client::new(&config)
}

pub async fn get_issue_count(s3client: &S3Client) -> Result<usize, S3Error> {
    let bucket = get_bucket_for_client(s3client);

    let Ok(issues) = s3client
        .list_objects_v2()
        .bucket(bucket)
        .send()
        .await
    else {
        return Err(S3Error::NotFound(
            NotFound::builder()
                .message("Issue with S3Client or bucket")
                .build(),
        ));
    };

    let latest_issue = issues.contents()
        .iter()
        .map(|obj| {
            let key = obj.key.as_ref().unwrap();
            // Key may include prefix before issue_, so we trim that off
            // Trim up to end of "issue_":
            let key = key.find("issue_").map(|idx| &key[idx..]).unwrap_or(key);
            // check if key is a pdf
            if !key.ends_with(".pdf") {
                return 0;
            }
            println!("{}", key);
            let issue_number = key
                .trim_start_matches("issue_")
                .trim_end_matches(".pdf")
                .parse::<usize>()
                .unwrap();

            issue_number
        })
        .max()
        .unwrap();

    return Ok(latest_issue);
}

pub fn get_bucket_for_client(s3client: &S3Client) -> &'static str {
    if s3client
        .config()
        .region()
        .is_some_and(|reg| reg.as_ref() == "us-east-1")
    {
        "nonothingissues1"
    } else if s3client
        .config()
        .region()
        .is_some_and(|reg| reg.as_ref() == "us-east-2")
    {
        "nonothingissues"
    } else {
        panic!("Invalid region");
    }
}

pub async fn get_signed_url_for_latest_issue(s3client: &S3Client) -> Result<String, S3Error> {
    // Need to list all issues to check for latest, since some may be missing
    let bucket = get_bucket_for_client(s3client);
    
    let objects = s3client
        .list_objects_v2()
        .bucket(bucket)
        .send()
        .await?
        .contents
        .unwrap_or_default();
    let latest_issue = objects
        .iter()
        .map(|obj| {
            let key = obj.key.as_ref().unwrap();
            // Key may include prefix before issue_, so we trim that off
            // Trim up to end of "issue_":
            let key = key.find("issue_").map(|idx| &key[idx..]).unwrap_or(key);
            // check if key is a pdf
            if !key.ends_with(".pdf") {
                return 0;
            }
            
            let issue_number = key
                .trim_start_matches("issue_")
                .trim_end_matches(".pdf")
                .parse::<usize>()
                .unwrap();

            issue_number
        })
        .max()
        .unwrap();

    get_signed_url_for_issue(latest_issue, s3client).await
}

pub async fn get_signed_url_for_issue(
    issue_number: usize,
    s3client: &S3Client,
) -> Result<String, S3Error> {
    let issue_key = format!("nnm_issues/issue_{}.pdf", issue_number);
    // Generate a signed URL for the issue
    let bucket = get_bucket_for_client(s3client);
    
    let conf = PresigningConfigBuilder::default()
        .expires_in(Duration::from_secs(30))
        .build()
        .unwrap();
    let ret = s3client
        .get_object()
        .bucket(bucket)
        .key(issue_key)
        .presigned(conf)
        .await?;
    Ok(ret.uri().to_string())
}
