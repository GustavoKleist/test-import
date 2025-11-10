# Test application

This test application is designed to handle data import and export in an efficient way.

## Table of Contents

- [Features](#features)
- [Quick Start Docker](#quick-start-docker)
- [Quick Start Local](#quick-start-local-and-DB-docker)
- [Access your api](#access-your-api)
- [Api documentation](#api-documentation)
- [Api postman](#api-postman)
- [Decisions made](#decisions-made)
- [Stack](#stack)
- [Architecture](#architecture)
- [Tests](#tests)
- [Challenge limitations](#challenge-limitations)
- [Final Comments](#final-comments)

## Features

- 📈 **Large Files**: Can handle large import
- ⚡ **High Performance**: Optimized for high-throughput scenarios
- 🎯 **Zero Message Loss**: Database-backed reliability

## Quick start docker

# 1. Add dependencies

Add [docker](https://docs.docker.com/get-started/get-docker/).

I highly recommend running with Docker.

# 2. Create your .env file

On the root your application you must create an .env file following the .env.example fields.

Will look like this in the end.

```console
# Database Configuration
DB_HOST=postgres
DB_PORT=port
DB_NAME=name
DB_USER=user
DB_PASSWORD=password

# Application Configuration
PORT=port
```

# 3. Build application to run

docker commands to build and run you application

### Start the application + database

```console
docker-compose up -d
```

### Stop the application + database

```console
docker-compose down
```

### Stop application and remove volumes (warning: deletes data)

```console
docker-compose down -v
```

## Quick start local and DB docker

# 1. Add Database Dependencies

Add [postgres](https://www.postgresql.org/download/).

Support [link](https://www.w3schools.com/postgresql/postgresql_install.php)

# 2. Create your .env file

On the root your application you must create an .env file following the .env.example fields.

Will look like this in the end.

```console
# Database Configuration
DB_HOST=localhost
DB_PORT=port
DB_NAME=name
DB_USER=user
DB_PASSWORD=password

# Application Configuration
PORT=port
```

If you changed the credentials of your postgres database, update the .env file.

# 3. Build application to run

### Install application dependencies

```console
npm run install
```

### Run the application locally

```console
npm run build && npm run start
```

# Access your api

Your api will be exposed by default on port 3000.

```console
http://localhost:3000
```

# Api documentation

The api documentation is exposed on a Swagger, which can be accessed through:

```console
http://localhost:3000/ui
```

# Api postman

There is a postman-collection.json file in the root of the project.

This file can be imported on [Postman](https://www.postman.com/) to easy iteration with the api

# Decisions made

## Stack

- [NodeJS](https://nodejs.org/en)
- [Hono](https://hono.dev/) (Web Framework)
- [Swagger](https://swagger.io/) (Api Documentation)
- [Postgres](https://www.postgresql.org/) (Database)
- [Pino](https://github.com/pinojs/pino) (Logger)
- [Zod](https://zod.dev/) (Schemma Validation)

## Architecture

Opted for a clean and direct approach on functionality (Import and Export).

## Tests

Due to a lack of time, I wasn't able to generate tests in time.

## Challenge limitations

### Endpoint

The (/v1/exports/{job_id}) endpoint was not implemented.

The reason was, to fulfill the requirements of this endpoint, I should have an s3 bucket available or similar.

To upload the results and provide a valid download link.

### Tables creation

When creating the tables, since there was no description on the assignment on types for each field.

I took the liberty to check the samples of data provided for testing, to find a possible pattern to guide me.

But since I can't control what is coming from a partner, I opt for not restricting the Ids as uuid.

## Final comments

I had a good time doing this.

Learned a lot o things, and refreshed a few old concepts.
