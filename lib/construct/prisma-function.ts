import * as path from "path";
import * as cdk from "@aws-cdk/core";
import * as lambdanode from "@aws-cdk/aws-lambda-nodejs";

interface PrismaFunctionProps extends lambdanode.NodejsFunctionProps {
  mysqlHost: string;
  mysqlUserName: string;
  mysqlPassword: string;
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
        MYSQL_HOST: props.mysqlHost,
        MYSQL_USER: props.mysqlUserName,
        MYSQL_PASSWORD: props.mysqlPassword,
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
