import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { DatabaseConnectionProps, PrismaFunction } from "./prisma-function";
import { Construct } from "constructs";
import { DockerPrismaFunction } from "./docker-prisma-function";
import { DockerImageCode, Runtime } from "aws-cdk-lib/aws-lambda";
import { Platform } from "aws-cdk-lib/aws-ecr-assets";

interface ApplicationProps {
  vpc: ec2.IVpc;
  database: DatabaseConnectionProps;
}

export class Application extends Construct {
  readonly lambdaSecurityGroup: ec2.ISecurityGroup;

  constructor(scope: Construct, id: string, props: ApplicationProps) {
    super(scope, id);

    const { vpc, database } = props;

    const securityGroup = new ec2.SecurityGroup(this, `SecurityGroup`, {
      vpc: props.vpc,
    });

    // Zip bundle
    const handler = new PrismaFunction(this, "Handler", {
      entry: "./backend/handler.ts",
      memorySize: 256,
      runtime: Runtime.NODEJS_18_X,
      timeout: cdk.Duration.seconds(15),
      vpc,
      securityGroups: [securityGroup],
      database,
      depsLockFilePath: "./backend/package-lock.json",
    });

    const migrationRunner = new PrismaFunction(this, "MigrationRunner", {
      entry: "./backend/migration-runner.ts",
      memorySize: 256,
      runtime: Runtime.NODEJS_18_X,
      timeout: cdk.Duration.minutes(1),
      vpc,
      securityGroups: [securityGroup],
      database,
      depsLockFilePath: "./backend/package-lock.json",
    });

    // Docker bundle
    new DockerPrismaFunction(this, "DockerHandler", {
      code: DockerImageCode.fromImageAsset("./backend", { platform: Platform.LINUX_AMD64 }),
      memorySize: 256,
      timeout: cdk.Duration.seconds(15),
      vpc,
      securityGroups: [securityGroup],
      database,
    });

    new DockerPrismaFunction(this, "DockerMigrationRunner", {
      code: DockerImageCode.fromImageAsset("./backend", {
        cmd: ["migration-runner.handler"],
        platform: Platform.LINUX_AMD64,
      }),
      memorySize: 256,
      timeout: cdk.Duration.minutes(1),
      vpc,
      securityGroups: [securityGroup],
      database,
    });

    new cdk.CfnOutput(this, `HandlerLambdaArn`, { value: handler.functionArn });
    new cdk.CfnOutput(this, `MigrationRunnerLambdaArn`, { value: migrationRunner.functionArn });

    this.lambdaSecurityGroup = securityGroup;
  }
}
