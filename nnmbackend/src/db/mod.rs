use anyhow::{Error, anyhow};
use aws_config::{meta::region::RegionProviderChain, BehaviorVersion};
use aws_sdk_dynamodb::{types::AttributeValue, Client as DynamoClient};

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct DBContributor {
    pub name: String,
    pub handle: String
}

impl DBContributor {
    pub fn new(name: String, handle: String) -> Self {
        DBContributor { name, handle }
    }
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct DBIssue {
    pub number: usize,
    pub blurb: String,
    pub contributors: Vec<DBContributor>
}

impl DBIssue {
    pub fn new(number: usize, blurb: String, contributors: Vec<DBContributor>) -> Self {
        DBIssue { number, blurb, contributors }
    }
}

pub async fn get_db_client() -> Result<DynamoClient, Error> {
    let region_provider = RegionProviderChain::default_provider().or_else("us-east-2");
    let config = aws_config::defaults(BehaviorVersion::latest())
        .region(region_provider)
        .load()
        .await;
    Ok(DynamoClient::new(&config))
}

pub async fn get_issue_count(client: &DynamoClient) -> Result<usize, Error> {
    let response = client
        .describe_table()
        .table_name("nnmIssueData")
        .send()
        .await?;
    Ok(response.table.unwrap().item_count.unwrap() as usize)
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
        .get("blurb").ok_or(anyhow!("Blurb not found"))?
        .as_s().map_err(|e| anyhow!(format!("{:?}", e)))?
        .to_string();

    let contributors = item
        .get("contributors").ok_or(anyhow!("Contributors not found"))?
        .as_l().map_err(|e| anyhow!(format!("{:?}", e)))?
        .iter().map(|contributor| {
            let contributor = contributor.as_ss().unwrap(); // String-sets
            let name = contributor.get(0).unwrap().to_string();
            let handle = contributor.get(1).unwrap().to_string();
            DBContributor { name, handle }
        }).collect();
    
    Ok(DBIssue { number: issue_number, blurb, contributors })
}

pub async fn put_issue_data(issue: DBIssue, client: &DynamoClient) -> Result<(), aws_sdk_dynamodb::Error> {
    let contributors = AttributeValue::L(issue.contributors.iter().map(|contributor| {
        AttributeValue::Ss(vec![contributor.name.to_string(), contributor.handle.to_string()])
    }).collect::<Vec<AttributeValue>>());
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