import { Handler } from "aws-lambda";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", `warn`, `error`],
});

export const handler: Handler = async (event, context) => {
  console.log(event);
  console.log(context);
  const command: string = event.command ?? "create";

  switch (command) {
    case "create":
      return await prisma.request.create({ data: { awsRequestId: context.awsRequestId } });
    default:
    case "get":
      return await prisma.request.findMany();
  }
};
