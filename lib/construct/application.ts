import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as secretsmanager from "@aws-cdk/aws-secretsmanager";
import { PrismaFunction } from "./prisma-function";

interface ApplicationProps {
  vpc: ec2.IVpc;
  databaseSecrets: secretsmanager.ISecret;
  databaseSecurityGroup: ec2.ISecurityGroup;
}

export class Application extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: ApplicationProps) {
    super(scope, id);

    const vpc = props.vpc;

    const securityGroup = new ec2.SecurityGroup(this, `SecurityGroup`, {
      vpc: props.vpc,
    });

    props.databaseSecurityGroup.addIngressRule(securityGroup, ec2.Port.tcp(3306));

    const handler = new PrismaFunction(this, "Handler", {
      entry: "./backend/handler.ts",
      memorySize: 256,
      timeout: cdk.Duration.seconds(15),
      vpc,
      securityGroups: [securityGroup],
      mysqlHost: props.databaseSecrets.secretValueFromJson("host").toString(),
      // We use the master user only to simplify this sample.
      // You should create a database user with minimal privileges for your application.
      // Also refer to: https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/UsingWithRDS.MasterAccounts.html
      mysqlUserName: props.databaseSecrets.secretValueFromJson("username").toString(),
      mysqlPassword: props.databaseSecrets.secretValueFromJson("password").toString(),
      relativePathToPrisma: "backend",
    });

    const migrationRunner = new PrismaFunction(this, "MigrationRunner", {
      entry: "./backend/migration-runner.ts",
      memorySize: 256,
      timeout: cdk.Duration.minutes(1),
      vpc,
      securityGroups: [securityGroup],
      mysqlHost: props.databaseSecrets.secretValueFromJson("host").toString(),
      mysqlUserName: props.databaseSecrets.secretValueFromJson("username").toString(),
      mysqlPassword: props.databaseSecrets.secretValueFromJson("password").toString(),
      relativePathToPrisma: "backend",
    });

    new cdk.CfnOutput(this, `HandlerLambdaArn`, { value: handler.functionArn });
    new cdk.CfnOutput(this, `MigrationRunnerLambdaArn`, { value: migrationRunner.functionArn });
  }
}
