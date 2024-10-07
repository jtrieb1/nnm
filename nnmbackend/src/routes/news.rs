

/// This module defines the routes for fetching news articles.
///
/// The routes are defined using Actix-web and handle HTTP GET requests to fetch the latest news articles.
///
/// # Routes
///
/// - `GET /news`: Fetches the latest news articles from the database and S3 storage.
///
/// # Structs
///
/// - `NewsAPIResponse`: Represents the structure of the response containing news articles.
///
/// # Example
///
/// ```
/// use actix_web::{web, App, HttpServer};
/// use nnmbackend::routes::news::get_news;
///
/// #[actix_web::main]
/// async fn main() -> std::io::Result<()> {
///     HttpServer::new(|| {
///         App::new()
///             .route("/news", web::get().to(get_news))
///     })
///     .bind("127.0.0.1:8080")?
///     .run()
///     .await
/// }
/// ```
///
/// # Errors
///
/// This route returns an `InternalServerError` if there is an issue fetching the news articles from the database or S3 storage.
use actix_web::Responder;

use crate::utils::{dynamodb as db, news::{get_latest_news, NewsItem}, s3::get_s3_client};

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct NewsAPIResponse {
    pub articles: Vec<NewsItem>
}

#[actix_web::get("/news")]
pub async fn get_news() -> impl Responder {
    let dbclient = db::get_db_client().await.unwrap();
    let s3client = get_s3_client().await;

    let news_items = get_latest_news(&dbclient, &s3client).await.unwrap();
    let response = NewsAPIResponse { articles: news_items };
    actix_web::HttpResponse::Ok().json(response)
}