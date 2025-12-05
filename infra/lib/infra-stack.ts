import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB table
    const table = new dynamodb.Table(this, 'ClubSaasTable', {
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // change for production
    });

    // S3 bucket for Frontend hosting
    const frontendBucket = new s3.Bucket(this, 'FrontendBucket', {
      websiteIndexDocument: 'index.html',
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // CloudFront distribution for frontend
    const distribution = new cloudfront.Distribution(this, 'FrontendDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(frontendBucket),
      },
    });

    // Basic Lambda
    const apiLambda = new lambda.Function(this, 'ApiLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("../backend"),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    table.grantReadWriteData(apiLambda);

    // HTTP API
    const httpApi = new apigwv2.HttpApi(this, 'HttpApi', {
      apiName: 'ClubSaasApi',
    });

    // Lambda integration
    httpApi.addRoutes({
      path: '/{proxy+}',
      methods: [apigwv2.HttpMethod.ANY],
      integration: new integrations.HttpLambdaIntegration(
        'LambdaIntegration',
        apiLambda
      ),
    });

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: httpApi.url!,
    });

    new cdk.CfnOutput(this, 'FrontendBucketName', {
      value: frontendBucket.bucketName,
    });

    new cdk.CfnOutput(this, 'CloudFrontUrl', {
      value: distribution.domainName,
    });
  }
}
