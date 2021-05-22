import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import { DatabaseConnectionProps, PrismaFunction } from "./prisma-function";

interface ApplicationProps {
  vpc: ec2.IVpc;
  database: DatabaseConnectionProps;
}

export class Application extends cdk.Construct {
  readonly lambdaSecurityGroup: ec2.ISecurityGroup;

  constructor(scope: cdk.Construct, id: string, props: ApplicationProps) {
    super(scope, id);

    const vpc = props.vpc;

    const securityGroup = new ec2.SecurityGroup(this, `SecurityGroup`, {
      vpc: props.vpc,
    });

    const handler = new PrismaFunction(this, "Handler", {
      entry: "./backend/handler.ts",
      memorySize: 256,
      timeout: cdk.Duration.seconds(15),
      vpc,
      securityGroups: [securityGroup],
      database: props.database,
      relativePathToPrisma: "backend",
    });

    const migrationRunner = new PrismaFunction(this, "MigrationRunner", {
      entry: "./backend/migration-runner.ts",
      memorySize: 256,
      timeout: cdk.Duration.minutes(1),
      vpc,
      securityGroups: [securityGroup],
      database: props.database,
      relativePathToPrisma: "backend",
    });

    new cdk.CfnOutput(this, `HandlerLambdaArn`, { value: handler.functionArn });
    new cdk.CfnOutput(this, `MigrationRunnerLambdaArn`, { value: migrationRunner.functionArn });

    this.lambdaSecurityGroup = securityGroup;
  }
}
