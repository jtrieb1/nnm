use actix_cors::Cors;
use actix_web::{http, App, HttpServer};

mod routes;
mod utils;

use routes::{
    dynamodb::get_issue_data,
    s3::{count_issues, get_issue, get_latest_issue},
    shopify::{create_checkout, get_checkout, execute_checkout},
    upload,
};

#[actix_web::main]
async fn main() -> Result<(), std::io::Error> {
    println!("Starting server on port 443...");
    HttpServer::new(|| {
        let cors = Cors::default()
            .allow_any_origin()
            .allowed_methods(vec!["GET", "POST"])
            .allowed_headers(vec![http::header::AUTHORIZATION, http::header::ACCEPT])
            .allowed_header(http::header::CONTENT_TYPE)
            .max_age(3600)
            .send_wildcard();
        App::new()
            .wrap(cors)
            .service(count_issues)
            .service(get_issue)
            .service(get_latest_issue)
            .service(get_issue_data)
            .service(create_checkout)
            .service(get_checkout)
            .service(execute_checkout)
            .service(upload)
    })
    .bind("127.0.0.1:8000")?
    .run()
    .await
}
