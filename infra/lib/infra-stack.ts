import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as s3 from "aws-cdk-lib/aws-s3";
import path = require("path");

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "StorageBucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const handlerNode = new NodejsFunction(this, "NodeHandler", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "main",
      entry: path.join(__dirname, "..", "src/handler.ts"),
    });

    const handlerRust = new lambda.Function(this, "RustHandler", {
      runtime: lambda.Runtime.PROVIDED_AL2,
      handler: "not_required_for_rust",
      code: lambda.Code.fromAsset(
        path.join(
          __dirname,
          "..",
          "..",
          "basic-endpoint/target/lambda/basic-endpoint"
        )
      ),
    });

    const handlerNodeParseJSON = new NodejsFunction(this, "NodeHandlerParse", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "main",
      entry: path.join(__dirname, "..", "src/handler-parse.ts"),
      environment: {
        BUCKET_NAME: bucket.bucketName,
      },
    });

    const handlerRustParseJSON = new lambda.Function(this, "RustHandlerParse", {
      runtime: lambda.Runtime.PROVIDED_AL2,
      handler: "not_required_for_rust",
      code: lambda.Code.fromAsset(
        path.join(
          __dirname,
          "..",
          "..",
          "parse-endpoint/target/lambda/parse-endpoint"
        )
      ),
      environment: {
        BUCKET_NAME: bucket.bucketName,
      },
    });

    bucket.grantReadWrite(handlerNodeParseJSON);
    bucket.grantReadWrite(handlerRustParseJSON);

    const api = new apigateway.RestApi(this, "RustApi", {
      restApiName: "Rust Service",
      description: "API Gateway that invokes a rust handler.",
    });

    const postRustIntegration = new apigateway.LambdaIntegration(handlerRust, {
      requestTemplates: { "application/json": '{ "statusCode": "200" }' },
    });

    const postNodeIntegration = new apigateway.LambdaIntegration(handlerNode, {
      requestTemplates: { "application/json": '{ "statusCode": "200" }' },
    });

    const postNodeParseIntegration = new apigateway.LambdaIntegration(
      handlerNodeParseJSON,
      {
        requestTemplates: { "application/json": '{ "statusCode": "200" }' },
      }
    );

    const postRustParseIntegration = new apigateway.LambdaIntegration(
      handlerRustParseJSON,
      {
        requestTemplates: { "application/json": '{ "statusCode": "200" }' },
      }
    );

    api.root.addResource("rust").addMethod("POST", postRustIntegration);
    api.root.addResource("node").addMethod("POST", postNodeIntegration);
    api.root
      .addResource("node-parse")
      .addMethod("POST", postNodeParseIntegration);
    api.root
      .addResource("rust-parse")
      .addMethod("POST", postRustParseIntegration);
  }
}
