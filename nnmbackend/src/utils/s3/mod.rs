use std::time::Duration;

use aws_config::{meta::region::RegionProviderChain, BehaviorVersion};
use aws_sdk_s3::Client as S3Client;
use aws_sdk_s3::{presigning::PresigningConfigBuilder, types::error::NotFound, Error as S3Error};

pub async fn get_s3_client() -> S3Client {
    let region_provider = RegionProviderChain::default_provider().or_else("us-east-2");
    let config = aws_config::defaults(BehaviorVersion::latest())
        .region(region_provider)
        .load()
        .await;
    S3Client::new(&config)
}

pub async fn get_issue_count(s3client: &S3Client) -> Result<usize, S3Error> {
    if s3client
        .config()
        .region()
        .is_some_and(|reg| reg.as_ref() == "us-east-1")
    {
        let Ok(issues) = s3client
            .list_objects_v2()
            .bucket("nonothingissues1")
            .send()
            .await
        else {
            return Err(S3Error::NotFound(
                NotFound::builder()
                    .message("Issue with S3Client or bucket in us-east-1")
                    .build(),
            ));
        };
        Ok(issues.contents.unwrap_or_default().len())
    } else if s3client
        .config()
        .region()
        .is_some_and(|reg| reg.as_ref() == "us-east-2")
    {
        let Ok(issues) = s3client
            .list_objects_v2()
            .bucket("nonothingissues")
            .send()
            .await
        else {
            return Err(S3Error::NotFound(
                NotFound::builder()
                    .message("Issue with S3Client or bucket in us-east-2")
                    .build(),
            ));
        };
        Ok(issues.contents.unwrap_or_default().len())
    } else {
        Err(S3Error::NotFound(
            NotFound::builder().message("Invalid region").build(),
        ))
    }
}

pub async fn get_signed_url_for_latest_issue(s3client: &S3Client) -> Result<String, S3Error> {
    // Need to list all issues to check for latest, since some may be missing
    let bucket = {
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
            return Err(S3Error::NotFound(
                NotFound::builder().message("Invalid region").build(),
            ));
        }
    };

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
    let bucket = {
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
            return Err(S3Error::NotFound(
                NotFound::builder().message("Invalid region").build(),
            ));
        }
    };
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
