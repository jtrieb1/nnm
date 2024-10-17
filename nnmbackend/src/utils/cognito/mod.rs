use aws_config::BehaviorVersion;
use aws_sdk_cognitoidentityprovider::Client;

pub async fn get_cognito_client() -> Client {
    Client::new(
        &&aws_config::load_defaults(BehaviorVersion::latest()).await,
    )
}

pub async fn validate_token(client: Client, token: String) -> bool {
    // Try to use it, if it works then it's valid
    let request = client
        .get_user()
        .access_token(token)
        .send()
        .await;

    match request {
        Ok(_) => true,
        Err(_) => false,
    }
}