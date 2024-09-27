use actix_web::web::Path;
use crate::utils::dynamodb as db;

#[actix_web::get("/issuedata/{issue_number}")]
async fn get_issue_data(issue_number: Path<usize>) -> actix_web::HttpResponse {
    // Get issue data from database
    let client = db::get_db_client().await.unwrap();
    match db::get_issue_data(issue_number.into_inner(), &client).await {
        Ok(issue) => actix_web::HttpResponse::Ok().body(serde_json::to_string(&issue).unwrap()),
        Err(e) => actix_web::HttpResponse::InternalServerError().body(format!("Error: {}", e)),
    }
}