use std::io::Read;

use crate::utils::dynamodb as db;
use crate::utils::s3::get_s3_client;

use actix_multipart::form::{tempfile::TempFile, MultipartForm};
use actix_web::Responder;

pub mod dynamodb;
pub mod s3;
pub mod shopify;

#[derive(Debug, MultipartForm)]
struct UploadForm {
    file: TempFile,
    api_key: actix_multipart::form::text::Text<String>,
    issue_number: actix_multipart::form::text::Text<usize>,
    blurb: actix_multipart::form::text::Text<String>,
}

#[actix_web::post("/upload")]
async fn upload(MultipartForm(form): MultipartForm<UploadForm>) -> impl Responder {
    // Check API key
    let api_key = std::env::var("NNM_API_KEY").unwrap_or("".to_string());
    if api_key.is_empty() {
        return actix_web::HttpResponse::InternalServerError().body("API key not set");
    }

    if form.api_key.0 != api_key {
        return actix_web::HttpResponse::Unauthorized().body("Invalid API key");
    }

    // Get file as bytes
    let mut file = form.file.file.as_file();
    let mut bytes = Vec::new();
    file.read_to_end(&mut bytes).unwrap();

    // Upload the issue to S3
    let s3client = get_s3_client().await;
    let issue_number = form.issue_number.0;
    let issue_key = format!("nnm_issues/issue_{}.pdf", issue_number);

    // Need to upload to buckets in both regions
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
            return actix_web::HttpResponse::InternalServerError().body("Invalid region");
        }
    };

    let put_req = s3client
        .put_object()
        .bucket(bucket)
        .key(issue_key)
        .body(bytes.into());

    let res = put_req.send().await;
    if let Err(e) = res {
        return actix_web::HttpResponse::InternalServerError().body(format!("Error: {}", e));
    }

    // Add the issue to the database
    let issue = db::DBIssue::new(issue_number, form.blurb.0.clone(), vec![]);
    let put_res = db::put_issue_data(issue, &db::get_db_client().await.unwrap()).await;
    if let Err(e) = put_res {
        return actix_web::HttpResponse::InternalServerError().body(format!("Error: {}", e));
    }

    actix_web::HttpResponse::Ok().body("Issue uploaded and added to database")
}
