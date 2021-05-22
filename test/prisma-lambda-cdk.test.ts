import { SynthUtils } from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import { PrismaLambdaCdkStack } from "../lib/stack/prisma-lambda-cdk-stack";

test("Snapshot test", () => {
  const app = new cdk.App();
  const stack = new PrismaLambdaCdkStack(app, "MyTestStack");
  expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});
