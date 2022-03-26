#!/usr/bin/env node
import "source-map-support/register";
import { App } from 'aws-cdk-lib';
import { PrismaLambdaCdkStack } from "../lib/stack/prisma-lambda-cdk-stack";

const app = new App();
new PrismaLambdaCdkStack(app, "PrismaLambdaCdkStack");
