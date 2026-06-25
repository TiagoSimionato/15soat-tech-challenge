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

Use `DB_HOST=db` with this docker compose file, then run:

```bash
docker compose --env-file .env up -d
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

## Deployment

In order to kubernetes be able to download from a private container registry, create the necessary secret

```bash
kubectl create secret docker-registry ghcr-secrets --docker-server=https://ghcr.io --docker-username=[YOUR_USERNAME] --docker-password=[YOUR_PASSWORD]
```

## Infrastructure (Terraform + Kubernetes)

The scripts in `infra` provision resources on a local kubernetes cluster.

Terraform is responsible for:

- kind_cluster → creates the cluster
- kubernetes_namespace → creates the namespace
- kubernetes_secret → creates the secrets
- kubernetes_deployment → deploys PostgreSQL
- kubernetes_service → creates the PostgreSQL service
- kubernetes_service → creates the API service
- kubernetes_horizontal_pod_autoscaler_v2 → creates the API HPA

### Prerequisites

- kubectl
- kind
- Terraform
- Docker

### Steps

1. Go to the `infra` directory

```bash

cd infra

```

2. Create a file named `terraform.tfvars` with the values for the required variables

```bash

postgres_user     = "********"
postgres_password = "********"
postgres_db       = "********"
jwt_secret        = "********"

```

3. Run

```bash

terraform init

terraform apply
```

### Validate

```bash

kubectl get pods

kubectl get svc
```

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.
