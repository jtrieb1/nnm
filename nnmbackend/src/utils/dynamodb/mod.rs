/// This module provides utility functions for interacting with DynamoDB.
///
/// The functions include creating a DynamoDB client, retrieving issue data, and storing issue data.
///
/// # Structs
///
/// - `DBContributor`: Represents a contributor with a name and handle.
/// - `DBIssue`: Represents an issue with a number, blurb, and a list of contributors.
///
/// # Functions
///
/// - `get_db_client`: Asynchronously creates and returns a DynamoDB client.
/// - `get_issue_data`: Asynchronously retrieves issue data from DynamoDB based on the issue number.
/// - `put_issue_data`: Asynchronously stores issue data in DynamoDB.
///
/// # Example
///
/// ```
/// use nnmbackend::utils::dynamodb::{get_db_client, get_issue_data, put_issue_data, DBIssue, DBContributor};
/// use aws_sdk_dynamodb::Client;
///
/// #[tokio::main]
/// async fn main() -> Result<(), Box<dyn std::error::Error>> {
///     let client = get_db_client().await?;
///
///     let issue = DBIssue::new(
///         1,
///         "Issue blurb".to_string(),
///         vec![DBContributor {
///             name: "Contributor Name".to_string(),
///             handle: "contributor_handle".to_string(),
///         }],
///     );
///
///     put_issue_data(issue, &client).await?;
///
///     let retrieved_issue = get_issue_data(1, &client).await?;
///     println!("{:?}", retrieved_issue);
///
///     Ok(())
/// }
/// ```
///
/// # Errors
///
/// - `get_db_client`: Returns an `Error` if there is an issue creating the DynamoDB client.
/// - `get_issue_data`: Returns an `Error` if there is an issue retrieving the item from DynamoDB or parsing the item attributes.
/// - `put_issue_data`: Returns an `Error` if there is an issue storing the item in DynamoDB.

use anyhow::{anyhow, Error};
use aws_config::{meta::region::RegionProviderChain, BehaviorVersion};
use aws_sdk_dynamodb::{types::AttributeValue, Client as DynamoClient};

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct DBContributor {
    pub name: String,
    pub handle: String,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct DBIssue {
    pub number: usize,
    pub blurb: String,
    pub contributors: Vec<DBContributor>,
}

impl DBIssue {
    pub fn new(number: usize, blurb: String, contributors: Vec<DBContributor>) -> Self {
        DBIssue {
            number,
            blurb,
            contributors,
        }
    }
}

pub async fn get_db_client() -> Result<DynamoClient, Error> {
    let region_provider = RegionProviderChain::default_provider().or_else("us-east-1");
    let config = aws_config::defaults(BehaviorVersion::latest())
        .region(region_provider)
        .load()
        .await;
    Ok(DynamoClient::new(&config))
}

pub async fn get_issue_data(issue_number: usize, client: &DynamoClient) -> Result<DBIssue, Error> {
    let response = client
        .get_item()
        .table_name("nnmIssueData")
        .key("issueNumber", AttributeValue::N(issue_number.to_string()))
        .send()
        .await?;

    let item = response.item.ok_or(anyhow!("Could not retrieve item"))?;
    let blurb = item
        .get("blurb")
        .ok_or(anyhow!("Blurb not found"))?
        .as_s()
        .map_err(|e| anyhow!(format!("{:?}", e)))?
        .to_string();

    let contributors = item
        .get("contributors")
        .ok_or(anyhow!("Contributors not found"))?
        .as_l()
        .map_err(|e| anyhow!(format!("{:?}", e)))?
        .iter()
        .map(|contributor| {
            let contributor = contributor.as_ss().unwrap(); // String-sets
            let handle = contributor.first().unwrap().to_string();
            let name = contributor.get(1).unwrap().to_string();
            DBContributor { name, handle }
        })
        .collect();

    Ok(DBIssue {
        number: issue_number,
        blurb,
        contributors,
    })
}

pub async fn put_issue_data(
    issue: DBIssue,
    client: &DynamoClient,
) -> Result<(), aws_sdk_dynamodb::Error> {
    let contributors = AttributeValue::L(
        issue
            .contributors
            .iter()
            .map(|contributor| {
                AttributeValue::Ss(vec![
                    contributor.name.to_string(),
                    contributor.handle.to_string(),
                ])
            })
            .collect::<Vec<AttributeValue>>(),
    );
    client
        .put_item()
        .table_name("nnmIssueData")
        .item("issueNumber", AttributeValue::N(issue.number.to_string()))
        .item("blurb", AttributeValue::S(issue.blurb))
        .item("contributors", contributors)
        .send()
        .await?;
    Ok(())
}
