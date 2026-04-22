# 15SOAT Tech Challenge

## Project setup

```bash
$ npm install
```

## Development

First create a `.env` file specifying the env variable used for database connection and JWT key signing:

```bash
DB_HOST # (=localhost for local testing)
DB_NAME
DB_USER
DB_PASSWORD
DB_PORT

JWT_SECRET
```

Then run:

```bash
# Start the development server
npm run dev
```

## Running project with docker compose

```bash
docker compose --env-file .env up -d --build
```

## Swagger / OpenAPI Docs

The project uses Swagger to automatically generate and serve API documentation. Once the application is running, you can explore the endpoints and test requests interactively.

- **Swagger UI:** [http://localhost:3000/api](http://localhost:3000/api)
- **OpenAPI JSON:** [http://localhost:3000/api-json](http://localhost:3000/api-json)

## Generating a new migration

```bash
npm run generate:migration --name=MIGRATION_NAME
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.
