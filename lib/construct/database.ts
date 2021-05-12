import * as cdk from "@aws-cdk/core";
import * as rds from "@aws-cdk/aws-rds";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as secretsmanager from "@aws-cdk/aws-secretsmanager";

interface DatabaseProps {
  vpc: ec2.IVpc;
}

export class Database extends cdk.Construct {
  readonly cluster: rds.DatabaseCluster;
  readonly secret: secretsmanager.ISecret;
  readonly securityGroup: ec2.ISecurityGroup;

  constructor(scope: cdk.Construct, id: string, props: DatabaseProps) {
    super(scope, id);

    const vpc = props.vpc;

    const securityGroup = new ec2.SecurityGroup(this, `SecurityGroup`, {
      vpc,
    });

    const cluster = new rds.DatabaseCluster(this, `Cluster`, {
      engine: rds.DatabaseClusterEngine.auroraMysql({ version: rds.AuroraMysqlEngineVersion.VER_2_09_1 }),
      instanceProps: {
        vpc,
        vpcSubnets: vpc.selectSubnets({ subnets: vpc.isolatedSubnets.concat(vpc.privateSubnets) }),
        instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.SMALL),
        securityGroups: [securityGroup],
      },
      instances: 1,
      storageEncrypted: true,
    });

    this.cluster = cluster;
    this.secret = cluster.secret!;
    this.securityGroup = securityGroup;
  }
}
