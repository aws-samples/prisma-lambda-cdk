#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { PrismaLambdaCdkStack } from "../lib/stack/prisma-lambda-cdk-stack";

const app = new cdk.App();
new PrismaLambdaCdkStack(app, "PrismaLambdaCdkStack");
