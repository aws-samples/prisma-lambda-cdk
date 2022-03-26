import * as path from "path";
import * as lambdanode from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

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
      },
      bundling: {
        nodeModules: ["prisma", "@prisma/client"].concat(props.bundling?.nodeModules ?? []),
        commandHooks: {
          beforeInstall: (i, o) => [
            // Copy prisma directory and .env file to Lambda code asset
            // these directory/file must be located in the same directory as your Lambda code
            `cp -r ${path.join(i, "prisma")} ${o}`,
            `cp ${path.join(i, ".env")} ${o}`,
          ],
          beforeBundling: (i, o) => [],
          afterBundling: (i, o) => [],
        },
      },
    });
  }
}
