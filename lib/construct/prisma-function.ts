import * as lambdanode from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

export interface DatabaseConnectionProps {
  host: string;
  port: string;
  engine: string;
  username: string;
  password: string;
}

interface PrismaFunctionProps extends lambdanode.NodejsFunctionProps {
  database: DatabaseConnectionProps;
}

export class PrismaFunction extends lambdanode.NodejsFunction {
  constructor(scope: Construct, id: string, props: PrismaFunctionProps) {
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
      bundling: {
        nodeModules: ["prisma", "@prisma/client"].concat(props.bundling?.nodeModules ?? []),
        commandHooks: {
          beforeInstall: (i, o) => [
            // Copy prisma directory to Lambda code asset
            // the directory must be placed on the same directory as your Lambda code
            `cp -r ${i}/prisma ${o}`,
          ],
          beforeBundling: (i, o) => [],
          afterBundling: (i, o) => [],
        },
      },
    });
  }
}
