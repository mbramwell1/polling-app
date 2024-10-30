# mbramwell-dizplai-test API

This is the API submission for the Technical Test for Martin Bramwell.
The submission uses the Spring Boot framework, along with RestAssured and TestContainers for testing.

Some assumptions/compromises have been made:
1. A Poll is active until a new Poll is created
2. Creating a new Poll deactivates the current Active Poll
3. Votes are only allowed on a Poll whilst the Poll is active
4. A user cannot vote on the same Poll twice, or change their vote
5. For simplicity, I am using the 'admin' database on Mongo along with the root user. This would not be advisable for a production system.

## Running the application via the Maven Wrapper

The API needs a Mongo and Redis instance available. The easiest way to get started is to use the Spring Boot tools and Docker compose.
Running via the CLI will start up Mongo and Redis in a Docker Container.

You will need Java21, Docker and Docker Compose installed.
Maven has been provided as part of the project in the Maven Wrapper.

```shell script
./mvnw spring-boot:run
```

## Running the application in Docker

Build a Docker image:
```shell script
./mvnw spring-boot:build-image
```

Or you can build a Native Docker image, but this will be resource intensive:
```shell script
./mvnw spring-boot:build-image -Pnative
```

Finally:
```shell script
docker compose up
```

## Using the Application

The Application provides several Endpoints, as well as a WebSocket to listen for new Votes on a given Poll.
JavaDocs are available in
[PollController.java](src/main/java/uk/co/mgbramwell/polling/api/PollController.java) and 
[WebSocketController.java](src/main/java/uk/co/mgbramwell/polling/api/websocket/WebSocketController.java).

A Demo Poll will be loaded when the application first starts up by an ApplicationRunner
[DemoDataLoader.java](src/main/java/uk/co/mgbramwell/polling/api/DemoDataLoader.java). This Poll will be Active,
and can be replaced by creating a new Poll using the REST API.

Swagger is also included by default and once the Dev Mode Application is running, visit:
[localhost:8080/swagger-ui/index.html](localhost:8080/swagger-ui/index.html). This will give you a graphical, interactive way to use
the API.