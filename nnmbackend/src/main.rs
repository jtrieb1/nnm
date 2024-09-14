use actix_web::{App, HttpServer};
use aws_config::meta::region::RegionProviderChain;
use aws_config::BehaviorVersion;
use aws_sdk_s3::{presigning::PresigningConfigBuilder, Client as S3Client, Error as S3Error};


#[actix_web::main]
async fn main() -> Result<(), std::io::Error> {
    HttpServer::new(|| {
        App::new()
            .service(count_issues)
            .service(get_issue)
            .service(get_latest_issue)
    })
    .bind(("0.0.0.0", 8000))?
    .run()
    .await
}

async fn get_s3_client() -> S3Client {
    let region_provider = RegionProviderChain::default_provider().or_else("us-east-1");
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
        Err(_) => "Error".to_string(),
    }
}

#[actix_web::get("/issue/{issue_number}")]
async fn get_issue(issue_number: actix_web::web::Path<usize>) -> actix_web::HttpResponse {
    // Returns signed URL for issue
    let s3client = get_s3_client().await;
    match get_signed_url_for_issue(issue_number.into_inner(), &s3client).await {
        Ok(url) => actix_web::HttpResponse::Ok().body(url),
        Err(_) => actix_web::HttpResponse::InternalServerError().body("Error"),
    }
}

#[actix_web::get("/issue/latest")]
async fn get_latest_issue() -> actix_web::HttpResponse {
    // Returns signed URL for latest issue
    let s3client = get_s3_client().await;
    match get_issue_count(&s3client).await {
        Ok(count) => match get_signed_url_for_issue(count, &s3client).await {
            Ok(url) => actix_web::HttpResponse::Ok().body(url),
            Err(_) => actix_web::HttpResponse::InternalServerError().body("Error"),
        },
        Err(_) => actix_web::HttpResponse::InternalServerError().body("Error"),
    }
}

async fn get_issue_count(s3client: &S3Client) -> Result<usize, S3Error> {
    let issues = s3client.list_objects_v2().bucket("nonothingissues").send().await?;
    Ok(issues.contents.unwrap().len())
}

async fn get_signed_url_for_issue(issue_number: usize, s3client: &S3Client) -> Result<String, S3Error> {
    let issue_key = format!("issue_{:04}.pdf", issue_number);
    // Generate a signed URL for the issue
    let bucket = "nonothingissues";
    let conf = PresigningConfigBuilder::default().build().unwrap();
    let ret = s3client.get_object().bucket(bucket).key(issue_key).presigned(conf).await?;
    Ok(ret.uri().to_string())
}
