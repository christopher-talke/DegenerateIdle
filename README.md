# DegenerateIdle

A discord first idle game centered around gambling, specifically Roulette.

## Prerequisites

You will require the following software before you can setup a development environment.

```
Software                    Version
---                         ---
Git                         ^v2.37.3.windows.1
NodeJS                      ^v18.12.2
NPM (Ships with Node)       ^v8.19.2
Docker Desktop              ^v4.13.0

# If you do not know how to use Docker, then you can install the following locally instead
PostgresSQL                 ^v15.1.0
Redis                       ^v6.0.0
```

## Development Setup

Install project dependencies

```sh
npm install
```

Setup your local `Postgres Development Database` using Docker 🐋

```sh
docker run --name pg_development \
    -e "POSTGRES_PASSWORD=postgres" \
    -p 5432:5432 \
    -d --restart unless-stopped \
    postgres
```

Optionally you can also create a `PGAdmin` server using Docker 🐋

```sh
docker run --name pgadmin4 \
    -e "PGADMIN_DEFAULT_EMAIL=chris@talketech.com.au" \
    -e "PGADMIN_DEFAULT_PASSWORD=Password#1" \
    -p 5050:80 \
    -d --restart unless-stopped \
    dpage/pgadmin4
```

Setup your local `Redis Development Cache` using Docker 🐋

```sh
docker run --name redis_development \
    -p 6379:6379 \
    -d --restart unless-stopped \
    redis
```

Setup your `.env` file

1. Make a copy of `.exampe.env` and save this as `.env`
2. Fill out the details of the `.env` file
3. Make a copy of `config.example.ts` and save this as `config.ts`
4. Uncomment the code, and fill out the blanks as required.

Setup `Schemas/Tables` for the project:

```
npx prisma db push
npx prisma generate
```

Start the project up

```
npm run dev
```

## Project Patterns

Most, if not all of the business logic is stored under the `./plugins` directory, with the following pattern:

```
/<plugin-name>          The plugins root directory
    /discord            Logic that relates to handling and sending info through the discord bot.
    /logic              Core business logic that is related to the plugin.
        /mapping        Static data that is related to the plugin.
    /types              Type defs that are related to the plugin.
```

Anything related to the database can be found under the `./prisma` directory.

Any random utility functions can be found under the `./utils` directory.

## Helpful Tools

Here some helpful tools used for development of this project

```
Software        Type                        Website
---             ---                         ---
DB Beaver       Universal Database Tool     https://dbeaver.io/
RedisInsight    Redis UI Client             https://redis.com/redis-enterprise/redis-insight/
```
