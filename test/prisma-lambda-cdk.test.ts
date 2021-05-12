import { expect as expectCDK, matchTemplate, MatchStyle, SynthUtils } from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import * as PrismaLambdaCdk from "../lib/stack/prisma-lambda-cdk-stack";

test("Snapshot test", () => {
  const app = new cdk.App();
  const stack = new PrismaLambdaCdk.PrismaLambdaCdkStack(app, "MyTestStack");
  expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});
