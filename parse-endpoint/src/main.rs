use lambda_http::{run, service_fn, Error, Request, Response, Body};
use std::env;
use aws_sdk_s3 as s3;
use aws_config::meta::region::RegionProviderChain;
use aws_config::BehaviorVersion;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
struct SingleWine {
    points: i32,
    title: String,
    description: Option<String>,
    taster_name: Option<String>,
    taster_twitter_handle: Option<String>,
    price: Option<i32>,
    designation: Option<String>,
    variety: Option<String>,
    region_1: Option<String>,
    region_2: Option<String>,
    province: Option<String>,
    country: String,
    winery: Option<String>
}


async fn function_handler(event: Request) -> Result<Response<Body>, Error> {

    let region_provider = RegionProviderChain::default_provider().or_else("eu-west-2");
    let config = aws_config::defaults(BehaviorVersion::latest())
        .region(region_provider)
        .load()
        .await;

    let client = s3::Client::new(&config);

    let bucket = match env::var_os("BUCKET_NAME") {
        Some(v) => v.into_string().unwrap(),
        None => panic!("$BUCKET_NAME is not set")
    };
    let key = "wine-data-set.json";

    let mut object = client
        .get_object()
        .bucket(bucket)
        .key(key)
        .response_content_type("application/json")
        .send()
        .await?;
    
    let bytes = object.body.collect().await?.into_bytes();
    let response = std::str::from_utf8(&bytes)?;
    let temp: Vec<SingleWine> = serde_json::from_str(&response).unwrap();
    let filter1: Vec<SingleWine> = temp.into_iter().filter(|wine| wine.country == "Chile").collect();
    let filter2: Vec<SingleWine> = filter1.into_iter().filter(|wine| wine.points >= 90).collect();
    let json = serde_json::to_string(&filter2)?;

    let resp = Response::builder()
        .status(200)
        .header("content-type", "application/json")
        .body(json.into())
        .map_err(Box::new)?;
    
    Ok(resp)
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    run(service_fn(function_handler)).await
}
