import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Database } from "../construct/database";
import { Application } from "../construct/application";
import { Construct } from 'constructs';

export class PrismaLambdaCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, `Vpc`);

    const database = new Database(this, `Database`, { vpc });

    const application = new Application(this, `Application`, {
      vpc,
      database: {
        // We use direct reference for host and port because using only secret here results in failure of refreshing values.
        // Also refer to: https://github.com/aws-cloudformation/cloudformation-coverage-roadmap/issues/369
        host: database.cluster.clusterEndpoint.hostname,
        port: cdk.Token.asString(database.cluster.clusterEndpoint.port),
        engine: database.secret.secretValueFromJson("engine").toString(),
        // We use the master user only to simplify this sample.
        // You should create a database user with minimal privileges for your application.
        // Also refer to: https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/UsingWithRDS.MasterAccounts.html
        username: database.secret.secretValueFromJson("username").toString(),
        password: database.secret.secretValueFromJson("password").toString(),
      },
    });

    database.allowInboundAccess(application.lambdaSecurityGroup);
  }
}
