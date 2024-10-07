/// This module defines the routes for handling interactions with S3.
///
/// The routes are defined using Actix-web and handle various operations such as counting issues,
/// retrieving the latest issue, and getting a specific issue by its number.
///
/// # Routes
///
/// - `GET /count`: Returns the count of issues in S3.
/// - `GET /latest`: Returns a signed URL for the latest issue.
/// - `GET /issue/{issue_number}`: Returns a signed URL for a specific issue by its number.
///
/// # Example
///
/// ```
/// use actix_web::{web, App, HttpServer};
/// use nnmbackend::routes::s3;
///
/// #[actix_web::main]
/// async fn main() -> std::io::Result<()> {
///     HttpServer::new(|| {
///         App::new()
///             .service(s3::count_issues)
///             .service(s3::get_latest_issue)
///             .service(s3::get_issue)
///     })
///     .bind("127.0.0.1:8080")?
///     .run()
///     .await
/// }
/// ```
///
/// # Errors
///
/// These routes return an `InternalServerError` if there is an issue interacting with S3.
use actix_web::web::Path;

use crate::utils::s3::{
    get_issue_count, get_s3_client, get_signed_url_for_issue, get_signed_url_for_latest_issue,
};

#[actix_web::get("/count")]
async fn count_issues() -> String {
    let s3client = get_s3_client().await;
    match get_issue_count(&s3client).await {
        Ok(count) => format!("{{\"count\": {}}}", count),
        Err(e) => format!("{{\"error\": \"{}\"}}", e),
    }
}

#[actix_web::get("/latest")]
async fn get_latest_issue() -> actix_web::HttpResponse {
    // Returns signed URL for latest issue
    let s3client = get_s3_client().await;
    match get_signed_url_for_latest_issue(&s3client).await {
        Ok(url) => actix_web::HttpResponse::Ok().body(url),
        Err(e) => actix_web::HttpResponse::InternalServerError().body(format!("Error: {}", e)),
    }
}

#[actix_web::get("/issue/{issue_number}")]
async fn get_issue(issue_number: Path<usize>) -> actix_web::HttpResponse {
    // Returns signed URL for issue
    let s3client = get_s3_client().await;
    match get_signed_url_for_issue(issue_number.into_inner(), &s3client).await {
        Ok(url) => actix_web::HttpResponse::Ok().body(url),
        Err(e) => actix_web::HttpResponse::InternalServerError().body(format!("Error: {}", e)),
    }
}
