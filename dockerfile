FROM oven/bun:1.3.1-alpine 

WORKDIR /app

COPY *.json ./
RUN bun install

COPY . .

EXPOSE 4555

CMD ["bun", "start"]