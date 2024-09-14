use std::time::Duration;

use actix_web::{http, App, HttpServer};
use aws_config::meta::region::RegionProviderChain;
use aws_config::BehaviorVersion;
use aws_sdk_s3::{presigning::PresigningConfigBuilder, types::error::NotFound, Client as S3Client, Error as S3Error};
use actix_cors::Cors;

#[actix_web::main]
async fn main() -> Result<(), std::io::Error> {
    HttpServer::new(|| {
        let cors = Cors::default()
            .allow_any_origin()
            .allowed_methods(vec!["GET"])
            .allowed_headers(vec![http::header::AUTHORIZATION, http::header::ACCEPT])
            .allowed_header(http::header::CONTENT_TYPE)
            .max_age(3600)
            .send_wildcard();
        App::new()
            .wrap(cors)
            .service(count_issues)
            .service(get_issue)
            .service(get_latest_issue)
    })
    .bind(("0.0.0.0", 8000))?
    .run()
    .await
}

async fn get_s3_client() -> S3Client {
    let region_provider = RegionProviderChain::default_provider().or_else("us-east-2");
    let config = aws_config::defaults(BehaviorVersion::latest())
        .region(region_provider)
        .load()
        .await;
    S3Client::new(&config)
}

#[actix_web::get("/count")]
async fn count_issues() -> String {
    let s3client = get_s3_client().await;
    match get_issue_count(&s3client).await {
        Ok(count) => format!("{{\"count\": {}}}", count),
        Err(e) => format!("{{\"error\": \"{}\"}}", e),
    }
}

#[actix_web::get("/issue/{issue_number}")]
async fn get_issue(issue_number: actix_web::web::Path<usize>) -> actix_web::HttpResponse {
    // Returns signed URL for issue
    let s3client = get_s3_client().await;
    match get_signed_url_for_issue(issue_number.into_inner(), &s3client).await {
        Ok(url) => actix_web::HttpResponse::Ok().body(url),
        Err(e) => actix_web::HttpResponse::InternalServerError().body(format!("Error: {}", e)),
    }
}

#[actix_web::get("/issue/latest")]
async fn get_latest_issue() -> actix_web::HttpResponse {
    // Returns signed URL for latest issue
    let s3client = get_s3_client().await;
    match get_issue_count(&s3client).await {
        Ok(count) => match get_signed_url_for_issue(count, &s3client).await {
            Ok(url) => actix_web::HttpResponse::Ok().body(url),
            Err(e) => actix_web::HttpResponse::InternalServerError().body(format!("Error: {}", e)),
        },
        Err(e) => actix_web::HttpResponse::InternalServerError().body(format!("Error: {}", e)),
    }
}

async fn get_issue_count(s3client: &S3Client) -> Result<usize, S3Error> {
    if s3client.config().region().is_some_and(|reg| reg.as_ref() == "us-east-1") {
        let issues = s3client.list_objects_v2().bucket("nonothingissues1").send().await?;
        Ok(issues.contents.unwrap_or_default().len())
    } else if s3client.config().region().is_some_and(|reg| reg.as_ref() == "us-west-2") {
        let issues = s3client.list_objects_v2().bucket("nonothingissues").send().await?;
        Ok(issues.contents.unwrap_or_default().len())
    } else {
        Err(S3Error::NotFound(NotFound::builder().message("Invalid region").build()))
    }
    
}

async fn get_signed_url_for_issue(issue_number: usize, s3client: &S3Client) -> Result<String, S3Error> {
    let issue_key = format!("issue_{}.pdf", issue_number);
    // Generate a signed URL for the issue
    let bucket = {
        if s3client.config().region().is_some_and(|reg| reg.as_ref() == "us-east-1") {
            "nonothingissues1"
        } else if s3client.config().region().is_some_and(|reg| reg.as_ref() == "us-west-2") {
            "nonothingissues"
        } else {
            return Err(S3Error::NotFound(NotFound::builder().message("Invalid region").build()));
        }
    };
    let conf = PresigningConfigBuilder::default().expires_in(Duration::from_secs(3600)).build().unwrap();
    let ret = s3client.get_object().bucket(bucket).key(issue_key).presigned(conf).await?;
    Ok(ret.uri().to_string())
}
