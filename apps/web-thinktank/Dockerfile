FROM oven/bun:1.1.36-alpine

WORKDIR /repo
COPY package.json bun.lockb* tsconfig.base.json tsconfig.json ./
COPY apps/web-thinktank ./apps/web-thinktank
COPY packages ./packages
RUN bun install

WORKDIR /repo/apps/web-thinktank
RUN bun run build

EXPOSE 4173
CMD ["bun", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]
