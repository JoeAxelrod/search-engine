# Search Engine API

This project provides an API for a search engine backed by MongoDB and Elasticsearch. It is built with Node.js and TypeScript and is designed to run in Docker.

## Project Structure

    search-engine/
    │
    ├── src/
    │   ├── video/          # Domain-Driven Design (DDD)
    │   │   ├── video.model.ts
    │   │   └── video.service.ts
    │   ├── config/
    │   │   ├── elasticsearch.ts
    │   │   └── mongo.ts
    │   ├── routes/
    │   │   └── videos.ts
    │   ├── app.ts          # Express app
    │   └── server.ts       # Server entry point
    │
    ├── tests/              # Test files
    │
    ├── .dockerignore       # Specifies files to ignore in Docker build
    ├── .gitignore          # Specifies files to ignore in Git
    ├── Dockerfile          # Docker image specifications
    ├── docker-compose.yml  # Docker compose configuration
    ├── package.json        # Project metadata and dependencies
    └── tsconfig.json       # TypeScript configuration

## How to run the application

You can run the application either using npm or using Docker Compose. Here's how to do it:

### Using npm

First, install the dependencies:

    npm install

Then, start the application:

    npm start

### Using Docker Compose

Build and run the application with Docker Compose:

    docker-compose up -d

To import the data into MongoDB, run
    
    docker ps
    ...
    docker exec -it  [MONGO_CONTAINER_ID] mongoimport --db searchEngine --collection videos --type json --file /import_data/import_data/videos.json --jsonArray

To import the data into Elasticsearch, run
    
    docker ps
    ...
    docker exec -it [ES_CONTAINER_ID] bash -c "curl -u elastic:your_password_here -H 'Content-Type: application/x-ndjson' -XPOST 'localhost:9200/_bulk?pretty' --data-binary @/import_data/import_data/videos.ndjson"


### ENV
To set up your environment variables, you need to rename the `.env.example` file to `.env`. You can do this by running the following command in your terminal:

    mv .env.example .env


### test
The `tests/videos.test.ts` file contains the test suite for the search engine API, specifically testing its Elasticsearch functions.

This suite starts by importing necessary dependencies and defining some test data. It then uses Jest's `describe` and `it` functions to structure the tests and the `expect` function to make assertions about the test results. 

To run these tests, use the command `npm test` from your project's root directory.

### search parameters
The `src/routes/videos.ts` script sets up a GET route for '/api/videos'. This route fetches videos from the database, applying various filters according to the request's query parameters. 

The script checks the validity of the parameters and constructs an Elasticsearch search query accordingly. Depending on the parameters provided (`filename`, `authorId`, `duration`, `tags`), it adds different filters to the query. The results of this query execution form the response.

### TypeScript
TypeScript is a statically typed superset of JavaScript, offering all JavaScript features along with an additional layer of type-checking. This feature helps in catching potential issues early, during development, before runtime. TypeScript hence provides a safer and more efficient coding experience, especially for large codebases.

### Data sharing
Data sharing in Docker can be achieved using Docker volumes. A Docker volume allows data to persist across container lifecycles and can be shared among several containers. 

In the given docker-compose configuration, two volumes are defined: 

    ./data/db:/data/db
    ./data:/import_data

These lines indicate that the data stored in your local `./data/db` and `./data` directories can be accessed within the Docker containers at `/data/db` and `/import_data`, respectively. This setup ensures data consistency between your local environment and the Dockerized services.

The Postman collection provided in the project can be used to understand and test the API endpoints.
Follow these steps to import the Postman collection:

1. Open Postman.
2. Click the `Import` button on the top left of the application.
3. In the opened dialog, click `Upload Files`.
4. Select the `postman_collection.json` file that is provided in the project repository.
5. After successful import, the collection will appear on the left side panel of Postman.
6. You can now select any request from the collection and hit the `Send` button to execute it.

Note: Replace `localhost:5000` with your server's actual address if it's different. Also, if your API has
authorization, you will need to include the correct authorization headers or tokens as necessary.


