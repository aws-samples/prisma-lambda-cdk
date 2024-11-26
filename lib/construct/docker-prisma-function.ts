import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export interface DatabaseConnectionProps {
  host: string;
  port: string;
  engine: string;
  username: string;
  password: string;
}

interface DockerPrismaFunctionProps extends lambda.DockerImageFunctionProps {
  database: DatabaseConnectionProps;
}

export class DockerPrismaFunction extends lambda.DockerImageFunction {
  constructor(scope: Construct, id: string, props: DockerPrismaFunctionProps) {
    super(scope, id, {
      ...props,
      environment: {
        ...props.environment,
        DATABASE_HOST: props.database.host,
        DATABASE_PORT: props.database.port,
        DATABASE_ENGINE: props.database.engine,
        DATABASE_USER: props.database.username,
        DATABASE_PASSWORD: props.database.password,
        // Aurora Serverless v2 cold start takes up to 15 seconds
        // https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/connection-pool
        DATABASE_OPTION: "?pool_timeout=20&connect_timeout=20",
      },
    });
  }
}
