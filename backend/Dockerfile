FROM public.ecr.aws/lambda/nodejs:18 as build
WORKDIR /build
COPY package-lock.json package.json ./
COPY prisma ./prisma
RUN npm ci
COPY . .
# https://esbuild.github.io/api/
# also refer to: https://github.com/aws/aws-cdk/blob/master/packages/%40aws-cdk/aws-lambda-nodejs/lib/bundling.ts
RUN npx esbuild handler.ts migration-runner.ts --bundle --outdir=dist --platform=node --external:aws-sdk --external:@prisma/client

FROM public.ecr.aws/lambda/nodejs:18
WORKDIR ${LAMBDA_TASK_ROOT}

COPY package-lock.json package.json ./
COPY prisma ./prisma
RUN npm ci --production
COPY --from=build /build/dist .
COPY . .

CMD ["handler.handler"]
