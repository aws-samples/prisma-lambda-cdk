import * as cdk from "aws-cdk-lib";
import { Template } from 'aws-cdk-lib/assertions';
import { PrismaLambdaCdkStack } from "../lib/stack/prisma-lambda-cdk-stack";

test("Snapshot test", () => {
  const app = new cdk.App();
  const stack = new PrismaLambdaCdkStack(app, "MyTestStack");
  const template = Template.fromStack(stack);
  expect(template).toMatchSnapshot();
});
