import * as path from "path";
import * as cdk from "@aws-cdk/core";
import * as lambdanode from "@aws-cdk/aws-lambda-nodejs";

export interface DatabaseConnectionProps {
  host: string;
  port: string;
  engine: string;
  username: string;
  password: string;
}

interface PrismaFunctionProps extends lambdanode.NodejsFunctionProps {
  database: DatabaseConnectionProps;
  /**
   * relative path of the directory which contains prisma directory from your CDK root directory.
   */
  relativePathToPrisma: string;
}

export class PrismaFunction extends lambdanode.NodejsFunction {
  constructor(scope: cdk.Construct, id: string, props: PrismaFunctionProps) {
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
            `cp -r ${path.join(i, props.relativePathToPrisma, "prisma")} ${o}`,
            `cp ${path.join(i, props.relativePathToPrisma, ".env")} ${o}`,
          ],
          beforeBundling: (i, o) => [],
          afterBundling: (i, o) => [],
        },
      },
    });
  }
}
