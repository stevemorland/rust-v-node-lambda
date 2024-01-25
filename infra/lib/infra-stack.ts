import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import path = require("path");
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const handlerNode = new NodejsFunction(this, "NodeHandler", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "main",
      entry: path.join(__dirname, "..", "src/handler.ts"),
      environment: {
        VAL: "SOME_VAL",
      },
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
      environment: {
        VAL: "SOME_VAL",
      },
    });
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

    api.root.addResource("rust").addMethod("POST", postRustIntegration);
    api.root.addResource("node").addMethod("POST", postNodeIntegration);
  }
}
