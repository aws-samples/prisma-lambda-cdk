import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import { Database } from "../construct/database";
import { Application } from "../construct/application";

export class PrismaLambdaCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, `Vpc`);

    const database = new Database(this, `Database`, { vpc });

    const application = new Application(this, `Application`, {
      vpc,
      databaseSecrets: database.secret,
    });

    database.allowInboundAccess(application.lambdaSecurityGroup);
  }
}
