use std::io::Read;

use actix_multipart::form::{tempfile::TempFile, MultipartForm};
use actix_web::Responder;

use crate::utils::{dynamodb as db, s3::{get_bucket_for_client, get_s3_client}};

/// This module defines the routes for handling file uploads.
///
/// The routes are defined using Actix-web and handle multipart form data for file uploads.
///
/// # Routes
///
/// - `POST /upload`: Handles file uploads with additional metadata.
///
/// # Structs
///
/// - `UploadForm`: Represents the structure of the multipart form data for file uploads.
///
/// # Example
///
/// ```
/// use actix_web::{web, App, HttpServer};
/// use nnmbackend::routes::upload;
///
/// #[actix_web::main]
/// async fn main() -> std::io::Result<()> {
///     HttpServer::new(|| {
///         App::new()
///             .route("/upload", web::post().to(upload))
///     })
///     .bind("127.0.0.1:8080")?
///     .run()
///     .await
/// }
/// ```
///
/// # Errors
///
/// This route returns an `InternalServerError` if there is an issue processing the uploaded file or form data.

#[derive(Debug, MultipartForm)]
struct UploadForm {
    file: TempFile,
    api_key: actix_multipart::form::text::Text<String>,
    issue_number: actix_multipart::form::text::Text<usize>,
    blurb: actix_multipart::form::text::Text<String>,
}

/// This route allows for uploading a new issue to the NNM database.
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
    let bucket = get_bucket_for_client(&s3client);

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