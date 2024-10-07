/// This module defines the route for fetching issue data from DynamoDB.
///
/// The route is defined using Actix-web and interacts with DynamoDB through utility functions.
///
/// # Routes
///
/// - `GET /issuedata/{issue_number}`: Fetches issue data for the given issue number.
///
/// # Functions
///
/// - `get_issue_data`: Asynchronously fetches issue data from DynamoDB and returns an HTTP response.
///
/// # Example
///
/// ```
/// use actix_web::{web, App, HttpServer};
/// use nnmbackend::routes::dynamodb::get_issue_data;
///
/// #[actix_web::main]
/// async fn main() -> std::io::Result<()> {
///     HttpServer::new(|| {
///         App::new()
///             .route("/issuedata/{issue_number}", web::get().to(get_issue_data))
///     })
///     .bind("127.0.0.1:8080")?
///     .run()
///     .await
/// }
/// ```
///
/// # Errors
///
/// This function returns an `InternalServerError` if there is an issue fetching data from DynamoDB.

use crate::utils::dynamodb as db;
use actix_web::web::Path;

#[actix_web::get("/issuedata/{issue_number}")]
async fn get_issue_data(issue_number: Path<usize>) -> actix_web::HttpResponse {
    // Get issue data from database
    let client = db::get_db_client().await.unwrap();
    match db::get_issue_data(issue_number.into_inner(), &client).await {
        Ok(issue) => actix_web::HttpResponse::Ok().body(serde_json::to_string(&issue).unwrap()),
        Err(e) => actix_web::HttpResponse::InternalServerError().body(format!("Error: {}", e)),
    }
}
