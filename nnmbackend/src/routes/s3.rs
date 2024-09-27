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
