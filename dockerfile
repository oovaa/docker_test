FROM oven/bun:1.3.1-alpine 

# create

WORKDIR /app

COPY *.json ./

RUN bun install

RUN echo "test=tete" > .env



COPY . .

EXPOSE 4555

CMD ["bun", "start"]