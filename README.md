# Test application

This test application is designed to handle data import and export in an efficient way, supporting high-volume data processing with reliability and performance.

## Table of Contents

- [Features](#features)
- [Quick Start Docker](#quick-start-docker)
- [Quick Start Local](#quick-start-local-and-DB)
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

- 📈 **Large File Processing:**: Efficiently handles large data imports through streaming and chunking
- ⚡ **High Performance:**: Optimized for high-throughput scenarios with database batching
- 🔄 **Asynchronous Processing:** Background job processing for long-running operations
- 🎯 **Zero Message Loss**: Database-backed reliability ensures data integrity
- 📊 **Flexible Export:** Supports various export formats and filtering options

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

## Quick start local and DB

# 1. Add Database Dependencies

Add [postgres](https://www.postgresql.org/download/).

Support [link](https://www.w3schools.com/postgresql/postgresql_install.php)

[Node.js](https://nodejs.org/en) (v20 or later)

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

# Usage

# Access your api

The API is available at http://localhost:3000 (or the port specified in your .env file).

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

- [NodeJS](https://nodejs.org/en) (Runtime)
- [Hono](https://hono.dev/) (Lightweight, high-performance web framework)
- [Swagger](https://swagger.io/) (OpenAPI specification and interactive UI)
- [Postgres](https://www.postgresql.org/) (Reliable, ACID-compliant relational database)
- [Pino](https://github.com/pinojs/pino) (Ultra-fast Node.js logger)
- [Zod](https://zod.dev/) (TypeScript-first schema validation)

## Architecture

The application follows a clean architecture approach with clear separation of concerns:

- **Routes:** API endpoint definitions and request handling
- **Services:** Business logic implementation
- **Repositories:** Data access layer
- **Models:** Data structures and validation schemas
- **Utils:** Shared utility functions

Processing of large datasets is handled through streaming and chunking to optimize memory usage and performance.

### Performance Optimizations

- **Batch Processing:** Database operations are performed in configurable batches
- **Connection Pooling:** Database connections are reused for better performance
- **Streaming:** File data is processed as streams to minimize memory usage
- **Asynchronous Processing:** Long-running operations are handled asynchronously

## Tests

Due to time constraints, comprehensive test coverage is not yet implemented. Future development should prioritize:

- Unit tests for core business logic
- Integration tests for API endpoints
- Performance tests for data processing pipelines

## Challenge limitations

- **Export Job Retrieval:** The /v1/exports/{job_id} endpoint is not implemented as it would require object storage (S3 or similar) for storing and retrieving large export files.

- **Schema Flexibility:** Database schemas are designed to be flexible based on sample data, without strict type constraints on IDs to accommodate various partner data formats.

## Final comments

This project demonstrates efficient handling of large-scale data import/export operations with a focus on performance and reliability. The architecture provides a solid foundation for further enhancements and feature additions.

Feedback and contributions are welcome!
