import * as path from "path";
import * as cdk from "@aws-cdk/core";
import * as lambdanode from "@aws-cdk/aws-lambda-nodejs";

interface PrismaFunctionProps extends lambdanode.NodejsFunctionProps {
  databaseHost: string;
  databasePort: string;
  databaseEngine: string;  // should be "mysql" or "postgres"
  databaseUserName: string;
  databasePassword: string;
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
        DATABASE_HOST: props.databaseHost,
        DATABASE_PORT: props.databasePort,
        DATABASE_ENGINE: props.databaseEngine,
        DATABASE_USER: props.databaseUserName,
        DATABASE_PASSWORD: props.databasePassword,
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
